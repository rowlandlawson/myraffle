import crypto from 'crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';

/**
 * Run a raffle: randomly select a winner from all ticket holders.
 * Uses crypto.randomInt() for cryptographically secure randomness.
 * All updates are atomic via Prisma $transaction.
 */
export const runRaffle = async (raffleId: string) => {
    const raffle = await prisma.raffle.findUnique({
        where: { id: raffleId },
        include: {
            tickets: { where: { status: 'ACTIVE' } },
            item: true,
        },
    });

    if (!raffle) {
        throw new Error('Raffle not found');
    }

    if (raffle.status === 'COMPLETED') {
        throw new Error('Raffle has already been drawn');
    }

    if (raffle.status === 'CANCELLED') {
        throw new Error('Raffle has been cancelled');
    }

    if (raffle.tickets.length === 0) {
        throw new Error('No tickets sold — cannot run raffle');
    }

    // Cryptographically random winner selection
    const winnerIndex = crypto.randomInt(0, raffle.tickets.length);
    const winningTicket = raffle.tickets[winnerIndex]!;

    // Atomic transaction: update raffle, winning ticket, losing tickets
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // 1. Mark the raffle as completed with the winner
        const updatedRaffle = await tx.raffle.update({
            where: { id: raffleId },
            data: {
                status: 'COMPLETED',
                winnerUserId: winningTicket.userId,
            },
        });

        // 2. Mark winning ticket
        await tx.ticket.update({
            where: { id: winningTicket.id },
            data: { status: 'WON' },
        });

        // 3. Mark all other tickets as LOST
        await tx.ticket.updateMany({
            where: {
                raffleId,
                id: { not: winningTicket.id },
                status: 'ACTIVE',
            },
            data: { status: 'LOST' },
        });

        // 4. Log a RAFFLE_WIN transaction for the winner
        await tx.transaction.create({
            data: {
                userId: winningTicket.userId,
                type: 'RAFFLE_WIN',
                amount: raffle.item.value,
                status: 'COMPLETED',
                description: `Won raffle for ${raffle.item.name}`,
            },
        });

        return updatedRaffle;
    });

    return {
        raffleId: result.id,
        winnerId: winningTicket.userId,
        winningTicketId: winningTicket.id,
        winningTicketNumber: winningTicket.ticketNumber,
        itemName: raffle.item.name,
        totalTickets: raffle.tickets.length,
    };
};
