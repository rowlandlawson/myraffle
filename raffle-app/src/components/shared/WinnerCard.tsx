interface WinnerCardProps {
  winner: {
    id: number;
    userNumber: string;
    itemName: string;
    date: string;
  };
}

export default function WinnerCard({ winner }: WinnerCardProps) {
  return (
    <div className="bg-gradient-to-r from-yellow-50 to-white p-6 rounded-xl border-2 border-yellow-200">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center">
          <span className="text-white font-bold">👤</span>
        </div>
        <div className="flex-1">
          <div className="font-bold text-gray-900">{winner.userNumber}</div>
          <div className="text-sm text-gray-600">Won {winner.itemName}</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-gray-900">
            {winner.date}
          </div>
        </div>
      </div>
    </div>
  );
}
