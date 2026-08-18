'use client';

import { useAuthStore } from '@/lib/authStore';
import { getPushSubscriptionStatus, subscribeUserToPush } from '@/lib/pushClient';
import { Bell, Check, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export default function NotificationPromptModal() {
  const { isAuthenticated } = useAuthStore();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if user closed prompt in this session
    const dismissedSession = sessionStorage.getItem('myraffle_push_banner_closed');
    if (dismissedSession) return;

    // Check push status and prompt inside dashboard or admin
    const checkAndPrompt = async () => {
      const status = await getPushSubscriptionStatus();
      if (status.isSupported && status.permission !== 'granted' && !status.isSubscribed) {
        setIsOpen(true);
      }
    };

    const isAllowedRoute = pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin');
    if (isAuthenticated && isAllowedRoute) {
      const timer = setTimeout(checkAndPrompt, 2500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, pathname]);

  const handleEnable = async () => {
    setIsSubscribing(true);
    const success = await subscribeUserToPush();
    setIsSubscribing(false);
    if (success) {
      setIsSubscribed(true);
      setTimeout(() => setIsOpen(false), 1500);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    sessionStorage.setItem('myraffle_push_banner_closed', 'true');
    setIsOpen(false);
  };

  const isAllowedRoute = pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin');
  if (!isOpen || !isAuthenticated || !isAllowedRoute) return null;

  return (
    <div className="fixed top-2 left-2 right-2 sm:top-3 sm:left-1/2 sm:-translate-x-1/2 sm:max-w-xs z-[100] transition-all duration-300 animate-in slide-in-from-top-4">
      {/* Main Top Banner Card: Matches PWA Banner Design */}
      <div className="bg-white/90 text-gray-900 backdrop-blur-md rounded-2xl p-2 px-3 shadow-xl border border-gray-200/80 flex items-center justify-between gap-3">
        {/* Bell Icon & Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-red-50 text-[#E10600] flex items-center justify-center shrink-0 border border-red-100 shadow-xs">
            <Bell size={16} className={isSubscribed ? '' : 'animate-bounce'} />
          </div>
          <h4 className="text-xs font-extrabold text-gray-900 leading-tight truncate">
            {isSubscribed ? 'Notifications On!' : 'Push Notifications'}
          </h4>
        </div>

        {/* Action Button & Close Icon */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isSubscribed ? (
            <div className="w-7 h-7 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
              <Check size={16} />
            </div>
          ) : (
            <button
              onClick={handleEnable}
              disabled={isSubscribing}
              className="px-3 py-1.5 bg-[#E10600] hover:bg-red-700 active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1 disabled:opacity-70"
            >
              {isSubscribing ? (
                <span className="animate-spin text-[10px]">⏳</span>
              ) : (
                <span>Enable</span>
              )}
            </button>
          )}

          <button
            onClick={handleClose}
            className="p-1 text-gray-400 hover:text-gray-700 rounded-lg transition"
            title="Close"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
