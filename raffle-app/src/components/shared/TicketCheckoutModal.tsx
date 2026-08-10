'use client';

import { useState } from 'react';
import { X, CheckCircle2, Wallet, CreditCard, ShieldCheck, Ticket, ArrowRight, Loader2 } from 'lucide-react';
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

export default function TicketCheckoutModal({
  item,
  isOpen,
  onClose,
}: TicketCheckoutModalProps) {
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
          const ticketNumber = res?.data?.ticketNumber || res?.ticket?.ticketNumber || 'TKT-LIVE-DRAW';
          setSuccessReceipt({ ticketNumber });
          toast.success('🎉 Ticket secured successfully!');
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

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <Ticket className="text-red-600" size={22} />
            <h2 className="text-lg font-black text-gray-900">
              {successReceipt ? 'Ticket Receipt' : 'Checkout & Confirm Ticket'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-200/60 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {successReceipt ? (
            /* Success Receipt View */
            <div className="text-center space-y-5 py-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
                <CheckCircle2 size={36} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900">You&apos;re in the Draw!</h3>
                <p className="text-sm text-gray-500 mt-1">Your ticket for <span className="font-bold text-gray-800">{item.name}</span> is confirmed.</p>
              </div>

              {/* Ticket Card Receipt */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl text-left relative overflow-hidden shadow-xl">
                <div className="absolute -right-6 -bottom-6 text-slate-800 opacity-30">
                  <Ticket size={120} />
                </div>
                <p className="text-xs font-mono uppercase text-slate-400 tracking-wider">Official Ticket ID</p>
                <p className="text-xl font-mono font-black text-yellow-400 mt-1">{successReceipt.ticketNumber}</p>
                <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-end text-xs text-slate-300">
                  <div>
                    <p className="font-semibold text-white">{item.name}</p>
                    <p className="text-[11px] text-slate-400">{item.ticketPrice.toLocaleString()} NGN Paid</p>
                  </div>
                  <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-md font-bold text-[10px]">
                    ACTIVE TICKET
                  </span>
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-2">
                <button
                  onClick={() => {
                    handleClose();
                    router.push('/dashboard/tickets');
                  }}
                  className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-md"
                >
                  View My Tickets Dashboard
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={handleClose}
                  className="w-full py-2.5 text-gray-600 font-semibold text-xs hover:text-gray-900"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            /* Checkout View */
            <>
              {/* Item Card Summary */}
              <div className="flex gap-4 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl items-center">
                <div className="w-16 h-16 bg-red-600 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center p-1 border border-slate-200">
                  {imageUrl ? (
                    <img src={imageUrl} alt={item.name} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-2xl">📦</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-extrabold text-gray-900 text-sm truncate">{item.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">1 Ticket Entry</p>
                  <p className="text-sm font-black text-red-600 mt-1">
                    {item.ticketPrice.toLocaleString()} NGN
                  </p>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                  Select Payment Method
                </label>

                {/* Option 1: Wallet Balance */}
                <div
                  onClick={() => setPaymentMethod('wallet')}
                  className={`p-4 border rounded-2xl cursor-pointer transition flex items-center justify-between ${
                    paymentMethod === 'wallet'
                      ? 'border-red-600 bg-red-50/50 ring-2 ring-red-600/20'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${paymentMethod === 'wallet' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                      <Wallet size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-sm flex items-center gap-2">
                        Wallet Balance
                        <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          ₦{isLoadingWallet ? '...' : walletBalance.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {isWalletSufficient ? 'Instant checkout with wallet funds' : `Insufficient balance (₦${walletBalance.toLocaleString()} / ₦${ticketPrice.toLocaleString()})`}
                      </p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'wallet' ? 'border-red-600 bg-red-600' : 'border-gray-300'}`}>
                    {paymentMethod === 'wallet' && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                </div>

                {/* Option 2: Monnify Gateway */}
                <div
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 border rounded-2xl cursor-pointer transition flex items-center justify-between ${
                    paymentMethod === 'card'
                      ? 'border-red-600 bg-red-50/50 ring-2 ring-red-600/20'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${paymentMethod === 'card' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-sm flex items-center gap-2">
                        Monnify Online Payment
                        {!isWalletSufficient && walletBalance > 0 && (
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                            Split Payment Supported
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {!isWalletSufficient && walletBalance > 0
                          ? `Use ₦${walletBalance.toLocaleString()} wallet balance + pay remaining ₦${(ticketPrice - walletBalance).toLocaleString()} via Monnify`
                          : 'Debit Card, Bank Transfer or USSD'}
                      </p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'card' ? 'border-red-600 bg-red-600' : 'border-gray-300'}`}>
                    {paymentMethod === 'card' && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl space-y-2.5 text-xs">
                <div className="flex justify-between text-gray-600 font-medium">
                  <span>Ticket Price</span>
                  <span>{item.ticketPrice.toLocaleString()} NGN</span>
                </div>
                {paymentMethod === 'wallet' && isWalletSufficient && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Wallet Applied</span>
                    <span>-{ticketPrice.toLocaleString()} NGN</span>
                  </div>
                )}
                {paymentMethod === 'card' && walletBalance > 0 && !isWalletSufficient && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Wallet Applied (Split)</span>
                    <span>-{walletBalance.toLocaleString()} NGN</span>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-200 flex justify-between text-sm font-extrabold text-gray-900">
                  <span>Total Amount Payable</span>
                  <span className="text-red-600 text-base">
                    {paymentMethod === 'wallet'
                      ? isWalletSufficient ? '0 NGN' : `${ticketPrice.toLocaleString()} NGN`
                      : walletBalance > 0 && !isWalletSufficient
                      ? `${(ticketPrice - walletBalance).toLocaleString()} NGN via Monnify`
                      : `${item.ticketPrice.toLocaleString()} NGN via Monnify`}
                  </span>
                </div>
              </div>

              {/* Security Banner */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 font-semibold">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span>100% Encrypted & Secure Ticket Allocation</span>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        {!successReceipt && (
          <div className="p-4 bg-white border-t border-gray-100">
            <button
              disabled={buyTicketMutation.isPending}
              onClick={handleCheckout}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
            >
              {buyTicketMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <span>Confirm & Secure Ticket</span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
