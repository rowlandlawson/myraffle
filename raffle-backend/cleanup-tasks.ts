import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        where: { role: 'USER' },
        select: { id: true, name: true, userNumber: true }
    });

    let totalDeleted = 0;

    for (const user of users) {
        const completions = await prisma.userTask.findMany({
            where: { userId: user.id },
            orderBy: { completedAt: 'desc' }
        });

        // Track combinations of (taskId, date) for daily limits, and (taskId) for one-time
        const seenOneTime = new Set<string>();
        const seenDaily = new Set<string>();

        for (const record of completions) {
            const task = await prisma.task.findUnique({ where: { id: record.taskId } });
            if (!task) continue;

            const dateStr = record.completedAt.toISOString().split('T')[0];
            const dailyKey = `${record.taskId}-${dateStr}`;

            let isDuplicate = false;

            if (task.type.startsWith('WATCH_AD') && !task.dailyLimit) {
                if (seenOneTime.has(record.taskId)) isDuplicate = true;
                seenOneTime.add(record.taskId);
            } else if (task.type === 'DAILY_LOGIN') {
                if (seenDaily.has(dailyKey)) isDuplicate = true;
                seenDaily.add(dailyKey);
            } else if (task.type.startsWith('SOCIAL_')) {
                if (seenOneTime.has(record.taskId)) isDuplicate = true;
                seenOneTime.add(record.taskId);
            }

            if (isDuplicate) {
                console.log(`Deleting duplicate task completion: ${task.type} for ${user.name}`);
                await prisma.userTask.delete({ where: { id: record.id } });
                
                // Roll back points
                await prisma.user.update({
                    where: { id: user.id },
                    data: { rafflePoints: { decrement: record.pointsEarned } }
                });

                // Delete transaction log
                const transaction = await prisma.transaction.findFirst({
                   where: { 
                       userId: user.id, 
                       type: 'TASK_REWARD', 
                       amount: record.pointsEarned,
                       createdAt: {
                           gte: new Date(record.completedAt.getTime() - 1000),
                           lte: new Date(record.completedAt.getTime() + 1000)
                       }
                   }
                });
                if (transaction) {
                    await prisma.transaction.delete({ where: { id: transaction.id } });
                }

                totalDeleted++;
            }
        }
    }
    
    console.log(`Cleanup complete. Deleted ${totalDeleted} duplicate records and rolled back points.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
