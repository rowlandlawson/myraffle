'use client';

import { SortOption } from '@/types/publicItems';

interface SortOptionsProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export default function SortOptions({ value, onChange }: SortOptionsProps) {
  const options = [
    { value: 'latest', label: 'Latest' },
    { value: 'ending-soon', label: 'Ending Soon' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
  ];

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="font-bold text-gray-900 mb-4">Sort By</h3>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
