'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import ItemCard from '@/components/shared/ItemCard';

interface Item {
  id: number;
  name: string;
  image: string;
  ticketPrice: number;
  ticketsSold: number;
  ticketsTotal: number;
  status: 'active' | 'completed';
  endsIn: string;
}

interface ItemsSectionProps {
  items: Item[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function ItemsSection({
  items,
  activeTab,
  onTabChange,
}: ItemsSectionProps) {
  const activeItems = items.filter((item) => item.status === 'active');
  const completedItems = items.filter((item) => item.status === 'completed');
  const displayItems = activeTab === 'active' ? activeItems : completedItems;

  return (
    <section id="items" className="py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Available Items
          </h2>
          <Link
            href="/items"
            className="text-red-600 font-semibold hover:text-red-700 flex items-center gap-2"
          >
            View All <ChevronRight size={20} />
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => onTabChange('active')}
            className={`px-6 py-3 font-semibold border-b-2 transition ${
              activeTab === 'active'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            🔴 Active Raffles ({activeItems.length})
          </button>
          <button
            onClick={() => onTabChange('completed')}
            className={`px-6 py-3 font-semibold border-b-2 transition ${
              activeTab === 'completed'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            ✓ Completed ({completedItems.length})
          </button>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
