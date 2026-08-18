'use client';

import { Clock } from 'lucide-react';
import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: string | Date;
  compact?: boolean;
  className?: string;
}

export default function CountdownTimer({
  targetDate,
  compact = false,
  className = '',
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
        });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (timeLeft.isExpired) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 font-bold text-xs ${className}`}
      >
        <Clock size={14} className="animate-spin text-amber-600" />
        <span>Drawing Winner / Expired</span>
      </div>
    );
  }

  const format2Digits = (num: number) => String(num).padStart(2, '0');

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white font-mono text-[11px] font-bold ${className}`}
      >
        <Clock size={12} className="text-red-400" />
        <span>
          {timeLeft.days > 0 && `${timeLeft.days}d `}
          {format2Digits(timeLeft.hours)}:{format2Digits(timeLeft.minutes)}:
          {format2Digits(timeLeft.seconds)}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 text-xs font-mono font-bold ${className}`}>
      {timeLeft.days > 0 && (
        <div className="flex flex-col items-center bg-slate-900 text-white px-2 py-1 rounded-lg shadow-sm">
          <span className="text-xs">{format2Digits(timeLeft.days)}</span>
          <span className="text-[9px] font-sans font-normal text-slate-400 uppercase">Days</span>
        </div>
      )}
      <div className="flex flex-col items-center bg-slate-900 text-white px-2 py-1 rounded-lg shadow-sm">
        <span className="text-xs">{format2Digits(timeLeft.hours)}</span>
        <span className="text-[9px] font-sans font-normal text-slate-400 uppercase">Hours</span>
      </div>
      <span className="text-slate-400 font-bold">:</span>
      <div className="flex flex-col items-center bg-slate-900 text-white px-2 py-1 rounded-lg shadow-sm">
        <span className="text-xs">{format2Digits(timeLeft.minutes)}</span>
        <span className="text-[9px] font-sans font-normal text-slate-400 uppercase">Mins</span>
      </div>
      <span className="text-slate-400 font-bold">:</span>
      <div className="flex flex-col items-center bg-red-600 text-white px-2 py-1 rounded-lg shadow-sm animate-pulse">
        <span className="text-xs">{format2Digits(timeLeft.seconds)}</span>
        <span className="text-[9px] font-sans font-normal text-red-200 uppercase">Secs</span>
      </div>
    </div>
  );
}
