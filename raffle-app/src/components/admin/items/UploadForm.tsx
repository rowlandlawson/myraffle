'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { convertNairaToPoints } from '@/lib/constants';

interface UploadFormProps {
  onCancel: () => void;
  onSubmit: (data: any) => void;
}

// Compress image using Canvas API
async function compressImage(file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      let { width, height } = img;

      // Scale down if needed
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(file); return; }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return; }
          const compressed = new File([blob], file.name.replace(/\.\w+$/, '.jpg'), {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(compressed);
        },
        'image/jpeg',
        quality,
      );
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

export default function UploadForm({ onCancel, onSubmit }: UploadFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'electronics',
    value: '',
    ticketPrice: '',
    totalTickets: '',
    raffleDate: '',
    description: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = useCallback(async (file: File) => {
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Only .jpg, .jpeg, .png, and .webp files are allowed.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      alert('Image must be under 20MB.');
      return;
    }

    setIsCompressing(true);
    try {
      // Compress if over 1MB
      let processed = file;
      if (file.size > 1 * 1024 * 1024) {
        processed = await compressImage(file, 1200, 1200, 0.8);
        // If still over 1MB, try harder
        if (processed.size > 1 * 1024 * 1024) {
          processed = await compressImage(file, 1000, 1000, 0.6);
        }
      }
      setImageFile(processed);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(processed);
    } catch {
      // Fallback: use original
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
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
    [handleImageSelect],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Build FormData including the image file
    const fd = new FormData();
    fd.append('name', formData.name);
    fd.append('description', formData.description);
    fd.append('value', formData.value);
    fd.append('category', formData.category);
    if (imageFile) fd.append('image', imageFile);
    onSubmit(fd);
  };

  const pointsValue = formData.value ? convertNairaToPoints(parseFloat(formData.value)) : 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Upload size={20} />
          Upload New Item
        </h2>
        <p className="text-red-100 text-xs mt-0.5">Add a new item with image for raffle</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Image Upload Zone */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2">Item Image *</label>
          {imagePreview ? (
            <div className="relative w-full h-52 rounded-xl overflow-hidden border-2 border-green-200 bg-gray-50">
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
                className="absolute top-2 right-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition shadow-lg"
              >
                <X size={16} />
              </button>
              <div className="absolute bottom-2 left-2 bg-green-600/90 text-white text-xs px-3 py-1 rounded-full font-medium">
                ✓ Image ready {imageFile && `(${(imageFile.size / 1024).toFixed(0)}KB)`}
              </div>
            </div>
          ) : isCompressing ? (
            <div className="w-full h-44 rounded-xl border-2 border-dashed border-red-300 bg-red-50/30 flex flex-col items-center justify-center gap-2">
              <Loader2 size={32} className="text-red-500 animate-spin" />
              <p className="text-sm text-red-600 font-medium">Compressing image...</p>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`w-full h-44 rounded-xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${isDragging
                  ? 'border-red-400 bg-red-50'
                  : 'border-gray-300 bg-gray-50 hover:border-red-400 hover:bg-red-50/30'
                }`}
            >
              <ImageIcon size={32} className={isDragging ? 'text-red-500' : 'text-gray-400'} />
              <p className="text-sm text-gray-500 font-medium">
                {isDragging ? 'Drop image here' : 'Click or drag image here'}
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
          />
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Item Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., iPhone 15 Pro Max"
              className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-500"
              required
            >
              <option value="electronics">Electronics</option>
              <option value="gaming">Gaming</option>
              <option value="accessories">Accessories</option>
              <option value="fashion">Fashion</option>
              <option value="home">Home & Living</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Item Value (₦) *</label>
            <input
              type="number"
              name="value"
              value={formData.value}
              onChange={handleChange}
              placeholder="850000"
              className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20"
              required
            />
            {pointsValue > 0 && (
              <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                ⭐ ≈ {pointsValue.toLocaleString()} raffle points
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Ticket Price (₦) *</label>
            <input
              type="number"
              name="ticketPrice"
              value={formData.ticketPrice}
              onChange={handleChange}
              placeholder="5000"
              className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20"
              required
            />
            {formData.ticketPrice && (
              <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                ⭐ ≈ {convertNairaToPoints(parseFloat(formData.ticketPrice)).toLocaleString()} pts / ticket
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Total Tickets *</label>
            <input
              type="number"
              name="totalTickets"
              value={formData.totalTickets}
              onChange={handleChange}
              placeholder="100"
              className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Raffle Date *</label>
            <input
              type="date"
              name="raffleDate"
              value={formData.raffleDate}
              onChange={handleChange}
              className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20"
              required
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the item..."
            rows={3}
            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={!imageFile}
            className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-red-600/30 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Upload Item
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
