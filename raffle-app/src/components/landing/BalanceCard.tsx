'use client';

import RafflePointsIcon from '@/components/ui/RafflePointsIcon';
import { Wallet, Zap } from 'lucide-react';
import Link from 'next/link';

interface BalanceCardProps {
  isAuthenticated: boolean;
  walletBalance?: number;
  rafflePoints?: number;
}

export default function BalanceCard({
  isAuthenticated,
  walletBalance = 0,
  rafflePoints: _rafflePoints = 0,
}: BalanceCardProps) {
  if (!isAuthenticated) {
    return (
      <div className="px-4 pt-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center">
              <Wallet size={22} className="text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">CURRENT BALANCE</p>
              <p className="text-lg font-bold text-gray-900">Login to view</p>
            </div>
          </div>
          <Link
            href="/login"
            className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition active:scale-95"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center">
              <Wallet size={22} className="text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">CURRENT BALANCE</p>
              <p className="text-xl font-bold text-gray-900">
                ₦{walletBalance.toLocaleString()} NGN
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/wallet"
            className="px-3.5 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-xl hover:bg-red-100 transition active:scale-95 flex items-center gap-1"
          >
            + Top Up
          </Link>
        </div>
      </div>
    </div>
  );
}
