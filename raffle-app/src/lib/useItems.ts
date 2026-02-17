'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

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

// ─── Hooks ──────────────────────────────────────────────────

/** Fetch paginated, filterable items from GET /api/items */
export function useItems(params?: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    search?: string;
}) {
    const [items, setItems] = useState<ApiItem[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const query = new URLSearchParams();
            if (params?.page) query.set('page', String(params.page));
            if (params?.limit) query.set('limit', String(params.limit));
            if (params?.category && params.category !== 'all') query.set('category', params.category);
            if (params?.status) query.set('status', params.status);
            if (params?.search) query.set('search', params.search);

            const qs = query.toString();
            const res = await api.get<{ items: ApiItem[]; pagination: Pagination }>(`/api/items${qs ? `?${qs}` : ''}`);
            setItems(res.data?.items ?? []);
            setPagination(res.data?.pagination ?? null);
        } catch (err: any) {
            setError(err.message || 'Failed to load items');
        } finally {
            setLoading(false);
        }
    }, [params?.page, params?.limit, params?.category, params?.status, params?.search]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    return { items, pagination, loading, error, refetch: fetchItems };
}

/** Fetch single item by ID from GET /api/items/:id */
export function useItem(id: string | null) {
    const [item, setItem] = useState<ApiItem | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        setError(null);
        api
            .get<ApiItem>(`/api/items/${id}`)
            .then((res) => setItem(res.data ?? null))
            .catch((err: any) => setError(err.message || 'Failed to load item'))
            .finally(() => setLoading(false));
    }, [id]);

    return { item, loading, error };
}

// ─── Admin API functions ────────────────────────────────────

/** POST /api/items — Create item with image upload */
export async function createItem(formData: FormData) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const token =
        typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

    const res = await fetch(`${API_URL}/api/items`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData, // Let browser set Content-Type with boundary
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create item');
    return data;
}

/** PUT /api/items/:id — Update item (optional image re-upload) */
export async function updateItem(id: string, formData: FormData) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const token =
        typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

    const res = await fetch(`${API_URL}/api/items/${id}`, {
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update item');
    return data;
}

/** DELETE /api/items/:id */
export async function deleteItem(id: string) {
    return api.delete(`/api/items/${id}`);
}
