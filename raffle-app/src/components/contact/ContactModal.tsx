'use client';

import { api } from '@/lib/api';
import { Mail, MessageSquare, Phone, X } from 'lucide-react';
import React, { useState, useEffect } from 'react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [supportEmail, setSupportEmail] = useState('support@myraffle.ng');
  const [supportPhone, setSupportPhone] = useState('+234 800 123 4567');

  useEffect(() => {
    if (isOpen) {
      api
        .get<{ value?: string }>('/api/settings/general_settings')
        .then((res) => {
          if (res.success && res.data?.value) {
            try {
              const parsed = JSON.parse(res.data.value);
              if (parsed.supportEmail) setSupportEmail(parsed.supportEmail);
              if (parsed.supportPhone) setSupportPhone(parsed.supportPhone);
            } catch (e) {
              console.error('Error parsing general settings', e);
            }
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full shadow-2xl overflow-hidden sm:my-8 border border-gray-100 flex flex-col animate-in slide-in-from-bottom duration-200">
        {/* Mobile Sheet Handle */}
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto sm:hidden my-2.5 shrink-0" />

        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
              <MessageSquare size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Contact Support</h2>
              <p className="text-red-100 text-xs">We're here to help 24/7</p>
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
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600 text-center font-medium">
            Reach out directly to our official support channels:
          </p>

          {/* Quick Contact Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href={`mailto:${supportEmail}`}
              className="p-4 bg-red-50 border border-red-100 rounded-2xl flex flex-col items-center text-center hover:bg-red-100/60 transition group shadow-xs"
            >
              <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-105 transition-transform">
                <Mail size={20} />
              </div>
              <span className="text-xs font-bold text-gray-800">Email Us</span>
              <span className="text-[11px] text-gray-500 truncate max-w-full font-medium mt-0.5">
                {supportEmail}
              </span>
            </a>

            <a
              href={`tel:${supportPhone}`}
              className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex flex-col items-center text-center hover:bg-emerald-100/60 transition group shadow-xs"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-105 transition-transform">
                <Phone size={20} />
              </div>
              <span className="text-xs font-bold text-gray-800">Call Support</span>
              <span className="text-[11px] text-gray-500 truncate max-w-full font-medium mt-0.5">
                {supportPhone}
              </span>
            </a>
          </div>
        </div>

        {/* Footer Close Button */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end px-6">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
