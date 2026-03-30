// src/lib/hooks/useAdmin.ts
// TanStack Query hooks for admin API interactions
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// ─── Types ──────────────────────────────────────────────────
export interface AdminDashboardData {
    stats: {
        totalRevenue: number;
        revenueThisMonth: number;
        totalUsers: number;
        activeUsers: number;
        totalRaffles: number;
        activeRaffles: number;
        totalTicketsSold: number;
        winnersThisMonth: number;
        pendingPayouts: number;
        failedTransactions: number;
    };
    recentTransactions: AdminTransaction[];
    activeRaffles: AdminActiveRaffle[];
}

export interface AdminTransaction {
    id: string;
    type: string;
    amount: number;
    status: string;
    reference: string | null;
    description: string | null;
    createdAt: string;
    user: {
        id: string;
        name: string;
        userNumber: string;
    };
}

export interface AdminActiveRaffle {
    id: string;
    ticketPrice: number;
    ticketsSold: number;
    ticketsTotal: number;
    raffleDate: string;
    status: string;
    item: {
        id: string;
        name: string;
        imageUrl: string;
        value: number;
    };
}

export interface AdminUser {
    id: string;
    userNumber: string;
    name: string;
    email: string;
    phone: string | null;
    walletBalance: number;
    rafflePoints: number;
    role: string;
    status: string;
    createdAt: string;
    _count: {
        tickets: number;
        transactions: number;
    };
}

export interface AdminWithdrawal {
    id: string;
    userId: string;
    amount: number;
    bankCode: string;
    accountNumber: string;
    accountName: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
    user: {
        id: string;
        name: string;
        userNumber: string;
        email: string;
    };
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

// ─── Query Keys ─────────────────────────────────────────────
export const adminKeys = {
    all: ['admin'] as const,
    dashboard: () => [...adminKeys.all, 'dashboard'] as const,
    users: (params: Record<string, unknown>) => [...adminKeys.all, 'users', params] as const,
    transactions: (params: Record<string, unknown>) =>
        [...adminKeys.all, 'transactions', params] as const,
    analytics: (dateRange: string) => [...adminKeys.all, 'analytics', dateRange] as const,
    withdrawals: (params: Record<string, unknown>) =>
        [...adminKeys.all, 'withdrawals', params] as const,
};

// ─── Hooks ──────────────────────────────────────────────────

/** GET /api/admin/dashboard */
export function useAdminDashboard() {
    return useQuery({
        queryKey: adminKeys.dashboard(),
        queryFn: async () => {
            const res = await api.get<AdminDashboardData>('/api/admin/dashboard');
            if (!res.success || !res.data) throw new Error(res.message);
            return res.data;
        },
    });
}

/** GET /api/admin/users */
export function useAdminUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
}) {
    return useQuery({
        queryKey: adminKeys.users(params ?? {}),
        queryFn: async () => {
            const query = new URLSearchParams();
            if (params?.page) query.set('page', String(params.page));
            if (params?.limit) query.set('limit', String(params.limit));
            if (params?.search) query.set('search', params.search);
            if (params?.status && params.status !== 'all') query.set('status', params.status);

            const qs = query.toString();
            const res = await api.get<{ users: AdminUser[]; pagination: Pagination }>(
                `/api/admin/users${qs ? `?${qs}` : ''}`,
            );
            return {
                users: res.data?.users ?? [],
                pagination: res.data?.pagination ?? null,
            };
        },
    });
}

/** GET /api/admin/transactions */
export function useAdminTransactions(params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    search?: string;
}) {
    return useQuery({
        queryKey: adminKeys.transactions(params ?? {}),
        queryFn: async () => {
            const query = new URLSearchParams();
            if (params?.page) query.set('page', String(params.page));
            if (params?.limit) query.set('limit', String(params.limit));
            if (params?.type && params.type !== 'all') query.set('type', params.type);
            if (params?.status && params.status !== 'all') query.set('status', params.status);
            if (params?.search) query.set('search', params.search);

            const qs = query.toString();
            const res = await api.get<{ transactions: AdminTransaction[]; pagination: Pagination }>(
                `/api/admin/transactions${qs ? `?${qs}` : ''}`,
            );
            return {
                transactions: res.data?.transactions ?? [],
                pagination: res.data?.pagination ?? null,
            };
        },
    });
}

/** GET /api/admin/analytics */
export function useAdminAnalytics(dateRange = '7d') {
    return useQuery({
        queryKey: adminKeys.analytics(dateRange),
        queryFn: async () => {
            const res = await api.get<{
                stats: {
                    totalRevenue: number;
                    newUsers: number;
                    ticketsSold: number;
                    activeRaffles: number;
                    revenueChange: number;
                    usersChange: number;
                    ticketsChange: number;
                };
                topItems: { name: string; tickets: number; revenue: number }[];
                recentActivity: { type: string; message: string; time: string }[];
                platformSummary: {
                    totalUsers: number;
                    totalRaffles: number;
                    totalTicketsSold: number;
                    totalPayouts: number;
                };
            }>(`/api/admin/analytics?range=${dateRange}`);
            if (!res.success || !res.data) throw new Error(res.message);
            return res.data;
        },
    });
}

/** GET /api/admin/withdrawals */
export function useAdminWithdrawals(params?: {
    page?: number;
    limit?: number;
    status?: string;
}) {
    return useQuery({
        queryKey: adminKeys.withdrawals(params ?? {}),
        queryFn: async () => {
            const query = new URLSearchParams();
            if (params?.page) query.set('page', String(params.page));
            if (params?.limit) query.set('limit', String(params.limit));
            if (params?.status && params.status !== 'all') query.set('status', params.status);

            const qs = query.toString();
            const res = await api.get<{ withdrawals: AdminWithdrawal[]; pagination: Pagination }>(
                `/api/admin/withdrawals${qs ? `?${qs}` : ''}`,
            );
            return {
                withdrawals: res.data?.withdrawals ?? [],
                pagination: res.data?.pagination ?? null,
            };
        },
    });
}

// ─── Admin Mutations ────────────────────────────────────────

export function useApproveWithdrawal() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const result = await api.put(`/api/admin/withdrawals/${id}/approve`, {});
            if (!result.success) throw new Error(result.message);
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminKeys.all });
        },
    });
}

export function useRejectWithdrawal() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const result = await api.put(`/api/admin/withdrawals/${id}/reject`, {});
            if (!result.success) throw new Error(result.message);
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminKeys.all });
        },
    });
}

export function useSuspendUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (userId: string) => {
            const result = await api.put('/api/users/suspend', { userId });
            if (!result.success) throw new Error(result.message);
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminKeys.users({}) });
        },
    });
}

export function useActivateUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (userId: string) => {
            const result = await api.put('/api/users/activate', { userId });
            if (!result.success) throw new Error(result.message);
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminKeys.users({}) });
        },
    });
}

// ─── Wins Management ────────────────────────────────────────

export const winsKeys = {
    all: ['admin', 'wins'] as const,
    list: (params: Record<string, unknown>) => [...winsKeys.all, params] as const,
};

export function useAdminWins(params?: {
    page?: number;
    deliveryStatus?: string;
}) {
    return useQuery({
        queryKey: winsKeys.list(params ?? {}),
        queryFn: async () => {
            const query = new URLSearchParams();
            if (params?.page) query.set('page', String(params.page));
            if (params?.deliveryStatus && params.deliveryStatus !== 'all')
                query.set('deliveryStatus', params.deliveryStatus);

            const qs = query.toString();
            const res = await api.get<{ wins: any[]; pagination: any }>(
                `/api/admin/wins${qs ? `?${qs}` : ''}`,
            );
            return {
                wins: res.data?.wins ?? [],
                pagination: res.data?.pagination ?? null,
            };
        },
    });
}

export function useUpdateDeliveryStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ raffleId, deliveryStatus, deliveryNote }: {
            raffleId: string;
            deliveryStatus: string;
            deliveryNote?: string;
        }) => {
            const result = await api.put(`/api/admin/wins/${raffleId}/delivery`, {
                deliveryStatus,
                deliveryNote,
            });
            if (!result.success) throw new Error(result.message);
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: winsKeys.all });
        },
    });
}

// ─── Visitor Analytics ──────────────────────────────────────

export function useAdminVisitors(startDate?: string, endDate?: string) {
    return useQuery({
        queryKey: [...adminKeys.all, 'visitors', startDate, endDate] as const,
        queryFn: async () => {
            const query = new URLSearchParams();
            if (startDate) query.set('startDate', startDate);
            if (endDate) query.set('endDate', endDate);
            const qs = query.toString();

            const res = await api.get<{
                totalVisits: number;
                uniqueVisitors: number;
                visitsByDay: { date: string; visits: number }[];
                visitsByPath: { path: string; visits: number }[];
            }>(`/api/admin/analytics/visitors${qs ? `?${qs}` : ''}`);

            if (!res.success || !res.data) throw new Error(res.message);
            return res.data;
        },
    });
}
