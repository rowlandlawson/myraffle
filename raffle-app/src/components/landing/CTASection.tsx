import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CTASection() {
  return (
    <section className="py-20 px-4 bg-[#E10600] relative overflow-hidden">
      {/* Subtle texture circles */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-black/10 translate-y-1/3 -translate-x-1/4" />

      <div className="relative max-w-3xl mx-auto text-center">
        {/* Pill */}
        <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-4 py-1.5 mb-6">
          <span className="w-2 h-2 rounded-full bg-yellow-300 animate-pulse" />
          <span className="text-white/90 text-xs font-semibold tracking-wide">
            Draws happening now
          </span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 tracking-tight leading-[1.1]">
          Your next win
          <br />
          starts today.
        </h2>
        <p className="text-white/70 text-sm sm:text-base mb-8 max-w-md mx-auto">
          Join 50,000+ participants on Nigeria's most trusted raffle platform. Fair draws. Real
          prizes. Instant payouts.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-[#E10600] font-black text-sm rounded-xl hover:bg-red-50 transition-colors shadow-xl"
          >
            Create Free Account <ArrowRight size={16} />
          </Link>
          <Link
            href="#items"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-transparent text-white font-semibold text-sm rounded-xl border border-white/30 hover:bg-white/10 transition-colors"
          >
            Browse Live Draws
          </Link>
        </div>
      </div>
    </section>
  );
}
