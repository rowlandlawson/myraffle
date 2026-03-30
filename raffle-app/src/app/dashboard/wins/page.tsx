'use client';

import { Trophy, Clock, Package, Truck, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { convertNairaToPoints } from '@/lib/constants';

const DELIVERY_STEPS = [
  { status: 'PENDING', label: 'Pending', icon: Clock },
  { status: 'PROCESSING', label: 'Processing', icon: Package },
  { status: 'SHIPPED', label: 'Shipped', icon: Truck },
  { status: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
];

function useMyWins() {
  return useQuery({
    queryKey: ['my-wins'],
    queryFn: async () => {
      const res = await api.get<any[]>('/api/raffles/my-wins');
      if (!res.success) throw new Error(res.message);
      return res.data ?? [];
    },
  });
}

export default function UserWinsPage() {
  const { data: wins, isLoading } = useMyWins();

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Trophy className="text-yellow-500" size={24} />
          My Wins
        </h1>
        <p className="text-sm text-gray-500 mt-1">Track your won items and delivery status</p>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
              <div className="h-5 w-1/3 bg-gray-200 rounded mb-3" />
              <div className="h-4 w-2/3 bg-gray-200 rounded mb-2" />
              <div className="h-10 w-full bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Wins */}
      {!isLoading && wins && wins.length > 0 && (
        <div className="space-y-4">
          {wins.map((win: any) => {
            const currentStepIdx = DELIVERY_STEPS.findIndex(s => s.status === win.deliveryStatus);
            const imageUrl = win.item?.imageUrl?.startsWith('/uploads')
              ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${win.item.imageUrl}`
              : win.item?.imageUrl;

            return (
              <div key={win.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Item Header */}
                <div className="flex items-center gap-4 p-5">
                  <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                    {imageUrl ? (
                      <img src={imageUrl} alt={win.item?.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🏆</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900">{win.item?.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Value: ₦{win.item?.value?.toLocaleString()} (⭐ {convertNairaToPoints(win.item?.value || 0).toLocaleString()} pts)
                    </p>
                    <p className="text-xs text-gray-400">
                      Won on {new Date(win.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Delivery Status Stepper */}
                <div className="px-5 pb-5">
                  <p className="text-xs font-semibold text-gray-600 mb-3">Delivery Status</p>
                  <div className="flex items-center justify-between">
                    {DELIVERY_STEPS.map((step, idx) => {
                      const StepIcon = step.icon;
                      const isCompleted = idx <= currentStepIdx;
                      const isCurrent = idx === currentStepIdx;

                      return (
                        <div key={step.status} className="flex flex-col items-center flex-1 relative">
                          {/* Connector line */}
                          {idx > 0 && (
                            <div className={`absolute top-4 right-1/2 w-full h-0.5 -z-10 ${
                              idx <= currentStepIdx ? 'bg-green-400' : 'bg-gray-200'
                            }`} />
                          )}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            isCurrent
                              ? 'bg-green-500 text-white shadow-md shadow-green-200 ring-4 ring-green-100'
                              : isCompleted
                                ? 'bg-green-400 text-white'
                                : 'bg-gray-200 text-gray-400'
                          }`}>
                            <StepIcon size={14} />
                          </div>
                          <span className={`text-[10px] mt-1.5 font-medium ${
                            isCurrent ? 'text-green-600' : isCompleted ? 'text-green-500' : 'text-gray-400'
                          }`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Delivery Note */}
                {win.deliveryNote && (
                  <div className="px-5 pb-4 pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      <span className="font-semibold">Update:</span> {win.deliveryNote}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty */}
      {!isLoading && (!wins || wins.length === 0) && (
        <div className="text-center py-16">
          <Trophy size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">No wins yet</h3>
          <p className="text-sm text-gray-500 mt-1">
            Keep participating in raffles for a chance to win amazing prizes!
          </p>
        </div>
      )}
    </div>
  );
}
