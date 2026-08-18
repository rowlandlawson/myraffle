'use client';

import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  showLogo?: boolean;
  logoLink?: string;
}

export default function AuthLayout({ children, showLogo = true, logoLink = '/' }: AuthLayoutProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white flex">
      {/* ── Left Brand Panel (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-[42%] xl:w-[45%] flex-col justify-between bg-[#E10600] px-10 py-10 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-black/10 translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-white/[0.03] border border-white/10" />

        {/* Logo */}
        <Link href={logoLink} className="relative z-10 flex items-center w-fit">
          <Image
            src="/images/logo-dark-bg.png"
            alt="myRaffle"
            width={220}
            height={64}
            className="h-14 xl:h-16 w-auto object-contain"
            priority
          />
        </Link>

        {/* Center Content */}
        <div className="relative z-10 space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-3 py-1">
              <span className="w-2 h-2 rounded-full bg-yellow-300 animate-pulse" />
              <span className="text-white/90 text-xs font-semibold tracking-wide uppercase">
                Live Draws · Real Winners
              </span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-black text-white leading-[1.1] tracking-tight">
              Win premium
              <br />
              prizes
            </h1>
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10">
          <p className="text-white/40 text-xs">
            © {new Date().getFullYear()} myRaffle · All rights reserved
          </p>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex-1 flex flex-col min-h-screen bg-white">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 sm:px-8 py-5 border-b border-gray-100">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Back
          </button>

          {showLogo && (
            <Link href={logoLink} className="flex items-center lg:hidden">
              <Image
                src="/images/logo.png"
                alt="myRaffle"
                width={120}
                height={36}
                className="h-8 w-auto object-contain"
              />
            </Link>
          )}

          <div className="w-14 hidden sm:block" />
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-5 sm:px-10 py-8">
          <div className="w-full max-w-[400px]">{children}</div>
        </div>

        {/* Bottom note */}
        <div className="text-center pb-6 px-5">
          <p className="text-xs text-gray-400">Provably fair &amp; secured with SSL encryption</p>
        </div>
      </div>
    </div>
  );
}
