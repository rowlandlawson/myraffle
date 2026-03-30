'use client';

import { useState } from 'react';
import { Trophy, Package, Truck, CheckCircle, Clock, Search, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAdminWins, useUpdateDeliveryStatus } from '@/lib/hooks/useAdmin';

const DELIVERY_STATUSES = [
    { value: 'PENDING', label: 'Pending', icon: Clock, color: 'bg-gray-100 text-gray-700' },
    { value: 'PROCESSING', label: 'Processing', icon: Package, color: 'bg-yellow-100 text-yellow-700' },
    { value: 'SHIPPED', label: 'Shipped', icon: Truck, color: 'bg-blue-100 text-blue-700' },
    { value: 'DELIVERED', label: 'Delivered', icon: CheckCircle, color: 'bg-green-100 text-green-700' },
];

export default function AdminWinsPage() {
    const [filterStatus, setFilterStatus] = useState('all');
    const [page, setPage] = useState(1);
    const { data, isLoading } = useAdminWins({ page, deliveryStatus: filterStatus });
    const updateDelivery = useUpdateDeliveryStatus();

    const wins = data?.wins ?? [];
    const pagination = data?.pagination ?? null;

    const handleStatusChange = async (raffleId: string, newStatus: string) => {
        try {
            await updateDelivery.mutateAsync({ raffleId, deliveryStatus: newStatus });
            toast.success(`Delivery status updated to ${newStatus}`);
        } catch (err: any) {
            toast.error(err.message || 'Failed to update');
        }
    };

    return (
        <div className="space-y-6 pb-20 md:pb-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Trophy className="text-yellow-500" size={24} />
                        Wins Management
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Track and manage raffle winners and deliveries</p>
                </div>

                <select
                    value={filterStatus}
                    onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                    className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-500"
                >
                    <option value="all">All Statuses</option>
                    {DELIVERY_STATUSES.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                </select>
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
                            <div className="h-5 w-1/3 bg-gray-200 rounded mb-3" />
                            <div className="h-4 w-2/3 bg-gray-200 rounded mb-2" />
                            <div className="h-8 w-1/4 bg-gray-200 rounded" />
                        </div>
                    ))}
                </div>
            )}

            {/* Wins List */}
            {!isLoading && (
                <div className="space-y-4">
                    {wins.map((win: any) => {
                        const currentStatus = DELIVERY_STATUSES.find(s => s.value === win.deliveryStatus) || DELIVERY_STATUSES[0];
                        const StatusIcon = currentStatus.icon;
                        const imageUrl = win.item?.imageUrl?.startsWith('/uploads')
                            ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${win.item.imageUrl}`
                            : win.item?.imageUrl;

                        return (
                            <div key={win.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    {/* Item Image */}
                                    <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                                        {imageUrl ? (
                                            <img src={imageUrl} alt={win.item?.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-2xl">🏆</div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-900 text-sm">{win.item?.name}</h3>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Winner: <span className="font-semibold text-gray-700">{win.winner?.name}</span>
                                            {' '}({win.winner?.userNumber})
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            Won on: {new Date(win.updatedAt).toLocaleDateString()}
                                            {win.winner?.phone && ` • Phone: ${win.winner.phone}`}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            Value: ₦{win.item?.value?.toLocaleString()}
                                        </p>
                                    </div>

                                    {/* Status & Actions */}
                                    <div className="flex flex-col gap-2 sm:items-end shrink-0">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${currentStatus.color}`}>
                                            <StatusIcon size={14} />
                                            {currentStatus.label}
                                        </span>

                                        <select
                                            value={win.deliveryStatus}
                                            onChange={(e) => handleStatusChange(win.id, e.target.value)}
                                            disabled={updateDelivery.isPending}
                                            className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 bg-white disabled:opacity-50"
                                        >
                                            {DELIVERY_STATUSES.map(s => (
                                                <option key={s.value} value={s.value}>{s.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Delivery Note */}
                                {win.deliveryNote && (
                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                        <p className="text-xs text-gray-500">
                                            <span className="font-semibold">Note:</span> {win.deliveryNote}
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Empty */}
            {!isLoading && wins.length === 0 && (
                <div className="text-center py-16">
                    <Trophy size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700">No wins found</h3>
                    <p className="text-sm text-gray-500 mt-1">Completed raffles with winners will appear here</p>
                </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    <button
                        disabled={page <= 1}
                        onClick={() => setPage(p => p - 1)}
                        className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2 text-sm text-gray-500">
                        Page {page} of {pagination.totalPages}
                    </span>
                    <button
                        disabled={page >= pagination.totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
