'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Clock, Users, Ticket } from 'lucide-react';

interface RaffleItem {
    id: number;
    name: string;
    image: string;
    ticketPrice: number;
    ticketsSold: number;
    ticketsTotal: number;
    status: 'active' | 'completed';
    endsIn: string;
}

interface RaffleCardProps {
    item: RaffleItem;
    isAuthenticated: boolean;
}

export default function RaffleCard({ item, isAuthenticated }: RaffleCardProps) {
    const progressPercent = Math.round(
        (item.ticketsSold / item.ticketsTotal) * 100,
    );
    const isImageUrl = item.image.startsWith('http') || item.image.startsWith('/');
    const ticketsRemaining = item.ticketsTotal - item.ticketsSold;

    return (
        <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-red-100 transition-all duration-300 overflow-hidden hover:-translate-y-1">
            {/* Image */}
            <div className="relative h-44 sm:h-48 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                {isImageUrl ? (
                    <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-6xl">
                        {item.image}
                    </div>
                )}

                {/* Status Badge */}
                {item.status === 'active' ? (
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-green-500/90 backdrop-blur-sm text-white text-xs font-bold rounded-full">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        LIVE
                    </div>
                ) : (
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-gray-800/80 backdrop-blur-sm text-white text-xs font-bold rounded-full">
                        ENDED
                    </div>
                )}

                {/* Countdown badge */}
                {item.status === 'active' && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-semibold rounded-full shadow-sm">
                        <Clock size={12} className="text-red-500" />
                        {item.endsIn}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-3 truncate">
                    {item.name}
                </h3>

                {/* Progress */}
                <div className="mb-3">
                    <div className="flex justify-between items-center mb-1.5">
                        <span className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                            <Users size={12} />
                            {item.ticketsSold}/{item.ticketsTotal} sold
                        </span>
                        <span className="text-xs font-bold text-red-600">
                            {progressPercent}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-700"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    <div className="mt-1 text-xs text-gray-400 font-medium">
                        <Ticket size={10} className="inline mr-0.5" />
                        {ticketsRemaining} ticket{ticketsRemaining !== 1 ? 's' : ''} left
                    </div>
                </div>

                {/* CTA Button */}
                {item.status === 'active' ? (
                    isAuthenticated ? (
                        <Link
                            href={`/dashboard`}
                            className="flex items-center justify-center w-full py-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold text-sm rounded-xl hover:from-red-700 hover:to-red-600 transition-all shadow-md shadow-red-600/20 hover:shadow-lg hover:shadow-red-600/30 active:scale-[0.98]"
                        >
                            ₦{item.ticketPrice.toLocaleString()} — Buy Ticket
                        </Link>
                    ) : (
                        <Link
                            href="/login"
                            className="flex items-center justify-center w-full py-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold text-sm rounded-xl hover:from-red-700 hover:to-red-600 transition-all shadow-md shadow-red-600/20 hover:shadow-lg hover:shadow-red-600/30 active:scale-[0.98]"
                        >
                            Join Now
                        </Link>
                    )
                ) : (
                    <button
                        disabled
                        className="w-full py-2.5 bg-gray-100 text-gray-400 font-bold text-sm rounded-xl cursor-not-allowed"
                    >
                        Draw Completed
                    </button>
                )}
            </div>
        </div>
    );
}

