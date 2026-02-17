'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import TicketCard from '@/components/tickets/TicketCard';
import TicketStatCard from '@/components/tickets/TicketStatCard';
import { useTicketHistory } from '@/lib/useTickets';

type TicketStatus = 'active' | 'won' | 'lost';

export default function TicketsPage() {
  const [filterStatus, setFilterStatus] = useState<TicketStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { tickets: apiTickets, stats, loading, error } = useTicketHistory();

  // Map API tickets to the format TicketCard expects
  const allTickets = apiTickets.map((t) => {
    const now = new Date();
    const raffleEnd = new Date(t.raffle.raffleDate);
    const daysLeft = Math.max(0, Math.ceil((raffleEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const imageUrl = t.raffle.item.imageUrl?.startsWith('/uploads')
      ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${t.raffle.item.imageUrl}`
      : t.raffle.item.imageUrl || '📦';

    return {
      id: t.id as any,
      ticketNumber: t.ticketNumber,
      item: t.raffle.item.name,
      image: imageUrl,
      price: t.raffle.ticketPrice,
      purchaseDate: new Date(t.createdAt).toISOString().split('T')[0]!,
      raffleDate: new Date(t.raffle.raffleDate).toISOString().split('T')[0]!,
      status: t.status.toLowerCase() as TicketStatus,
      daysLeft,
      winnerNotification:
        t.status === 'WON'
          ? 'Congratulations! You won! Check your email for details.'
          : undefined,
      loserMessage:
        t.status === 'LOST'
          ? 'Better luck next time! Try another raffle.'
          : undefined,
    };
  });

  const filteredTickets = allTickets.filter((ticket) => {
    const statusMatch =
      filterStatus === 'all' || ticket.status === filterStatus;
    const searchMatch =
      ticket.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });

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
          count={stats.active}
          subtitle="Waiting for results"
          borderColor="border-blue-600"
          textColor="text-blue-600"
        />
        <TicketStatCard
          title="Won"
          count={stats.won}
          subtitle="Congratulations! 🎉"
          borderColor="border-green-600"
          textColor="text-green-600"
        />
        <TicketStatCard
          title="Lost"
          count={stats.lost}
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

        {/* Loading / Error / Tickets List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Loading your tickets...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}

        {!loading && !error && filteredTickets.length === 0 && (
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
