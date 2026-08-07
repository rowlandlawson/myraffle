'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Slide {
  id: number;
  headline: string;
  subtext: string;
  gradient: string;
  emoji: string;
}

const slides: Slide[] = [
  {
    id: 1,
    headline: "YOU'RE CLOSER TO WINNING THAN YOU THINK",
    subtext: 'One ticket can change your whole life',
    gradient: 'from-red-700 via-red-600 to-orange-500',
    emoji: '🎁',
  },
  {
    id: 2,
    headline: 'WIN AMAZING PRIZES EVERY WEEK',
    subtext: 'iPhones, MacBooks, PS5 & more up for grabs',
    gradient: 'from-emerald-700 via-emerald-600 to-teal-500',
    emoji: '🏆',
  },
  {
    id: 3,
    headline: 'EARN FREE RAFFLE POINTS DAILY',
    subtext: 'Complete tasks, watch ads & win without spending',
    gradient: 'from-violet-700 via-purple-600 to-fuchsia-500',
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
    <div className="px-4 pt-4">
      <div
        className={`relative bg-gradient-to-br ${slide.gradient} rounded-2xl overflow-hidden shadow-lg transition-all duration-500`}
        style={{ minHeight: '220px' }}
      >
        {/* Decorative elements */}
        <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full" />
        <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-white/5 rounded-full" />
        <div className="absolute top-1/2 right-4 text-6xl sm:text-7xl opacity-30 select-none">{slide.emoji}</div>

        {/* Content */}
        <div className="relative z-10 p-6 flex flex-col justify-center h-full" style={{ minHeight: '220px' }}>
          <h2 className="text-white text-xl sm:text-2xl font-extrabold leading-tight mb-2 max-w-[75%] drop-shadow-md">
            {slide.headline}
          </h2>
          <p className="text-white/80 text-sm sm:text-base font-medium mb-5 max-w-[70%]">
            {slide.subtext}
          </p>
          {!isAuthenticated && (
            <Link
              href="/register"
              className="inline-flex items-center self-start px-5 py-2.5 bg-white text-gray-900 font-bold text-sm rounded-full shadow-lg hover:bg-gray-100 active:scale-95 transition-all"
            >
              Get Started →
            </Link>
          )}
        </div>

        {/* Carousel Dots */}
        <div className="absolute bottom-4 left-6 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`rounded-full transition-all duration-300 ${
                i === currentSlide
                  ? 'w-6 h-2.5 bg-white'
                  : 'w-2.5 h-2.5 bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
