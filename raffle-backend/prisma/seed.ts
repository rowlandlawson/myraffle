import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  const adminEmail = 'admin@myraffle.com';
  const hashedPassword = await bcrypt.hash('Admin123!', 10);

  // Check if admin@myraffle.com or any admin user exists
  const existingAdmin = await prisma.user.findFirst({
    where: {
      OR: [{ email: adminEmail }, { role: Role.ADMIN }],
    },
  });

  if (existingAdmin) {
    // Update existing admin to email admin@myraffle.com
    const updated = await prisma.user.update({
      where: { id: existingAdmin.id },
      data: {
        email: adminEmail,
        password: hashedPassword,
        role: Role.ADMIN,
        emailVerified: true,
        whatsappVerified: true,
      },
    });
    console.log(`✅ Updated Admin user email to: ${updated.email}`);
  } else {
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'System Admin',
        userNumber: 'ADM-100001',
        role: Role.ADMIN,
        emailVerified: true,
        whatsappVerified: true,
        walletBalance: 500000.0,
      },
    });
    console.log(`🎉 Created default Admin user: ${adminUser.email}`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
