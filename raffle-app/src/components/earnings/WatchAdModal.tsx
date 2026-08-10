import Image from 'next/image';

interface WatchAdModalProps {
  isOpen: boolean;
  adTimer: number;
  totalDuration: number;
}

export default function WatchAdModal({ isOpen, adTimer, totalDuration }: WatchAdModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl animate-in slide-in-from-bottom duration-200">
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto sm:hidden mb-4" />
        <div className="mb-4 flex justify-center">
          <Image
            src="https://img.icons8.com/3d-fluency/94/tv.png"
            alt="TV"
            width={64}
            height={64}
          />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Watching Advertisement
        </h2>
        <p className="text-gray-600 mb-6">
          Please watch the full advertisement to earn your reward
        </p>

        <div className="text-4xl font-bold text-red-600 mb-6">{adTimer}s</div>

        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden mb-6">
          <div
            className="bg-red-600 h-full transition-all"
            style={{ width: `${((totalDuration - adTimer) / totalDuration) * 100}%` }}
          />
        </div>

        <p className="text-sm text-gray-600">
          Don&apos;t close this window while the ad is playing
        </p>
      </div>
    </div>
  );
}
