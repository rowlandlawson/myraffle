'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Search,
  Plus,
  Play,
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  X,
  Upload as UploadIcon,
  Image as ImageIcon,
} from 'lucide-react';
import { useRaffles } from '@/lib/hooks/useRaffles';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { convertNairaToPoints } from '@/lib/constants';

type RaffleStatus = 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

// Client-side image compression using Canvas API
async function compressImage(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  targetSizeKB = 1024
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      let { width, height } = img;

      // Scale down if larger than max dimensions
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);

      // Try progressively lower quality until under target size
      let quality = 0.9;
      const tryCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Compression failed'));
              return;
            }
            if (blob.size > targetSizeKB * 1024 && quality > 0.3) {
              quality -= 0.1;
              tryCompress();
            } else {
              const compressed = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressed);
            }
          },
          'image/jpeg',
          quality
        );
      };
      tryCompress();
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

export default function AdminRafflesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<RaffleStatus | 'all'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Confirm draw dialog state
  const [drawRaffleId, setDrawRaffleId] = useState<string | null>(null);

  const { data: rafflesData, isLoading: loading, error, refetch } = useRaffles({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    limit: 50,
  });
  const apiRaffles = rafflesData?.raffles ?? [];

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Map to display format
  const raffles = apiRaffles.map((r) => ({
    id: r.id,
    itemName: r.item.name,
    image: r.item.imageUrl?.startsWith('/uploads')
      ? `${apiUrl}${r.item.imageUrl}`
      : r.item.imageUrl || '📦',
    ticketPrice: r.ticketPrice,
    totalTickets: r.ticketsTotal,
    soldTickets: r.ticketsSold,
    startDate: new Date(r.createdAt).toISOString().split('T')[0]!,
    endDate: new Date(r.raffleDate).toISOString().split('T')[0]!,
    status: r.status as RaffleStatus,
    winner: r.winner?.name || null,
  }));

  const filteredRaffles = raffles.filter((raffle) => {
    const matchesSearch = raffle.itemName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleStartDraw = async () => {
    if (!drawRaffleId) return;
    try {
      const res = await api.post(`/api/raffles/${drawRaffleId}/draw`);
      toast.success(res.message || 'Winner drawn successfully!');
      refetch();
    } catch (err: any) {
      toast.error(err.message || 'Failed to start draw');
    } finally {
      setDrawRaffleId(null);
    }
  };

  const getStatusBadge = (status: RaffleStatus) => {
    const styles: Record<string, string> = {
      SCHEDULED: 'bg-yellow-100 text-yellow-800',
      ACTIVE: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-blue-100 text-blue-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    const icons: Record<string, React.ReactNode> = {
      SCHEDULED: <Clock size={14} />,
      ACTIVE: <Play size={14} />,
      COMPLETED: <CheckCircle size={14} />,
      CANCELLED: <XCircle size={14} />,
    };
    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || ''}`}
      >
        {icons[status]}
        {status.charAt(0) + status.slice(1).toLowerCase()}
      </span>
    );
  };

  const stats = {
    total: raffles.length,
    active: raffles.filter((r) => r.status === 'ACTIVE').length,
    scheduled: raffles.filter((r) => r.status === 'SCHEDULED').length,
    completed: raffles.filter((r) => r.status === 'COMPLETED').length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Raffle Management
          </h1>
          <p className="text-gray-600">
            Create and manage all raffles on the platform
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
        >
          <Plus size={20} />
          Create New Raffle
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-gray-600">
          <p className="text-sm text-gray-600">Total Raffles</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-green-600">
          <p className="text-sm text-gray-600">Active</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-yellow-600">
          <p className="text-sm text-gray-600">Scheduled</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.scheduled}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-blue-600">
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by item name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as RaffleStatus | 'all')
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
            >
              <option value="all">All Status</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Loading / Error / Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Loading raffles...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error instanceof Error ? error.message : 'Failed to load raffles'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Item
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Ticket Price
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Progress
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Dates
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRaffles.map((raffle) => (
                  <tr key={raffle.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {raffle.image.startsWith('http') || raffle.image.startsWith('/') ? (
                          <img
                            src={raffle.image}
                            alt={raffle.itemName}
                            className="w-10 h-10 object-cover rounded-lg"
                          />
                        ) : (
                          <span className="text-2xl">{raffle.image}</span>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">
                            {raffle.itemName}
                          </p>
                          {raffle.winner && (
                            <p className="text-xs text-green-600 flex items-center gap-1">
                              <Trophy size={12} /> Winner: {raffle.winner}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-900 font-semibold">
                      ₦{raffle.ticketPrice.toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      <div className="w-32">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>
                            {raffle.soldTickets}/{raffle.totalTickets}
                          </span>
                          <span>
                            {raffle.totalTickets > 0
                              ? Math.round(
                                (raffle.soldTickets / raffle.totalTickets) * 100
                              )
                              : 0}
                            %
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-2 bg-red-600 rounded-full"
                            style={{
                              width: `${raffle.totalTickets > 0 ? (raffle.soldTickets / raffle.totalTickets) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-900">{raffle.startDate}</p>
                      <p className="text-xs text-gray-600">to {raffle.endDate}</p>
                    </td>
                    <td className="px-4 py-4">{getStatusBadge(raffle.status)}</td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition">
                          View
                        </button>
                        {raffle.status === 'ACTIVE' && (
                          <button
                            onClick={() => setDrawRaffleId(raffle.id)}
                            className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition"
                          >
                            Draw
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && filteredRaffles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No raffles found</p>
          </div>
        )}
      </div>

      {/* Draw Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!drawRaffleId}
        title="Draw Raffle Winner"
        message="Are you sure you want to draw a winner for this raffle? This will complete the raffle and notify the winner."
        confirmLabel="Draw Winner"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleStartDraw}
        onCancel={() => setDrawRaffleId(null)}
      />

      {/* Unified Create Raffle Modal */}
      {isCreateModalOpen && (
        <CreateRaffleModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}

// Sub-component for Create Raffle Modal
function CreateRaffleModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    value: '',
    category: 'electronics',
    ticketPrice: '',
    totalTickets: '',
    raffleDate: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = useCallback(async (file: File) => {
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Only .jpg, .jpeg, .png, and .webp files are allowed.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error('Image must be under 20MB.');
      return;
    }

    setIsCompressing(true);
    try {
      // Auto-compress: resize to max 1200px and target <= 1MB
      const compressed =
        file.size > 1024 * 1024 ? await compressImage(file) : file;
      setImageFile(compressed);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(compressed);
    } catch {
      toast.error('Failed to process image. Please try a different file.');
    } finally {
      setIsCompressing(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleImageSelect(file);
    },
    [handleImageSelect]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      toast.error('Please upload an item image.');
      return;
    }

    setIsSubmitting(true);
    const fd = new FormData();
    fd.append('name', formData.name);
    fd.append('description', formData.description || formData.name);
    fd.append('value', formData.value);
    fd.append('category', formData.category);
    fd.append('ticketPrice', formData.ticketPrice);
    fd.append('totalTickets', formData.totalTickets);
    fd.append('raffleDate', formData.raffleDate);
    fd.append('image', imageFile);

    try {
      await api.post('/api/raffles/create', fd);
      toast.success('Raffle and item created successfully!');
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create raffle.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pointsValue = formData.value ? convertNairaToPoints(parseFloat(formData.value)) : 0;
  const ticketPointsValue = formData.ticketPrice ? convertNairaToPoints(parseFloat(formData.ticketPrice)) : 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl overflow-hidden my-8">
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <UploadIcon size={24} />
              Create Unified Raffle
            </h2>
            <p className="text-red-100 text-sm mt-1">Upload item and configure raffle together</p>
          </div>
          <button
            onClick={onClose}
            className="text-red-100 hover:text-white p-2 hover:bg-white/10 rounded-full transition"
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Item File & Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Item Info</h3>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Item Image *</label>
                {imagePreview ? (
                  <div className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-green-200 bg-gray-50">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition"
                      disabled={isSubmitting}
                    >
                      <X size={16} />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-green-600/90 text-white text-xs px-3 py-1 rounded-full font-medium">
                      ✓ Ready ({imageFile && `${(imageFile.size / 1024).toFixed(0)}KB`})
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`w-full h-48 rounded-xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                      isDragging
                        ? 'border-red-400 bg-red-50'
                        : 'border-gray-300 bg-gray-50 hover:border-red-400 hover:bg-red-50/30'
                    }`}
                  >
                    <ImageIcon size={32} className={isDragging ? 'text-red-500' : 'text-gray-400'} />
                    <p className="text-sm text-gray-500 font-medium">
                      {isDragging ? 'Drop image here' : 'Drop or browse image'}
                    </p>
                    <p className="text-xs text-gray-400">JPG, PNG, WebP · Auto-compressed</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageSelect(file);
                  }}
                  className="hidden"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Item Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., iPhone 15 Pro Max"
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-500"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Value (₦) *</label>
                  <input
                    type="number"
                    name="value"
                    value={formData.value}
                    onChange={handleChange}
                    placeholder="850000"
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-500"
                    required
                    disabled={isSubmitting}
                  />
                  {pointsValue > 0 && (
                    <p className="text-xs text-yellow-600 mt-1">⭐ ≈ {pointsValue.toLocaleString()} pts</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-500"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="electronics">Electronics</option>
                    <option value="gaming">Gaming</option>
                    <option value="accessories">Accessories</option>
                    <option value="fashion">Fashion</option>
                    <option value="home">Home & Living</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right Column - Raffle Config */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Raffle Config</h3>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ticket Price (₦) *</label>
                <input
                  type="number"
                  name="ticketPrice"
                  value={formData.ticketPrice}
                  onChange={handleChange}
                  placeholder="5000"
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-500"
                  required
                  disabled={isSubmitting}
                />
                {ticketPointsValue > 0 && (
                  <p className="text-xs text-yellow-600 mt-1">
                    ⭐ ≈ {ticketPointsValue.toLocaleString()} pts per ticket
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Total Tickets *</label>
                <input
                  type="number"
                  name="totalTickets"
                  value={formData.totalTickets}
                  onChange={handleChange}
                  placeholder="100"
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-500"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Draw Date *</label>
                <input
                  type="date"
                  name="raffleDate"
                  value={formData.raffleDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-500"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description (Optional)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Additional details..."
                  rows={4}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-500 resize-none"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={!imageFile || isCompressing || isSubmitting}
              className="px-8 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isSubmitting ? 'Creating...' : 'Create Item & Raffle'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-8 py-3 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
