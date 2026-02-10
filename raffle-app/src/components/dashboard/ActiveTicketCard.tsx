import Link from 'next/link';

interface ActiveTicketCardProps {
  ticket: {
    id: number;
    item: string;
    image: string;
    ticketNumber: string;
    purchaseDate: string;
    endsIn: string;
  };
}

export default function ActiveTicketCard({ ticket }: ActiveTicketCardProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 hover:border-red-200 transition">
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className="text-4xl">{ticket.image}</div>
        <div className="flex-1 sm:hidden">
          <h3 className="font-bold text-gray-900">{ticket.item}</h3>
          <div className="text-sm text-gray-600 mt-1">
            Ticket: {ticket.ticketNumber}
          </div>
        </div>
      </div>

      <div className="flex-1 hidden sm:block">
        <h3 className="font-bold text-gray-900">{ticket.item}</h3>
        <div className="flex gap-4 text-sm text-gray-600 mt-1">
          <span>Ticket: {ticket.ticketNumber}</span>
          <span>Bought: {ticket.purchaseDate}</span>
        </div>
      </div>

      <div className="flex items-center justify-between w-full sm:w-auto gap-4">
        <div className="sm:hidden text-sm text-gray-600">
          <div>Bought: {ticket.purchaseDate}</div>
        </div>

        <div className="flex items-center gap-4 ml-auto sm:ml-0">
          <div className="text-right">
            <div className="font-semibold text-gray-900 text-sm sm:text-base">
              Ends in
            </div>
            <div className="text-red-600 font-bold">{ticket.endsIn}</div>
          </div>
          <Link
            href="#"
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-sm font-semibold whitespace-nowrap"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
}
