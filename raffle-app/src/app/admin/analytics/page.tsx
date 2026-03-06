'use client';

import { useState } from 'react';
import {
  TrendingUp,
  Users,
  DollarSign,
  ShoppingCart,
  Calendar,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { useAdminAnalytics } from '@/lib/hooks/useAdmin';

export default function AdminAnalyticsPage() {
  const [dateRange, setDateRange] = useState('7d');
  const { data, isLoading, error } = useAdminAnalytics(dateRange);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></span>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-red-600">{error instanceof Error ? error.message : 'Failed to load analytics'}</p>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Revenue',
      value: `₦${data.stats.totalRevenue.toLocaleString()}`,
      change: data.stats.revenueChange ? `${data.stats.revenueChange > 0 ? '+' : ''}${data.stats.revenueChange}%` : 'N/A',
      isPositive: data.stats.revenueChange >= 0,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'New Users',
      value: data.stats.newUsers.toLocaleString(),
      change: data.stats.usersChange ? `${data.stats.usersChange > 0 ? '+' : ''}${data.stats.usersChange}%` : 'N/A',
      isPositive: data.stats.usersChange >= 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Tickets Sold',
      value: data.stats.ticketsSold.toLocaleString(),
      change: data.stats.ticketsChange ? `${data.stats.ticketsChange > 0 ? '+' : ''}${data.stats.ticketsChange}%` : 'N/A',
      isPositive: data.stats.ticketsChange >= 0,
      icon: ShoppingCart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      label: 'Active Raffles',
      value: String(data.stats.activeRaffles),
      change: '',
      isPositive: true,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Monitor platform performance and trends</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={20} className="text-gray-400" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon size={24} className={stat.color} />
              </div>
              {stat.change && (
                <span
                  className={`flex items-center gap-1 text-sm font-semibold ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}
                >
                  {stat.isPositive ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                  {stat.change}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Selling Items */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Top Selling Items</h2>
          <div className="space-y-4">
            {data.topItems.length > 0 ? (
              data.topItems.map((item, index) => (
                <div key={item.name} className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.tickets} tickets sold</p>
                  </div>
                  <p className="font-bold text-gray-900">₦{item.revenue.toLocaleString()}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No items data yet</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {data.recentActivity.length > 0 ? (
              data.recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0"
                >
                  <div
                    className={`w-2 h-2 mt-2 rounded-full ${activity.type === 'ticket_purchase'
                        ? 'bg-green-500'
                        : activity.type === 'deposit'
                          ? 'bg-blue-500'
                          : activity.type === 'withdrawal'
                            ? 'bg-purple-500'
                            : 'bg-orange-500'
                      }`}
                  />
                  <div className="flex-1">
                    <p className="text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.time).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Summary */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-6 text-white">
        <h2 className="text-xl font-bold mb-4">Platform Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-red-200 text-sm">Total Users</p>
            <p className="text-2xl font-bold">{data.platformSummary.totalUsers.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-red-200 text-sm">Total Raffles</p>
            <p className="text-2xl font-bold">{data.platformSummary.totalRaffles.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-red-200 text-sm">Tickets Sold (All Time)</p>
            <p className="text-2xl font-bold">{data.platformSummary.totalTicketsSold.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-red-200 text-sm">Total Payouts</p>
            <p className="text-2xl font-bold">₦{data.platformSummary.totalPayouts.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
