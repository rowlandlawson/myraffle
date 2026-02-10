'use client';

import { Filter } from 'lucide-react';
import { Category } from '@/types/publicItems';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Filter size={20} /> Categories
      </h3>
      <div className="space-y-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`w-full text-left px-4 py-2 rounded-lg transition ${
              selectedCategory === cat.id
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="font-semibold">{cat.name}</span>
              <span className="text-sm">{cat.count}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
