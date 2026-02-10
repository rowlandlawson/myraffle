'use client';

import { Search } from 'lucide-react';

interface SearchFiltersProps {
  searchTerm: string;
  filterStatus: string;
  onSearchChange: (term: string) => void;
  onFilterChange: (status: string) => void;
}

export default function SearchFilters({
  searchTerm,
  filterStatus,
  onSearchChange,
  onFilterChange,
}: SearchFiltersProps) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
            />
          </div>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => onFilterChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="draft">Draft</option>
        </select>
      </div>
    </div>
  );
}
