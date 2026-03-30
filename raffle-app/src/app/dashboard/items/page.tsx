'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, Star, Lock } from 'lucide-react';
import { useRaffles } from '@/lib/hooks/useRaffles';
import { convertNairaToPoints, CASH_PAYMENT_ENABLED } from '@/lib/constants';

export default function DashboardItemsPage() {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const { data: raffleData, isLoading } = useRaffles({
        status: 'ACTIVE',
        limit: 50,
    });

    const activeRaffles = raffleData?.raffles ?? [];

    // Filter by search and category
    const filteredRaffles = activeRaffles.filter((r) => {
        const matchesSearch = !search || r.item.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = category === 'all' || r.item.category === category;
        return matchesSearch && matchesCategory;
    });

    const categories = ['all', ...new Set(activeRaffles.map((r) => r.item.category))];

    return (
        <div className="space-y-6 pb-20 md:pb-0">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Browse Items</h1>
                <p className="text-sm text-gray-500 mt-1">Explore available raffle items and join to win</p>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search items..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20"
                    />
                </div>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-500"
                >
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                    ))}
                </select>
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
                            <div className="h-44 bg-gray-200" />
                            <div className="p-4 space-y-3">
                                <div className="h-5 w-3/4 bg-gray-200 rounded" />
                                <div className="h-4 w-1/2 bg-gray-200 rounded" />
                                <div className="h-8 w-full bg-gray-200 rounded-lg" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Items Grid */}
            {!isLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredRaffles.map((raffle) => {
                        const progress = Math.min(100, Math.round((raffle.ticketsSold / raffle.ticketsTotal) * 100));
                        const imageUrl = raffle.item.imageUrl?.startsWith('/uploads')
                            ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${raffle.item.imageUrl}`
                            : raffle.item.imageUrl;
                        const pointsValue = convertNairaToPoints(raffle.item.value);
                        const ticketPointsPrice = convertNairaToPoints(raffle.ticketPrice);
                        const daysLeft = Math.max(0, Math.ceil((new Date(raffle.raffleDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

                        return (
                            <div key={raffle.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group">
                                {/* Image */}
                                <div className="h-44 bg-gray-100 relative overflow-hidden">
                                    {imageUrl ? (
                                        <img
                                            src={imageUrl}
                                            alt={raffle.item.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                                    )}
                                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-xs font-bold px-2.5 py-1 rounded-full text-gray-700">
                                        {daysLeft}d left
                                    </div>
                                    <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                                        {raffle.item.category}
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-4 space-y-3">
                                    <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{raffle.item.name}</h3>

                                    {/* Value + Points */}
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-500">Value: ₦{raffle.item.value.toLocaleString()}</span>
                                        <span className="font-semibold text-yellow-600 flex items-center gap-1">
                                            <Star size={12} /> {pointsValue.toLocaleString()} pts
                                        </span>
                                    </div>

                                    {/* Progress */}
                                    <div>
                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                            <span>{raffle.ticketsSold}/{raffle.ticketsTotal} tickets</span>
                                            <span>{progress}% sold</span>
                                        </div>
                                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <Link
                                            href={`/items/${raffle.item.id || raffle.id}`}
                                            className="flex-1 text-center bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-2.5 rounded-xl transition"
                                        >
                                            ⭐ {ticketPointsPrice.toLocaleString()} pts / ticket
                                        </Link>
                                        {CASH_PAYMENT_ENABLED ? (
                                            <button className="px-3 py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-xl transition">
                                                ₦{raffle.ticketPrice.toLocaleString()}
                                            </button>
                                        ) : (
                                            <button
                                                disabled
                                                className="px-3 py-2.5 bg-gray-200 text-gray-400 text-xs font-semibold rounded-xl cursor-not-allowed relative group/cash"
                                                title="Cash payments coming soon"
                                            >
                                                <Lock size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredRaffles.length === 0 && (
                <div className="text-center py-16">
                    <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700">No items found</h3>
                    <p className="text-sm text-gray-500 mt-1">
                        {search ? 'Try adjusting your search or filters' : 'Check back soon for new raffle items!'}
                    </p>
                </div>
            )}
        </div>
    );
}
