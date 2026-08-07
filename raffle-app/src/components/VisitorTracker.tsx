'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Global visitor tracker — fires POST /api/track-visit on every
 * client-side route change. Mount once in the root layout.
 * Skips /api paths and deduplicates within the same pathname.
 * 
 * Tracks: IP address, user agent, timestamp, page visited, referrer
 */
export default function VisitorTracker() {
  const pathname = usePathname();
  const lastTracked = useRef<string | null>(null);
  const lastTrackedTime = useRef<number>(0);

  useEffect(() => {
    // Don't track API routes or the same page within 100ms (prevents duplicate tracks)
    if (!pathname || pathname.startsWith('/api')) {
      return;
    }

    const now = Date.now();
    if (pathname === lastTracked.current && now - lastTrackedTime.current < 100) {
      return;
    }

    lastTracked.current = pathname;
    lastTrackedTime.current = now;

    // Collect tracking data
    const trackingData = {
      path: pathname,
      referrer: typeof document !== 'undefined' ? document.referrer || null : null,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      timestamp: new Date().toISOString(),
    };

    // Send asynchronously with error handling
    fetch(`${API_URL}/api/track-visit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trackingData),
      // Use keepalive for better reliability on page unload
      keepalive: true,
    }).catch((error) => {
      // Log error for debugging, but don't break user experience
      if (process.env.NODE_ENV === 'development') {
        console.debug('[VisitorTracker] Failed to track visit:', error?.message);
      }
    });
  }, [pathname]);

  return null;
}
