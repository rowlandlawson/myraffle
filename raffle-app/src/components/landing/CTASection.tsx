import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="py-16 px-4 bg-gradient-to-br from-red-600 to-red-700">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Ready to Win?
        </h2>
        <p className="text-xl text-red-100 mb-8">
          Join thousands of winners today. Your first ticket is waiting.
        </p>

        <Link
          href="/register"
          className="inline-block px-8 py-4 bg-white text-red-600 font-bold rounded-lg hover:shadow-lg transition"
        >
          Start Your Journey <ChevronRight size={20} className="inline ml-2" />
        </Link>
      </div>
    </section>
  );
}
