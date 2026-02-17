'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

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

// ─── Hooks ──────────────────────────────────────────────────

/** Fetch user's tickets from GET /api/tickets */
export function useTickets(params?: {
    page?: number;
    limit?: number;
    status?: string;
}) {
    const [tickets, setTickets] = useState<ApiTicket[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTickets = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const query = new URLSearchParams();
            if (params?.page) query.set('page', String(params.page));
            if (params?.limit) query.set('limit', String(params.limit));
            if (params?.status && params.status !== 'all') query.set('status', params.status);

            const qs = query.toString();
            const res = await api.get<{ tickets: ApiTicket[]; pagination: Pagination }>(`/api/tickets${qs ? `?${qs}` : ''}`);
            setTickets(res.data?.tickets ?? []);
            setPagination(res.data?.pagination ?? null);
        } catch (err: any) {
            setError(err.message || 'Failed to load tickets');
        } finally {
            setLoading(false);
        }
    }, [params?.page, params?.limit, params?.status]);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    return { tickets, pagination, loading, error, refetch: fetchTickets };
}

/** Fetch ticket history with stats from GET /api/tickets/history */
export function useTicketHistory() {
    const [tickets, setTickets] = useState<ApiTicket[]>([]);
    const [stats, setStats] = useState<TicketStats>({ total: 0, active: 0, won: 0, lost: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchHistory = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get<{ tickets: ApiTicket[]; stats: TicketStats }>('/api/tickets/history');
            setTickets(res.data?.tickets ?? []);
            setStats(res.data?.stats ?? { total: 0, active: 0, won: 0, lost: 0 });
        } catch (err: any) {
            setError(err.message || 'Failed to load ticket history');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return { tickets, stats, loading, error, refetch: fetchHistory };
}

// ─── API functions ──────────────────────────────────────────

/** POST /api/tickets — Buy a ticket */
export async function buyTicket(raffleId: string, paymentMethod: 'wallet' | 'points') {
    return api.post('/api/tickets', { raffleId, paymentMethod });
}
