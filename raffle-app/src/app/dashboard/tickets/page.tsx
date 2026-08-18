'use client';

import TicketCard from '@/components/tickets/TicketCard';
import { useTicketHistory } from '@/lib/hooks/useTickets';
import { useState } from 'react';

type TicketStatus = 'active' | 'won' | 'lost';

export default function TicketsPage() {
  const [filterStatus, setFilterStatus] = useState<TicketStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: ticketData, isLoading: loading, error } = useTicketHistory();
  const apiTickets = ticketData?.tickets ?? [];

  // Map API tickets to the format TicketCard expects
  const allTickets = apiTickets.map((t) => {
    const now = new Date();
    const raffleEnd = new Date(t.raffle.raffleDate);
    const daysLeft = Math.max(
      0,
      Math.ceil((raffleEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    );
    const imageUrl = t.raffle.item?.imageUrl?.startsWith('/uploads')
      ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${t.raffle.item.imageUrl}`
      : t.raffle.item?.imageUrl || '';

    return {
      id: t.id,
      ticketNumber: t.ticketNumber,
      item: t.raffle.item?.name || 'Raffle Draw',
      image: imageUrl,
      price: t.raffle.ticketPrice,
      purchaseDate: new Date(t.createdAt).toLocaleDateString(),
      raffleDate: new Date(t.raffle.raffleDate).toLocaleDateString(),
      status: t.status.toLowerCase() as TicketStatus,
      daysLeft,
    };
  });

  const filteredTickets = allTickets.filter((ticket) => {
    const statusMatch = filterStatus === 'all' || ticket.status === filterStatus;
    const searchMatch =
      ticket.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });

  return (
    <div className="space-y-6 pb-20 md:pb-0 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">My Tickets</h1>
        <p className="text-gray-500 text-sm mt-0.5">View all your tickets and draw statuses</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search ticket number or item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-red-600 focus:bg-white transition"
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                filterStatus === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                filterStatus === 'active'
                  ? 'bg-amber-500 text-white'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              Ongoing
            </button>
            <button
              onClick={() => setFilterStatus('won')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                filterStatus === 'won'
                  ? 'bg-green-600 text-white'
                  : 'bg-green-50 text-green-700 hover:bg-green-100'
              }`}
            >
              Won
            </button>
            <button
              onClick={() => setFilterStatus('lost')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                filterStatus === 'lost'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              Lost
            </button>
          </div>
        </div>

        {/* Loading / Error / Tickets List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-7 h-7 border-3 border-red-600 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Loading tickets...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 text-sm font-medium">
              {error instanceof Error ? error.message : 'Failed to load tickets'}
            </p>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            {filteredTickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}

        {!loading && !error && filteredTickets.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-gray-800 font-bold text-sm">No tickets found</p>
            <p className="text-gray-500 text-xs mt-1">
              Enter active raffle draws to see your tickets here!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
