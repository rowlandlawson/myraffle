'use client';

import Link from 'next/link';

interface PromoBannerProps {
  isAuthenticated: boolean;
}

export default function PromoBanner({ isAuthenticated }: PromoBannerProps) {
  return (
    <section className="bg-red-600">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-white">
            <h2 className="text-base sm:text-lg font-semibold tracking-tight">
              Win Amazing Prizes Today
            </h2>
            <p className="text-sm text-red-100">
              Enter live raffle draws &bull; Guaranteed fair &bull; Free delivery
            </p>
          </div>

          {!isAuthenticated && (
            <Link
              href="/register"
              className="px-6 py-2.5 bg-white text-red-600 font-semibold text-sm rounded-lg hover:bg-red-50 transition-colors whitespace-nowrap"
            >
              Get Started
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
