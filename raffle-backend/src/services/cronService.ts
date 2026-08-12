import { prisma } from '../config/database';
import { runRaffleDraw } from './raffle';

let intervalId: NodeJS.Timeout | null = null;

/**
 * Periodically checks for active raffles whose countdown timers have elapsed.
 * - If tickets were sold (>0): Executes automated cryptographic random winner draw.
 * - If 0 tickets were sold (Option C): Marks status as EXPIRED for Admin re-scheduling / extension.
 */
export const checkExpiredRaffles = async () => {
    try {
        const now = new Date();

        const expiredRaffles = await prisma.raffle.findMany({
            where: {
                status: { in: ['ACTIVE', 'SCHEDULED'] },
                raffleDate: { lte: now },
            },
            select: {
                id: true,
                ticketsSold: true,
                raffleDate: true,
                item: { select: { name: true } },
            },
        });

        if (expiredRaffles.length === 0) return;

        console.log(`[CronService] Found ${expiredRaffles.length} raffle(s) with elapsed countdown timers.`);

        for (const raffle of expiredRaffles) {
            if (raffle.ticketsSold > 0) {
                console.log(`[CronService] Auto-drawing winner for expired raffle "${raffle.item.name}" (${raffle.id}) with ${raffle.ticketsSold} ticket(s) sold...`);
                try {
                    const result = await runRaffleDraw(raffle.id);
                    console.log(`[CronService] Winner drawn for "${raffle.item.name}": ${result.winnerName} (${result.winnerUserNumber})`);
                } catch (drawErr) {
                    console.error(`[CronService] Error drawing winner for raffle ${raffle.id}:`, drawErr);
                }
            } else {
                // Option C: 0 tickets sold -> Mark as EXPIRED for Admin alert & re-scheduling
                console.log(`[CronService] Raffle "${raffle.item.name}" (${raffle.id}) timer elapsed with 0 tickets sold. Marking as EXPIRED (Option C).`);
                await prisma.raffle.update({
                    where: { id: raffle.id },
                    data: { status: 'EXPIRED' as any },
                });
            }
        }
    } catch (error) {
        console.error('[CronService] Error running expired raffles check:', error);
    }
};

/**
 * Starts the background polling timer service (runs every 15 seconds).
 */
export const startCronService = () => {
    if (intervalId) return;

    console.log('⏱️  [CronService] Starting automated raffle expiration & auto-draw background worker (15s interval)...');
    
    // Run immediately on start
    checkExpiredRaffles();

    // Schedule every 15 seconds
    intervalId = setInterval(() => {
        checkExpiredRaffles();
    }, 15000);
};

/**
 * Stops the background polling service gracefully.
 */
export const stopCronService = () => {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        console.log('[CronService] Background worker stopped.');
    }
};
