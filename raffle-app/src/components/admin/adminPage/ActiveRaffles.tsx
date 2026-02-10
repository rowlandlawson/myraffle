'use client';

import Link from 'next/link';
import Card from '@/components/ui/Card';

interface Raffle {
  id: number;
  itemName: string;
  ticketsSold: number;
  ticketsTotal: number;
  endsIn: string;
  revenue: number;
  status: string;
}

interface ActiveRafflesProps {
  raffles: Raffle[];
}

export default function ActiveRaffles({ raffles }: ActiveRafflesProps) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-lg md:text-2xl font-bold text-gray-900">
          Active Raffles
        </h2>
        <Link
          href="/admin/raffles"
          className="text-red-600 font-semibold hover:text-red-700 text-sm md:text-base"
        >
          View All →
        </Link>
      </div>

      <div className="space-y-3 md:space-y-4">
        {raffles.map((raffle) => (
          <div
            key={raffle.id}
            className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 p-3 md:p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 hover:border-red-200 transition"
          >
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-sm md:text-base truncate">
                {raffle.itemName}
              </h3>
              <div className="flex flex-wrap gap-2 md:gap-4 text-xs md:text-sm text-gray-600 mt-1 md:mt-2">
                <span>
                  Tickets: {raffle.ticketsSold}/{raffle.ticketsTotal}
                </span>
                <span>Ends: {raffle.endsIn}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 md:h-2 overflow-hidden mt-2">
                <div
                  className="bg-gradient-to-r from-red-600 to-red-700 h-full"
                  style={{
                    width: `${(raffle.ticketsSold / raffle.ticketsTotal) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between md:block md:text-right gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
              <div>
                <p className="font-bold text-gray-900 text-sm md:text-base">
                  ₦{(raffle.revenue / 1000).toFixed(0)}k
                </p>
                <p className="text-xs text-gray-600">Revenue</p>
              </div>
              <Link
                href={`/admin/raffles/${raffle.id}`}
                className="px-3 md:px-4 py-1.5 md:py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-xs md:text-sm font-semibold md:hidden"
              >
                Manage
              </Link>
            </div>
            <Link
              href={`/admin/raffles/${raffle.id}`}
              className="hidden md:block px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-sm font-semibold flex-shrink-0"
            >
              Manage
            </Link>
          </div>
        ))}
      </div>
    </Card>
  );
}
