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
    twoFactorEnabled?: boolean;
    twoFactorMethod?: string | null;
}

interface TwoFactorPending {
    tempToken: string;
    method: string; // 'EMAIL' or 'TOTP'
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    twoFactorPending: TwoFactorPending | null;

    // Actions
    login: (email: string, password: string) => Promise<{
        success: boolean;
        message: string;
        user?: User;
        requires2FA?: boolean;
        twoFactorMethod?: string;
    }>;
    verify2FA: (code: string) => Promise<{ success: boolean; message: string; user?: User }>;
    resend2FACode: () => Promise<{ success: boolean; message: string }>;
    register: (data: {
        name: string;
        email: string;
        phone: string;
        password: string;
    }) => Promise<{ success: boolean; message: string; data?: any }>;
    logout: () => Promise<void>;
    fetchUser: () => Promise<void>;
    setUser: (user: User | null) => void;
    hydrate: () => void;
    clearTwoFactorPending: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    twoFactorPending: null,

    login: async (email, password) => {
        const result = await api.post<{
            accessToken?: string;
            refreshToken?: string;
            user?: User;
            requires2FA?: boolean;
            tempToken?: string;
            method?: string;
        }>('/api/auth/login', { email, password });

        if (result.success && result.data) {
            // Check if 2FA is required
            if (result.data.requires2FA && result.data.tempToken && result.data.method) {
                set({
                    twoFactorPending: {
                        tempToken: result.data.tempToken,
                        method: result.data.method,
                    },
                });
                return {
                    success: true,
                    message: result.message,
                    requires2FA: true,
                    twoFactorMethod: result.data.method,
                };
            }

            // Normal login (no 2FA)
            if (result.data.accessToken && result.data.refreshToken && result.data.user) {
                storeTokens(result.data.accessToken, result.data.refreshToken);
                localStorage.setItem('user', JSON.stringify(result.data.user));
                set({
                    user: result.data.user,
                    isAuthenticated: true,
                    twoFactorPending: null,
                });
                return { success: true, message: result.message, user: result.data.user };
            }
        }

        return { success: result.success, message: result.message };
    },

    verify2FA: async (code) => {
        const pending = get().twoFactorPending;
        if (!pending) {
            return { success: false, message: 'No 2FA session found. Please log in again.' };
        }

        const result = await api.post<{
            accessToken: string;
            refreshToken: string;
            user: User;
        }>('/api/auth/2fa/verify', {
            tempToken: pending.tempToken,
            code,
        });

        if (result.success && result.data) {
            storeTokens(result.data.accessToken, result.data.refreshToken);
            localStorage.setItem('user', JSON.stringify(result.data.user));
            set({
                user: result.data.user,
                isAuthenticated: true,
                twoFactorPending: null,
            });
            return { success: true, message: result.message, user: result.data.user };
        }

        return { success: false, message: result.message };
    },

    resend2FACode: async () => {
        const pending = get().twoFactorPending;
        if (!pending) {
            return { success: false, message: 'No 2FA session found.' };
        }

        const result = await api.post('/api/auth/2fa/resend', {
            tempToken: pending.tempToken,
        });

        return { success: result.success, message: result.message };
    },

    register: async (data) => {
        const result = await api.post('/api/auth/register', data);
        return { success: result.success, message: result.message, data: result.data };
    },

    logout: async () => {
        try {
            await api.post('/api/auth/logout');
        } catch {
            // Ignore errors — clear local state regardless
        }
        clearTokens();
        set({ user: null, isAuthenticated: false, twoFactorPending: null });
    },

    fetchUser: async () => {
        try {
            const result = await api.get<{ user: User }>('/api/auth/me');
            if (result.success && result.data?.user) {
                localStorage.setItem('user', JSON.stringify(result.data.user));
                set({ user: result.data.user, isAuthenticated: true, isLoading: false });
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

    clearTwoFactorPending: () => {
        set({ twoFactorPending: null });
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
                // Show cached user immediately for UI, but keep isLoading=true
                // so guards (admin layout) wait for fetchUser() to confirm role
                set({ user, isAuthenticated: true, isLoading: true });
                // Fetch fresh user data — this sets isLoading=false when done
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
