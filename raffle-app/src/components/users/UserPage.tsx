'use client';

import { useState } from 'react';
import UsersHeader from '@/components/users/UsersHeader';
import UserStats from '@/components/users/UserStats';
import UserFilters from '@/components/users/UserFilters';
import UsersTable from '@/components/users/UsersTable';
import UserActivity from '@/components/users/UserActivity';
import TopSpenders from '@/components/users/TopSpenders';
import { User, FilterState, StatsData } from '@/types/users';

// Initial data (could be fetched from API)
export const initialUsers: User[] = [
  {
    id: 1,
    userNumber: 'USER-98765',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '0801234567',
    status: 'active',
    joinDate: '2026-01-10',
    balance: 50000,
    rafflePoints: 2500,
    ticketsPurchased: 5,
    totalSpent: 25000,
    lastActive: '2 hours ago',
  },
  {
    id: 2,
    userNumber: 'USER-54321',
    name: 'Sarah M.',
    email: 'sarah@example.com',
    phone: '0809876543',
    status: 'active',
    joinDate: '2026-01-15',
    balance: 120000,
    rafflePoints: 5200,
    ticketsPurchased: 12,
    totalSpent: 96000,
    lastActive: '10 minutes ago',
  },
  {
    id: 3,
    userNumber: 'USER-11223',
    name: 'Alex K.',
    email: 'alex@example.com',
    phone: '0807654321',
    status: 'suspended',
    joinDate: '2026-01-05',
    balance: 0,
    rafflePoints: 0,
    ticketsPurchased: 3,
    totalSpent: 15000,
    lastActive: '5 days ago',
  },
  {
    id: 4,
    userNumber: 'USER-44556',
    name: 'Maria L.',
    email: 'maria@example.com',
    phone: '0805555555',
    status: 'active',
    joinDate: '2026-01-20',
    balance: 85000,
    rafflePoints: 1800,
    ticketsPurchased: 7,
    totalSpent: 42000,
    lastActive: '1 hour ago',
  },
  {
    id: 5,
    userNumber: 'USER-77889',
    name: 'Chris T.',
    email: 'chris@example.com',
    phone: '0803333333',
    status: 'active',
    joinDate: '2026-01-12',
    balance: 35000,
    rafflePoints: 900,
    ticketsPurchased: 2,
    totalSpent: 10000,
    lastActive: '30 minutes ago',
  },
];

// Helper function to calculate stats
export const calculateStats = (users: User[]): StatsData => {
  return {
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.status === 'active').length,
    suspendedUsers: users.filter((u) => u.status === 'suspended').length,
    totalWalletBalance: users.reduce((sum, u) => sum + u.balance, 0),
  };
};

// Helper function to filter users
export const filterUsers = (users: User[], filters: FilterState): User[] => {
  return users.filter((user) => {
    const searchMatch =
      user.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      user.userNumber.includes(filters.searchTerm);
    const statusMatch =
      filters.status === 'all' || user.status === filters.status;
    return searchMatch && statusMatch;
  });
};

// Main component
export function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    status: 'all',
  });

  // Calculate stats
  const stats = calculateStats(users);

  // Filter users based on search and status
  const filteredUsers = filterUsers(users, filters);

  // Handlers
  const handleToggleStatus = (id: number) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id
          ? {
              ...user,
              status: user.status === 'active' ? 'suspended' : 'active',
              lastActive:
                user.status === 'active' ? 'Just now' : user.lastActive,
            }
          : user,
      ),
    );
  };

  const handleEditUser = (user: User) => {
    // Open edit modal or navigate to edit page
    console.log('Edit user:', user);
  };

  const handleViewUser = (user: User) => {
    // Navigate to user detail page
    console.log('View user:', user);
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Handler to delete a user
  const handleDeleteUser = (id: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers((prev) => prev.filter((user) => user.id !== id));
    }
  };

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      {/* Stats */}
      <UserStats stats={stats} />

      {/* Search & Filters */}
      <UserFilters
        searchTerm={filters.searchTerm}
        filterStatus={filters.status}
        onSearchChange={(term) => handleFilterChange('searchTerm', term)}
        onFilterChange={(status) => handleFilterChange('status', status)}
      />

      {/* Users Table */}
      <UsersTable
        users={filteredUsers}
        onToggleStatus={handleToggleStatus}
        onEdit={handleEditUser}
        onView={handleViewUser}
        onDelete={handleDeleteUser}
      />

      {/* Activity & Top Spenders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UserActivity users={users} />
        <TopSpenders users={users} />
      </div>
    </div>
  );
}

export default AdminUsersPage;
