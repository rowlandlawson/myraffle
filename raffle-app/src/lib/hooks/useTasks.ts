// src/lib/hooks/useTasks.ts
// TanStack Query hooks for tasks (earnings) API interactions
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// ─── Types ──────────────────────────────────────────────────
export interface ApiTask {
    id: string;
    type: string;
    title: string;
    description: string;
    points: number;
    isActive: boolean;
    createdAt: string;
    actionUrl?: string;
    platform?: string;
    adDuration?: number;
    dailyLimit?: number;
    isPinned?: boolean;
    priority?: number;
    // Drip-feed metadata (only present for logged-in users)
    completedToday?: boolean;
    recentlyCompleted?: boolean;
}

export interface CompletedTask {
    id: string;
    userId: string;
    taskId: string;
    pointsEarned: number;
    completedAt: string;
    task: {
        id: string;
        type: string;
        title: string;
        description: string;
        points: number;
    };
}

// ─── Types ──────────────────────────────────────────────────
export type StatsRange = 'today' | 'week' | 'month' | 'year' | 'all';

// ─── Query Keys ─────────────────────────────────────────────
export const taskKeys = {
    all: ['tasks'] as const,
    available: () => [...taskKeys.all, 'available'] as const,
    completed: (range?: StatsRange) => [...taskKeys.all, 'completed', range ?? 'all'] as const,
};

// ─── Hooks ──────────────────────────────────────────────────

/** Fetch all available tasks from GET /api/tasks */
export function useTasks() {
    return useQuery({
        queryKey: taskKeys.available(),
        queryFn: async () => {
            const res = await api.get<{
                tasks: ApiTask[];
                pagination: { page: number; limit: number; total: number; totalPages: number };
            }>('/api/tasks?limit=50');
            return res.data?.tasks ?? [];
        },
    });
}

/** Fetch user's completed tasks from GET /api/tasks/completed */
export function useCompletedTasks(range: StatsRange = 'all') {
    return useQuery({
        queryKey: taskKeys.completed(range),
        queryFn: async () => {
            const res = await api.get<{
                completedTasks: CompletedTask[];
                summary: {
                    totalTasksCompleted: number;
                    totalPointsEarned: number;
                    range: string;
                };
            }>(`/api/tasks/completed?range=${range}`);
            return {
                completedTasks: res.data?.completedTasks ?? [],
                summary: res.data?.summary ?? { totalTasksCompleted: 0, totalPointsEarned: 0, range },
            };
        },
    });
}

/** Complete a task via POST /api/tasks/:id/complete */
export function useCompleteTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (taskId: string) => {
            const result = await api.post<{
                pointsEarned: number;
                totalPoints: number;
            }>(`/api/tasks/${taskId}/complete`, {});
            if (!result.success) throw new Error(result.message);
            return result.data!;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: taskKeys.all });
        },
    });
}
