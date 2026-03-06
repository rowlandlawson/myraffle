// src/lib/hooks/useTickets.ts
// TanStack Query hooks for tickets API interactions
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { walletKeys } from './useWallet';

// ─── Types ──────────────────────────────────────────────────
export interface ApiTicket {
    id: string;
    userId: string;
    raffleId: string;
    ticketNumber: string;
    status: string; // ACTIVE | WON | LOST
    createdAt: string;
    raffle: {
        id: string;
        ticketPrice: number;
        ticketsTotal: number;
        ticketsSold: number;
        raffleDate: string;
        status: string;
        item: {
            id: string;
            name: string;
            imageUrl: string;
            value: number;
            category?: string;
        };
        winner?: {
            id: string;
            name: string;
        } | null;
    };
}

export interface TicketStats {
    total: number;
    active: number;
    won: number;
    lost: number;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

// ─── Query Keys ─────────────────────────────────────────────
export const ticketKeys = {
    all: ['tickets'] as const,
    lists: () => [...ticketKeys.all, 'list'] as const,
    list: (params: Record<string, unknown>) => [...ticketKeys.lists(), params] as const,
    history: () => [...ticketKeys.all, 'history'] as const,
};

// ─── Hooks ──────────────────────────────────────────────────

export function useTickets(params?: {
    page?: number;
    limit?: number;
    status?: string;
}) {
    return useQuery({
        queryKey: ticketKeys.list(params ?? {}),
        queryFn: async () => {
            const query = new URLSearchParams();
            if (params?.page) query.set('page', String(params.page));
            if (params?.limit) query.set('limit', String(params.limit));
            if (params?.status && params.status !== 'all') query.set('status', params.status);

            const qs = query.toString();
            const res = await api.get<{ tickets: ApiTicket[]; pagination: Pagination }>(
                `/api/tickets${qs ? `?${qs}` : ''}`,
            );
            return {
                tickets: res.data?.tickets ?? [],
                pagination: res.data?.pagination ?? null,
            };
        },
    });
}

export function useTicketHistory() {
    return useQuery({
        queryKey: ticketKeys.history(),
        queryFn: async () => {
            const res = await api.get<{ tickets: ApiTicket[]; stats: TicketStats }>(
                '/api/tickets/history',
            );
            return {
                tickets: res.data?.tickets ?? [],
                stats: res.data?.stats ?? { total: 0, active: 0, won: 0, lost: 0 },
            };
        },
    });
}

// ─── Mutations ──────────────────────────────────────────────

export function useBuyTicket() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            raffleId,
            paymentMethod,
        }: {
            raffleId: string;
            paymentMethod: 'wallet' | 'points';
        }) => {
            const result = await api.post('/api/tickets', { raffleId, paymentMethod });
            if (!result.success) throw new Error(result.message);
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ticketKeys.all });
            queryClient.invalidateQueries({ queryKey: walletKeys.all });
        },
    });
}
