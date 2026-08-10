'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { FileText, X, ShieldCheck } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TermsModal({ isOpen, onClose }: TermsModalProps) {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      api
        .get('/api/settings/terms_and_conditions')
        .then((res: any) => {
          if (res.success && res.data?.value) {
            setContent(res.data.value);
          }
        })
        .catch((err) => {
          console.error('Failed to load terms:', err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden sm:my-8 border border-gray-100 flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-in slide-in-from-bottom duration-200">
        {/* Mobile Sheet Handle Bar */}
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto sm:hidden my-2.5 shrink-0" />

        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
              <ShieldCheck size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Terms & Conditions</h2>
              <p className="text-red-100 text-xs">Official Platform Guidelines & Rules</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 overflow-y-auto grow space-y-4">
          {isLoading ? (
            <div className="py-16 text-center text-gray-400 space-y-3">
              <FileText className="animate-bounce mx-auto text-red-500" size={36} />
              <p className="text-sm">Loading Terms & Conditions...</p>
            </div>
          ) : (
            <div
              dangerouslySetInnerHTML={{ __html: content }}
              className="prose prose-red max-w-none text-gray-700 text-sm leading-relaxed"
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between shrink-0 px-6">
          <span className="text-xs text-gray-400">MyRaffle Platform Policies</span>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-red-600 text-white font-semibold rounded-xl text-sm hover:bg-red-700 transition"
          >
            I Understand & Close
          </button>
        </div>
      </div>
    </div>
  );
}
