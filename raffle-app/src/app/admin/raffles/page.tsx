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

type RaffleStatus = 'pending' | 'active' | 'completed' | 'cancelled';

interface Raffle {
  id: number;
  itemName: string;
  image: string;
  ticketPrice: number;
  totalTickets: number;
  soldTickets: number;
  startDate: string;
  endDate: string;
  status: RaffleStatus;
  winner?: string;
}

export default function AdminRafflesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<RaffleStatus | 'all'>('all');

  const [raffles] = useState<Raffle[]>([
    {
      id: 1,
      itemName: 'iPhone 15 Pro Max',
      image: '📱',
      ticketPrice: 5000,
      totalTickets: 100,
      soldTickets: 87,
      startDate: '2026-01-25',
      endDate: '2026-01-30',
      status: 'active',
    },
    {
      id: 2,
      itemName: 'MacBook Pro 14"',
      image: '💻',
      ticketPrice: 8000,
      totalTickets: 50,
      soldTickets: 50,
      startDate: '2026-01-20',
      endDate: '2026-01-25',
      status: 'completed',
      winner: 'John Doe',
    },
    {
      id: 3,
      itemName: 'PlayStation 5',
      image: '🎮',
      ticketPrice: 6000,
      totalTickets: 75,
      soldTickets: 45,
      startDate: '2026-01-28',
      endDate: '2026-02-05',
      status: 'pending',
    },
    {
      id: 4,
      itemName: 'AirPods Pro Max',
      image: '🎧',
      ticketPrice: 3000,
      totalTickets: 200,
      soldTickets: 156,
      startDate: '2026-01-22',
      endDate: '2026-01-27',
      status: 'active',
    },
    {
      id: 5,
      itemName: 'iPad Pro 12.9"',
      image: '📲',
      ticketPrice: 4500,
      totalTickets: 80,
      soldTickets: 20,
      startDate: '2026-01-18',
      endDate: '2026-01-22',
      status: 'cancelled',
    },
    {
      id: 6,
      itemName: 'Apple Watch Ultra',
      image: '⌚',
      ticketPrice: 2500,
      totalTickets: 150,
      soldTickets: 150,
      startDate: '2026-01-10',
      endDate: '2026-01-18',
      status: 'completed',
      winner: 'Jane Smith',
    },
  ]);

  const filteredRaffles = raffles.filter((raffle) => {
    const matchesSearch = raffle.itemName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || raffle.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: RaffleStatus) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    const icons = {
      pending: <Clock size={14} />,
      active: <Play size={14} />,
      completed: <CheckCircle size={14} />,
      cancelled: <XCircle size={14} />,
    };
    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}
      >
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const stats = {
    total: raffles.length,
    active: raffles.filter((r) => r.status === 'active').length,
    pending: raffles.filter((r) => r.status === 'pending').length,
    completed: raffles.filter((r) => r.status === 'completed').length,
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
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
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
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Table */}
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
                      <span className="text-2xl">{raffle.image}</span>
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
                          {Math.round(
                            (raffle.soldTickets / raffle.totalTickets) * 100,
                          )}
                          %
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-red-600 rounded-full"
                          style={{
                            width: `${(raffle.soldTickets / raffle.totalTickets) * 100}%`,
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
                      {raffle.status === 'pending' && (
                        <button className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition">
                          Start
                        </button>
                      )}
                      {raffle.status === 'active' && (
                        <button className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition">
                          End
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRaffles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No raffles found</p>
          </div>
        )}
      </div>
    </div>
  );
}
