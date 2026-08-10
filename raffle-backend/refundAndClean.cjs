require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. Reset all non-admin user wallet balances to 1000
  const updatedUsers = await prisma.user.updateMany({
    where: { role: { not: 'ADMIN' } },
    data: { walletBalance: 1000 },
  });
  console.log('Refunded non-admin users to 1000 NGN balance:', updatedUsers.count);

  // 2. Delete all existing tickets
  const deletedTickets = await prisma.ticket.deleteMany({});
  console.log('Deleted tickets:', deletedTickets.count);

  // 3. Reset ticketsSold to 0 on all active/scheduled raffles
  const updatedRaffles = await prisma.raffle.updateMany({
    data: { ticketsSold: 0 },
  });
  console.log('Reset ticketsSold on raffles:', updatedRaffles.count);
}

main()
  .then(() => {
    console.log('Refund and cleanup completed successfully!');
    process.exit(0);
  })
  .catch((e) => {
    console.error('Error during cleanup:', e);
    process.exit(1);
  });
