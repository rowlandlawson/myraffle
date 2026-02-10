'use client';

import { useState } from 'react';
import ItemsHeader from '@/components/admin/items/ItemsHeader';
import UploadForm from '@/components/admin/items/UploadForm';
import SearchFilters from '@/components/admin/items/SearchFilters';
import ItemsTable from '@/components/admin/items/ItemsTable';
import ItemsStats from '@/components/admin/items/ItemsStats';
import { Item } from '@/types/items';

// Initial data (could be fetched from API)
export const initialItems: Item[] = [
  {
    id: 1,
    name: 'iPhone 15 Pro Max',
    image: '📱',
    price: 850000,
    category: 'electronics',
    status: 'active',
    ticketPrice: 5000,
    ticketsTotal: 100,
    ticketsSold: 87,
    endsIn: '2 days',
    createdDate: '2026-01-15',
    createdBy: 'Admin User',
  },
  {
    id: 2,
    name: 'MacBook Pro 14"',
    image: '💻',
    price: 580000,
    category: 'electronics',
    status: 'active',
    ticketPrice: 8000,
    ticketsTotal: 50,
    ticketsSold: 45,
    endsIn: '5 days',
    createdDate: '2026-01-10',
    createdBy: 'Admin User',
  },
  {
    id: 3,
    name: 'PlayStation 5',
    image: '🎮',
    price: 330000,
    category: 'gaming',
    status: 'completed',
    ticketPrice: 6000,
    ticketsTotal: 60,
    ticketsSold: 60,
    endsIn: 'Completed',
    createdDate: '2026-01-01',
    createdBy: 'Admin User',
  },
];

export function AdminItemsPage() {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [filters, setFilters] = useState({
    searchTerm: '',
    status: 'all',
  });

  // Filter items based on search and status
  const filteredItems = items.filter((item) => {
    const searchMatch = item.name
      .toLowerCase()
      .includes(filters.searchTerm.toLowerCase());
    const statusMatch =
      filters.status === 'all' || item.status === filters.status;
    return searchMatch && statusMatch;
  });

  // Handlers
  const handleDeleteItem = (id: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleEditItem = (item: Item) => {
    // Open edit modal or navigate to edit page
    console.log('Edit item:', item);
  };

  const handleViewItem = (item: Item) => {
    // Navigate to item detail page
    console.log('View item:', item);
  };

  const handleUploadSubmit = (formData: any) => {
    // In real app, this would be an API call
    const newItem: Item = {
      id: items.length + 1,
      name: formData.name,
      image: '📦', // Default icon
      price: parseInt(formData.value),
      category: formData.category,
      status: 'active',
      ticketPrice: parseInt(formData.ticketPrice),
      ticketsTotal: parseInt(formData.totalTickets),
      ticketsSold: 0,
      endsIn: '7 days',
      createdDate: new Date().toISOString().split('T')[0],
      createdBy: 'Admin User',
    };

    setItems((prev) => [...prev, newItem]);
    setShowUploadForm(false);
    alert('Item uploaded successfully!');
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

      {/* Items Table */}
      <ItemsTable
        items={filteredItems}
        onDelete={handleDeleteItem}
        onEdit={handleEditItem}
        onView={handleViewItem}
      />

      {/* Stats */}
      <ItemsStats items={items} />
    </div>
  );
}

export default AdminItemsPage;
