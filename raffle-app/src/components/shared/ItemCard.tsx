interface ItemProps {
  item: {
    id: number;
    name: string;
    image: string;
    ticketPrice: number;
    ticketsSold: number;
    ticketsTotal: number;
    status: 'active' | 'completed';
    endsIn: string;
  };
}

export default function ItemCard({ item }: ItemProps) {
  const progressPercent = Math.round(
    (item.ticketsSold / item.ticketsTotal) * 100,
  );

  return (
    <div className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden">
      {/* Item Image */}
      <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-40 flex items-center justify-center text-6xl">
        {item.image}
      </div>

      {/* Item Content */}
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{item.name}</h3>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-600">
              {item.ticketsSold} / {item.ticketsTotal}
            </span>
            <span className="text-sm font-semibold text-red-600">
              {progressPercent}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-red-600 to-red-700 h-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Details */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="text-sm text-gray-600">Price per ticket</div>
            <div className="text-2xl font-bold text-gray-900">
              ₦{item.ticketPrice.toLocaleString()}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Ends in</div>
            <div className="text-lg font-bold text-red-600">{item.endsIn}</div>
          </div>
        </div>

        {/* CTA Button */}
        {item.status === 'active' ? (
          <button className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-red-600/50 transition">
            Buy Ticket
          </button>
        ) : (
          <button
            disabled
            className="w-full py-3 bg-gray-300 text-gray-600 font-bold rounded-lg cursor-not-allowed"
          >
            Raffle Completed
          </button>
        )}
      </div>
    </div>
  );
}
