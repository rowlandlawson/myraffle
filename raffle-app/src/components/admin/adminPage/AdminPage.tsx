'use client';

import React from 'react';
import DashboardHeader from './DashboardHeader';
import StatsGrid from './StatsGrid';
import QuickActions from './QuickActions';
import AlertCards from './AlertCards';
import ActiveRaffles from './ActiveRaffles';
import RecentTransactions from './RecentTransactions';
import SystemHealth from './SystemHealth';
import { useAdminDashboard } from '@/lib/hooks/useAdmin';

export default function AdminPage() {
    const { data, isLoading, error } = useAdminDashboard();

    if (isLoading) {
        return (
            <div className="space-y-6">
                <DashboardHeader title="Admin Dashboard" subtitle="Welcome back, Administrator" />
                <div className="flex items-center justify-center py-20">
                    <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full" />
                        <p className="text-gray-500">Loading dashboard...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <DashboardHeader title="Admin Dashboard" subtitle="Welcome back, Administrator" />
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                    <p className="text-red-600">Failed to load dashboard data</p>
                    <p className="text-sm text-red-400 mt-1">{error instanceof Error ? error.message : 'Unknown error'}</p>
                </div>
            </div>
        );
    }

    const stats = data?.stats ?? {
        totalRevenue: 0,
        revenueThisMonth: 0,
        totalUsers: 0,
        activeUsers: 0,
        totalRaffles: 0,
        activeRaffles: 0,
        totalTicketsSold: 0,
        winnersThisMonth: 0,
        pendingPayouts: 0,
        failedTransactions: 0,
    };

    const alerts = {
        pendingPayouts: stats.pendingPayouts,
        failedTransactions: stats.failedTransactions,
    };

    return (
        <div className="space-y-6">
            <DashboardHeader title="Admin Dashboard" subtitle="Welcome back, Administrator" />

            <StatsGrid stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <QuickActions />
                    <ActiveRaffles raffles={data?.activeRaffles ?? []} />
                    <RecentTransactions transactions={data?.recentTransactions ?? []} />
                </div>

                <div className="space-y-6">
                    <AlertCards alerts={alerts} />
                    <SystemHealth />
                </div>
            </div>
        </div>
    );
}
