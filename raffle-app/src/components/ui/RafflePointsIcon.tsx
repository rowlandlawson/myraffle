// Custom Raffle Points icon — a coin/token with "RP" emblem
// Represents platform currency/points. More recognizable than the old gem shape.

interface RafflePointsIconProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
}

export default function RafflePointsIcon({
  size = 20,
  className = '',
  strokeWidth = 2,
}: RafflePointsIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Outer coin circle */}
      <circle cx="12" cy="12" r="10" />
      {/* Inner ring for coin depth */}
      <circle cx="12" cy="12" r="7" strokeWidth={strokeWidth * 0.75} />
      {/* "R" letter — stands for Raffle Points */}
      <path d="M10 8.5h2.5a2 2 0 0 1 0 4H10V8.5z" />
      <path d="M10 8.5v7" />
      <path d="M12.5 12.5L14.5 15.5" />
      {/* Small sparkle accents */}
      <line x1="4" y1="4" x2="5" y2="5" strokeWidth={strokeWidth * 0.6} />
      <line x1="19" y1="4" x2="20" y2="5" strokeWidth={strokeWidth * 0.6} />
    </svg>
  );
}
