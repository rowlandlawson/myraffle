import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { createTransferRecipient, initiateTransfer } from '../services/paystack';
import { logTransaction } from '../utils/transactions';

// GET /api/admin/withdrawals
// Query params: ?status=PENDING|APPROVED|REJECTED|COMPLETED&page=1&limit=20
export const getWithdrawals = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;
        const status = req.query.status as string | undefined;

        const where = status ? { status: status as 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' } : {};

        const [withdrawals, total] = await Promise.all([
            prisma.withdrawal.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            userNumber: true,
                            name: true,
                            email: true,
                            walletBalance: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.withdrawal.count({ where }),
        ]);

        res.status(200).json({
            success: true,
            data: {
                withdrawals,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        console.error('[Admin] Get withdrawals error:', error);
        res.status(500).json({ success: false, message: 'Failed to get withdrawals.' });
    }
};

// PUT /api/admin/withdrawals/:id/approve
// Triggers Paystack transfer to the user's bank account
export const approveWithdrawal = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        const withdrawal = await prisma.withdrawal.findUnique({
            where: { id },
            include: {
                user: {
                    select: { id: true, name: true, email: true },
                },
            },
        });

        if (!withdrawal) {
            res.status(404).json({ success: false, message: 'Withdrawal request not found.' });
            return;
        }

        if (withdrawal.status !== 'PENDING') {
            res.status(400).json({
                success: false,
                message: `Cannot approve a withdrawal with status: ${withdrawal.status}`,
            });
            return;
        }

        try {
            // Step 1: Create a Paystack transfer recipient for the user's bank account
            const recipient = await createTransferRecipient(
                withdrawal.accountName,
                withdrawal.accountNumber,
                withdrawal.bankCode
            );

            // Step 2: Initiate the transfer via Paystack
            const transfer = await initiateTransfer(
                withdrawal.amount,
                recipient.recipient_code,
                `RaffleHub withdrawal for ${withdrawal.user.name}`
            );

            // Step 3: Update withdrawal status to COMPLETED
            await prisma.withdrawal.update({
                where: { id },
                data: {
                    status: 'COMPLETED',
                    adminNote: `Approved by admin. Transfer ref: ${transfer.reference}`,
                },
            });

            // Step 4: Log the completed transaction
            await logTransaction({
                userId: withdrawal.userId,
                type: 'WITHDRAWAL',
                amount: withdrawal.amount,
                status: 'COMPLETED',
                reference: transfer.reference,
                description: `Withdrawal approved. Sent to ${withdrawal.accountName} (${withdrawal.accountNumber})`,
            });

            console.log(`[Admin] Withdrawal ${id} approved. Transfer ref: ${transfer.reference}`);

            res.status(200).json({
                success: true,
                message: 'Withdrawal approved and funds transferred.',
                data: {
                    withdrawalId: id,
                    transferReference: transfer.reference,
                    amount: withdrawal.amount,
                },
            });
        } catch (paystackError) {
            // Paystack transfer failed — mark as APPROVED but not yet transferred
            // Admin can retry later
            console.error('[Admin] Paystack transfer failed:', paystackError);

            await prisma.withdrawal.update({
                where: { id },
                data: {
                    status: 'APPROVED',
                    adminNote: `Approved but transfer failed. Error: ${paystackError instanceof Error ? paystackError.message : 'Unknown error'}`,
                },
            });

            res.status(200).json({
                success: true,
                message: 'Withdrawal approved but bank transfer failed. Please retry the transfer.',
                data: {
                    withdrawalId: id,
                    transferFailed: true,
                },
            });
        }
    } catch (error) {
        console.error('[Admin] Approve withdrawal error:', error);
        res.status(500).json({ success: false, message: 'Failed to approve withdrawal.' });
    }
};

// PUT /api/admin/withdrawals/:id/reject
// Refunds the withdrawal amount back to the user's wallet
export const rejectWithdrawal = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { reason } = req.body;

        const withdrawal = await prisma.withdrawal.findUnique({
            where: { id },
        });

        if (!withdrawal) {
            res.status(404).json({ success: false, message: 'Withdrawal request not found.' });
            return;
        }

        if (withdrawal.status !== 'PENDING') {
            res.status(400).json({
                success: false,
                message: `Cannot reject a withdrawal with status: ${withdrawal.status}`,
            });
            return;
        }

        // Reject and refund in a single database transaction
        await prisma.$transaction([
            // Update withdrawal status to REJECTED
            prisma.withdrawal.update({
                where: { id },
                data: {
                    status: 'REJECTED',
                    adminNote: reason || 'Rejected by admin.',
                },
            }),
            // Refund the amount back to the user's wallet
            prisma.user.update({
                where: { id: withdrawal.userId },
                data: {
                    walletBalance: { increment: withdrawal.amount },
                },
            }),
        ]);

        // Log the refund transaction
        await logTransaction({
            userId: withdrawal.userId,
            type: 'REFUND',
            amount: withdrawal.amount,
            status: 'COMPLETED',
            description: `Withdrawal rejected. Reason: ${reason || 'No reason provided'}. Amount refunded to wallet.`,
        });

        console.log(`[Admin] Withdrawal ${id} rejected. ₦${withdrawal.amount} refunded.`);

        res.status(200).json({
            success: true,
            message: 'Withdrawal rejected and funds refunded to user wallet.',
            data: {
                withdrawalId: id,
                refundedAmount: withdrawal.amount,
            },
        });
    } catch (error) {
        console.error('[Admin] Reject withdrawal error:', error);
        res.status(500).json({ success: false, message: 'Failed to reject withdrawal.' });
    }
};
