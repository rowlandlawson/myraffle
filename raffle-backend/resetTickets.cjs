require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Find all tickets
  const tickets = await prisma.ticket.findMany({
    include: {
      user: { select: { email: true } },
      raffle: { select: { id: true, ticketsSold: true } },
    },
  });

  console.log('Found tickets count:', tickets.length);
  for (const t of tickets) {
    console.log(
      `Ticket ID: ${t.id}, Number: ${t.ticketNumber}, User: ${t.user?.email}, RaffleId: ${t.raffleId}`,
    );
  }

  // Delete all existing test tickets to start clean
  const deleted = await prisma.ticket.deleteMany({});
  console.log('Deleted tickets count:', deleted.count);

  // Reset ticketsSold to 0 on all raffles
  const updatedRaffles = await prisma.raffle.updateMany({
    data: { ticketsSold: 0 },
  });
  console.log('Reset ticketsSold to 0 on raffles:', updatedRaffles.count);
}

main()
  .then(() => {
    console.log('Cleanup completed successfully!');
    process.exit(0);
  })
  .catch((e) => {
    console.error('Error during cleanup:', e);
    process.exit(1);
  });
