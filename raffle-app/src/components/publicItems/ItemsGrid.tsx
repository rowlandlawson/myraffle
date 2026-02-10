'use client';

import { Item } from '@/types/publicItems';
import ItemCard from '@/components/publicItems/ItemCard';
import EmptyState from '@/components/publicItems/EmptyState';

interface ItemsGridProps {
  items: Item[];
  onViewDetails: (item: Item) => void;
}

export default function ItemsGrid({ items, onViewDetails }: ItemsGridProps) {
  if (items.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} onViewDetails={onViewDetails} />
      ))}
    </div>
  );
}
