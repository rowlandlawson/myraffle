import Link from 'next/link';

type TicketStatus = 'active' | 'won' | 'lost';

interface TicketCardProps {
  ticket: {
    id: number;
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
  const getStatusColor = (status: TicketStatus): string => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-700';
      case 'won':
        return 'bg-green-100 text-green-700';
      case 'lost':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: TicketStatus): string => {
    switch (status) {
      case 'active':
        return '⏳';
      case 'won':
        return '🎉';
      case 'lost':
        return '❌';
      default:
        return '📋';
    }
  };

  const getBorderColor = () => {
    if (ticket.status === 'active')
      return 'border-blue-200 bg-blue-50 hover:border-blue-400';
    if (ticket.status === 'won')
      return 'border-green-200 bg-green-50 hover:border-green-400';
    return 'border-gray-200 bg-gray-50 hover:border-gray-400';
  };

  return (
    <div className={`p-6 rounded-xl border-2 transition ${getBorderColor()}`}>
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: Ticket Info */}
        <div className="flex gap-4">
          <div className="text-5xl">{ticket.image}</div>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <h3 className="text-xl font-bold text-gray-900">{ticket.item}</h3>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold w-fit ${getStatusColor(ticket.status)}`}
              >
                {getStatusIcon(ticket.status)}{' '}
                {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
              </span>
            </div>
            <p className="text-sm text-gray-600 font-mono">
              Ticket #: {ticket.ticketNumber}
            </p>
            <p className="text-sm text-gray-600">
              Price: ₦{ticket.price.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">
              Purchased: {ticket.purchaseDate}
            </p>

            {/* Status Messages */}
            {ticket.status === 'won' && (
              <div className="mt-3 p-3 bg-green-100 border border-green-300 rounded-lg">
                <p className="text-sm font-semibold text-green-700">
                  🎉 {ticket.winnerNotification}
                </p>
              </div>
            )}
            {ticket.status === 'lost' && (
              <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded-lg">
                <p className="text-sm font-semibold text-red-700">
                  ❌ {ticket.loserMessage}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Countdown or Result */}
        <div className="flex flex-col justify-between md:text-right">
          {ticket.status === 'active' ? (
            <div>
              <p className="text-sm text-gray-600 mb-1">Raffle ends in</p>
              <div className="text-4xl font-bold text-red-600">
                {ticket.daysLeft} {ticket.daysLeft === 1 ? 'day' : 'days'}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Scheduled: {ticket.raffleDate}
              </p>
              <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
                View Details
              </button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-1">Raffle completed</p>
              <div className="text-3xl font-bold mb-2">
                {ticket.status === 'won' ? '🏆' : '✗'}
              </div>
              <p className="text-sm text-gray-600">On {ticket.raffleDate}</p>
              <button className="mt-4 px-6 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition">
                View Results
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
