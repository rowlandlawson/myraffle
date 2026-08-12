import TicketButton from '@/components/landing/TicketButton';
import { resolveImageUrl } from '@/lib/imageUrl';
import CountdownTimer from '@/components/shared/CountdownTimer';

export interface FeaturedItem {
  id: string | number;
  name: string;
  image: string;
  ticketPrice: number;
  ticketsSold: number;
  ticketsTotal: number;
  status: string;
  endsIn?: string;
  category?: string;
  raffleDate?: string | Date;
}

interface FeaturedRaffleCardProps {
  item: FeaturedItem;
  onViewDetails?: (item: any) => void;
}

export default function FeaturedRaffleCard({
  item,
  onViewDetails,
}: FeaturedRaffleCardProps) {
  const imageUrl = resolveImageUrl(item.image);
  const ticketsLeft = Math.max(0, item.ticketsTotal - item.ticketsSold);

  return (
    <div
      className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-6 cursor-pointer"
      onClick={() => onViewDetails?.(item)}
    >
      {/* Top Image Container with brand Yellow bg-yellow-400 */}
      <div className="relative w-full aspect-[4/3] bg-yellow-400 overflow-hidden flex items-center justify-center p-4">
        {/* Left Top Pill Badge */}
        <div className="absolute top-4 left-4 z-10 bg-white/95 rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-sm border border-red-600">
          <span className="text-red-600 font-extrabold text-sm sm:text-base">
            {ticketsLeft}
          </span>
          <span className="text-gray-800 text-xs font-bold">LEFT</span>
          <span className="text-gray-300 text-xs">|</span>
          <span className="text-gray-500 text-[10px] font-semibold">OUT OF</span>
          <span className="text-gray-900 font-bold text-xs sm:text-sm">
            {item.ticketsTotal}
          </span>
        </div>

        {/* Top Right POOL Badge */}
        <div className="absolute top-4 right-4 z-10 bg-slate-900 text-white text-[11px] font-black tracking-widest px-2.5 py-1 rounded-md shadow-sm border border-yellow-300 transform rotate-3">
          RAFFLE
        </div>

        {/* Main Product Image */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name}
            className="w-full h-full object-contain drop-shadow"
          />
        ) : (
          <div className="text-7xl">📦</div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-4 sm:p-5 bg-white space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base sm:text-lg font-extrabold text-gray-900 truncate">
            {item.name}
          </h3>
          {item.raffleDate && <CountdownTimer targetDate={item.raffleDate} compact />}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-red-600 font-extrabold text-base sm:text-lg">
              {item.ticketPrice.toLocaleString()} NGN
            </span>
            <span className="text-gray-500 text-xs font-medium ml-1">/ticket</span>
          </div>
          {item.raffleDate && (
            <CountdownTimer targetDate={item.raffleDate} className="hidden sm:flex" />
          )}
        </div>

        {/* JOIN THE DRAW Ticket Button */}
        <TicketButton
          label="JOIN THE DRAW"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails?.(item);
          }}
        />
      </div>
    </div>
  );
}
