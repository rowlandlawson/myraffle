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

// ─── Query Keys ─────────────────────────────────────────────
export const taskKeys = {
    all: ['tasks'] as const,
    available: () => [...taskKeys.all, 'available'] as const,
    completed: () => [...taskKeys.all, 'completed'] as const,
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
export function useCompletedTasks() {
    return useQuery({
        queryKey: taskKeys.completed(),
        queryFn: async () => {
            const res = await api.get<{
                completedTasks: CompletedTask[];
                summary: {
                    totalTasksCompleted: number;
                    totalPointsEarned: number;
                };
            }>('/api/tasks/completed');
            return {
                completedTasks: res.data?.completedTasks ?? [],
                summary: res.data?.summary ?? { totalTasksCompleted: 0, totalPointsEarned: 0 },
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
