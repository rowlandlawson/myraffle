'use client';

import Link from 'next/link';
import { ShieldAlert, Trophy, ArrowRight } from 'lucide-react';

export default function AdminPayoutsPage() {
  return (
    <div className="max-w-2xl mx-auto my-12 p-8 bg-white rounded-3xl shadow-sm border border-gray-100 text-center space-y-5">
      <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-100">
        <ShieldAlert size={32} />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Direct Cash Payouts Disabled</h1>
        <p className="text-sm text-gray-600 mt-2 leading-relaxed">
          The platform does not support direct cash bank payouts. If a physical raffle prize remains unclaimed by a winner over a period of time, administrators can convert the prize value into store credits on the winner&apos;s account. These wallet credits are non-withdrawable as cash and can be used by the winner to purchase tickets for upcoming raffles on the platform.
        </p>
      </div>

      <div className="pt-4">
        <Link
          href="/admin/wins"
          className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-md transition"
        >
          <Trophy size={18} />
          Go to Wins & Claims Management
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
