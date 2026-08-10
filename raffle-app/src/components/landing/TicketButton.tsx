'use client';

interface TicketButtonProps {
  label?: string;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
}

export default function TicketButton({
  label = 'JOIN THE DRAW',
  onClick,
  className = '',
}: TicketButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`relative w-full py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm sm:text-base tracking-wider rounded-md flex items-center justify-center overflow-hidden transition-all active:scale-[0.99] shadow-sm ${className}`}
    >
      {/* Left ticket notch */}
      <span className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-r border-gray-100" />

      {/* Text */}
      <span>{label}</span>

      {/* Right ticket notch */}
      <span className="absolute right-[-8px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-l border-gray-100" />
    </button>
  );
}
