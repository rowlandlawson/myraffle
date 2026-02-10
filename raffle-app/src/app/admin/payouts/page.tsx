'use client';

import { useState } from 'react';
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  DollarSign,
} from 'lucide-react';

type PayoutStatus = 'pending' | 'approved' | 'rejected' | 'completed';

interface Payout {
  id: string;
  userId: string;
  userName: string;
  bankName: string;
  accountNumber: string;
  amount: number;
  status: PayoutStatus;
  requestDate: string;
  processedDate?: string;
}

export default function AdminPayoutsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PayoutStatus | 'all'>('all');

  const [payouts, setPayouts] = useState<Payout[]>([
    {
      id: 'PAY-001',
      userId: 'USR-001',
      userName: 'John Doe',
      bankName: 'GTBank',
      accountNumber: '0123456789',
      amount: 50000,
      status: 'pending',
      requestDate: '2026-01-29',
    },
    {
      id: 'PAY-002',
      userId: 'USR-002',
      userName: 'Jane Smith',
      bankName: 'Access Bank',
      accountNumber: '1234567890',
      amount: 25000,
      status: 'pending',
      requestDate: '2026-01-29',
    },
    {
      id: 'PAY-003',
      userId: 'USR-003',
      userName: 'Mike Johnson',
      bankName: 'Zenith Bank',
      accountNumber: '2345678901',
      amount: 100000,
      status: 'approved',
      requestDate: '2026-01-28',
      processedDate: '2026-01-29',
    },
    {
      id: 'PAY-004',
      userId: 'USR-004',
      userName: 'Sarah Wilson',
      bankName: 'UBA',
      accountNumber: '3456789012',
      amount: 15000,
      status: 'completed',
      requestDate: '2026-01-27',
      processedDate: '2026-01-28',
    },
    {
      id: 'PAY-005',
      userId: 'USR-005',
      userName: 'David Brown',
      bankName: 'Fidelity Bank',
      accountNumber: '4567890123',
      amount: 200000,
      status: 'rejected',
      requestDate: '2026-01-26',
      processedDate: '2026-01-26',
    },
    {
      id: 'PAY-006',
      userId: 'USR-001',
      userName: 'John Doe',
      bankName: 'GTBank',
      accountNumber: '0123456789',
      amount: 30000,
      status: 'completed',
      requestDate: '2026-01-25',
      processedDate: '2026-01-26',
    },
  ]);

  const filteredPayouts = payouts.filter((payout) => {
    const matchesSearch =
      payout.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payout.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payout.accountNumber.includes(searchTerm);
    const matchesStatus =
      statusFilter === 'all' || payout.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = (id: string) => {
    setPayouts(
      payouts.map((p) =>
        p.id === id
          ? {
              ...p,
              status: 'approved' as PayoutStatus,
              processedDate: new Date().toISOString().split('T')[0],
            }
          : p,
      ),
    );
  };

  const handleReject = (id: string) => {
    setPayouts(
      payouts.map((p) =>
        p.id === id
          ? {
              ...p,
              status: 'rejected' as PayoutStatus,
              processedDate: new Date().toISOString().split('T')[0],
            }
          : p,
      ),
    );
  };

  const getStatusBadge = (status: PayoutStatus) => {
    const config = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      approved: { bg: 'bg-blue-100', text: 'text-blue-800', icon: CheckCircle },
      completed: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: CheckCircle,
      },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
    };
    const { bg, text, icon: Icon } = config[status];
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${bg} ${text}`}
      >
        <Icon size={12} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const pendingTotal = payouts
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingCount = payouts.filter((p) => p.status === 'pending').length;
  const completedTotal = payouts
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Payout Management</h1>
        <p className="text-gray-600">Review and process withdrawal requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-yellow-600">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertCircle size={24} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Requests</p>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              <p className="text-sm text-gray-500">
                ₦{pendingTotal.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-green-600">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed Payouts</p>
              <p className="text-2xl font-bold text-gray-900">
                ₦{completedTotal.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">This month</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-blue-600">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg. Processing Time</p>
              <p className="text-2xl font-bold text-gray-900">24h</p>
              <p className="text-sm text-gray-500">Target: 48h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, ID, or account number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as PayoutStatus | 'all')
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Request ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  User
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Bank Details
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Date
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
              {filteredPayouts.map((payout) => (
                <tr key={payout.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 font-mono text-sm text-gray-900">
                    {payout.id}
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {payout.userName}
                      </p>
                      <p className="text-xs text-gray-500">{payout.userId}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {payout.bankName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {payout.accountNumber}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right font-bold text-gray-900">
                    ₦{payout.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-900">
                      {payout.requestDate}
                    </p>
                    {payout.processedDate && (
                      <p className="text-xs text-gray-500">
                        Processed: {payout.processedDate}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-4">{getStatusBadge(payout.status)}</td>
                  <td className="px-4 py-4">
                    {payout.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(payout.id)}
                          className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(payout.id)}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {payout.status !== 'pending' && (
                      <button className="text-gray-600 hover:text-gray-700 text-sm">
                        View
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayouts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No payouts found</p>
          </div>
        )}
      </div>
    </div>
  );
}
