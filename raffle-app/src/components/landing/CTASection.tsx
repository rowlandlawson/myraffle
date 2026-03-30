import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="py-14 px-4 bg-gradient-to-r from-red-600 via-red-500 to-orange-500 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white rounded-full" />
      </div>

      <div className="relative max-w-4xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
          Ready to Win Big?
        </h2>
        <p className="text-base sm:text-lg text-red-100 mb-8 max-w-xl mx-auto">
          Join thousands of winners today. Your first raffle ticket is waiting.
        </p>

        <Link
          href="/register"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-red-600 font-bold text-sm rounded-full hover:bg-red-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95"
        >
          Start Your Journey <ChevronRight size={18} />
        </Link>
      </div>
    </section>
  );
}

