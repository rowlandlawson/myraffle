// src/lib/hooks/useWallet.ts
// TanStack Query hooks for wallet API interactions
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// ─── Types ──────────────────────────────────────────────────
interface WalletBalance {
    walletBalance: number;
    rafflePoints: number;
}

interface Transaction {
    id: string;
    type: string;
    amount: number;
    status: string;
    reference: string | null;
    description: string | null;
    createdAt: string;
}

interface PaginatedTransactions {
    transactions: Transaction[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// ─── Query Keys ─────────────────────────────────────────────
export const walletKeys = {
    all: ['wallet'] as const,
    balance: () => [...walletKeys.all, 'balance'] as const,
    transactions: (page: number, limit: number) =>
        [...walletKeys.all, 'transactions', { page, limit }] as const,
};

// ─── Hooks ──────────────────────────────────────────────────

export function useWalletBalance() {
    return useQuery({
        queryKey: walletKeys.balance(),
        queryFn: async () => {
            const result = await api.get<WalletBalance>('/api/wallet/balance');
            if (!result.success || !result.data) throw new Error(result.message);
            return result.data;
        },
    });
}

export function useWalletTransactions(page = 1, limit = 20) {
    return useQuery({
        queryKey: walletKeys.transactions(page, limit),
        queryFn: async () => {
            const result = await api.get<PaginatedTransactions>(
                `/api/wallet/transactions?page=${page}&limit=${limit}`,
            );
            if (!result.success || !result.data) throw new Error(result.message);
            return result.data;
        },
    });
}

export function useInitiateDeposit() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (amount: number) => {
            const result = await api.post<{ authorizationUrl: string; reference: string }>(
                '/api/wallet/deposit',
                { amount },
            );
            if (!result.success || !result.data) throw new Error(result.message);
            return result.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: walletKeys.all });
        },
    });
}

export function useRequestWithdrawal() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: {
            amount: number;
            bankCode: string;
            accountNumber: string;
            accountName: string;
        }) => {
            const result = await api.post<{ withdrawalId: string; amount: number; status: string }>(
                '/api/wallet/withdraw',
                data,
            );
            if (!result.success || !result.data) throw new Error(result.message);
            return result.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: walletKeys.all });
        },
    });
}
