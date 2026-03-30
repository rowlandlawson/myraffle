// Quick debug script to check task completion records
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Show all tasks
    const tasks = await prisma.task.findMany({
        where: { isActive: true },
        select: { id: true, type: true, title: true, points: true },
    });
    console.log('\n=== ALL ACTIVE TASKS ===');
    tasks.forEach(t => console.log(`  [${t.type}] ${t.title} (id: ${t.id}, ${t.points} pts)`));

    // Show all users
    const users = await prisma.user.findMany({
        where: { role: 'USER' },
        select: { id: true, name: true, userNumber: true },
    });

    for (const user of users) {
        const completions = await prisma.userTask.findMany({
            where: { userId: user.id },
            include: { task: { select: { type: true, title: true } } },
            orderBy: { completedAt: 'desc' },
        });

        if (completions.length === 0) continue;

        console.log(`\n=== COMPLETIONS FOR ${user.name} (${user.userNumber}) ===`);
        completions.forEach(c => {
            console.log(`  ${c.task.type} | "${c.task.title}" | +${c.pointsEarned} pts | ${c.completedAt.toISOString()} | taskId: ${c.taskId}`);
        });

        const uniqueTaskIds = new Set(completions.map(c => c.taskId));
        console.log(`  → Total records: ${completions.length}, Unique tasks: ${uniqueTaskIds.size}`);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
