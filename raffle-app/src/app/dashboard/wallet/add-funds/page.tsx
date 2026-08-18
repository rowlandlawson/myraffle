'use client';

import { Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AddFundsPage() {
  const router = useRouter();

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-12 text-center">
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-4">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
          💰
        </div>
        <h1 className="text-2xl font-black text-gray-900">Earn Cash to Your Wallet</h1>
        <p className="text-gray-600 text-sm max-w-md mx-auto leading-relaxed">
          Direct cash deposits are temporarily disabled. You can complete simple daily tasks in your
          dashboard to earn cash rewards directly credited to your wallet balance!
        </p>

        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.push('/dashboard/tasks')}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition shadow-sm flex items-center justify-center gap-2"
          >
            <Zap size={18} />
            Complete Tasks & Earn
          </button>
          <button
            onClick={() => router.push('/dashboard/wallet')}
            className="px-6 py-3 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-sm transition"
          >
            Back to Wallet
          </button>
        </div>
      </div>
    </div>
  );
}
