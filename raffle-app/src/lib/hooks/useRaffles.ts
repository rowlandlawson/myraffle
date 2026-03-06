// src/lib/hooks/useRaffles.ts
// TanStack Query hooks for raffles API interactions
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// ─── Types ──────────────────────────────────────────────────
export interface ApiRaffle {
    id: string;
    itemId: string;
    ticketPrice: number;
    ticketsTotal: number;
    ticketsSold: number;
    raffleDate: string;
    status: string;
    winnerUserId: string | null;
    createdAt: string;
    updatedAt: string;
    item: {
        id: string;
        name: string;
        imageUrl: string;
        value: number;
        category: string;
    };
    winner?: {
        id: string;
        name: string;
        userNumber: string;
    } | null;
    _count?: { tickets: number };
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

// ─── Query Keys ─────────────────────────────────────────────
export const raffleKeys = {
    all: ['raffles'] as const,
    lists: () => [...raffleKeys.all, 'list'] as const,
    list: (params: Record<string, unknown>) => [...raffleKeys.lists(), params] as const,
    details: () => [...raffleKeys.all, 'detail'] as const,
    detail: (id: string) => [...raffleKeys.details(), id] as const,
    winners: (id: string) => [...raffleKeys.all, 'winners', id] as const,
};

// ─── Hooks ──────────────────────────────────────────────────

export function useRaffles(params?: {
    page?: number;
    limit?: number;
    status?: string;
}) {
    return useQuery({
        queryKey: raffleKeys.list(params ?? {}),
        queryFn: async () => {
            const query = new URLSearchParams();
            if (params?.page) query.set('page', String(params.page));
            if (params?.limit) query.set('limit', String(params.limit));
            if (params?.status && params.status !== 'all') query.set('status', params.status);

            const qs = query.toString();
            const res = await api.get<{ raffles: ApiRaffle[]; pagination: Pagination }>(
                `/api/raffles${qs ? `?${qs}` : ''}`,
            );
            return {
                raffles: res.data?.raffles ?? [],
                pagination: res.data?.pagination ?? null,
            };
        },
    });
}

export function useRaffle(id: string | null) {
    return useQuery({
        queryKey: raffleKeys.detail(id ?? ''),
        queryFn: async () => {
            const res = await api.get<ApiRaffle>(`/api/raffles/${id}`);
            if (!res.success || !res.data) throw new Error(res.message);
            return res.data;
        },
        enabled: !!id,
    });
}

export function useRaffleWinner(raffleId: string | null) {
    return useQuery({
        queryKey: raffleKeys.winners(raffleId ?? ''),
        queryFn: async () => {
            const res = await api.get(`/api/raffles/${raffleId}/winners`);
            if (!res.success || !res.data) throw new Error(res.message);
            return res.data;
        },
        enabled: !!raffleId,
    });
}

// ─── Admin Mutations ────────────────────────────────────────

export function useCreateRaffle() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: {
            itemId: string;
            ticketPrice: number;
            ticketsTotal: number;
            raffleDate: string;
        }) => {
            const result = await api.post('/api/raffles', data);
            if (!result.success) throw new Error(result.message);
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: raffleKeys.all });
        },
    });
}

export function useUpdateRaffle() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            data,
        }: {
            id: string;
            data: Partial<{
                ticketPrice: number;
                ticketsTotal: number;
                raffleDate: string;
                status: string;
            }>;
        }) => {
            const result = await api.put(`/api/raffles/${id}`, data);
            if (!result.success) throw new Error(result.message);
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: raffleKeys.all });
        },
    });
}

export function useStartRaffleDraw() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const result = await api.post(`/api/raffles/${id}/start`, {});
            if (!result.success) throw new Error(result.message);
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: raffleKeys.all });
        },
    });
}
