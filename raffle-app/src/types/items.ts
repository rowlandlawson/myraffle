export interface Item {
  id: number;
  name: string;
  image: string;
  price: number;
  category: string;
  status: 'active' | 'completed';
  ticketPrice: number;
  ticketsTotal: number;
  ticketsSold: number;
  endsIn: string;
  createdDate: string;
  createdBy: string;
}

export interface FilterState {
  searchTerm: string;
  status: 'all' | 'active' | 'completed';
}
