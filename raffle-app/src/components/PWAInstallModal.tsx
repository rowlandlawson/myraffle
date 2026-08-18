'use client';

import { Download, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface Window {
    deferredPWAInstallPrompt?: BeforeInstallPromptEvent | null;
    onPWAInstallPromptReady?: (e: BeforeInstallPromptEvent) => void;
  }
}

export default function PWAInstallModal() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .catch((err) => console.error('[SW] Registration error:', err));
    }

    // Check if already running in standalone app mode
    const standaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standaloneMode);

    if (standaloneMode) return;

    // Capture deferred prompt from window or event listener
    if (window.deferredPWAInstallPrompt) {
      setDeferredPrompt(window.deferredPWAInstallPrompt);
    }

    window.onPWAInstallPromptReady = (e: BeforeInstallPromptEvent) => {
      setDeferredPrompt(e);
    };

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const installEvent = e as BeforeInstallPromptEvent;
      window.deferredPWAInstallPrompt = installEvent;
      setDeferredPrompt(installEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setIsOpen(false);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    const isDismissed = localStorage.getItem('myraffle_pwa_banner_dismissed');
    if (!isDismissed) {
      setIsOpen(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    let promptEvent = deferredPrompt || window.deferredPWAInstallPrompt;

    if (!promptEvent) {
      await new Promise((res) => setTimeout(res, 350));
      promptEvent = deferredPrompt || window.deferredPWAInstallPrompt;
    }

    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice.outcome === 'accepted') {
          setIsOpen(false);
        }
      } catch (err) {
        console.error('[PWA] Prompt error:', err);
      } finally {
        setDeferredPrompt(null);
        window.deferredPWAInstallPrompt = null;
      }
    }
  };

  const handleClose = () => {
    localStorage.setItem('myraffle_pwa_banner_dismissed', 'true');
    setIsOpen(false);
  };

  if (isStandalone || !isOpen) return null;

  return (
    <div className="fixed top-3 left-3 right-3 sm:left-auto sm:right-4 sm:max-w-sm z-[100] animate-in slide-in-from-top-4 duration-200">
      <div className="bg-white text-gray-900 rounded-2xl p-3 shadow-xl border border-gray-200 flex items-center justify-between gap-3">
        {/* App Icon & Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src="/images/icon-192.png"
            alt="myRaffle App"
            className="w-9 h-9 rounded-xl border border-gray-100 object-cover shrink-0 shadow-xs"
          />
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-gray-900 leading-tight truncate">myRaffle App</h4>
            <p className="text-[11px] text-gray-500 truncate">Install for instant access</p>
          </div>
        </div>

        {/* Action Button & Close */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleInstallClick}
            className="px-3.5 py-1.5 bg-[#E10600] hover:bg-red-700 active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download size={13} />
            <span>Install</span>
          </button>

          <button
            onClick={handleClose}
            className="p-1 text-gray-400 hover:text-gray-700 rounded-lg transition cursor-pointer"
            title="Dismiss"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
