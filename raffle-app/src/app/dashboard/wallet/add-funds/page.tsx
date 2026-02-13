'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Zap } from 'lucide-react';
import { initiateDeposit } from '@/lib/useWallet';

export default function AddFundsPage() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quickAmounts = [5000, 10000, 25000, 50000];

  const handleSubmit = async () => {
    const numAmount = parseFloat(amount);
    if (!amount || numAmount < 100) {
      setError('Please enter a valid amount (minimum ₦100)');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const result = await initiateDeposit(numAmount);

      if (result.success && result.data?.authorizationUrl) {
        // Redirect to Paystack checkout page
        window.location.href = result.data.authorizationUrl;
      } else {
        setError(result.message || 'Failed to initialize payment.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const rafflePoints = Math.floor((parseFloat(amount) || 0) * 0.1);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 md:pb-0">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Add Funds to Your Wallet
        </h1>
        <p className="text-gray-600">
          Securely deposit money to start playing raffle and buying tickets
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left: Form */}
        <div className="space-y-6">
          {/* Amount Section */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              1. Enter Amount
            </h2>

            <div className="space-y-4">
              {/* Amount Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Amount (₦)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setError(null);
                  }}
                  placeholder="Enter amount"
                  min="100"
                  step="100"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-600 text-lg font-semibold"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Minimum: ₦100 | Maximum: ₦5,000,000
                </p>
              </div>

              {/* Quick Amount Buttons */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Quick Select
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAmount(amt.toString())}
                      className={`py-2 rounded-lg font-bold transition ${amount === amt.toString()
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                        }`}
                    >
                      ₦{(amt / 1000).toFixed(0)}k
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="font-bold text-gray-900 mb-3">
                  2. Payment Method
                </h3>

                <div className="space-y-3">
                  {/* Card Option */}
                  <div
                    onClick={() => setPaymentMethod('card')}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-red-600 transition ${paymentMethod === 'card'
                        ? 'border-red-600 bg-red-50'
                        : 'border-gray-300'
                      }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'card'}
                      onChange={() => { }}
                      className="w-4 h-4 accent-red-600"
                    />
                    <div className="ml-4 flex-1">
                      <div className="font-semibold text-gray-900">
                        Credit/Debit Card
                      </div>
                      <div className="text-xs text-gray-600">
                        Visa, Mastercard, Verve
                      </div>
                    </div>
                    <span className="text-xl">💳</span>
                  </div>

                  {/* Bank Transfer Option */}
                  <div
                    onClick={() => setPaymentMethod('bank')}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-red-600 transition ${paymentMethod === 'bank'
                        ? 'border-red-600 bg-red-50'
                        : 'border-gray-300'
                      }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'bank'}
                      onChange={() => { }}
                      className="w-4 h-4 accent-red-600"
                    />
                    <div className="ml-4 flex-1">
                      <div className="font-semibold text-gray-900">
                        Bank Transfer
                      </div>
                      <div className="text-xs text-gray-600">
                        Direct bank transfer (1-2 hours)
                      </div>
                    </div>
                    <span className="text-xl">🏦</span>
                  </div>

                  {/* Mobile Money Option */}
                  <div
                    onClick={() => setPaymentMethod('mobile')}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-red-600 transition ${paymentMethod === 'mobile'
                        ? 'border-red-600 bg-red-50'
                        : 'border-gray-300'
                      }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'mobile'}
                      onChange={() => { }}
                      className="w-4 h-4 accent-red-600"
                    />
                    <div className="ml-4 flex-1">
                      <div className="font-semibold text-gray-900">
                        Mobile Money
                      </div>
                      <div className="text-xs text-gray-600">
                        MTN Mobile Money, Airtel Money
                      </div>
                    </div>
                    <span className="text-xl">📱</span>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isProcessing || !amount}
                className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-red-600/50 transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Redirecting to Paystack...
                  </span>
                ) : (
                  'Continue to Payment'
                )}
              </button>
            </div>

            {/* Security Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <div className="flex gap-3">
                <span className="text-xl">🔒</span>
                <div>
                  <p className="font-semibold text-blue-900 text-sm">
                    Your payment is secure
                  </p>
                  <p className="text-xs text-blue-700">
                    All transactions are encrypted and secured by Paystack
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Summary & Benefits */}
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Transaction Summary
            </h2>

            <div className="space-y-3 mb-6 pb-6 border-b border-gray-300">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount:</span>
                <span className="font-bold text-gray-900">
                  ₦{(amount || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Processing Fee:</span>
                <span className="font-bold text-gray-900">Free</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">You&apos;ll Receive:</span>
                <span className="font-bold text-gray-900">
                  ₦{(amount || 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={20} className="text-yellow-600" />
                <span className="font-bold text-yellow-900">
                  Bonus Raffle Points
                </span>
              </div>
              <p className="text-yellow-800 font-bold text-2xl mb-1">
                {rafflePoints.toLocaleString()} points
              </p>
              <p className="text-xs text-yellow-700">
                Use these points to buy raffle tickets for free!
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-bold text-gray-900 mb-4">Why Add Funds?</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Check
                  size={20}
                  className="text-green-600 flex-shrink-0 mt-1"
                />
                <div>
                  <p className="font-semibold text-gray-900">Instant Access</p>
                  <p className="text-sm text-gray-600">
                    Start buying raffle tickets immediately
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Check
                  size={20}
                  className="text-green-600 flex-shrink-0 mt-1"
                />
                <div>
                  <p className="font-semibold text-gray-900">Secure Wallet</p>
                  <p className="text-sm text-gray-600">
                    Your funds are safe with us
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Check
                  size={20}
                  className="text-green-600 flex-shrink-0 mt-1"
                />
                <div>
                  <p className="font-semibold text-gray-900">Easy Withdrawal</p>
                  <p className="text-sm text-gray-600">
                    Withdraw anytime to your bank account
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Check
                  size={20}
                  className="text-green-600 flex-shrink-0 mt-1"
                />
                <div>
                  <p className="font-semibold text-gray-900">
                    Free Raffle Points
                  </p>
                  <p className="text-sm text-gray-600">
                    Get points for every deposit
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Payment Methods Info */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-bold text-gray-900 mb-4">
              Supported Payment Methods
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-xl">💳</span>
                <div>
                  <p className="font-semibold text-gray-900">Cards</p>
                  <p className="text-gray-600">Visa, Mastercard, Verve</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🏦</span>
                <div>
                  <p className="font-semibold text-gray-900">Bank Transfer</p>
                  <p className="text-gray-600">
                    Direct bank transfer in 1-2 hours
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">📱</span>
                <div>
                  <p className="font-semibold text-gray-900">Mobile Money</p>
                  <p className="text-gray-600">MTN MM, Airtel Money, Others</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
