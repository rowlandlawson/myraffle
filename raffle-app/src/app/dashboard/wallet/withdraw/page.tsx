'use client';

import { useState } from 'react';
import { Check, AlertCircle, HelpCircle } from 'lucide-react';

export default function WithdrawPage() {
  const [amount, setAmount] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const walletBalance = 50000;
  const pendingWithdrawal = 20000;
  const availableForWithdrawal = walletBalance - pendingWithdrawal;

  const banks = [
    { code: '999991', name: 'Access Bank' },
    { code: '044', name: 'Access Bank Nigeria' },
    { code: '070', name: 'Fidelity Bank' },
    { code: '066', name: 'Guaranty Trust Bank' },
    { code: '076', name: 'Zenith Bank' },
    { code: '050', name: 'Ecobank' },
    { code: '035', name: 'Wema Bank' },
    { code: '033', name: 'United Bank for Africa' },
  ];

  const handleValidateAccount = () => {
    if (!bankCode || !accountNumber) {
      alert('Please select a bank and enter account number');
      return;
    }
    setShowValidation(true);
    setTimeout(() => {
      setShowValidation(false);
      setAccountName('John Doe');
    }, 1500);
  };

  const handleSubmit = () => {
    if (!amount || !bankCode || !accountNumber || !accountName) {
      alert('Please fill in all fields');
      return;
    }

    if (parseFloat(amount) < 1000) {
      alert('Minimum withdrawal is ₦1,000');
      return;
    }

    if (parseFloat(amount) > availableForWithdrawal) {
      alert(
        `You only have ₦${availableForWithdrawal.toLocaleString()} available for withdrawal`,
      );
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowSuccess(true);
      setAmount('');
      setBankCode('');
      setAccountNumber('');
      setAccountName('');
      setTimeout(() => setShowSuccess(false), 3000);
    }, 2000);
  };

  const chargePercentage = Math.round(parseFloat(amount) * 0.01) || 0;
  const amountAfterCharge = (parseFloat(amount) || 0) - chargePercentage;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 md:pb-0">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Withdraw Your Funds
        </h1>
        <p className="text-gray-600">
          Transfer money from your wallet to your bank account
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left: Form */}
        <div className="space-y-6">
          {/* Balance Info */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border border-red-200">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total Balance:</span>
                <span className="font-bold text-lg text-gray-900">
                  ₦{walletBalance.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Pending Withdrawal:</span>
                <span className="font-bold text-lg text-red-600">
                  -₦{pendingWithdrawal.toLocaleString()}
                </span>
              </div>
              <div className="border-t border-red-200 pt-3 flex justify-between items-center">
                <span className="font-semibold text-gray-900">
                  Available to Withdraw:
                </span>
                <span className="font-bold text-2xl text-green-600">
                  ₦{availableForWithdrawal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Withdrawal Form */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Withdrawal Details
            </h2>

            <div className="space-y-4">
              {/* Amount */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Withdrawal Amount (₦)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="1000"
                  max={availableForWithdrawal}
                  step="100"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-600 text-lg font-semibold"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Minimum: ₦1,000 | Maximum: ₦
                  {availableForWithdrawal.toLocaleString()}
                </p>
              </div>

              {/* Quick Amount Buttons */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Quick Select
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[10000, 25000, 50000].map(
                    (amt) =>
                      amt <= availableForWithdrawal && (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setAmount(amt.toString())}
                          className={`py-2 rounded-lg font-bold transition ${
                            amount === amt.toString()
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                          }`}
                        >
                          ₦{(amt / 1000).toFixed(0)}k
                        </button>
                      ),
                  )}
                </div>
              </div>

              {/* Bank Selection */}
              <div className="pt-4 border-t border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Bank
                </label>
                <select
                  value={bankCode}
                  onChange={(e) => setBankCode(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                >
                  <option value="">Choose a bank...</option>
                  {banks.map((bank) => (
                    <option key={bank.code} value={bank.code}>
                      {bank.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Account Number
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) =>
                      setAccountNumber(
                        e.target.value.replace(/\D/g, '').slice(0, 10),
                      )
                    }
                    placeholder="Enter 10-digit account number"
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                  />
                  <button
                    onClick={handleValidateAccount}
                    disabled={!bankCode || accountNumber.length !== 10}
                    className="px-6 py-3 bg-gray-100 text-gray-900 font-semibold rounded-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Verify
                  </button>
                </div>
              </div>

              {/* Account Name (Read-only after validation) */}
              {accountName && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Account Name
                  </label>
                  <div className="w-full px-4 py-3 border-2 border-green-300 rounded-lg bg-green-50">
                    <div className="flex items-center gap-2">
                      <Check size={20} className="text-green-600" />
                      <span className="font-semibold text-gray-900">
                        {accountName}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {showValidation && (
                <div className="flex items-center gap-2 text-yellow-700 text-sm">
                  <span className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></span>
                  Verifying account...
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isProcessing || !amount || !accountName}
                className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-red-600/50 transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Processing...
                  </span>
                ) : (
                  'Request Withdrawal'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Summary & Info */}
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Withdrawal Summary
            </h2>

            <div className="space-y-3 mb-6 pb-6 border-b border-gray-300">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Withdrawal Amount:</span>
                <span className="font-bold text-gray-900">
                  ₦{(amount || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Processing Fee (1%):</span>
                <span className="font-bold text-gray-900">
                  -₦{chargePercentage.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-300">
                <span className="font-semibold text-gray-900">
                  You&apos;ll Receive:
                </span>
                <span className="font-bold text-2xl text-green-600">
                  ₦{amountAfterCharge.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
              <p>
                Processing takes 24-48 hours. You&apos;ll receive an SMS
                notification when complete.
              </p>
            </div>
          </div>

          {/* Important Info */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle size={20} className="text-orange-600" />
              Important Information
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="text-lg">📋</span>
                <div>
                  <p className="font-semibold text-gray-900">
                    Correct Account Details
                  </p>
                  <p className="text-gray-600">
                    Ensure your account details are correct to avoid failed
                    transfers
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-lg">⏱️</span>
                <div>
                  <p className="font-semibold text-gray-900">Processing Time</p>
                  <p className="text-gray-600">
                    Withdrawals are processed within 24-48 business hours
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-lg">💰</span>
                <div>
                  <p className="font-semibold text-gray-900">
                    Minimum Withdrawal
                  </p>
                  <p className="text-gray-600">
                    Minimum withdrawal amount is ₦1,000
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-lg">🔒</span>
                <div>
                  <p className="font-semibold text-gray-900">
                    Secure Transfers
                  </p>
                  <p className="text-gray-600">
                    All withdrawals are encrypted and secure
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Withdrawal Status */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-bold text-gray-900 mb-4">Recent Withdrawals</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">
                    ₦20,000 to GTBank
                  </p>
                  <p className="text-xs text-gray-600">Requested 1 day ago</p>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                  Pending
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">
                    ₦15,000 to Access Bank
                  </p>
                  <p className="text-xs text-gray-600">Completed 3 days ago</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                  Done
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-100 border-2 border-green-600 text-green-700 px-6 py-4 rounded-lg font-semibold flex items-center gap-2 shadow-lg">
          <Check size={24} /> Withdrawal request submitted!
        </div>
      )}
    </div>
  );
}
