// src/lib/useWallet.ts
// Custom hook for wallet API interactions
'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from './api';

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

export function useWalletBalance() {
    const [balance, setBalance] = useState<WalletBalance | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchBalance = useCallback(async () => {
        setIsLoading(true);
        const result = await api.get<WalletBalance>('/api/wallet/balance');
        if (result.success && result.data) {
            setBalance(result.data);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchBalance();
    }, [fetchBalance]);

    return { balance, isLoading, refetch: fetchBalance };
}

export function useWalletTransactions(page = 1, limit = 20) {
    const [data, setData] = useState<PaginatedTransactions | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTransactions = useCallback(async () => {
        setIsLoading(true);
        const result = await api.get<PaginatedTransactions>(
            `/api/wallet/transactions?page=${page}&limit=${limit}`,
        );
        if (result.success && result.data) {
            setData(result.data);
        }
        setIsLoading(false);
    }, [page, limit]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    return { data, isLoading, refetch: fetchTransactions };
}

export async function initiateDeposit(amount: number) {
    return api.post<{ authorizationUrl: string; reference: string }>(
        '/api/wallet/deposit',
        { amount },
    );
}

export async function requestWithdrawal(data: {
    amount: number;
    bankCode: string;
    accountNumber: string;
    accountName: string;
}) {
    return api.post<{ withdrawalId: string; amount: number; status: string }>(
        '/api/wallet/withdraw',
        data,
    );
}
