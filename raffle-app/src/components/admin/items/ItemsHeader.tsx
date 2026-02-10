'use client';

import { Plus } from 'lucide-react';

interface ItemsHeaderProps {
  showUploadForm: boolean;
  onToggleUploadForm: () => void;
}

export default function ItemsHeader({
  showUploadForm,
  onToggleUploadForm,
}: ItemsHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Raffle Items</h1>
        <p className="text-gray-600">
          Manage all raffle items and their settings
        </p>
      </div>
      <button
        onClick={onToggleUploadForm}
        className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-red-600/50 transition flex items-center gap-2 justify-center"
      >
        <Plus size={20} />{' '}
        {showUploadForm ? 'Cancel Upload' : 'Upload New Item'}
      </button>
    </div>
  );
}
