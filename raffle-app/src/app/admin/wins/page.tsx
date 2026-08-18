'use client';

import { api } from '@/lib/api';
import { type AdminWin, useAdminWins, useUpdateDeliveryStatus } from '@/lib/hooks/useAdmin';
import {
  ArrowUpRight,
  Check,
  CheckCircle,
  Clock,
  Copy,
  Filter,
  Mail,
  MapPin,
  Package,
  Phone,
  Search,
  Trophy,
  Truck,
  Wallet,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const DELIVERY_STATUSES = [
  {
    value: 'PENDING',
    label: 'Pending',
    icon: Clock,
    color: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    value: 'PROCESSING',
    label: 'Processing',
    icon: Package,
    color: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    value: 'SHIPPED',
    label: 'Shipped',
    icon: Truck,
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  {
    value: 'DELIVERED',
    label: 'Delivered',
    icon: CheckCircle,
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    value: 'CONVERTED_TO_WALLET',
    label: 'Converted to Credits',
    icon: Wallet,
    color: 'bg-purple-50 text-purple-700 border-purple-200',
  },
];

export default function AdminWinsPage() {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading, refetch } = useAdminWins({
    page,
    deliveryStatus: filterStatus,
  });
  const updateDelivery = useUpdateDeliveryStatus();

  const [selectedWinForConversion, setSelectedWinForConversion] = useState<AdminWin | null>(null);
  const [conversionAmount, setConversionAmount] = useState<number>(0);
  const [conversionNote, setConversionNote] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const wins = data?.wins ?? [];
  const pagination = data?.pagination ?? null;

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`Copied ${label}`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleStatusChange = async (raffleId: string, newStatus: string) => {
    try {
      await updateDelivery.mutateAsync({ raffleId, deliveryStatus: newStatus });
      toast.success(`Delivery status updated to ${newStatus}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update delivery status');
    }
  };

  const handleOpenConversionModal = (win: AdminWin) => {
    setSelectedWinForConversion(win);
    setConversionAmount(win.item?.value || 0);
    setConversionNote(
      `Unclaimed/Unavailable physical prize converted to non-withdrawable store credits for ${win.item?.name}.`,
    );
  };

  const handleConfirmConversion = async () => {
    if (!selectedWinForConversion) return;
    setIsConverting(true);
    try {
      const res = await api.post(
        `/api/admin/wins/${selectedWinForConversion.id}/convert-to-wallet`,
        {
          amount: conversionAmount,
          note: conversionNote,
        },
      );

      if (res.success) {
        toast.success(res.message || 'Prize successfully converted to store credits!');
        setSelectedWinForConversion(null);
        refetch();
      } else {
        toast.error(res.message || 'Failed to convert prize');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error converting prize to store credit');
    } finally {
      setIsConverting(false);
    }
  };

  // Filter by search query (winner name, email, item name)
  const filteredWins = wins.filter((w: AdminWin) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      w.item?.name?.toLowerCase().includes(q) ||
      w.winner?.name?.toLowerCase().includes(q) ||
      w.winner?.email?.toLowerCase().includes(q) ||
      w.winner?.userNumber?.toLowerCase().includes(q)
    );
  });

  // KPI Metrics calculation
  const totalWinsCount = wins.length;
  const pendingCount = wins.filter(
    (w: AdminWin) => w.deliveryStatus === 'PENDING' || w.deliveryStatus === 'PROCESSING',
  ).length;
  const deliveredCount = wins.filter((w: AdminWin) => w.deliveryStatus === 'DELIVERED').length;
  const convertedCount = wins.filter(
    (w: AdminWin) => w.deliveryStatus === 'CONVERTED_TO_WALLET',
  ).length;

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2.5">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Trophy size={24} />
            </div>
            Wins & Claims Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track raffle prize claims, manage winner delivery fulfillment, and handle store credit
            conversions.
          </p>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl shrink-0">
            <Trophy size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Winners
            </p>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">{totalWinsCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Delivery
            </p>
            <p className="text-xl sm:text-2xl font-bold text-blue-600 mt-0.5">{pendingCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
            <CheckCircle size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Delivered
            </p>
            <p className="text-xl sm:text-2xl font-bold text-emerald-600 mt-0.5">
              {deliveredCount}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl shrink-0">
            <Wallet size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Converted Credits
            </p>
            <p className="text-xl sm:text-2xl font-bold text-purple-600 mt-0.5">{convertedCount}</p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search winner name, email, or item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-500 transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={18} className="text-slate-400 shrink-0" />
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-red-500"
          >
            <option value="all">All Delivery Statuses</option>
            {DELIVERY_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs animate-pulse space-y-4"
            >
              <div className="h-5 w-1/3 bg-slate-200 rounded" />
              <div className="h-4 w-2/3 bg-slate-200 rounded" />
              <div className="h-8 w-1/4 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Wins List */}
      {!isLoading && (
        <div className="space-y-4">
          {filteredWins.map((win: AdminWin) => {
            const currentStatus =
              DELIVERY_STATUSES.find((s) => s.value === win.deliveryStatus) || DELIVERY_STATUSES[0];
            const StatusIcon = currentStatus.icon;
            const imageUrl = win.item?.imageUrl?.startsWith('/uploads')
              ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${win.item.imageUrl}`
              : win.item?.imageUrl;

            const winnerAddress = [win.winner?.address, win.winner?.city, win.winner?.state]
              .filter(Boolean)
              .join(', ');

            return (
              <div
                key={win.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition space-y-4"
              >
                <div className="flex flex-col md:flex-row gap-5">
                  {/* Item Image */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-100 flex items-center justify-center">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={win.item?.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl">🏆</span>
                    )}
                  </div>

                  {/* Info & Winner Address */}
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
                          {win.item?.name}
                          <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-bold border border-red-100">
                            ₦{win.item?.value?.toLocaleString()}
                          </span>
                        </h3>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${currentStatus.color}`}
                      >
                        <StatusIcon size={14} />
                        {currentStatus.label}
                      </span>
                    </div>

                    {/* Winner Details Box */}
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-slate-800 text-sm">
                          Winner: <span className="text-red-600">{win.winner?.name}</span>{' '}
                          <span className="font-mono text-slate-400 text-[11px]">
                            ({win.winner?.userNumber})
                          </span>
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 pt-1">
                        {win.winner?.email && (
                          <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/60">
                            <span className="flex items-center gap-1.5 truncate">
                              <Mail size={13} className="text-slate-400 shrink-0" />
                              <span className="truncate">{win.winner.email}</span>
                            </span>
                            <button
                              onClick={() => copyToClipboard(win.winner?.email || '', 'Email')}
                              className="text-slate-400 hover:text-slate-700 p-1"
                              title="Copy email"
                            >
                              {copiedField === 'Email' ? (
                                <Check size={13} className="text-emerald-600" />
                              ) : (
                                <Copy size={13} />
                              )}
                            </button>
                          </div>
                        )}

                        {win.winner?.phone && (
                          <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/60">
                            <span className="flex items-center gap-1.5 truncate">
                              <Phone size={13} className="text-slate-400 shrink-0" />
                              <span>{win.winner.phone}</span>
                            </span>
                            <button
                              onClick={() => copyToClipboard(win.winner?.phone || '', 'Phone')}
                              className="text-slate-400 hover:text-slate-700 p-1"
                              title="Copy phone"
                            >
                              {copiedField === 'Phone' ? (
                                <Check size={13} className="text-emerald-600" />
                              ) : (
                                <Copy size={13} />
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      {winnerAddress ? (
                        <div className="pt-1 flex items-start gap-1.5 font-medium text-slate-700">
                          <MapPin size={14} className="text-red-500 shrink-0 mt-0.5" />
                          <span>
                            <strong>Shipping Address:</strong> {winnerAddress}
                          </span>
                        </div>
                      ) : (
                        <div className="pt-1 flex items-center gap-1.5 italic text-slate-400">
                          <MapPin size={13} className="text-slate-300" />
                          <span>Delivery address not yet set in winner profile</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Box */}
                  <div className="flex flex-col gap-2.5 justify-center md:items-end shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Update Delivery Status
                    </label>
                    <select
                      value={win.deliveryStatus}
                      onChange={(e) => handleStatusChange(win.id, e.target.value)}
                      disabled={
                        updateDelivery.isPending || win.deliveryStatus === 'CONVERTED_TO_WALLET'
                      }
                      className="text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-red-500 bg-white font-bold text-slate-700 disabled:opacity-50 shadow-xs"
                    >
                      {DELIVERY_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>

                    {win.deliveryStatus !== 'CONVERTED_TO_WALLET' && (
                      <button
                        onClick={() => handleOpenConversionModal(win)}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/80 rounded-xl text-xs font-bold transition shadow-xs"
                      >
                        <Wallet size={14} />
                        Convert Prize to Store Credits
                      </button>
                    )}
                  </div>
                </div>

                {/* Delivery Note */}
                {win.deliveryNote && (
                  <div className="pt-3 border-t border-slate-100 text-xs text-slate-500">
                    <strong className="text-slate-700">Delivery Note:</strong> {win.deliveryNote}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Conversion Modal */}
      {selectedWinForConversion && (
        <div className="fixed inset-0 z-[1001] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-md w-full p-6 pb-20 sm:pb-6 shadow-2xl space-y-4 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
            {/* Mobile Sheet Bar */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto sm:hidden mb-1" />

            <div className="flex items-center gap-3 text-purple-700">
              <div className="p-3 bg-purple-100 rounded-xl shrink-0">
                <Wallet size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">Convert Prize to Store Credits</h3>
                <p className="text-xs text-slate-500">
                  Credit winner&apos;s non-withdrawable wallet balance
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-100 text-xs space-y-1.5 text-purple-900 font-medium">
              <p>
                Winner: <strong>{selectedWinForConversion.winner?.name}</strong>
              </p>
              <p>
                Prize Item: <strong>{selectedWinForConversion.item?.name}</strong>
              </p>
              <p>
                Item Market Value:{' '}
                <strong>₦{selectedWinForConversion.item?.value?.toLocaleString()}</strong>
              </p>
              <div className="text-[11px] text-purple-700 bg-purple-100/70 p-2.5 rounded-lg mt-2 font-normal leading-relaxed">
                💡 Credited funds are non-withdrawable cash and can only be used by the winner to
                purchase raffle tickets on the platform.
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Credit Amount (₦)
                </label>
                <input
                  type="number"
                  value={conversionAmount}
                  onChange={(e) => setConversionAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-600 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Admin Note / Reason
                </label>
                <textarea
                  value={conversionNote}
                  onChange={(e) => setConversionNote(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-purple-600 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedWinForConversion(null)}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmConversion}
                disabled={isConverting}
                className="px-5 py-2.5 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl shadow-md transition disabled:opacity-50"
              >
                {isConverting ? 'Converting...' : 'Confirm & Credit Wallet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredWins.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <Trophy size={48} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-lg font-bold text-slate-700">No win records found</h3>
          <p className="text-sm text-slate-500 mt-1">
            Completed raffles with winning claims will appear here.
          </p>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-4">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl disabled:opacity-50 hover:bg-slate-50 transition"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-xs text-slate-600 font-semibold">
            Page {page} of {pagination.totalPages}
          </span>
          <button
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl disabled:opacity-50 hover:bg-slate-50 transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
