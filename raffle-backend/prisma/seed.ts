import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // 1. Create Default Admin
    const adminEmail = 'admin@rafflehub.com';
    const adminPassword = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            emailVerified: true,
        },
        create: {
            email: adminEmail,
            userNumber: 'ADMIN-001',
            name: 'Super Admin',
            password: adminPassword,
            role: 'ADMIN',
            status: 'ACTIVE',
            emailVerified: true,
            walletBalance: 0,
            rafflePoints: 0,
        },
    });

    console.log(`✅ Admin created: ${admin.email}`);

    // 2. Seed Default Tasks
    const tasks = [
        {
            type: 'WATCH_AD',
            title: 'Watch Video Ad',
            description: 'Watch a 30-second advertisement',
            points: 10,
        },
        {
            type: 'WATCH_AD',
            title: 'Watch Sports Highlights',
            description: 'Watch a 60-second sports video',
            points: 20,
        },
        {
            type: 'WATCH_AD',
            title: 'Product Review Video',
            description: 'Watch a product review (90 seconds)',
            points: 30,
        },
        {
            type: 'SOCIAL_SHARE',
            title: 'Share on WhatsApp',
            description: 'Share RaffleHub with your friends on WhatsApp',
            points: 50,
        },
        {
            type: 'SOCIAL_SHARE',
            title: 'Post on Facebook',
            description: 'Share a post about RaffleHub on Facebook',
            points: 50,
        },
        {
            type: 'SURVEY',
            title: 'Quick Survey',
            description: 'Complete a 2-minute survey about your preferences',
            points: 100,
        },
        {
            type: 'DAILY_LOGIN',
            title: 'Daily Login',
            description: 'Login to RaffleHub every day',
            points: 25,
        },
    ];

    for (const task of tasks) {
        await prisma.task.create({
            data: {
                type: task.type as any,
                title: task.title,
                description: task.description,
                points: task.points,
                isActive: true,
            },
        });
    }

    console.log(`✅ Created ${tasks.length} default tasks`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
