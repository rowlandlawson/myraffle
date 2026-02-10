'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface AuthLayoutProps {
  children: ReactNode;
  showLogo?: boolean;
  logoLink?: string;
}

export default function AuthLayout({
  children,
  showLogo = true,
  logoLink = '/',
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="relative w-full max-w-md">
        {/* Logo Section */}
        {showLogo && (
          <div className="text-center mb-8">
            <Link href={logoLink} className="inline-block">
              <Image
                src="/images/logo.png"
                alt="RaffleHub"
                width={180}
                height={60}
                className="mx-auto h-16 w-auto"
              />
            </Link>
            <p className="text-gray-500 mt-2">Win big, play fair</p>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-xl">
          {children}
        </div>
      </div>
    </div>
  );
}
