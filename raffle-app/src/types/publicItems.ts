export interface Item {
  id: number;
  name: string;
  category: string;
  image: string;
  price: number;
  ticketsSold: number;
  ticketsTotal: number;
  endsIn: string;
  raffleDate: string;
  description: string;
  status: 'active' | 'completed';
  progress: number;
}

export interface Category {
  id: string;
  name: string;
  count: number;
}

export type SortOption = 'latest' | 'ending-soon' | 'price-low' | 'price-high';

export interface FilterState {
  category: string;
  searchTerm: string;
  sortBy: SortOption;
}
