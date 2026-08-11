'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Image as ImageIcon, Plus, Trash2, Edit2, Eye, EyeOff, ExternalLink } from 'lucide-react';

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  buttonText?: string;
  isActive: boolean;
  priority: number;
  createdAt: string;
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  // Form states - Banner image & optional button link & text
  const [linkUrl, setLinkUrl] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBanners = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/api/admin/banners');
      if (res.success) {
        setBanners((res as any).data || []);
      }
    } catch (err) {
      console.error('Fetch banners error:', err);
      toast.error('Failed to load banners.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openModal = (banner?: Banner) => {
    if (banner) {
      setEditingBanner(banner);
      setLinkUrl(banner.linkUrl || '');
      setButtonText(banner.buttonText || '');
      setIsActive(banner.isActive);
      setImageUrlInput(banner.imageUrl);
      setImageFile(null);
    } else {
      setEditingBanner(null);
      setLinkUrl('');
      setButtonText('');
      setIsActive(true);
      setImageUrlInput('');
      setImageFile(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBanner(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile && !imageUrlInput && !editingBanner) {
      toast.error('Please upload a banner image file or paste an image URL.');
      return;
    }

    setIsSubmitting(true);

    try {
      const finalLink = linkUrl.trim() || '/login';
      const finalButtonText = buttonText.trim() || 'Get Started';

      const fd = new FormData();
      fd.append('title', 'Banner'); // Auto default
      fd.append('linkUrl', finalLink);
      fd.append('buttonText', finalButtonText);
      fd.append('isActive', isActive ? 'true' : 'false');
      if (imageFile) {
        fd.append('image', imageFile);
      } else if (imageUrlInput) {
        fd.append('imageUrl', imageUrlInput);
      }

      let res;
      if (editingBanner) {
        res = await api.put(`/api/admin/banners/${editingBanner.id}`, fd);
      } else {
        res = await api.post('/api/admin/banners', fd);
      }

      if (res.success) {
        toast.success(editingBanner ? 'Banner updated!' : 'Banner uploaded successfully!');
        closeModal();
        fetchBanners();
      } else {
        toast.error(res.message || 'Action failed.');
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    try {
      const res = await api.delete(`/api/admin/banners/${id}`);
      if (res.success) {
        toast.success('Banner deleted.');
        fetchBanners();
      }
    } catch {
      toast.error('Failed to delete banner.');
    }
  };

  const toggleStatus = async (banner: Banner) => {
    try {
      const fd = new FormData();
      fd.append('isActive', (!banner.isActive) ? 'true' : 'false');
      const res = await api.put(`/api/admin/banners/${banner.id}`, fd);
      if (res.success) {
        toast.success(`Banner ${!banner.isActive ? 'activated' : 'deactivated'}.`);
        fetchBanners();
      }
    } catch {
      toast.error('Failed to update banner status.');
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ImageIcon className="text-red-500" size={24} />
            Homepage Banners
          </h1>
          <p className="text-sm text-gray-500 mt-1">Upload promo banners with custom button links and button titles</p>
        </div>

        <button
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition shadow-md shadow-red-200"
        >
          <Plus size={18} />
          Upload New Banner
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm animate-pulse space-y-3">
              <div className="h-40 bg-gray-200 rounded-xl" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      )}

      {/* Banners Grid */}
      {!isLoading && banners.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <ImageIcon className="mx-auto text-gray-300 mb-3" size={48} />
          <h3 className="text-lg font-semibold text-gray-700">No Banners Uploaded</h3>
          <p className="text-sm text-gray-500 mt-1">Upload banners to display on the homepage slider</p>
          <button
            onClick={() => openModal()}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl"
          >
            <Plus size={16} /> Upload First Banner
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {banners.map((banner: any) => {
            const imageUrl = banner.imageUrl?.startsWith('/uploads')
              ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${banner.imageUrl}`
              : banner.imageUrl;

            return (
              <div key={banner.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="relative h-48 bg-gray-100 overflow-hidden">
                    <img src={imageUrl} alt="Banner" className="w-full h-full object-cover" />
                    <span
                      className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${
                        banner.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                      }`}
                    >
                      {banner.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="p-4 space-y-1">
                    <p className="text-xs text-gray-500">
                      Button Label: <span className="font-semibold text-gray-800">{banner.buttonText || 'Get Started'}</span>
                    </p>
                    <p className="text-xs text-blue-600 flex items-center gap-1 font-medium truncate">
                      <ExternalLink size={12} /> {banner.linkUrl || '/login'}
                    </p>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                  <button
                    onClick={() => toggleStatus(banner)}
                    className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition ${
                      banner.isActive ? 'text-amber-600 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'
                    }`}
                  >
                    {banner.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                    {banner.isActive ? 'Deactivate' : 'Activate'}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openModal(banner)}
                      className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Edit Banner"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete Banner"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Clean Upload Modal / Mobile Sheet */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Mobile Sheet Handle Bar */}
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto sm:hidden mb-2" />

            <h2 className="text-lg font-bold text-gray-900 border-b pb-3">
              {editingBanner ? 'Edit Banner Settings' : 'Upload Banner'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Banner Image File *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                />
                <p className="text-xs text-gray-400 mt-1.5">Or paste image URL:</p>
                <input
                  type="text"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="https://example.com/banner.png"
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-red-500 mt-1"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Button Name (Optional)</label>
                <input
                  type="text"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  placeholder="Default: Get Started"
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Button Target Link (Optional)</label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="Default: /login"
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded focus:ring-red-500 cursor-pointer"
                />
                <label htmlFor="isActiveToggle" className="font-semibold text-gray-700 cursor-pointer text-xs">
                  Active (Display on Homepage)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Uploading...' : editingBanner ? 'Save Changes' : 'Upload Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
