'use client';

import { api } from '@/lib/api';
import { resolveImageUrl } from '@/lib/imageUrl';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  buttonText?: string;
}

export default function BannerSlider() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ success?: boolean; data?: Banner[] }>('/api/banners')
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setBanners(res.data);
        }
      })
      .catch((err) => {
        console.error('Failed to load public banners:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Auto-play timer for slide changes
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (isLoading || banners.length === 0) return null;

  const current = banners[currentIndex];
  const btnText = current.buttonText?.trim() || 'Get Started';
  const btnLink = current.linkUrl?.trim() || '/login';

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  return (
    <div className="relative w-full py-0">
      <div className="relative h-[180px] sm:h-[260px] md:h-[320px] lg:h-[360px] w-full overflow-hidden shadow-lg bg-gray-900 group">
        {/* Banner Background Image */}
        <img
          src={resolveImageUrl(current.imageUrl) || current.imageUrl}
          alt={current.title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out"
        />

        {/* Gradient Overlay for CTA Button */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 sm:p-6 md:p-10 flex flex-col justify-end">
          <div className="max-w-4xl space-y-2 text-white">
            {/* CTA Button - Defaults to "Get Started" linking to "/login" */}
            <div>
              <Link
                href={btnLink}
                className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-7 sm:py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-base rounded-2xl shadow-xl hover:shadow-red-600/50 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {btnText}
              </Link>
            </div>
          </div>
        </div>

        {/* Carousel Controls (if more than 1 banner) */}
        {banners.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md"
              aria-label="Previous Banner"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md"
              aria-label="Next Banner"
            >
              <ChevronRight size={24} />
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-4 right-6 flex gap-2">
              {banners.map((b, idx) => (
                <button
                  key={b.id || `banner-dot-${idx}`}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    idx === currentIndex ? 'w-8 bg-red-600' : 'w-2.5 bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
