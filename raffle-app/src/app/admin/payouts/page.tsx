'use client';

import { useState } from 'react';
import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  DollarSign,
} from 'lucide-react';
import { useAdminWithdrawals, useApproveWithdrawal, useRejectWithdrawal } from '@/lib/hooks/useAdmin';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import toast from 'react-hot-toast';

type PayoutStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';

export default function AdminPayoutsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [confirmAction, setConfirmAction] = useState<{ id: string; type: 'approve' | 'reject' } | null>(null);

  const { data, isLoading, error } = useAdminWithdrawals({
    page,
    limit: 20,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const approveWithdrawal = useApproveWithdrawal();
  const rejectWithdrawal = useRejectWithdrawal();

  const withdrawals = data?.withdrawals ?? [];
  const pagination = data?.pagination;

  // Client-side search filter (backend doesn't have search on withdrawals)
  const filteredWithdrawals = withdrawals.filter((w) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      w.user.name.toLowerCase().includes(term) ||
      w.id.toLowerCase().includes(term) ||
      w.accountNumber.includes(term)
    );
  });

  const handleApprove = (id: string) => {
    setConfirmAction({ id, type: 'approve' });
  };

  const handleReject = (id: string) => {
    setConfirmAction({ id, type: 'reject' });
  };

  const executeConfirmAction = () => {
    if (!confirmAction) return;

    if (confirmAction.type === 'approve') {
      approveWithdrawal.mutate(confirmAction.id, {
        onSuccess: () => {
          toast.success('Withdrawal approved successfully');
          setConfirmAction(null);
        },
        onError: (err: any) => {
          toast.error(err.message || 'Failed to approve withdrawal');
          setConfirmAction(null);
        },
      });
    } else {
      rejectWithdrawal.mutate(confirmAction.id, {
        onSuccess: () => {
          toast.success('Withdrawal rejected and refunded');
          setConfirmAction(null);
        },
        onError: (err: any) => {
          toast.error(err.message || 'Failed to reject withdrawal');
          setConfirmAction(null);
        },
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; icon: typeof Clock }> = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      APPROVED: { bg: 'bg-blue-100', text: 'text-blue-800', icon: CheckCircle },
      COMPLETED: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
    };
    const { bg, text, icon: Icon } = config[status] || config.PENDING;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${bg} ${text}`}>
        <Icon size={12} />
        {status.charAt(0) + status.slice(1).toLowerCase()}
      </span>
    );
  };

  const pendingTotal = filteredWithdrawals
    .filter((p) => p.status === 'PENDING')
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingCount = filteredWithdrawals.filter((p) => p.status === 'PENDING').length;
  const completedTotal = filteredWithdrawals
    .filter((p) => p.status === 'COMPLETED')
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
              <p className="text-sm text-gray-500">₦{pendingTotal.toLocaleString()}</p>
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
              <p className="text-2xl font-bold text-gray-900">₦{completedTotal.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-blue-600">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{pagination?.total ?? 0}</p>
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
              placeholder="Search by name, ID, or User Number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="COMPLETED">Completed</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Loading payouts...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error instanceof Error ? error.message : 'Failed to load'}</p>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">User</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Bank Details</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredWithdrawals.map((w) => (
                    <tr key={w.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 font-mono text-sm text-gray-900">
                        {w.id.slice(0, 10)}
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">{w.user.name}</p>
                          <p className="text-xs text-gray-500">{w.user.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">{w.accountName || 'N/A'}</p>
                          <p className="text-xs text-gray-500">{w.accountNumber} ({w.bankCode})</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right font-bold text-gray-900">
                        ₦{w.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-900">
                          {new Date(w.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-4 py-4">{getStatusBadge(w.status)}</td>
                      <td className="px-4 py-4">
                        {w.status === 'PENDING' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(w.id)}
                              disabled={approveWithdrawal.isPending}
                              className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(w.id)}
                              disabled={rejectWithdrawal.isPending}
                              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredWithdrawals.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No payouts found</p>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!confirmAction}
        title={confirmAction?.type === 'approve' ? 'Approve Withdrawal' : 'Reject Withdrawal'}
        message={
          confirmAction?.type === 'approve'
            ? 'Are you sure you want to approve this withdrawal? Funds should be manually transferred first.'
            : 'Are you sure you want to reject this withdrawal? The amount will be refunded to the user\'s wallet.'
        }
        confirmLabel={confirmAction?.type === 'approve' ? 'Approve' : 'Reject'}
        onConfirm={executeConfirmAction}
        onCancel={() => setConfirmAction(null)}
        variant={confirmAction?.type === 'approve' ? 'info' : 'danger'}
      />
    </div>
  );
}
