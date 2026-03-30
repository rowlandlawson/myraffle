import React from 'react';
import { Ticket, Calendar } from 'lucide-react';
import type { AdminActiveRaffle } from '@/lib/hooks/useAdmin';

interface ActiveRafflesProps {
    raffles: AdminActiveRaffle[];
}

export default function ActiveRaffles({ raffles }: ActiveRafflesProps) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    if (!raffles || raffles.length === 0) {
        return (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Active Raffles</h2>
                <div className="text-sm text-gray-500 text-center py-8">
                    No active raffles found
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Active Raffles</h2>
            <div className="space-y-3">
                {raffles.map((raffle) => {
                    const progress = raffle.ticketsTotal > 0
                        ? Math.round((raffle.ticketsSold / raffle.ticketsTotal) * 100)
                        : 0;
                    const imageUrl = raffle.item.imageUrl?.startsWith('/uploads')
                        ? `${apiUrl}${raffle.item.imageUrl}`
                        : raffle.item.imageUrl;
                    const endDate = new Date(raffle.raffleDate).toLocaleDateString('en-NG', {
                        month: 'short', day: 'numeric', year: 'numeric',
                    });

                    return (
                        <div key={raffle.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                            {imageUrl ? (
                                <img src={imageUrl} alt={raffle.item.name} className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                            ) : (
                                <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center text-xl">📦</div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 text-sm truncate">{raffle.item.name}</p>
                                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Ticket size={12} />
                                        {raffle.ticketsSold}/{raffle.ticketsTotal}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar size={12} />
                                        {endDate}
                                    </span>
                                </div>
                                <div className="mt-1.5 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-red-500 rounded-full transition-all"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-gray-900">₦{raffle.ticketPrice.toLocaleString()}</p>
                                <p className="text-xs text-gray-500">{progress}% sold</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
