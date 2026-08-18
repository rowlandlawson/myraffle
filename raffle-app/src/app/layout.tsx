import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
import VisitorTracker from '@/components/VisitorTracker';
import CartDrawer from '@/components/cart/CartDrawer';
import AppBottomNav from '@/components/nav/AppBottomNav';
import AppHeader from '@/components/nav/AppHeader';
import { Analytics } from '@vercel/analytics/react';
import { Toaster } from 'react-hot-toast';

import PWAInstallModal from '@/components/PWAInstallModal';
import PushNotificationManager from '@/components/PushNotificationManager';

const fontClassName = 'font-sans antialiased';

export const metadata: Metadata = {
  title: 'myRaffle - Win Big!',
  description: 'Participate in amazing raffles and win prizes',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'myRaffle',
  },
  icons: {
    icon: '/images/icon-192.png',
    apple: '/images/icon-192.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#E10600" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.deferredPWAInstallPrompt = null;
              window.addEventListener('beforeinstallprompt', function(e) {
                e.preventDefault();
                window.deferredPWAInstallPrompt = e;
                if (window.onPWAInstallPromptReady) {
                  window.onPWAInstallPromptReady(e);
                }
              });
            `,
          }}
        />
      </head>
      <body className={fontClassName}>
        <Toaster position="top-center" />
        <Providers>
          <PushNotificationManager />
          <PWAInstallModal />
          <VisitorTracker />
          <AppHeader />
          {children}
          <AppBottomNav />
          <CartDrawer />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
