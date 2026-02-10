'use client';

import { Plus } from 'lucide-react';

interface UsersHeaderProps {
  title?: string;
  subtitle?: string;
  showAddButton?: boolean;
  onAddUser?: () => void; // Add this prop
}

export default function UsersHeader({
  title = 'User Management',
  subtitle = 'Manage user accounts and view their activity',
  showAddButton = true,
  onAddUser,
}: UsersHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-600">{subtitle}</p>
      </div>

      {showAddButton && onAddUser && (
        <button
          onClick={onAddUser}
          className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-red-600/50 transition flex items-center gap-2 justify-center"
        >
          <Plus size={20} /> Add New User
        </button>
      )}
    </div>
  );
}
