export interface User {
  id: number;
  userNumber: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'suspended';
  joinDate: string;
  balance: number;
  rafflePoints: number;
  ticketsPurchased: number;
  totalSpent: number;
  lastActive: string;
}

export interface FilterState {
  searchTerm: string;
  status: 'all' | 'active' | 'suspended';
}

export interface StatsData {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalWalletBalance: number;
}
