'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Slide {
  id: number;
  headline: string;
  subtext: string;
  bgColor: string;
  badgeColor: string;
  emoji: string;
}

const slides: Slide[] = [
  {
    id: 1,
    headline: "YOU'RE CLOSER TO WINNING THAN YOU THINK",
    subtext: 'One ticket can change your whole life',
    bgColor: 'bg-red-600',
    badgeColor: 'bg-yellow-400 text-slate-950',
    emoji: '🎁',
  },
  {
    id: 2,
    headline: 'WIN AMAZING PRIZES EVERY WEEK',
    subtext: 'iPhones, MacBooks, PS5 & more up for grabs',
    bgColor: 'bg-slate-900',
    badgeColor: 'bg-red-600 text-white',
    emoji: '🏆',
  },
  {
    id: 3,
    headline: 'EARN FREE RAFFLE POINTS DAILY',
    subtext: 'Complete tasks, watch ads & win without spending',
    bgColor: 'bg-red-700',
    badgeColor: 'bg-yellow-400 text-slate-950',
    emoji: '💎',
  },
];

interface HeroBannerProps {
  isAuthenticated: boolean;
}

export default function HeroBanner({ isAuthenticated }: HeroBannerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 4500);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const slide = slides[currentSlide];

  return (
    <div className="px-4 md:px-8 pt-4 md:pt-6 max-w-7xl mx-auto">
      <div
        className={`relative ${slide.bgColor} rounded-2xl md:rounded-3xl overflow-hidden shadow-md transition-colors duration-500`}
        style={{ minHeight: '200px' }}
      >
        {/* Decorative Circles */}
        <div className="absolute -top-6 -right-6 w-28 md:w-48 h-28 md:h-48 bg-white/10 rounded-full" />
        <div className="absolute -bottom-8 -left-8 w-36 md:w-64 h-36 md:h-64 bg-black/10 rounded-full" />
        <div className="absolute top-1/2 right-6 md:right-12 -translate-y-1/2 text-5xl sm:text-7xl md:text-8xl opacity-25 select-none">
          {slide.emoji}
        </div>

        {/* Content */}
        <div
          className="relative z-10 p-5 sm:p-8 md:p-12 flex flex-col justify-center h-full max-w-2xl"
          style={{ minHeight: '200px' }}
        >
          <span
            className={`self-start text-[11px] md:text-xs font-black tracking-widest px-3 py-1 rounded-full mb-3 uppercase ${slide.badgeColor}`}
          >
            SPECIAL OFFER
          </span>

          <h2 className="text-white text-lg sm:text-2xl md:text-3xl font-extrabold leading-tight mb-2">
            {slide.headline}
          </h2>
          <p className="text-white/90 text-xs sm:text-base font-medium mb-5">
            {slide.subtext}
          </p>

          {!isAuthenticated && (
            <Link
              href="/register"
              className="inline-flex items-center self-start px-5 md:px-6 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-extrabold text-xs md:text-sm rounded-xl shadow transition-transform active:scale-95"
            >
              Get Started →
            </Link>
          )}
        </div>

        {/* Carousel Dots */}
        <div className="absolute bottom-4 left-6 md:left-12 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`rounded-full transition-all duration-300 ${
                i === currentSlide ? 'w-6 h-2 bg-yellow-400' : 'w-2 h-2 bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
