'use client';

import { useState } from 'react';
import {
  X,
  CheckCircle2,
  Wallet,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  Loader2,
  Ticket,
  ChevronRight,
} from 'lucide-react';
import { useWalletBalance } from '@/lib/hooks/useWallet';
import { useBuyTicket } from '@/lib/hooks/useTickets';
import { resolveImageUrl } from '@/lib/imageUrl';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface RaffleItem {
  id: string | number;
  name: string;
  image: string;
  ticketPrice: number;
  ticketsSold: number;
  ticketsTotal: number;
  status: 'active' | 'completed';
  endsIn: string;
}

interface TicketCheckoutModalProps {
  item: RaffleItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TicketCheckoutModal({ item, isOpen, onClose }: TicketCheckoutModalProps) {
  const router = useRouter();
  const { data: walletData, isLoading: isLoadingWallet } = useWalletBalance();
  const buyTicketMutation = useBuyTicket();

  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'card'>('wallet');
  const [successReceipt, setSuccessReceipt] = useState<{ ticketNumber: string } | null>(null);

  if (!isOpen || !item) return null;

  const walletBalance = walletData?.walletBalance ?? 0;
  const ticketPrice = item.ticketPrice;
  const isWalletSufficient = walletBalance >= ticketPrice;
  const imageUrl = resolveImageUrl(item.image);

  const amountDue =
    paymentMethod === 'wallet'
      ? isWalletSufficient
        ? 0
        : ticketPrice
      : walletBalance > 0 && !isWalletSufficient
        ? ticketPrice - walletBalance
        : ticketPrice;

  const handleCheckout = () => {
    if (paymentMethod === 'wallet' && !isWalletSufficient) {
      toast.error('Insufficient wallet balance. Please top up or pay with card.');
      return;
    }
    buyTicketMutation.mutate(
      {
        raffleId: String(item.id),
        paymentMethod: paymentMethod === 'wallet' ? 'wallet' : 'paystack',
        useWallet: paymentMethod === 'wallet',
      },
      {
        onSuccess: (res: any) => {
          const ticketNumber =
            res?.data?.ticketNumber || res?.ticket?.ticketNumber || 'TKT-LIVE-DRAW';
          setSuccessReceipt({ ticketNumber });
          toast.success('🎉 Ticket secured!');
        },
        onError: (err: any) => {
          toast.error(err?.message || 'Failed to complete ticket purchase.');
        },
      }
    );
  };

  const handleClose = () => {
    setSuccessReceipt(null);
    onClose();
  };

  // ─── Success Screen ────────────────────────────────────
  if (successReceipt) {
    return (
      <div className="fixed inset-0 z-[150] flex items-end md:items-center justify-center p-0 md:p-6 bg-black/60 backdrop-blur-sm">
        <div className="bg-white w-full max-w-md md:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl flex flex-col">
          {/* Green top bar */}
          <div className="h-1.5 bg-gradient-to-r from-emerald-400 to-emerald-600" />

          <div className="p-6 sm:p-8 text-center space-y-5">
            {/* Success icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center ring-8 ring-emerald-50/60">
                <CheckCircle2 size={44} className="text-emerald-500" strokeWidth={1.5} />
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-black text-gray-900">You&apos;re in!</h3>
              <p className="text-sm text-gray-500 mt-1">
                Your ticket for <span className="font-semibold text-gray-800">{item.name}</span> is confirmed and active.
              </p>
            </div>

            {/* Ticket stub */}
            <div className="relative bg-gray-950 rounded-2xl overflow-hidden text-left p-5">
              {/* Dashed divider notch */}
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex items-center gap-1 px-4 opacity-20">
                {Array.from({ length: 28 }).map((_, i) => (
                  <div key={i} className="flex-1 h-px bg-white" />
                ))}
              </div>

              <div className="space-y-1 mb-4">
                <p className="text-[10px] font-mono uppercase text-gray-500 tracking-widest">Official Ticket ID</p>
                <p className="text-xl font-mono font-black text-yellow-400">{successReceipt.ticketNumber}</p>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm font-bold text-white truncate max-w-[200px]">{item.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">₦{ticketPrice.toLocaleString()} — Entry Confirmed</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg font-bold text-[10px] tracking-wide">
                  ACTIVE
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <button
                onClick={() => { handleClose(); router.push('/dashboard/tickets'); }}
                className="w-full py-3.5 bg-[#C0000C] hover:bg-red-700 text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                View My Tickets <ArrowRight size={16} />
              </button>
              <button
                onClick={handleClose}
                className="w-full py-2.5 text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Checkout Screen ───────────────────────────────────
  return (
    <div className="fixed inset-0 z-[150] flex items-end md:items-center justify-center p-0 md:p-6 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md md:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] md:max-h-[85vh]">

        {/* Red top bar */}
        <div className="h-1 bg-[#C0000C]" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-black text-gray-900">Confirm Purchase</h2>
            <p className="text-xs text-gray-400 mt-0.5">Review your order before proceeding</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-5">

          {/* Item summary */}
          <div className="flex gap-4 p-4 bg-gray-50 border border-gray-100 rounded-2xl items-center">
            <div className="w-16 h-16 bg-[#C0000C] rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center shadow-sm">
              {imageUrl ? (
                <img src={imageUrl} alt={item.name} className="w-full h-full object-contain" />
              ) : (
                <Ticket size={24} className="text-white/60" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-sm truncate">{item.name}</h3>
              <p className="text-xs text-gray-400 mt-0.5">1 Raffle Ticket Entry</p>
              <p className="text-base font-black text-[#C0000C] mt-1">
                ₦{ticketPrice.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2.5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Payment Method</p>

            {/* Wallet option */}
            <button
              type="button"
              onClick={() => setPaymentMethod('wallet')}
              className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${
                paymentMethod === 'wallet'
                  ? 'border-[#C0000C] bg-red-50/40'
                  : 'border-gray-100 bg-white hover:border-gray-200'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                paymentMethod === 'wallet' ? 'bg-[#C0000C] text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                <Wallet size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">Wallet Balance</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    isWalletSufficient
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      : 'bg-red-50 text-red-500 border border-red-100'
                  }`}>
                    {isLoadingWallet ? '...' : `₦${walletBalance.toLocaleString()}`}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {isWalletSufficient
                    ? 'Instant — deducted from your balance'
                    : `Needs ₦${(ticketPrice - walletBalance).toLocaleString()} more`}
                </p>
              </div>
              {/* Radio indicator */}
              <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                paymentMethod === 'wallet' ? 'border-[#C0000C] bg-[#C0000C]' : 'border-gray-300'
              }`}>
                {paymentMethod === 'wallet' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
              </div>
            </button>

            {/* Card option */}
            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${
                paymentMethod === 'card'
                  ? 'border-[#C0000C] bg-red-50/40'
                  : 'border-gray-100 bg-white hover:border-gray-200'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                paymentMethod === 'card' ? 'bg-[#C0000C] text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                <CreditCard size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-gray-900">Monnify</span>
                  <span className="text-xs text-gray-400 font-medium">Card · Bank Transfer · USSD</span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {walletBalance > 0 && !isWalletSufficient
                    ? `+₦${walletBalance.toLocaleString()} wallet credit applied automatically`
                    : 'Secure online payment gateway'}
                </p>
              </div>
              <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                paymentMethod === 'card' ? 'border-[#C0000C] bg-[#C0000C]' : 'border-gray-300'
              }`}>
                {paymentMethod === 'card' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
              </div>
            </button>
          </div>

          {/* Order Summary */}
          <div className="rounded-2xl border border-gray-100 overflow-hidden text-sm">
            <div className="px-4 py-3 bg-gray-50 flex justify-between items-center">
              <span className="text-gray-500 text-xs font-semibold uppercase tracking-wide">Order Summary</span>
            </div>
            <div className="divide-y divide-gray-50">
              <div className="px-4 py-3 flex justify-between text-sm">
                <span className="text-gray-500">Ticket Price</span>
                <span className="font-semibold text-gray-900">₦{ticketPrice.toLocaleString()}</span>
              </div>
              {paymentMethod === 'wallet' && isWalletSufficient && (
                <div className="px-4 py-3 flex justify-between text-sm">
                  <span className="text-emerald-600">Wallet Deducted</span>
                  <span className="font-semibold text-emerald-600">−₦{ticketPrice.toLocaleString()}</span>
                </div>
              )}
              {paymentMethod === 'card' && walletBalance > 0 && !isWalletSufficient && (
                <div className="px-4 py-3 flex justify-between text-sm">
                  <span className="text-emerald-600">Wallet Credit Applied</span>
                  <span className="font-semibold text-emerald-600">−₦{walletBalance.toLocaleString()}</span>
                </div>
              )}
              <div className="px-4 py-3 flex justify-between font-black text-sm bg-white">
                <span className="text-gray-900">You Pay Now</span>
                <span className="text-[#C0000C] text-base">
                  {amountDue === 0 ? '₦0 (Free from wallet)' : `₦${amountDue.toLocaleString()}`}
                </span>
              </div>
            </div>
          </div>

          {/* Security note */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
            <ShieldCheck size={13} className="text-emerald-500" />
            <span>SSL encrypted · 100% secure ticket allocation</span>
          </div>
        </div>

        {/* Sticky Footer CTA */}
        <div className="px-5 py-4 border-t border-gray-100 bg-white">
          <button
            disabled={buyTicketMutation.isPending}
            onClick={handleCheckout}
            className="w-full py-4 bg-[#C0000C] hover:bg-red-700 text-white font-black text-sm rounded-2xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-red-600/20 active:scale-[0.99]"
          >
            {buyTicketMutation.isPending ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Confirm & Secure Ticket
                <ChevronRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
