require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, walletBalance: true },
  });
  console.log('Current Users:', users);

  for (const u of users) {
    if (u.walletBalance === undefined || u.walletBalance === null || u.walletBalance < 1000) {
      await prisma.user.update({
        where: { id: u.id },
        data: { walletBalance: 1000 },
      });
      await prisma.transaction.create({
        data: {
          userId: u.id,
          type: 'TASK_REWARD',
          amount: 1000,
          status: 'COMPLETED',
          description: 'Welcome Sign-up Bonus: ₦1,000 credited to your wallet.',
        },
      });
      console.log('Credited 1000 bonus to user:', u.email || u.name || u.id);
    }
  }
}

main()
  .then(() => {
    console.log('Bonus migration completed successfully!');
    process.exit(0);
  })
  .catch((e) => {
    console.error('Error during bonus migration:', e);
    process.exit(1);
  });
