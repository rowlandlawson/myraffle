'use client';

import { useState } from 'react';
import ItemsHeader from '@/components/admin/items/ItemsHeader';
import UploadForm from '@/components/admin/items/UploadForm';
import SearchFilters from '@/components/admin/items/SearchFilters';
import ItemsTable from '@/components/admin/items/ItemsTable';
import ItemsStats from '@/components/admin/items/ItemsStats';
import { Item } from '@/types/items';
import { useItems, createItem, deleteItem as deleteItemApi } from '@/lib/useItems';

export function AdminItemsPage() {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [filters, setFilters] = useState({
    searchTerm: '',
    status: 'all',
  });

  // Fetch items from API — show all statuses for admin
  const { items: apiItems, loading, error, refetch } = useItems({
    search: filters.searchTerm || undefined,
    status: filters.status !== 'all' ? filters.status.toUpperCase() : undefined,
    limit: 50,
  });

  // Map API items to the admin Item type
  const items: Item[] = apiItems.map((item) => {
    const activeRaffle = item.raffles[0];
    return {
      id: item.id as any,
      name: item.name,
      image: item.imageUrl?.startsWith('/uploads')
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${item.imageUrl}`
        : item.imageUrl || '📦',
      price: item.value,
      category: item.category,
      status: item.status === 'ACTIVE' ? 'active' : 'completed',
      ticketPrice: activeRaffle?.ticketPrice ?? 0,
      ticketsTotal: activeRaffle?.ticketsTotal ?? 0,
      ticketsSold: activeRaffle?.ticketsSold ?? 0,
      endsIn: activeRaffle
        ? getEndsIn(activeRaffle.raffleDate)
        : 'No raffle',
      createdDate: new Date(item.createdAt).toISOString().split('T')[0]!,
      createdBy: 'Admin',
    };
  });

  // Filter items client-side for search (API already filters by status)
  const filteredItems = items.filter((item) => {
    const searchMatch = item.name
      .toLowerCase()
      .includes(filters.searchTerm.toLowerCase());
    return searchMatch;
  });

  // Handlers
  const handleDeleteItem = async (id: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteItemApi(String(id));
        refetch();
      } catch (err: any) {
        alert(err.message || 'Failed to delete item');
      }
    }
  };

  const handleEditItem = (item: Item) => {
    console.log('Edit item:', item);
  };

  const handleViewItem = (item: Item) => {
    console.log('View item:', item);
  };

  const handleUploadSubmit = async (formData: any) => {
    try {
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('description', formData.description || formData.name);
      fd.append('value', String(formData.value));
      fd.append('category', formData.category);
      if (formData.image) {
        fd.append('image', formData.image);
      }

      await createItem(fd);
      setShowUploadForm(false);
      refetch();
      alert('Item created successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to create item');
    }
  };

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      {/* Header */}
      <ItemsHeader
        showUploadForm={showUploadForm}
        onToggleUploadForm={() => setShowUploadForm(!showUploadForm)}
      />

      {/* Upload Form */}
      {showUploadForm && (
        <UploadForm
          onCancel={() => setShowUploadForm(false)}
          onSubmit={handleUploadSubmit}
        />
      )}

      {/* Search & Filters */}
      <SearchFilters
        searchTerm={filters.searchTerm}
        filterStatus={filters.status}
        onSearchChange={(term) => handleFilterChange('searchTerm', term)}
        onFilterChange={(status) => handleFilterChange('status', status)}
      />

      {/* Loading / Error / Items Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Loading items...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
        </div>
      ) : (
        <>
          <ItemsTable
            items={filteredItems}
            onDelete={handleDeleteItem}
            onEdit={handleEditItem}
            onView={handleViewItem}
          />
          <ItemsStats items={items} />
        </>
      )}
    </div>
  );
}

function getEndsIn(raffleDate: string): string {
  const now = new Date();
  const end = new Date(raffleDate);
  const diff = end.getTime() - now.getTime();
  if (diff <= 0) return 'Ended';
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days === 1) return '1 day';
  return `${days} days`;
}

export default AdminItemsPage;
