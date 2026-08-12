'use client';

import { useState } from 'react';
import { Trophy, Package, Truck, CheckCircle, Clock, Wallet, MapPin, Mail, Phone, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAdminWins, useUpdateDeliveryStatus } from '@/lib/hooks/useAdmin';
import { api } from '@/lib/api';

const DELIVERY_STATUSES = [
    { value: 'PENDING', label: 'Pending', icon: Clock, color: 'bg-gray-100 text-gray-700' },
    { value: 'PROCESSING', label: 'Processing', icon: Package, color: 'bg-yellow-100 text-yellow-700' },
    { value: 'SHIPPED', label: 'Shipped', icon: Truck, color: 'bg-blue-100 text-blue-700' },
    { value: 'DELIVERED', label: 'Delivered', icon: CheckCircle, color: 'bg-green-100 text-green-700' },
    { value: 'CONVERTED_TO_WALLET', label: 'Converted to Store Credits', icon: Wallet, color: 'bg-purple-100 text-purple-700' },
];

export default function AdminWinsPage() {
    const [filterStatus, setFilterStatus] = useState('all');
    const [page, setPage] = useState(1);
    const { data, isLoading, refetch } = useAdminWins({ page, deliveryStatus: filterStatus });
    const updateDelivery = useUpdateDeliveryStatus();

    const [selectedWinForConversion, setSelectedWinForConversion] = useState<any>(null);
    const [conversionAmount, setConversionAmount] = useState<number>(0);
    const [conversionNote, setConversionNote] = useState('');
    const [isConverting, setIsConverting] = useState(false);

    const wins = data?.wins ?? [];
    const pagination = data?.pagination ?? null;

    const handleStatusChange = async (raffleId: string, newStatus: string) => {
        try {
            await updateDelivery.mutateAsync({ raffleId, deliveryStatus: newStatus });
            toast.success(`Delivery status updated to ${newStatus}`);
        } catch (err: any) {
            toast.error(err.message || 'Failed to update delivery status');
        }
    };

    const handleOpenConversionModal = (win: any) => {
        setSelectedWinForConversion(win);
        setConversionAmount(win.item?.value || 0);
        setConversionNote(`Unclaimed/Unavailable physical prize converted to non-withdrawable store credits for ${win.item?.name}.`);
    };

    const handleConfirmConversion = async () => {
        if (!selectedWinForConversion) return;
        setIsConverting(true);
        try {
            const res = (await api.post(`/api/admin/wins/${selectedWinForConversion.id}/convert-to-wallet`, {
                amount: conversionAmount,
                note: conversionNote,
            })) as any;

            if (res.success) {
                toast.success(res.message || 'Prize successfully converted to store credits!');
                setSelectedWinForConversion(null);
                refetch();
            } else {
                toast.error(res.message || 'Failed to convert prize');
            }
        } catch (err: any) {
            toast.error(err.message || 'Error converting prize to store credit');
        } finally {
            setIsConverting(false);
        }
    };

    return (
        <div className="space-y-6 pb-20 md:pb-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Trophy className="text-yellow-500" size={24} />
                        Wins & Delivery Management
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Manage winner shipping info and prize-to-wallet conversions</p>
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

                        const winnerAddress = [win.winner?.address, win.winner?.city, win.winner?.state].filter(Boolean).join(', ');

                        return (
                            <div key={win.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
                                <div className="flex flex-col md:flex-row gap-5">
                                    {/* Item Image */}
                                    <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                                        {imageUrl ? (
                                            <img src={imageUrl} alt={win.item?.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-3xl">🏆</div>
                                        )}
                                    </div>

                                    {/* Info & Delivery Contact */}
                                    <div className="flex-1 min-w-0 space-y-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-base">{win.item?.name}</h3>
                                                <p className="text-xs text-gray-500 font-semibold">Value: ₦{win.item?.value?.toLocaleString()}</p>
                                            </div>
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${currentStatus.color}`}>
                                                <StatusIcon size={14} />
                                                {currentStatus.label}
                                            </span>
                                        </div>

                                        {/* Winner Contact details box */}
                                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs space-y-1">
                                            <p className="font-bold text-gray-800 flex items-center gap-1.5">
                                                Winner: {win.winner?.name} <span className="font-mono text-gray-400 text-[11px]">({win.winner?.userNumber})</span>
                                            </p>
                                            {win.winner?.email && (
                                                <p className="text-gray-600 flex items-center gap-1.5">
                                                    <Mail size={12} className="text-gray-400" /> {win.winner.email}
                                                </p>
                                            )}
                                            {win.winner?.phone && (
                                                <p className="text-gray-600 flex items-center gap-1.5">
                                                    <Phone size={12} className="text-gray-400" /> {win.winner.phone}
                                                </p>
                                            )}
                                            {winnerAddress ? (
                                                <p className="text-gray-700 flex items-start gap-1.5 font-medium">
                                                    <MapPin size={13} className="text-red-500 shrink-0 mt-0.5" /> Shipping Address: {winnerAddress}
                                                </p>
                                            ) : (
                                                <p className="text-gray-400 flex items-center gap-1.5 italic">
                                                    <MapPin size={12} className="text-gray-300" /> Delivery address not provided yet in profile
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-2.5 justify-center md:items-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
                                        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Update Delivery</label>
                                        <select
                                            value={win.deliveryStatus}
                                            onChange={(e) => handleStatusChange(win.id, e.target.value)}
                                            disabled={updateDelivery.isPending || win.deliveryStatus === 'CONVERTED_TO_WALLET'}
                                            className="text-xs px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 bg-white font-medium disabled:opacity-50"
                                        >
                                            {DELIVERY_STATUSES.map(s => (
                                                <option key={s.value} value={s.value}>{s.label}</option>
                                            ))}
                                        </select>

                                        {win.deliveryStatus !== 'CONVERTED_TO_WALLET' && (
                                            <button
                                                onClick={() => handleOpenConversionModal(win)}
                                                className="inline-flex items-center gap-1.5 px-3 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-xl text-xs font-semibold transition"
                                            >
                                                <Wallet size={13} />
                                                Convert Prize to Wallet
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Delivery Note */}
                                {win.deliveryNote && (
                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                        <p className="text-xs text-gray-500">
                                            <span className="font-semibold text-gray-700">Note:</span> {win.deliveryNote}
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Conversion Modal / Mobile Sheet */}
            {selectedWinForConversion && (
                <div className="fixed inset-0 z-[1001] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6">
                    <div className="bg-white rounded-t-3xl md:rounded-2xl max-w-md w-full p-6 pb-20 md:pb-6 shadow-2xl space-y-4 animate-in slide-in-from-bottom md:zoom-in-95 duration-200">
                        {/* Mobile Sheet Handle Bar */}
                        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto md:hidden mb-1" />

                        <div className="flex items-center gap-3 text-purple-700">
                            <div className="p-3 bg-purple-100 rounded-xl">
                                <Wallet size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">Convert Prize to Store Credit</h3>
                                <p className="text-xs text-gray-500">Credit winner's non-withdrawable wallet</p>
                            </div>
                        </div>

                        <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-xs space-y-1 text-purple-900 font-medium">
                            <p>Winner: <strong>{selectedWinForConversion.winner?.name}</strong></p>
                            <p>Prize Item: <strong>{selectedWinForConversion.item?.name}</strong></p>
                            <p>Item Value: <strong>₦{selectedWinForConversion.item?.value?.toLocaleString()}</strong></p>
                            <p className="text-[11px] text-purple-700 bg-purple-100/70 p-2 rounded-lg mt-1 font-normal">
                                💡 Fund winner&apos;s account for unclaimed/expired prizes. Credited funds are <strong>non-withdrawable as cash</strong> and can only be used to purchase raffle tickets on the platform.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Credit Amount (₦)</label>
                                <input
                                    type="number"
                                    value={conversionAmount}
                                    onChange={(e) => setConversionAmount(Number(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-600"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Admin Note / Reason</label>
                                <textarea
                                    value={conversionNote}
                                    onChange={(e) => setConversionNote(e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-purple-600"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                                onClick={() => setSelectedWinForConversion(null)}
                                className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmConversion}
                                disabled={isConverting}
                                className="px-4 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl shadow-md transition disabled:opacity-50"
                            >
                                {isConverting ? 'Converting...' : 'Confirm & Credit Wallet'}
                            </button>
                        </div>
                    </div>
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
