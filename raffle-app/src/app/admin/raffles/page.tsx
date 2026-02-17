'use client';

import { useState } from 'react';
import {
  Search,
  Plus,
  Play,
  Pause,
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
} from 'lucide-react';
import { useRaffles, startRaffleDraw } from '@/lib/useRaffles';

type RaffleStatus = 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export default function AdminRafflesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<RaffleStatus | 'all'>('all');

  const { raffles: apiRaffles, loading, error, refetch } = useRaffles({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    limit: 50,
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Map to display format
  const raffles = apiRaffles.map((r) => ({
    id: r.id,
    itemName: r.item.name,
    image: r.item.imageUrl?.startsWith('/uploads')
      ? `${apiUrl}${r.item.imageUrl}`
      : r.item.imageUrl || '📦',
    ticketPrice: r.ticketPrice,
    totalTickets: r.ticketsTotal,
    soldTickets: r.ticketsSold,
    startDate: new Date(r.createdAt).toISOString().split('T')[0]!,
    endDate: new Date(r.raffleDate).toISOString().split('T')[0]!,
    status: r.status as RaffleStatus,
    winner: r.winner?.name || null,
  }));

  const filteredRaffles = raffles.filter((raffle) => {
    const matchesSearch = raffle.itemName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleStartDraw = async (raffleId: string) => {
    if (!confirm('Are you sure you want to draw a winner for this raffle?')) return;
    try {
      const res = await startRaffleDraw(raffleId);
      alert(res.message || 'Winner drawn successfully!');
      refetch();
    } catch (err: any) {
      alert(err.message || 'Failed to start draw');
    }
  };

  const getStatusBadge = (status: RaffleStatus) => {
    const styles: Record<string, string> = {
      SCHEDULED: 'bg-yellow-100 text-yellow-800',
      ACTIVE: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-blue-100 text-blue-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    const icons: Record<string, React.ReactNode> = {
      SCHEDULED: <Clock size={14} />,
      ACTIVE: <Play size={14} />,
      COMPLETED: <CheckCircle size={14} />,
      CANCELLED: <XCircle size={14} />,
    };
    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || ''}`}
      >
        {icons[status]}
        {status.charAt(0) + status.slice(1).toLowerCase()}
      </span>
    );
  };

  const stats = {
    total: raffles.length,
    active: raffles.filter((r) => r.status === 'ACTIVE').length,
    scheduled: raffles.filter((r) => r.status === 'SCHEDULED').length,
    completed: raffles.filter((r) => r.status === 'COMPLETED').length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Raffle Management
          </h1>
          <p className="text-gray-600">
            Create and manage all raffles on the platform
          </p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition">
          <Plus size={20} />
          Create New Raffle
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-gray-600">
          <p className="text-sm text-gray-600">Total Raffles</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-green-600">
          <p className="text-sm text-gray-600">Active</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-yellow-600">
          <p className="text-sm text-gray-600">Scheduled</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.scheduled}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-blue-600">
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by item name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as RaffleStatus | 'all')
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
            >
              <option value="all">All Status</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Loading / Error / Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Loading raffles...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Item
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Ticket Price
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Progress
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Dates
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRaffles.map((raffle) => (
                  <tr key={raffle.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {raffle.image.startsWith('http') ? (
                          <img
                            src={raffle.image}
                            alt={raffle.itemName}
                            className="w-10 h-10 object-cover rounded-lg"
                          />
                        ) : (
                          <span className="text-2xl">{raffle.image}</span>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">
                            {raffle.itemName}
                          </p>
                          {raffle.winner && (
                            <p className="text-xs text-green-600 flex items-center gap-1">
                              <Trophy size={12} /> Winner: {raffle.winner}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-900 font-semibold">
                      ₦{raffle.ticketPrice.toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      <div className="w-32">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>
                            {raffle.soldTickets}/{raffle.totalTickets}
                          </span>
                          <span>
                            {raffle.totalTickets > 0
                              ? Math.round(
                                (raffle.soldTickets / raffle.totalTickets) * 100,
                              )
                              : 0}
                            %
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-2 bg-red-600 rounded-full"
                            style={{
                              width: `${raffle.totalTickets > 0 ? (raffle.soldTickets / raffle.totalTickets) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-900">{raffle.startDate}</p>
                      <p className="text-xs text-gray-600">to {raffle.endDate}</p>
                    </td>
                    <td className="px-4 py-4">{getStatusBadge(raffle.status)}</td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition">
                          View
                        </button>
                        {raffle.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleStartDraw(raffle.id)}
                            className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition"
                          >
                            Draw
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && filteredRaffles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No raffles found</p>
          </div>
        )}
      </div>
    </div>
  );
}
