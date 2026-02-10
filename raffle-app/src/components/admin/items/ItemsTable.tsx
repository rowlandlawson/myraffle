'use client';

import { Edit2, Trash2, Eye } from 'lucide-react';
import { Item } from '@/types/items';
import EmptyState from '@/components/admin/items/EmptyState';

interface ItemsTableProps {
  items: Item[];
  onDelete: (id: number) => void;
  onEdit: (item: Item) => void;
  onView: (item: Item) => void;
}

export default function ItemsTable({
  items,
  onDelete,
  onEdit,
  onView,
}: ItemsTableProps) {
  const getStatusColor = (status: Item['status']) => {
    return status === 'active'
      ? 'bg-green-100 text-green-700'
      : 'bg-gray-100 text-gray-700';
  };

  const getProgressPercentage = (sold: number, total: number) => {
    return Math.round((sold / total) * 100);
  };

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Item
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Category
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Value
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Ticket Price
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Tickets
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Status
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className="border-b border-gray-200 hover:bg-gray-50 transition"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{item.image}</span>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {item.name}
                      </div>
                      <div className="text-xs text-gray-600">
                        {item.createdDate}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600 capitalize">
                  {item.category}
                </td>
                <td className="px-6 py-4 font-bold text-gray-900">
                  ₦{(item.price / 1000).toFixed(0)}k
                </td>
                <td className="px-6 py-4 text-gray-600">
                  ₦{item.ticketPrice.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600">
                    {item.ticketsSold} / {item.ticketsTotal}
                    <span className="ml-2 text-xs">
                      (
                      {getProgressPercentage(
                        item.ticketsSold,
                        item.ticketsTotal,
                      )}
                      %)
                    </span>
                  </div>
                  <div className="w-20 bg-gray-200 rounded-full h-1 mt-1 overflow-hidden">
                    <div
                      className="bg-red-600 h-full"
                      style={{
                        width: `${(item.ticketsSold / item.ticketsTotal) * 100}%`,
                      }}
                    />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}
                  >
                    {item.status === 'active' ? '🔴 Active' : '✓ Completed'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onView(item)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition text-blue-600"
                      title="View"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => onEdit(item)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition text-yellow-600"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition text-red-600"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {items.length === 0 && <EmptyState />}
    </div>
  );
}
