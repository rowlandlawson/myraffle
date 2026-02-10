import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import WinnerCard from '@/components/shared/WinnerCard';

interface Winner {
  id: number;
  userNumber: string;
  itemName: string;
  date: string;
}

interface WinnersSectionProps {
  winners: Winner[];
}

export default function WinnersSection({ winners }: WinnersSectionProps) {
  return (
    <section id="winners" className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
          Recent Winners 🎉
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {winners.map((winner) => (
            <WinnerCard key={winner.id} winner={winner} />
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/winners"
            className="text-red-600 font-semibold hover:text-red-700 inline-flex items-center gap-2"
          >
            View All Winners <ChevronRight size={20} />
          </Link>
        </div>
      </div>
    </section>
  );
}
