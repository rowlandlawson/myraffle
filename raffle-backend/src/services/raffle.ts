import crypto from 'crypto';
import { prisma } from '../config/database';
import { sendRaffleWinnerEmail } from './brevo';

/**
 * Run the raffle draw for a given raffle.
 * Uses crypto.randomInt() for cryptographically fair random selection.
 */
export const runRaffleDraw = async (raffleId: string) => {
    // Get raffle with all tickets
    const raffle = await prisma.raffle.findUnique({
        where: { id: raffleId },
        include: {
            tickets: {
                where: { status: 'ACTIVE' },
                include: {
                    user: {
                        select: { id: true, name: true, email: true, userNumber: true },
                    },
                },
            },
            item: true,
        },
    });

    if (!raffle) {
        throw new Error('Raffle not found.');
    }

    if (raffle.status === 'COMPLETED') {
        throw new Error('Raffle has already been completed.');
    }

    if (raffle.status === 'CANCELLED') {
        throw new Error('Raffle has been cancelled.');
    }

    if (raffle.tickets.length === 0) {
        throw new Error('No tickets sold for this raffle. Cannot draw a winner.');
    }

    // Select a random winner using cryptographically secure randomness
    const winnerIndex = crypto.randomInt(0, raffle.tickets.length);
    const winningTicket = raffle.tickets[winnerIndex]!;
    const winner = winningTicket.user;

    // Execute all updates in a single transaction
    await prisma.$transaction([
        // Mark the raffle as completed with the winner
        prisma.raffle.update({
            where: { id: raffleId },
            data: {
                status: 'COMPLETED',
                winnerUserId: winner.id,
            },
        }),

        // Mark the winning ticket as WON
        prisma.ticket.update({
            where: { id: winningTicket.id },
            data: { status: 'WON' },
        }),

        // Mark all other tickets as LOST
        prisma.ticket.updateMany({
            where: {
                raffleId,
                id: { not: winningTicket.id },
                status: 'ACTIVE',
            },
            data: { status: 'LOST' },
        }),

        // Log a transaction for the winner (prize value recorded)
        prisma.transaction.create({
            data: {
                userId: winner.id,
                type: 'RAFFLE_WIN',
                amount: raffle.item.value,
                status: 'COMPLETED',
                description: `Won raffle for ${raffle.item.name}`,
            },
        }),
    ]);

    // Send winner notification email (non-blocking)
    sendRaffleWinnerEmail(
        winner.email,
        winner.name,
        raffle.item.name,
        raffle.item.value
    ).catch((err: Error) => {
        console.error('[Raffle] Failed to send winner email:', err);
    });

    return {
        raffleId,
        winnerId: winner.id,
        winnerName: winner.name,
        winnerUserNumber: winner.userNumber,
        winningTicketId: winningTicket.id,
        winningTicketNumber: winningTicket.ticketNumber,
        itemName: raffle.item.name,
        itemValue: raffle.item.value,
        totalTickets: raffle.tickets.length,
    };
};
