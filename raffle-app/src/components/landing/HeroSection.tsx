'use client';

import Link from 'next/link';
import { ChevronRight, Search } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-slate-50 to-white py-20 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Win Amazing Prizes,{' '}
          <span className="text-red-600">Guaranteed Fair</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Join thousands of winners. Buy raffle tickets, complete tasks to earn
          points, and win big prizes with RaffleHub.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/register"
            className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-red-600/50 transition inline-flex items-center gap-2 justify-center"
          >
            Start Winning <ChevronRight size={20} />
          </Link>
          <a
            href="#items"
            className="px-8 py-4 border-2 border-red-600 text-red-600 font-bold rounded-lg hover:bg-red-50 transition inline-flex items-center gap-2 justify-center"
          >
            Browse Items <Search size={20} />
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl sm:text-3xl font-bold text-red-600">
              2,500+
            </div>
            <div className="text-gray-600 text-sm">Winners</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl sm:text-3xl font-bold text-red-600">
              50K+
            </div>
            <div className="text-gray-600 text-sm">Active Users</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl sm:text-3xl font-bold text-red-600">
              ₦500M+
            </div>
            <div className="text-gray-600 text-sm">Distributed</div>
          </div>
        </div>
      </div>
    </section>
  );
}
