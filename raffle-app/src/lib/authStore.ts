// src/lib/authStore.ts
// Zustand auth store — replaces NextAuth SessionProvider
'use client';

import { create } from 'zustand';
import { api, storeTokens, clearTokens } from './api';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    userNumber: string;
    walletBalance: number;
    rafflePoints: number;
    phone?: string;
    profileImage?: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    // Actions
    login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
    register: (data: {
        name: string;
        email: string;
        phone: string;
        password: string;
    }) => Promise<{ success: boolean; message: string }>;
    logout: () => Promise<void>;
    fetchUser: () => Promise<void>;
    setUser: (user: User | null) => void;
    hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,

    login: async (email, password) => {
        const result = await api.post<{
            accessToken: string;
            refreshToken: string;
            user: User;
        }>('/api/auth/login', { email, password });

        if (result.success && result.data) {
            storeTokens(result.data.accessToken, result.data.refreshToken);
            localStorage.setItem('user', JSON.stringify(result.data.user));
            set({
                user: result.data.user,
                isAuthenticated: true,
            });
        }

        return { success: result.success, message: result.message };
    },

    register: async (data) => {
        const result = await api.post('/api/auth/register', data);
        return { success: result.success, message: result.message };
    },

    logout: async () => {
        try {
            await api.post('/api/auth/logout');
        } catch {
            // Ignore errors — clear local state regardless
        }
        clearTokens();
        set({ user: null, isAuthenticated: false });
    },

    fetchUser: async () => {
        try {
            const result = await api.get<User>('/api/auth/me');
            if (result.success && result.data) {
                localStorage.setItem('user', JSON.stringify(result.data));
                set({ user: result.data, isAuthenticated: true, isLoading: false });
            } else {
                set({ user: null, isAuthenticated: false, isLoading: false });
            }
        } catch {
            set({ user: null, isAuthenticated: false, isLoading: false });
        }
    },

    setUser: (user) => {
        set({ user, isAuthenticated: !!user });
    },

    // Hydrate state from localStorage on app load
    hydrate: () => {
        if (typeof window === 'undefined') {
            set({ isLoading: false });
            return;
        }

        const token = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            try {
                const user = JSON.parse(storedUser) as User;
                set({ user, isAuthenticated: true, isLoading: false });
                // Refresh user data in the background
                get().fetchUser();
            } catch {
                clearTokens();
                set({ user: null, isAuthenticated: false, isLoading: false });
            }
        } else {
            set({ isLoading: false });
        }
    },
}));
