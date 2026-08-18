'use client';

import { useAdminAnalytics, useAdminVisitors } from '@/lib/hooks/useAdmin';
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  Calendar,
  DollarSign,
  Eye,
  Globe,
  ShoppingCart,
  Ticket,
  TrendingUp,
  Trophy,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

function getThirtyDaysAgo() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().split('T')[0];
}

function getToday() {
  return new Date().toISOString().split('T')[0];
}

const PIE_COLORS = ['#E10600', '#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626'];
const TX_LABELS: Record<string, string> = {
  DEPOSIT: 'Deposits',
  TICKET_PURCHASE: 'Ticket Purchases',
  TASK_REWARD: 'Task Rewards',
  RAFFLE_WIN: 'Raffle Wins',
  REFUND: 'Refunds',
  WITHDRAWAL: 'Withdrawals',
};

function formatCurrency(n: number) {
  return `₦${n.toLocaleString('en-NG')}`;
}

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

interface TransactionBreakdownItem {
  type: string;
  count: number;
  name?: string;
}

interface TopItem {
  name: string;
  tickets: number;
  total: number;
  revenue: number;
}

interface VisitByDay {
  date: string;
  visits: number;
}

interface VisitByPath {
  path: string;
  visits: number;
}

interface RecentActivityItem {
  type: string;
  message: string;
  time: string;
  amount: number;
}

export default function AdminAnalyticsPage() {
  const [dateRange, setDateRange] = useState('7d');
  const [startDate, setStartDate] = useState(getThirtyDaysAgo());
  const [endDate, setEndDate] = useState(getToday());

  const { data, isLoading, error } = useAdminAnalytics(dateRange);
  const { data: visitorData, isLoading: visitorsLoading } = useAdminVisitors(startDate, endDate);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-red-600">
          {error instanceof Error ? error.message : 'Failed to load analytics'}
        </p>
      </div>
    );
  }

  const stats = [
    {
      label: 'Revenue',
      value: formatCurrency(data.stats.totalRevenue),
      change: data.stats.revenueChange,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
    },
    {
      label: 'New Users',
      value: data.stats.newUsers.toLocaleString(),
      change: data.stats.usersChange,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      label: 'Tickets Sold',
      value: data.stats.ticketsSold.toLocaleString(),
      change: data.stats.ticketsChange,
      icon: ShoppingCart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
    {
      label: 'Active Raffles',
      value: String(data.stats.activeRaffles),
      change: null,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
    },
  ];

  const revenueChartData = data.charts?.revenue || [];
  const ticketsChartData = data.charts?.tickets || [];
  const usersChartData = data.charts?.users || [];
  const txBreakdown = (data.transactionBreakdown || []).map((t: TransactionBreakdownItem) => ({
    ...t,
    name: TX_LABELS[t.type] || t.type,
  }));

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <BarChart3 size={24} className="text-red-600" />
            Analytics
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Platform performance & trends</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-400" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-red-500 shadow-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`bg-white rounded-2xl border ${stat.borderColor} p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-xl ${stat.bgColor}`}>
                <stat.icon size={18} className={stat.color} />
              </div>
              {stat.change !== null && (
                <span
                  className={`flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    stat.change >= 0 ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'
                  }`}
                >
                  {stat.change >= 0 ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                  {Math.abs(stat.change)}%
                </span>
              )}
            </div>
            <p className="text-xl md:text-2xl font-black text-gray-900">{stat.value}</p>
            <p className="text-[11px] text-gray-500 font-medium mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── Revenue & Funding Sources Breakdown ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-emerald-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-full">
              Direct Gateway Deposits
            </span>
            <DollarSign size={18} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-gray-900 mt-2">
            {formatCurrency(data.revenueBreakdown?.monnifyDeposits ?? 0)}
          </p>
          <p className="text-xs text-gray-400 mt-1">Real transfers via Monnify / Paystack</p>
        </div>

        <div className="bg-white rounded-2xl border border-amber-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider bg-amber-50 px-2.5 py-1 rounded-full">
              Wallet Rewards & Bonuses
            </span>
            <Trophy size={18} className="text-amber-600" />
          </div>
          <p className="text-2xl font-black text-gray-900 mt-2">
            {formatCurrency(data.revenueBreakdown?.walletBonuses ?? 0)}
          </p>
          <p className="text-xs text-gray-400 mt-1">Signup & task referral bonus funds</p>
        </div>

        <div className="bg-white rounded-2xl border border-purple-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider bg-purple-50 px-2.5 py-1 rounded-full">
              Ticket Sales Value
            </span>
            <Ticket size={18} className="text-purple-600" />
          </div>
          <p className="text-2xl font-black text-gray-900 mt-2">
            {formatCurrency(data.revenueBreakdown?.ticketSales ?? 0)}
          </p>
          <p className="text-xs text-gray-400 mt-1">Total value of purchased tickets</p>
        </div>
      </div>

      {/* ── Revenue Chart ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
          <DollarSign size={18} className="text-emerald-600" /> Revenue Overview
        </h2>
        <p className="text-xs text-gray-400 mb-4">Daily deposits for the selected period</p>
        <div className="h-64 md:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueChartData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tickFormatter={formatShortDate}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v: number) => formatCurrency(v)}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                width={60}
              />
              <Tooltip
                formatter={(value: unknown) => [
                  `₦${Number(value || 0).toLocaleString()}`,
                  'Revenue',
                ]}
                labelFormatter={(label: unknown) => formatShortDate(String(label || ''))}
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#059669"
                strokeWidth={2.5}
                fill="url(#revGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Tickets & Users Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Tickets Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
            <Ticket size={18} className="text-purple-600" /> Tickets Sold
          </h2>
          <p className="text-xs text-gray-400 mb-4">Daily ticket sales</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ticketsChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatShortDate}
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  formatter={(value: unknown) => [Number(value || 0), 'Tickets']}
                  labelFormatter={(label: unknown) => formatShortDate(String(label || ''))}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="tickets" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Users Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
            <Users size={18} className="text-blue-600" /> New Users
          </h2>
          <p className="text-xs text-gray-400 mb-4">Daily signups</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={usersChartData}>
                <defs>
                  <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatShortDate}
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  formatter={(value: unknown) => [Number(value || 0), 'Users']}
                  labelFormatter={(label: unknown) => formatShortDate(String(label || ''))}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fill="url(#userGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Transaction Breakdown + Top Items ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pie Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-base font-bold text-gray-900 mb-4">Transaction Breakdown</h2>
          {txBreakdown.length > 0 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={txBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="name"
                  >
                    {txBreakdown.map((item: TransactionBreakdownItem, i: number) => (
                      <Cell
                        key={item.type || item.name || `pie-cell-${i}`}
                        fill={PIE_COLORS[i % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: unknown, name: unknown) => [
                      Number(value || 0),
                      String(name || ''),
                    ]}
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb',
                      fontSize: 12,
                    }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 11, fontWeight: 600 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-12">No transaction data</p>
          )}
        </div>

        {/* Top Selling Items */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Trophy size={18} className="text-amber-500" /> Top Selling Items
          </h2>
          <div className="space-y-3">
            {data.topItems && data.topItems.length > 0 ? (
              data.topItems.map((item: TopItem, index: number) => {
                const pct = item.total > 0 ? Math.round((item.tickets / item.total) * 100) : 0;
                return (
                  <div key={item.name} className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center text-red-600 font-black text-xs border border-red-100">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">{item.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full bg-red-500 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-500 font-semibold shrink-0">
                          {item.tickets}/{item.total}
                        </span>
                      </div>
                    </div>
                    <p className="font-bold text-gray-900 text-xs shrink-0">
                      {formatCurrency(item.revenue)}
                    </p>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-400 text-sm text-center py-8">No items data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Ad Monetization Readiness Card ── */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 rounded-2xl p-6 text-white shadow-md border border-indigo-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 tracking-wider">
                Ad Integration Status
              </span>
            </div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              Public Audience & Ad Readiness
            </h2>
            <p className="text-xs text-indigo-200 mt-1 max-w-xl">
              Strictly tracking real public site visitors and registered users (excluding admin
              activity). Use this metric to determine when your traffic is high enough to integrate
              Google AdSense or sponsored ads.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10 shrink-0">
            <div>
              <p className="text-[11px] text-indigo-200 font-medium">Public Visitors</p>
              <p className="text-2xl font-black text-white">
                {visitorData?.uniqueVisitors?.toLocaleString() ?? 0}
              </p>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div>
              <p className="text-[11px] text-indigo-200 font-medium">Registered Users</p>
              <p className="text-2xl font-black text-emerald-400">
                {data.platformSummary?.totalUsers?.toLocaleString() ?? 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Website Visitors ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-50">
              <Eye size={18} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Public Site Traffic (Non-Admin)</h2>
              <p className="text-xs text-gray-400">
                Page views & unique visitors strictly on public pages
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-medium text-gray-500">From</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-red-500 bg-white"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-medium text-gray-500">To</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-red-500 bg-white"
              />
            </div>
          </div>
        </div>

        {visitorsLoading ? (
          <div className="flex items-center justify-center py-8">
            <span className="w-6 h-6 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : visitorData ? (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-indigo-50/60 rounded-xl p-4 border border-indigo-100">
                <div className="flex items-center gap-2">
                  <Globe size={20} className="text-indigo-600" />
                  <div>
                    <p className="text-xl font-black text-indigo-900">
                      {visitorData.totalVisits.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-indigo-600 font-medium">Total Page Views</p>
                  </div>
                </div>
              </div>
              <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-100">
                <div className="flex items-center gap-2">
                  <Users size={20} className="text-emerald-600" />
                  <div>
                    <p className="text-xl font-black text-emerald-900">
                      {visitorData.uniqueVisitors.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-emerald-600 font-medium">Unique Visitors</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Visits Bar Chart */}
            {visitorData.visitsByDay && visitorData.visitsByDay.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3">Daily Visits</h3>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={visitorData.visitsByDay.map((d: VisitByDay) => ({
                        ...d,
                        date:
                          typeof d.date === 'string'
                            ? d.date.split('T')[0]
                            : new Date(d.date).toISOString().split('T')[0],
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={formatShortDate}
                        tick={{ fontSize: 10, fill: '#9ca3af' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: '#9ca3af' }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        formatter={(value: unknown) => [Number(value || 0), 'Visits']}
                        labelFormatter={(label: unknown) => formatShortDate(String(label || ''))}
                        contentStyle={{
                          borderRadius: '12px',
                          border: '1px solid #e5e7eb',
                          fontSize: 12,
                        }}
                      />
                      <Bar dataKey="visits" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Visits by Path */}
            {visitorData.visitsByPath && visitorData.visitsByPath.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3">Visits by Page</h3>
                <div className="space-y-2">
                  {visitorData.visitsByPath.map((entry: VisitByPath) => {
                    const maxVisits = Math.max(
                      ...visitorData.visitsByPath.map((p: VisitByPath) => p.visits),
                    );
                    const widthPercent = maxVisits > 0 ? (entry.visits / maxVisits) * 100 : 0;
                    return (
                      <div key={entry.path} className="flex items-center gap-3">
                        <span className="text-xs font-mono text-gray-600 w-28 shrink-0 truncate">
                          {entry.path}
                        </span>
                        <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full flex items-center justify-end px-2 transition-all duration-500"
                            style={{ width: `${Math.max(widthPercent, 8)}%` }}
                          >
                            <span className="text-[9px] font-bold text-white">{entry.visits}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8 text-sm">
            No visitor data for the selected period
          </p>
        )}
      </div>

      {/* ── Platform Summary Banner ── */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-5 text-white">
        <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">
          Platform Totals (All Time)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <p className="text-gray-400 text-[11px] font-medium">Users</p>
            <p className="text-2xl font-black">
              {data.platformSummary?.totalUsers?.toLocaleString() ?? 0}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-[11px] font-medium">Raffles</p>
            <p className="text-2xl font-black">
              {data.platformSummary?.totalRaffles?.toLocaleString() ?? 0}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-[11px] font-medium">Tickets Sold</p>
            <p className="text-2xl font-black">
              {data.platformSummary?.totalTickets?.toLocaleString() ?? 0}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-[11px] font-medium">Active Draws</p>
            <p className="text-2xl font-black text-emerald-400">
              {data.platformSummary?.activeRaffles ?? 0}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-[11px] font-medium">Completed</p>
            <p className="text-2xl font-black text-amber-400">
              {data.platformSummary?.completedRaffles ?? 0}
            </p>
          </div>
        </div>
      </div>

      {/* ── Recent Activity ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-base font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {data.recentActivity && data.recentActivity.length > 0 ? (
            data.recentActivity.map((activity: RecentActivityItem, index: number) => {
              const dotColor =
                activity.type === 'deposit'
                  ? 'bg-emerald-500'
                  : activity.type === 'ticket_purchase'
                    ? 'bg-purple-500'
                    : activity.type === 'task_reward'
                      ? 'bg-amber-500'
                      : 'bg-gray-400';
              return (
                <div
                  key={`${activity.time}-${activity.type}-${index}`}
                  className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0"
                >
                  <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${dotColor}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 font-medium">{activity.message}</p>
                    <p className="text-[11px] text-gray-400">
                      {new Date(activity.time).toLocaleString()}
                    </p>
                  </div>
                  {activity.amount > 0 && (
                    <span
                      className={`text-xs font-bold shrink-0 ${activity.type === 'deposit' ? 'text-emerald-600' : 'text-gray-600'}`}
                    >
                      {formatCurrency(activity.amount)}
                    </span>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-gray-400 text-sm text-center py-6">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
}
