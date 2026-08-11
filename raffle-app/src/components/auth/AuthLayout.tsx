'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12 relative">
      <div className="w-full max-w-sm">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-red-600 mb-2 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Back</span>
        </button>

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
