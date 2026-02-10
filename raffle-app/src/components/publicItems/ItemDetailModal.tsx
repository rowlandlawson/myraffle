'use client';

import { Item } from '@/types/publicItems';

interface ItemDetailModalProps {
  item: Item | null;
  onClose: () => void;
  onBuyTicket?: (itemId: number) => void;
}

export default function ItemDetailModal({
  item,
  onClose,
  onBuyTicket,
}: ItemDetailModalProps) {
  if (!item) return null;

  const ticketsLeft = item.ticketsTotal - item.ticketsSold;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{item.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="text-7xl flex-shrink-0 self-center md:self-start">
              {item.image}
            </div>
            <div className="flex-1">
              <p className="text-gray-600 mb-4">{item.description}</p>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Price per ticket:</span>
                  <span className="font-bold text-2xl text-gray-900">
                    ₦{item.price.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Raffle date:</span>
                  <span className="font-bold text-gray-900">
                    {item.raffleDate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tickets available:</span>
                  <span className="font-bold text-gray-900">
                    {ticketsLeft} left
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span
                    className={`font-bold ${
                      item.status === 'active'
                        ? 'text-green-600'
                        : 'text-gray-600'
                    }`}
                  >
                    {item.status === 'active' ? 'Active' : 'Completed'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Tickets Sold</p>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-red-600 to-red-700 h-full"
                style={{ width: `${item.progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-sm text-gray-600">
                {item.ticketsSold} sold of {item.ticketsTotal}
              </span>
              <span className="text-sm text-red-600 font-semibold">
                {item.progress}% filled
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {item.status === 'active' && (
              <a
                href={`/login?redirect=/items/${item.id}`}
                className="block w-full py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-red-600/50 transition text-center"
              >
                Buy Ticket
              </a>
            )}
            <button
              onClick={onClose}
              className="block w-full py-3 border-2 border-gray-300 text-gray-900 font-bold rounded-lg hover:bg-gray-100 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
