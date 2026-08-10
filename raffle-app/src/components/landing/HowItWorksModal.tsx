'use client';

import React from 'react';
import { X, HelpCircle, UserPlus, Gift, Ticket, Award } from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HowItWorksModal({ isOpen, onClose }: HowItWorksModalProps) {
  if (!isOpen) return null;

  const steps = [
    {
      number: 1,
      icon: UserPlus,
      title: 'Create Account',
      description: 'Sign up in seconds with your email and access active raffle draws.',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      number: 2,
      icon: Gift,
      title: 'Complete Tasks & Earn',
      description: 'Complete daily tasks to earn cash rewards credited directly into your wallet.',
      color: 'bg-amber-50 text-amber-600',
    },
    {
      number: 3,
      icon: Ticket,
      title: 'Get Tickets',
      description: 'Use your wallet balance to buy raffle tickets for your favourite items.',
      color: 'bg-red-50 text-red-600',
    },
    {
      number: 4,
      icon: Award,
      title: 'Win & Receive',
      description: 'When tickets sell out, the draw takes place immediately and prizes get delivered.',
      color: 'bg-emerald-50 text-emerald-600',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 border border-gray-100 max-h-[85vh] flex flex-col">
        {/* Bottom Sheet Handle */}
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto my-3 shrink-0 sm:hidden" />

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
              <HelpCircle size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">How It Works</h2>
              <p className="text-xs text-gray-500">4 simple steps to win luxury prizes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Steps List */}
        <div className="p-6 overflow-y-auto space-y-4 shrink grow">
          {steps.map((step) => (
            <div
              key={step.number}
              className="flex items-start gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-red-100 transition-all"
            >
              <div className={`w-11 h-11 rounded-2xl ${step.color} flex items-center justify-center shrink-0 font-bold shadow-sm`}>
                <step.icon size={22} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-red-600 text-white rounded-md text-[10px] font-black uppercase">
                    Step {step.number}
                  </span>
                  <h3 className="font-extrabold text-gray-900 text-sm">{step.title}</h3>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Action */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 shrink-0 px-6">
          <button
            onClick={onClose}
            className="w-full py-3 bg-red-600 text-white font-bold rounded-2xl text-sm hover:bg-red-700 transition shadow-sm"
          >
            Got It! Start Playing
          </button>
        </div>
      </div>
    </div>
  );
}
