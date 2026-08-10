import Image from 'next/image';

type TicketStatus = 'active' | 'won' | 'lost';

interface TicketCardProps {
  ticket: {
    id: string | number;
    ticketNumber: string;
    item: string;
    image: string;
    price: number;
    purchaseDate: string;
    raffleDate: string;
    status: TicketStatus;
    daysLeft: number;
    winnerNotification?: string;
    loserMessage?: string;
  };
}

export default function TicketCard({ ticket }: TicketCardProps) {
  const getBadgeStyle = (status: TicketStatus): string => {
    switch (status) {
      case 'active':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'won':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'lost':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCardBorder = (status: TicketStatus): string => {
    switch (status) {
      case 'active':
        return 'border-amber-200 bg-amber-50/40 hover:border-amber-400';
      case 'won':
        return 'border-green-200 bg-green-50/40 hover:border-green-400';
      case 'lost':
        return 'border-red-200 bg-red-50/40 hover:border-red-400';
      default:
        return 'border-gray-200 bg-gray-50/40';
    }
  };

  const getStatusLabel = (status: TicketStatus): string => {
    switch (status) {
      case 'active':
        return 'Ongoing';
      case 'won':
        return 'Won';
      case 'lost':
        return 'Lost';
      default:
        return status;
    }
  };

  const isUrlImage = ticket.image && (ticket.image.startsWith('/') || ticket.image.startsWith('http'));

  return (
    <div className={`p-5 rounded-2xl border-2 transition-all shadow-xs ${getCardBorder(ticket.status)}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left: Info */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {isUrlImage && (
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
              <img
                src={ticket.image}
                alt={ticket.item}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="space-y-1">
            <h3 className="text-base font-bold text-gray-900 leading-snug">{ticket.item}</h3>
            <p className="text-xs text-gray-500 font-mono font-semibold">
              Ticket #: <span className="text-gray-800">{ticket.ticketNumber}</span>
            </p>
            <div className="flex items-center gap-3 text-xs text-gray-500 pt-0.5">
              <span>Price: <strong className="text-gray-900">₦{ticket.price.toLocaleString()}</strong></span>
              <span>•</span>
              <span>Date: {ticket.purchaseDate}</span>
            </div>
          </div>
        </div>

        {/* Right: Status Badge */}
        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-200/60">
          <span
            className={`px-4 py-1.5 rounded-full text-xs font-extrabold border shadow-xs tracking-wide ${getBadgeStyle(
              ticket.status
            )}`}
          >
            {getStatusLabel(ticket.status)}
          </span>
        </div>
      </div>
    </div>
  );
}
