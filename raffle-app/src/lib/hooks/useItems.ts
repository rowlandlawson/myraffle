// src/lib/hooks/useItems.ts
// TanStack Query hooks for items API interactions
'use client';

import { api } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// ─── Types ──────────────────────────────────────────────────
export interface ApiItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  value: number;
  category: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  raffles: ApiRaffleSummary[];
}

export interface ApiRaffleSummary {
  id: string;
  ticketPrice: number;
  ticketsTotal: number;
  ticketsSold: number;
  raffleDate: string;
  status: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ─── Query Keys ─────────────────────────────────────────────
export const itemKeys = {
  all: ['items'] as const,
  lists: () => [...itemKeys.all, 'list'] as const,
  list: (params: Record<string, unknown>) => [...itemKeys.lists(), params] as const,
  details: () => [...itemKeys.all, 'detail'] as const,
  detail: (id: string) => [...itemKeys.details(), id] as const,
};

// ─── Hooks ──────────────────────────────────────────────────

export function useItems(params?: {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: itemKeys.list(params ?? {}),
    queryFn: async () => {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', String(params.page));
      if (params?.limit) query.set('limit', String(params.limit));
      if (params?.category && params.category !== 'all') query.set('category', params.category);
      if (params?.status) query.set('status', params.status);
      if (params?.search) query.set('search', params.search);

      const qs = query.toString();
      const res = await api.get<{ items: ApiItem[]; pagination: Pagination }>(
        `/api/items${qs ? `?${qs}` : ''}`,
      );
      return {
        items: res.data?.items ?? [],
        pagination: res.data?.pagination ?? null,
      };
    },
  });
}

export function useItem(id: string | null) {
  return useQuery({
    queryKey: itemKeys.detail(id ?? ''),
    queryFn: async () => {
      const res = await api.get<ApiItem>(`/api/items/${id}`);
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    enabled: !!id,
  });
}

// ─── Admin API mutations ────────────────────────────────────

export function useCreateItem() {
  const queryClient = useQueryClient();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

      // Check if this formData contains raffle fields (ticketPrice, totalTickets, raffleDate)
      const hasRaffleFields =
        formData.has('ticketPrice') && formData.has('totalTickets') && formData.has('raffleDate');

      // Use the appropriate endpoint based on whether we're creating a raffle or just an item
      const endpoint = hasRaffleFields ? '/api/raffles/create' : '/api/items';

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create item');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemKeys.all });
      // Also invalidate raffles queries if we created a raffle
      queryClient.invalidateQueries({ queryKey: ['raffles'] });
    },
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  return useMutation({
    mutationFn: async ({
      id,
      formData,
    }: {
      id: string;
      formData: FormData;
    }) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      const res = await fetch(`${API_URL}/api/items/${id}`, {
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update item');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemKeys.all });
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await api.delete(`/api/items/${id}`);
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemKeys.all });
    },
  });
}
