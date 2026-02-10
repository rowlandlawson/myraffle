'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import TicketCard from '@/components/tickets/TicketCard';
import TicketStatCard from '@/components/tickets/TicketStatCard';
import TipsSection from '@/components/dashboard/TipsSection';

type TicketStatus = 'active' | 'won' | 'lost';

interface Ticket {
  id: number;
  ticketNumber: string;
  item: string;
  image: string;
  price: number;
  purchaseDate: string;
  raffleDate: string;
  status: TicketStatus;
  daysLeft: number;
  winnerNotification?: string;
  loserMessage?: string;
}

export default function TicketsPage() {
  const [filterStatus, setFilterStatus] = useState<TicketStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const allTickets: Ticket[] = [
    {
      id: 1,
      ticketNumber: 'TKT-2026-0001',
      item: 'iPhone 15 Pro Max',
      image: '📱',
      price: 5000,
      purchaseDate: '2026-01-25',
      raffleDate: '2026-01-27',
      status: 'active',
      daysLeft: 2,
    },
    {
      id: 2,
      ticketNumber: 'TKT-2026-0002',
      item: 'MacBook Pro 14"',
      image: '💻',
      price: 8000,
      purchaseDate: '2026-01-24',
      raffleDate: '2026-01-29',
      status: 'active',
      daysLeft: 4,
    },
    {
      id: 3,
      ticketNumber: 'TKT-2026-0003',
      item: 'AirPods Pro Max',
      image: '🎧',
      price: 3000,
      purchaseDate: '2026-01-23',
      raffleDate: '2026-01-26',
      status: 'active',
      daysLeft: 1,
    },
    {
      id: 4,
      ticketNumber: 'TKT-2026-0004',
      item: 'PlayStation 5',
      image: '🎮',
      price: 6000,
      purchaseDate: '2026-01-15',
      raffleDate: '2026-01-22',
      status: 'won',
      daysLeft: 0,
      winnerNotification:
        'Congratulations! You won! Check your email for details.',
    },
    {
      id: 5,
      ticketNumber: 'TKT-2026-0005',
      item: 'iPad Pro 12.9"',
      image: '📲',
      price: 4500,
      purchaseDate: '2026-01-10',
      raffleDate: '2026-01-18',
      status: 'lost',
      daysLeft: 0,
      loserMessage: 'Better luck next time! Try another raffle.',
    },
    {
      id: 6,
      ticketNumber: 'TKT-2026-0006',
      item: 'Apple Watch Ultra',
      image: '⌚',
      price: 2500,
      purchaseDate: '2026-01-08',
      raffleDate: '2026-01-16',
      status: 'lost',
      daysLeft: 0,
      loserMessage: 'Better luck next time! Try another raffle.',
    },
  ];

  const filteredTickets = allTickets.filter((ticket) => {
    const statusMatch =
      filterStatus === 'all' || ticket.status === filterStatus;
    const searchMatch =
      ticket.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });

  const activeCount = allTickets.filter((t) => t.status === 'active').length;
  const wonCount = allTickets.filter((t) => t.status === 'won').length;
  const lostCount = allTickets.filter((t) => t.status === 'lost').length;

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          My Raffle Tickets
        </h1>
        <p className="text-gray-600">
          Track all your raffle ticket purchases and results
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TicketStatCard
          title="Active Tickets"
          count={activeCount}
          subtitle="Waiting for results"
          borderColor="border-blue-600"
          textColor="text-blue-600"
        />
        <TicketStatCard
          title="Won"
          count={wonCount}
          subtitle="Congratulations! 🎉"
          borderColor="border-green-600"
          textColor="text-green-600"
        />
        <TicketStatCard
          title="Lost"
          count={lostCount}
          subtitle="Try again next time"
          borderColor="border-red-600"
          textColor="text-red-600"
        />
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search
                size={20}
                className="absolute left-3 top-3 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by item or ticket number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
              />
            </div>
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as TicketStatus | 'all')
              }
              className="w-full md:w-40 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
            >
              <option value="all">All Tickets</option>
              <option value="active">Active</option>
              <option value="won">Won 🎉</option>
              <option value="lost">Lost</option>
            </select>
          </div>
        </div>

        {/* Tickets List */}
        <div className="space-y-4">
          {filteredTickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>

        {filteredTickets.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🎫</div>
            <p className="text-gray-600 text-lg">No tickets found</p>
            <p className="text-gray-500 text-sm mt-2">
              Buy your first ticket to get started!
            </p>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-bold text-blue-900 mb-3">
          💡 Tips for Winning
        </h3>
        <ul className="text-blue-800 space-y-2">
          <li>✓ Buy early to get the best odds before tickets fill up</li>
          <li>✓ Check back regularly for new items being added</li>
          <li>
            ✓ You can hold multiple tickets for different items (max 1 per item)
          </li>
          <li>✓ Winners are announced within 1 hour of raffle completion</li>
        </ul>
      </div>
    </div>
  );
}
