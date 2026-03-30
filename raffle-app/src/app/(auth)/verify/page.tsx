'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Mail, Phone, CheckCircle2, RefreshCw } from 'lucide-react';

function VerifyPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const userId = searchParams.get('userId');

    const [emailCode, setEmailCode] = useState('');
    const [phoneCode, setPhoneCode] = useState('');
    const [emailVerified, setEmailVerified] = useState(false);
    const [phoneVerified, setPhoneVerified] = useState(false);
    const [emailLoading, setEmailLoading] = useState(false);
    const [phoneLoading, setPhoneLoading] = useState(false);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [phoneError, setPhoneError] = useState<string | null>(null);
    const [emailCooldown, setEmailCooldown] = useState(0);
    const [phoneCooldown, setPhoneCooldown] = useState(0);

    // Toggle: 'whatsapp' | 'sms'
    const [phoneChannel, setPhoneChannel] = useState<'whatsapp' | 'sms'>('whatsapp');

    // Redirect if no userId
    useEffect(() => {
        if (!userId) {
            router.push('/register');
        }
    }, [userId, router]);

    // Cooldown timers
    useEffect(() => {
        if (emailCooldown > 0) {
            const timer = setTimeout(() => setEmailCooldown(emailCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [emailCooldown]);

    useEffect(() => {
        if (phoneCooldown > 0) {
            const timer = setTimeout(() => setPhoneCooldown(phoneCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [phoneCooldown]);

    // Redirect when both verified
    useEffect(() => {
        if (emailVerified && phoneVerified) {
            const timer = setTimeout(() => {
                router.push('/login?verified=true');
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [emailVerified, phoneVerified, router]);

    // Verify email OTP
    const handleVerifyEmail = useCallback(async () => {
        if (emailCode.length !== 6 || !userId) return;
        setEmailLoading(true);
        setEmailError(null);

        try {
            const result = await api.post<{ bothVerified: boolean }>('/api/auth/verify-email-otp', {
                userId,
                code: emailCode,
            });

            if (result.success) {
                setEmailVerified(true);
                if (result.data?.bothVerified) {
                    setPhoneVerified(true);
                }
            } else {
                setEmailError(result.message || 'Invalid code. Please try again.');
            }
        } catch {
            setEmailError('Network error. Please try again.');
        } finally {
            setEmailLoading(false);
        }
    }, [emailCode, userId]);

    // Verify phone OTP (works for both WhatsApp and SMS — same backend endpoint)
    const handleVerifyPhone = useCallback(async () => {
        if (phoneCode.length < 4 || phoneCode.length > 6 || !userId) return;
        setPhoneLoading(true);
        setPhoneError(null);

        try {
            const result = await api.post<{ bothVerified: boolean }>('/api/auth/verify-whatsapp-otp', {
                userId,
                code: phoneCode,
            });

            if (result.success) {
                setPhoneVerified(true);
                if (result.data?.bothVerified) {
                    setEmailVerified(true);
                }
            } else {
                setPhoneError(result.message || 'Invalid code. Please try again.');
            }
        } catch {
            setPhoneError('Network error. Please try again.');
        } finally {
            setPhoneLoading(false);
        }
    }, [phoneCode, userId]);

    // Resend handlers
    const handleResendEmail = async () => {
        if (emailCooldown > 0 || !userId) return;
        try {
            const result = await api.post('/api/auth/resend-email-otp', { userId });
            if (result.success) {
                setEmailCooldown(60);
                setEmailError(null);
            } else {
                setEmailError(result.message || 'Failed to resend code.');
            }
        } catch {
            setEmailError('Failed to resend code.');
        }
    };

    const handleResendPhone = async () => {
        if (phoneCooldown > 0 || !userId) return;
        try {
            const endpoint =
                phoneChannel === 'sms'
                    ? '/api/auth/resend-sms-otp'
                    : '/api/auth/resend-whatsapp-otp';
            const result = await api.post(endpoint, { userId });
            if (result.success) {
                setPhoneCooldown(60);
                setPhoneError(null);
            } else {
                setPhoneError(result.message || 'Failed to resend code.');
            }
        } catch {
            setPhoneError('Failed to resend code.');
        }
    };

    if (!userId) return null;

    const bothDone = emailVerified && phoneVerified;

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Verify Your Account</h1>
                    <p className="text-gray-500 mt-2 text-sm">
                        Enter the verification codes sent to your email and phone
                    </p>
                </div>

                {/* Success Banner */}
                {bothDone && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-center">
                        <CheckCircle2 className="mx-auto mb-2 text-green-600" size={32} />
                        <p className="text-green-700 font-semibold">All verified! Redirecting to login...</p>
                    </div>
                )}

                {/* OTP Cards */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Email Verification */}
                    <div className={`bg-white rounded-2xl shadow-sm border p-6 transition-all ${emailVerified ? 'border-green-300 bg-green-50/30' : 'border-gray-200'}`}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${emailVerified ? 'bg-green-100' : 'bg-red-100'}`}>
                                {emailVerified ? (
                                    <CheckCircle2 className="text-green-600" size={20} />
                                ) : (
                                    <Mail className="text-red-600" size={20} />
                                )}
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Email</h3>
                                <p className="text-xs text-gray-500">
                                    {emailVerified ? 'Verified' : 'Check your inbox'}
                                </p>
                            </div>
                        </div>

                        {emailVerified ? (
                            <div className="text-center py-4">
                                <p className="text-green-600 font-medium text-sm">Email verified successfully</p>
                            </div>
                        ) : (
                            <>
                                <input
                                    type="text"
                                    maxLength={6}
                                    value={emailCode}
                                    onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, ''))}
                                    placeholder="000000"
                                    className="w-full px-3 py-3 text-center text-xl tracking-[0.3em] bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-300 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-colors font-mono mb-3"
                                />

                                {emailError && (
                                    <p className="text-sm text-red-500 mb-3 text-center">{emailError}</p>
                                )}

                                <button
                                    onClick={handleVerifyEmail}
                                    disabled={emailCode.length !== 6 || emailLoading}
                                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-2"
                                >
                                    {emailLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Verifying...
                                        </span>
                                    ) : (
                                        'Verify Email'
                                    )}
                                </button>

                                <button
                                    onClick={handleResendEmail}
                                    disabled={emailCooldown > 0}
                                    className="w-full flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-red-600 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors py-1"
                                >
                                    <RefreshCw size={14} />
                                    {emailCooldown > 0 ? `Resend in ${emailCooldown}s` : 'Resend code'}
                                </button>
                            </>
                        )}
                    </div>

                    {/* Phone Verification (WhatsApp / SMS Toggle) */}
                    <div className={`bg-white rounded-2xl shadow-sm border p-6 transition-all ${phoneVerified ? 'border-green-300 bg-green-50/30' : 'border-gray-200'}`}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${phoneVerified ? 'bg-green-100' : 'bg-blue-50'}`}>
                                {phoneVerified ? (
                                    <CheckCircle2 className="text-green-600" size={20} />
                                ) : (
                                    <Phone className="text-blue-600" size={20} />
                                )}
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Phone</h3>
                                <p className="text-xs text-gray-500">
                                    {phoneVerified ? 'Verified' : 'Check your WhatsApp or SMS'}
                                </p>
                            </div>
                        </div>

                        {phoneVerified ? (
                            <div className="text-center py-4">
                                <p className="text-green-600 font-medium text-sm">Phone verified successfully</p>
                            </div>
                        ) : (
                            <>
                                {/* WhatsApp / SMS Toggle */}
                                <div className="flex items-center bg-gray-100 rounded-lg p-1 mb-4">
                                    <button
                                        type="button"
                                        onClick={() => setPhoneChannel('whatsapp')}
                                        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${phoneChannel === 'whatsapp'
                                            ? 'bg-white text-green-700 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        WhatsApp
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPhoneChannel('sms')}
                                        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${phoneChannel === 'sms'
                                            ? 'bg-white text-blue-700 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        SMS
                                    </button>
                                </div>

                                <input
                                    type="text"
                                    maxLength={6}
                                    value={phoneCode}
                                    onChange={(e) => setPhoneCode(e.target.value.replace(/\D/g, ''))}
                                    placeholder="0000 – 000000"
                                    className="w-full px-3 py-3 text-center text-xl tracking-[0.3em] bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-colors font-mono mb-3"
                                />

                                {phoneError && (
                                    <p className="text-sm text-red-500 mb-3 text-center">{phoneError}</p>
                                )}

                                <button
                                    onClick={handleVerifyPhone}
                                    disabled={phoneCode.length < 4 || phoneCode.length > 6 || phoneLoading}
                                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-2"
                                >
                                    {phoneLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Verifying...
                                        </span>
                                    ) : (
                                        'Verify Phone'
                                    )}
                                </button>

                                <button
                                    onClick={handleResendPhone}
                                    disabled={phoneCooldown > 0}
                                    className="w-full flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors py-1"
                                >
                                    <RefreshCw size={14} />
                                    {phoneCooldown > 0
                                        ? `Resend in ${phoneCooldown}s`
                                        : `Resend via ${phoneChannel === 'sms' ? 'SMS' : 'WhatsApp'}`}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-gray-400 mt-8">
                    Codes expire in 10 minutes. Didn&apos;t receive a code? Try switching between WhatsApp and SMS above.
                </p>
            </div>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full" />
            </div>
        }>
            <VerifyPageContent />
        </Suspense>
    );
}
