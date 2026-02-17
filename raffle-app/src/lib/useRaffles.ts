'use client';

import { useState, useEffect, useCallback } from 'react';
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

// ─── Hooks ──────────────────────────────────────────────────

/** Fetch paginated, filterable raffles from GET /api/raffles */
export function useRaffles(params?: {
    page?: number;
    limit?: number;
    status?: string;
}) {
    const [raffles, setRaffles] = useState<ApiRaffle[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRaffles = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const query = new URLSearchParams();
            if (params?.page) query.set('page', String(params.page));
            if (params?.limit) query.set('limit', String(params.limit));
            if (params?.status && params.status !== 'all') query.set('status', params.status);

            const qs = query.toString();
            const res = await api.get<{ raffles: ApiRaffle[]; pagination: Pagination }>(`/api/raffles${qs ? `?${qs}` : ''}`);
            setRaffles(res.data?.raffles ?? []);
            setPagination(res.data?.pagination ?? null);
        } catch (err: any) {
            setError(err.message || 'Failed to load raffles');
        } finally {
            setLoading(false);
        }
    }, [params?.page, params?.limit, params?.status]);

    useEffect(() => {
        fetchRaffles();
    }, [fetchRaffles]);

    return { raffles, pagination, loading, error, refetch: fetchRaffles };
}

/** Fetch single raffle by ID */
export function useRaffle(id: string | null) {
    const [raffle, setRaffle] = useState<ApiRaffle | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        api
            .get<ApiRaffle>(`/api/raffles/${id}`)
            .then((res) => setRaffle(res.data ?? null))
            .catch((err: any) => setError(err.message || 'Failed to load raffle'))
            .finally(() => setLoading(false));
    }, [id]);

    return { raffle, loading, error };
}

// ─── Admin API functions ────────────────────────────────────

/** POST /api/raffles — Create raffle */
export async function createRaffle(data: {
    itemId: string;
    ticketPrice: number;
    ticketsTotal: number;
    raffleDate: string;
}) {
    return api.post('/api/raffles', data);
}

/** PUT /api/raffles/:id — Update raffle */
export async function updateRaffle(
    id: string,
    data: Partial<{
        ticketPrice: number;
        ticketsTotal: number;
        raffleDate: string;
        status: string;
    }>,
) {
    return api.put(`/api/raffles/${id}`, data);
}

/** POST /api/raffles/:id/start — Trigger raffle draw */
export async function startRaffleDraw(id: string) {
    return api.post(`/api/raffles/${id}/start`, {});
}

/** GET /api/raffles/:id/winners — Get winner info */
export async function getRaffleWinner(id: string) {
    return api.get(`/api/raffles/${id}/winners`);
}
