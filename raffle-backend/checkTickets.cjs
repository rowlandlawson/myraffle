require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tickets = await prisma.ticket.findMany({
    include: {
      user: { select: { email: true, walletBalance: true } },
      raffle: { select: { id: true, ticketsSold: true, item: { select: { name: true } } } },
    },
  });
  console.log('All Tickets in Database:', JSON.stringify(tickets, null, 2));

  const raffles = await prisma.raffle.findMany({
    include: { item: { select: { name: true } } },
  });
  console.log('All Raffles:', JSON.stringify(raffles, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
