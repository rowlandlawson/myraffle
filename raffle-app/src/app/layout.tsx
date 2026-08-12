import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Toaster } from 'react-hot-toast';
import VisitorTracker from '@/components/VisitorTracker';
import AppHeader from '@/components/nav/AppHeader';
import AppBottomNav from '@/components/nav/AppBottomNav';
import CartDrawer from '@/components/cart/CartDrawer';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Raffle - Win Big!',
  description: 'Participate in amazing raffles and win prizes',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Toaster position="top-center" />
        <Providers>
          <VisitorTracker />
          <AppHeader />
          {children}
          <AppBottomNav />
          <CartDrawer />
        </Providers>
      </body>
    </html>
  );
}
