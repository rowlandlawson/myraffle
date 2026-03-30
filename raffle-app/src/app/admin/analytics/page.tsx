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
  Eye,
  Globe,
} from 'lucide-react';
import { useAdminAnalytics, useAdminVisitors } from '@/lib/hooks/useAdmin';

function getToday() {
  return new Date().toISOString().split('T')[0];
}

export default function AdminAnalyticsPage() {
  const [dateRange, setDateRange] = useState('7d');
  const [startDate, setStartDate] = useState(getToday());
  const [endDate, setEndDate] = useState(getToday());

  const { data, isLoading, error } = useAdminAnalytics(dateRange);
  const { data: visitorData, isLoading: visitorsLoading } = useAdminVisitors(startDate, endDate);

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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-sm text-gray-600">Monitor platform performance and trends</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={20} className="text-gray-400" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${stat.bgColor}`}>
                <stat.icon size={20} className={stat.color} />
              </div>
              {stat.change && (
                <span
                  className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-full ${stat.isPositive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}
                >
                  {stat.isPositive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                  {stat.change}
                </span>
              )}
            </div>
            <p className="text-xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ─── Website Visitors Section ───────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-100">
              <Eye size={20} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Website Visitors</h2>
              <p className="text-xs text-gray-500">Track visits to homepage, items, and dashboard</p>
            </div>
          </div>

          {/* Calendar Date Range Picker */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-medium text-gray-500">From</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-500 bg-white"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-medium text-gray-500">To</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-500 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Visitor Stats */}
        {visitorsLoading ? (
          <div className="flex items-center justify-center py-8">
            <span className="w-6 h-6 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
          </div>
        ) : visitorData ? (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl p-5 border border-indigo-100">
                <div className="flex items-center gap-3">
                  <Globe size={24} className="text-indigo-600" />
                  <div>
                    <p className="text-2xl font-bold text-indigo-900">{visitorData.totalVisits.toLocaleString()}</p>
                    <p className="text-xs text-indigo-600 font-medium">Total Page Visits</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-5 border border-emerald-100">
                <div className="flex items-center gap-3">
                  <Users size={24} className="text-emerald-600" />
                  <div>
                    <p className="text-2xl font-bold text-emerald-900">{visitorData.uniqueVisitors.toLocaleString()}</p>
                    <p className="text-xs text-emerald-600 font-medium">Unique Visitors</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visits by Path */}
            {visitorData.visitsByPath && visitorData.visitsByPath.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3">Visits by Page</h3>
                <div className="space-y-2">
                  {visitorData.visitsByPath.map((entry: any) => {
                    const maxVisits = Math.max(...visitorData.visitsByPath.map((p: any) => p.visits));
                    const widthPercent = maxVisits > 0 ? (entry.visits / maxVisits) * 100 : 0;
                    return (
                      <div key={entry.path} className="flex items-center gap-3">
                        <span className="text-xs font-mono text-gray-600 w-24 shrink-0 truncate">{entry.path}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full flex items-center justify-end px-2 transition-all duration-500"
                            style={{ width: `${Math.max(widthPercent, 8)}%` }}
                          >
                            <span className="text-[10px] font-bold text-white">{entry.visits}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Visits by Day */}
            {visitorData.visitsByDay && visitorData.visitsByDay.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3">Daily Visits</h3>
                <div className="flex items-end gap-1 h-32">
                  {visitorData.visitsByDay.map((day: any) => {
                    const maxDayVisits = Math.max(...visitorData.visitsByDay.map((d: any) => d.visits));
                    const heightPercent = maxDayVisits > 0 ? (day.visits / maxDayVisits) * 100 : 0;
                    const dateStr = typeof day.date === 'string' ? day.date.split('T')[0] : new Date(day.date).toISOString().split('T')[0];
                    return (
                      <div key={dateStr} className="flex-1 flex flex-col items-center gap-1 group">
                        <span className="text-[9px] text-gray-500 opacity-0 group-hover:opacity-100 transition">{day.visits}</span>
                        <div
                          className="w-full bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t-md transition-all duration-500 hover:from-indigo-600 hover:to-indigo-500 min-h-[4px]"
                          style={{ height: `${Math.max(heightPercent, 3)}%` }}
                        />
                        <span className="text-[8px] text-gray-400 truncate w-full text-center">{dateStr.slice(5)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No visitor data available for the selected period</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Items */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5">Top Selling Items</h2>
          <div className="space-y-4">
            {data.topItems.length > 0 ? (
              data.topItems.map((item, index) => (
                <div key={item.name} className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.tickets} tickets sold</p>
                  </div>
                  <p className="font-bold text-gray-900 text-sm">₦{item.revenue.toLocaleString()}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4 text-sm">No items data yet</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5">Recent Activity</h2>
          <div className="space-y-4">
            {data.recentActivity.length > 0 ? (
              data.recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0"
                >
                  <div
                    className={`w-2 h-2 mt-2 rounded-full shrink-0 ${activity.type === 'ticket_purchase'
                        ? 'bg-green-500'
                        : activity.type === 'deposit'
                          ? 'bg-blue-500'
                          : activity.type === 'withdrawal'
                            ? 'bg-purple-500'
                            : 'bg-orange-500'
                      }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 text-sm">{activity.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.time).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4 text-sm">No recent activity</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Summary */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 text-white">
        <h2 className="text-lg font-bold mb-4">Platform Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-red-200 text-xs">Total Users</p>
            <p className="text-2xl font-bold">{data.platformSummary.totalUsers.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-red-200 text-xs">Total Raffles</p>
            <p className="text-2xl font-bold">{data.platformSummary.totalRaffles.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-red-200 text-xs">Tickets Sold (All Time)</p>
            <p className="text-2xl font-bold">{data.platformSummary.totalTicketsSold.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-red-200 text-xs">Total Payouts</p>
            <p className="text-2xl font-bold">₦{data.platformSummary.totalPayouts.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
