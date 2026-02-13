import { prisma } from '../config/database';

interface LogTransactionParams {
    userId: string;
    type: 'DEPOSIT' | 'WITHDRAWAL' | 'TICKET_PURCHASE' | 'TASK_REWARD' | 'RAFFLE_WIN' | 'REFUND';
    amount: number;
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    reference?: string;
    description?: string;
}

export const logTransaction = async ({
    userId,
    type,
    amount,
    status,
    reference,
    description,
}: LogTransactionParams) => {
    return prisma.transaction.create({
        data: {
            userId,
            type,
            amount,
            status,
            reference: reference || null,
            description: description || null,
        },
    });
};
