// src/lib/api.ts
// Centralized API client with JWT auth & auto token refresh

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
}

// Get stored tokens
const getAccessToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
};

const getRefreshToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken');
};

// Store tokens
export const storeTokens = (accessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
};

// Clear tokens
export const clearTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
};

// Refresh the access token using refresh token
const refreshAccessToken = async (): Promise<string | null> => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
            clearTokens();
            return null;
        }

        const result: ApiResponse<{ accessToken: string; refreshToken?: string }> = await response.json();

        if (result.success && result.data?.accessToken) {
            localStorage.setItem('accessToken', result.data.accessToken);
            // The backend also rotates the refresh token
            if (result.data.refreshToken) {
                localStorage.setItem('refreshToken', result.data.refreshToken);
            }
            return result.data.accessToken;
        }

        // Refresh failed — clear everything
        clearTokens();
        return null;
    } catch {
        clearTokens();
        return null;
    }
};

// Core fetch wrapper with auth
async function apiFetch<T = unknown>(
    endpoint: string,
    options: RequestInit = {},
    retry = true,
): Promise<ApiResponse<T>> {
    const accessToken = getAccessToken();

    const isFormData = options.body instanceof FormData;

    const headers: Record<string, string> = {
        // Don't set Content-Type for FormData — browser sets it with boundary
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(options.headers as Record<string, string>),
    };

    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        cache: 'no-store',
        ...options,
        headers,
    });

    // If 401 and we haven't retried yet, try refreshing the token
    if (response.status === 401 && retry) {
        const newToken = await refreshAccessToken();
        if (newToken) {
            return apiFetch<T>(endpoint, options, false);
        }

        // Refresh failed, redirect to login
        if (typeof window !== 'undefined') {
            clearTokens();
            window.location.href = '/login';
        }
    }

    const result: ApiResponse<T> = await response.json();
    return result;
}

// Convenience methods
export const api = {
    get: <T = unknown>(endpoint: string) =>
        apiFetch<T>(endpoint, { method: 'GET' }),

    post: <T = unknown>(endpoint: string, body?: unknown) =>
        apiFetch<T>(endpoint, {
            method: 'POST',
            body: body instanceof FormData
                ? body
                : body ? JSON.stringify(body) : undefined,
        }),

    put: <T = unknown>(endpoint: string, body?: unknown) =>
        apiFetch<T>(endpoint, {
            method: 'PUT',
            body: body instanceof FormData
                ? body
                : body ? JSON.stringify(body) : undefined,
        }),

    delete: <T = unknown>(endpoint: string) =>
        apiFetch<T>(endpoint, { method: 'DELETE' }),
};

