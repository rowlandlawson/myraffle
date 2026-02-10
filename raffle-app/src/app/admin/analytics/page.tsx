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

export default function AdminAnalyticsPage() {
  const [dateRange, setDateRange] = useState('7d');

  const stats = [
    {
      label: 'Total Revenue',
      value: '₦2,450,000',
      change: '+12.5%',
      isPositive: true,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'New Users',
      value: '1,234',
      change: '+8.2%',
      isPositive: true,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Tickets Sold',
      value: '5,678',
      change: '+15.3%',
      isPositive: true,
      icon: ShoppingCart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      label: 'Active Raffles',
      value: '12',
      change: '-2',
      isPositive: false,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  const topItems = [
    { name: 'iPhone 15 Pro Max', tickets: 450, revenue: '₦2,250,000' },
    { name: 'MacBook Pro 14"', tickets: 320, revenue: '₦2,560,000' },
    { name: 'PlayStation 5', tickets: 280, revenue: '₦1,680,000' },
    { name: 'Apple Watch Ultra', tickets: 210, revenue: '₦525,000' },
    { name: 'AirPods Pro Max', tickets: 180, revenue: '₦540,000' },
  ];

  const recentActivity = [
    {
      type: 'ticket',
      message: 'John D. purchased iPhone 15 Pro Max ticket',
      time: '2 min ago',
    },
    {
      type: 'user',
      message: 'New user registration: jane@example.com',
      time: '5 min ago',
    },
    {
      type: 'raffle',
      message: 'MacBook Pro raffle completed - Winner selected',
      time: '15 min ago',
    },
    {
      type: 'payout',
      message: 'Withdrawal request of ₦50,000 approved',
      time: '30 min ago',
    },
    {
      type: 'ticket',
      message: 'Sarah M. purchased PlayStation 5 ticket',
      time: '45 min ago',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Monitor platform performance and trends
          </p>
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
              <span
                className={`flex items-center gap-1 text-sm font-semibold ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}
              >
                {stat.isPositive ? (
                  <ArrowUp size={16} />
                ) : (
                  <ArrowDown size={16} />
                )}
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart Placeholder */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Revenue Trend
          </h2>
          <div className="h-64 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp size={48} className="text-red-600 mx-auto mb-2" />
              <p className="text-gray-600">
                Revenue chart will be displayed here
              </p>
              <p className="text-sm text-gray-500">
                Connect to analytics backend
              </p>
            </div>
          </div>
        </div>

        {/* User Growth Chart Placeholder */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">User Growth</h2>
          <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Users size={48} className="text-blue-600 mx-auto mb-2" />
              <p className="text-gray-600">
                User growth chart will be displayed here
              </p>
              <p className="text-sm text-gray-500">
                Connect to analytics backend
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Selling Items */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Top Selling Items
          </h2>
          <div className="space-y-4">
            {topItems.map((item, index) => (
              <div key={item.name} className="flex items-center gap-4">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    {item.tickets} tickets sold
                  </p>
                </div>
                <p className="font-bold text-gray-900">{item.revenue}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Recent Activity
          </h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0"
              >
                <div
                  className={`w-2 h-2 mt-2 rounded-full ${
                    activity.type === 'ticket'
                      ? 'bg-green-500'
                      : activity.type === 'user'
                        ? 'bg-blue-500'
                        : activity.type === 'raffle'
                          ? 'bg-purple-500'
                          : 'bg-orange-500'
                  }`}
                />
                <div className="flex-1">
                  <p className="text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats Summary */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-6 text-white">
        <h2 className="text-xl font-bold mb-4">Platform Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-red-200 text-sm">Total Users</p>
            <p className="text-2xl font-bold">12,456</p>
          </div>
          <div>
            <p className="text-red-200 text-sm">Total Raffles</p>
            <p className="text-2xl font-bold">248</p>
          </div>
          <div>
            <p className="text-red-200 text-sm">Tickets Sold (All Time)</p>
            <p className="text-2xl font-bold">45,678</p>
          </div>
          <div>
            <p className="text-red-200 text-sm">Total Payouts</p>
            <p className="text-2xl font-bold">₦15.2M</p>
          </div>
        </div>
      </div>
    </div>
  );
}
