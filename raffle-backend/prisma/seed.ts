import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...\n');

    const salt = await bcrypt.genSalt(10);

    // ── Admin Account ────────────────────────────
    const adminPassword = await bcrypt.hash('Admin@123', salt);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@rafflehub.ng' },
        update: {},
        create: {
            userNumber: 'RAF-000001',
            email: 'admin@rafflehub.ng',
            password: adminPassword,
            name: 'RaffleHub Admin',
            phone: '08000000001',
            role: 'ADMIN',
            walletBalance: 100000,
            rafflePoints: 5000,
            emailVerified: true,
        },
    });
    console.log('✅ Admin created:');
    console.log(`   Email:    admin@rafflehub.ng`);
    console.log(`   Password: Admin@123`);
    console.log(`   User #:   ${admin.userNumber}\n`);

    // ── Regular User Account ─────────────────────
    const userPassword = await bcrypt.hash('User@123', salt);
    const user = await prisma.user.upsert({
        where: { email: 'user@rafflehub.ng' },
        update: {},
        create: {
            userNumber: 'RAF-000002',
            email: 'user@rafflehub.ng',
            password: userPassword,
            name: 'Test User',
            phone: '08000000002',
            role: 'USER',
            walletBalance: 25000,
            rafflePoints: 1000,
            emailVerified: true,
        },
    });
    console.log('✅ User created:');
    console.log(`   Email:    user@rafflehub.ng`);
    console.log(`   Password: User@123`);
    console.log(`   User #:   ${user.userNumber}\n`);

    console.log('🎉 Seeding complete!');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
