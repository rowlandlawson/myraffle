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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        {showLogo && (
          <div className="text-center -mb-4">
            <Link href={logoLink} className="inline-block">
              <Image
                src="/images/logo.png"
                alt="MyRaffle"
                width={160}
                height={50}
                className="mx-auto h-40 w-auto"
              />
            </Link>
          </div>
        )}

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
