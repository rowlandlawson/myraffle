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
import { useItems } from '@/lib/useItems';
import { buyTicket } from '@/lib/useTickets';
import { useAuthStore } from '@/lib/authStore';

// Categories data - exported for reuse
export const categories: Category[] = [
  { id: 'all', name: 'All Items', count: 0 },
  { id: 'electronics', name: 'Electronics', count: 0 },
  { id: 'gaming', name: 'Gaming', count: 0 },
  { id: 'accessories', name: 'Accessories', count: 0 },
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
    return categoryMatch && searchMatch;
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
  if (ticketsTotal === 0) return 0;
  return Math.round((ticketsSold / ticketsTotal) * 100);
};

// Helper function to get time remaining
const getEndsIn = (raffleDate: string): string => {
  const now = new Date();
  const end = new Date(raffleDate);
  const diff = end.getTime() - now.getTime();
  if (diff <= 0) return 'Ended';
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days === 1) return '1 day';
  return `${days} days`;
};

// Main component
export function PublicItemsPage() {
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    searchTerm: '',
    sortBy: 'latest',
  });

  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [buyingItemId, setBuyingItemId] = useState<number | null>(null);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Fetch items from API
  const { items: apiItems, loading, error } = useItems({
    category: filters.category !== 'all' ? filters.category : undefined,
    search: filters.searchTerm || undefined,
  });

  // Map API items to the frontend Item type
  const mappedItems: Item[] = useMemo(() => {
    return apiItems.map((item, index) => {
      const activeRaffle = item.raffles[0]; // First active raffle
      const ticketsSold = activeRaffle?.ticketsSold ?? 0;
      const ticketsTotal = activeRaffle?.ticketsTotal ?? 0;
      return {
        id: index + 1, // numeric id for sorting compatibility
        _apiId: item.id, // preserve real id
        _raffleId: activeRaffle?.id ?? null,
        name: item.name,
        category: item.category,
        image: item.imageUrl?.startsWith('/uploads')
          ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${item.imageUrl}`
          : item.imageUrl || '📦',
        price: activeRaffle?.ticketPrice ?? 0,
        ticketsSold,
        ticketsTotal,
        endsIn: activeRaffle ? getEndsIn(activeRaffle.raffleDate) : 'N/A',
        raffleDate: activeRaffle?.raffleDate ?? '',
        description: item.description,
        status: item.status === 'ACTIVE' ? 'active' : 'completed',
        progress: calculateProgress(ticketsSold, ticketsTotal),
      } as Item & { _apiId: string; _raffleId: string | null };
    });
  }, [apiItems]);

  // Filter and sort on client side
  const filteredAndSortedItems = useMemo(() => {
    return filterAndSortItems(mappedItems, filters);
  }, [mappedItems, filters]);

  // Handlers
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleViewDetails = (item: Item) => {
    setSelectedItem(item);
  };

  const handleBuyTicket = async (itemId: number) => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    const item = mappedItems.find((i) => i.id === itemId) as any;
    if (!item?._raffleId) {
      alert('No active raffle for this item');
      return;
    }

    setBuyingItemId(itemId);
    try {
      await buyTicket(item._raffleId, 'wallet');
      alert('Ticket purchased successfully! 🎉');
      setSelectedItem(null);
    } catch (err: any) {
      alert(err.message || 'Failed to buy ticket');
    } finally {
      setBuyingItemId(null);
    }
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
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-gray-600">Loading items...</p>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <p className="text-red-600">{error}</p>
              </div>
            ) : (
              <>
                <ResultsCount count={filteredAndSortedItems.length} />
                <ItemsGrid
                  items={filteredAndSortedItems}
                  onViewDetails={handleViewDetails}
                />
              </>
            )}
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
