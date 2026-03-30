// src/lib/hooks/useAdminTasks.ts
// TanStack Query hooks for admin task CRUD operations
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// ─── Types ──────────────────────────────────────────────────

export interface AdminTask {
    id: string;
    type: string;
    title: string;
    description: string;
    points: number;
    isActive: boolean;
    actionUrl: string | null;
    platform: string | null;
    adDuration: number | null;
    maxCompletions: number | null;
    dailyLimit: number | null;
    expiresAt: string | null;
    isPinned: boolean;
    priority: number;
    createdAt: string;
    updatedAt: string;
    _count: {
        completions: number;
    };
}

export interface CreateTaskInput {
    type: string;
    title: string;
    description: string;
    points: number;
    actionUrl?: string;
    platform?: string;
    adDuration?: number;
    maxCompletions?: number;
    dailyLimit?: number;
    expiresAt?: string;
    priority?: number;
    isPinned?: boolean;
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
    isActive?: boolean;
}

// ─── Query Keys ─────────────────────────────────────────────

export const adminTaskKeys = {
    all: ['admin', 'tasks'] as const,
    list: (page?: number) => [...adminTaskKeys.all, 'list', page] as const,
};

// ─── Hooks ──────────────────────────────────────────────────

/** Fetch all tasks (active + inactive) for admin */
export function useAdminTasks(page = 1) {
    return useQuery({
        queryKey: adminTaskKeys.list(page),
        queryFn: async () => {
            const res = await api.get<{
                tasks: AdminTask[];
                pagination: { page: number; limit: number; total: number; totalPages: number };
            }>(`/api/admin/tasks?page=${page}&limit=20`);
            return res.data!;
        },
    });
}

/** Create a new task */
export function useCreateTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (input: CreateTaskInput) => {
            const result = await api.post<AdminTask>('/api/admin/tasks', input);
            if (!result.success) throw new Error(result.message);
            return result.data!;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminTaskKeys.all });
        },
    });
}

/** Update an existing task */
export function useUpdateTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...input }: UpdateTaskInput & { id: string }) => {
            const result = await api.put<AdminTask>(`/api/admin/tasks/${id}`, input);
            if (!result.success) throw new Error(result.message);
            return result.data!;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminTaskKeys.all });
        },
    });
}

/** Permanently delete a task */
export function useDeleteTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (taskId: string) => {
            const result = await api.delete(`/api/admin/tasks/${taskId}`);
            if (!result.success) throw new Error(result.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminTaskKeys.all });
        },
    });
}
