'use client';

interface BlockProgressBarProps {
  ticketsSold: number;
  ticketsTotal: number;
  totalBlocks?: number;
}

export default function BlockProgressBar({
  ticketsSold,
  ticketsTotal,
  totalBlocks = 10,
}: BlockProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (ticketsSold / ticketsTotal) * 100));
  const filledBlocks = Math.round((percentage / 100) * totalBlocks);

  return (
    <div className="flex gap-1 w-full my-1.5">
      {Array.from({ length: totalBlocks }).map((_, index) => {
        const isFilled = index < filledBlocks;
        return (
          <div
            key={`progress-block-${index + 1}`}
            className={`h-2.5 flex-1 rounded-[2px] transition-colors ${
              isFilled ? 'bg-red-600' : 'bg-gray-200'
            }`}
          />
        );
      })}
    </div>
  );
}
