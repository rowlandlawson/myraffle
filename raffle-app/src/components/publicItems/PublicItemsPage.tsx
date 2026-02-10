'use client';

import { useState, useMemo } from 'react';
import ItemsHeader from '@/components/publicItems/ItemsHeader';
import SearchBar from '@/components/publicItems/SearchBar';
import CategoryFilter from '@/components/publicItems/CategoryFilter';
import SortOptions from '@/components/publicItems/SortOptions';
import ItemsGrid from '@/components/publicItems/ItemsGrid';
import ItemDetailModal from '@/components/publicItems/ItemDetailModal';
import ResultsCount from '@/components/publicItems/ResultsCount';
import { Item, Category, FilterState } from '@/types/publicItems';

// Initial data - exported for reuse
export const initialItems: Item[] = [
  {
    id: 1,
    name: 'iPhone 15 Pro Max',
    category: 'electronics',
    image: '📱',
    price: 5000,
    ticketsSold: 87,
    ticketsTotal: 100,
    endsIn: '2 days',
    raffleDate: '2026-01-27',
    description: 'Latest Apple flagship smartphone with advanced features',
    status: 'active',
    progress: 87,
  },
  {
    id: 2,
    name: 'MacBook Pro 14"',
    category: 'electronics',
    image: '💻',
    price: 8000,
    ticketsSold: 45,
    ticketsTotal: 50,
    endsIn: '5 days',
    raffleDate: '2026-01-30',
    description: 'Professional laptop for creative work',
    status: 'active',
    progress: 90,
  },
  {
    id: 3,
    name: 'PlayStation 5',
    category: 'gaming',
    image: '🎮',
    price: 6000,
    ticketsSold: 60,
    ticketsTotal: 60,
    endsIn: 'Completed',
    raffleDate: '2026-01-25',
    description: 'Next-gen gaming console',
    status: 'completed',
    progress: 100,
  },
  {
    id: 4,
    name: 'AirPods Pro',
    category: 'electronics',
    image: '🎧',
    price: 2500,
    ticketsSold: 40,
    ticketsTotal: 60,
    endsIn: '1 day',
    raffleDate: '2026-01-26',
    description: 'Wireless noise-cancelling earbuds',
    status: 'active',
    progress: 67,
  },
  {
    id: 5,
    name: 'Nike Air Jordan 1',
    category: 'accessories',
    image: '👟',
    price: 3500,
    ticketsSold: 28,
    ticketsTotal: 50,
    endsIn: '3 days',
    raffleDate: '2026-01-28',
    description: 'Iconic basketball sneakers',
    status: 'active',
    progress: 56,
  },
  {
    id: 6,
    name: 'Apple Watch Series 9',
    category: 'electronics',
    image: '⌚',
    price: 4500,
    ticketsSold: 38,
    ticketsTotal: 60,
    endsIn: '4 days',
    raffleDate: '2026-01-29',
    description: 'Advanced smartwatch with health features',
    status: 'active',
    progress: 63,
  },
  {
    id: 7,
    name: 'Xbox Series X',
    category: 'gaming',
    image: '🎯',
    price: 5500,
    ticketsSold: 48,
    ticketsTotal: 70,
    endsIn: '6 days',
    raffleDate: '2026-01-31',
    description: 'Powerful gaming console',
    status: 'active',
    progress: 69,
  },
  {
    id: 8,
    name: 'Ray-Ban Aviator',
    category: 'accessories',
    image: '🕶️',
    price: 2000,
    ticketsSold: 25,
    ticketsTotal: 40,
    endsIn: '2 days',
    raffleDate: '2026-01-27',
    description: 'Classic sunglasses',
    status: 'active',
    progress: 63,
  },
  {
    id: 9,
    name: 'Samsung Galaxy S24',
    category: 'electronics',
    image: '📲',
    price: 4800,
    ticketsSold: 42,
    ticketsTotal: 80,
    endsIn: '7 days',
    raffleDate: '2026-02-01',
    description: 'Latest Samsung flagship',
    status: 'active',
    progress: 53,
  },
  {
    id: 10,
    name: 'Nintendo Switch OLED',
    category: 'gaming',
    image: '🎲',
    price: 3800,
    ticketsSold: 35,
    ticketsTotal: 55,
    endsIn: '4 days',
    raffleDate: '2026-01-29',
    description: 'Hybrid gaming console',
    status: 'active',
    progress: 64,
  },
  {
    id: 11,
    name: 'Dyson Airwrap',
    category: 'accessories',
    image: '💇',
    price: 5200,
    ticketsSold: 18,
    ticketsTotal: 30,
    endsIn: '5 days',
    raffleDate: '2026-01-30',
    description: 'Revolutionary hair styling tool',
    status: 'active',
    progress: 60,
  },
  {
    id: 12,
    name: 'iPad Pro 12.9"',
    category: 'electronics',
    image: '📟',
    price: 6500,
    ticketsSold: 22,
    ticketsTotal: 40,
    endsIn: '8 days',
    raffleDate: '2026-02-02',
    description: 'Professional tablet for creative work',
    status: 'active',
    progress: 55,
  },
];

// Categories data - exported for reuse
export const categories: Category[] = [
  { id: 'all', name: 'All Items', count: 12 },
  { id: 'electronics', name: 'Electronics', count: 6 },
  { id: 'gaming', name: 'Gaming', count: 3 },
  { id: 'accessories', name: 'Accessories', count: 3 },
];

// Helper function to filter and sort items
export const filterAndSortItems = (
  items: Item[],
  filters: FilterState,
): Item[] => {
  let result = items.filter((item) => {
    const categoryMatch =
      filters.category === 'all' || item.category === filters.category;
    const searchMatch = item.name
      .toLowerCase()
      .includes(filters.searchTerm.toLowerCase());
    const statusMatch = item.status === 'active';
    return categoryMatch && searchMatch && statusMatch;
  });

  // Sort items
  result.sort((a, b) => {
    switch (filters.sortBy) {
      case 'latest':
        return b.id - a.id;
      case 'ending-soon':
        return a.progress - b.progress;
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      default:
        return 0;
    }
  });

  return result;
};

// Helper function to calculate item progress
export const calculateProgress = (
  ticketsSold: number,
  ticketsTotal: number,
): number => {
  return Math.round((ticketsSold / ticketsTotal) * 100);
};

// Helper function to get item status
export const getItemStatus = (
  ticketsSold: number,
  ticketsTotal: number,
  raffleDate: string,
): 'active' | 'completed' | 'cancelled' => {
  if (ticketsSold >= ticketsTotal) return 'completed';
  // Add more logic here for date-based status if needed
  return 'active';
};

// Main component
export function PublicItemsPage() {
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    searchTerm: '',
    sortBy: 'latest',
  });

  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    return filterAndSortItems(initialItems, filters);
  }, [filters]);

  // Handlers
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleViewDetails = (item: Item) => {
    setSelectedItem(item);
  };

  const handleBuyTicket = (itemId: number) => {
    // Handle ticket purchase logic
    console.log('Buy ticket for item:', itemId);
    // In a real app, you would navigate to purchase page or open purchase modal
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <ItemsHeader />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:sticky md:top-20 md:h-fit space-y-6">
            <SearchBar
              value={filters.searchTerm}
              onChange={(value) => handleFilterChange('searchTerm', value)}
            />

            <CategoryFilter
              categories={categories}
              selectedCategory={filters.category}
              onSelectCategory={(category) =>
                handleFilterChange('category', category)
              }
            />

            <SortOptions
              value={filters.sortBy}
              onChange={(value) => handleFilterChange('sortBy', value)}
            />
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            {/* Results Count */}
            <ResultsCount count={filteredAndSortedItems.length} />

            {/* Items Grid */}
            <ItemsGrid
              items={filteredAndSortedItems}
              onViewDetails={handleViewDetails}
            />
          </div>
        </div>
      </div>

      {/* Item Detail Modal */}
      <ItemDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onBuyTicket={handleBuyTicket}
      />
    </div>
  );
}

export default PublicItemsPage;
