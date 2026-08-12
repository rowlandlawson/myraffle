// src/components/auth/LoginForm.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Shield, ArrowLeft, Mail, Smartphone } from 'lucide-react';
import { loginSchema } from '@/lib/validation';
import { useAuthStore } from '@/lib/authStore';
import toast from 'react-hot-toast';

type LoginFormData = z.infer<typeof loginSchema>;

const inputBase =
  'w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#C0000C] focus:ring-2 focus:ring-[#C0000C]/10 transition-all';

export function LoginForm() {
  const router = useRouter();
  const { login, verify2FA, resend2FACode, twoFactorPending, clearTwoFactorPending } =
    useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // 2FA state
  const [otpCode, setOtpCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (twoFactorPending && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [twoFactorPending]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await login(data.email, data.password);

      if (result.requires2FA) {
        setError(null);
        if (result.twoFactorMethod === 'EMAIL') {
          setResendCooldown(60);
        }
        return;
      }

      if (result.success && result.user) {
        reset();
        if (result.user.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      } else {
        if (result.message?.includes('verification')) {
          try {
            const rawRes = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/login`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: data.email, password: data.password }),
              }
            );
            const rawData = await rawRes.json();
            if (rawData.needsVerification && rawData.userId) {
              router.push(`/verify?userId=${rawData.userId}`);
              return;
            }
          } catch {
            // Fall through
          }
        }
        setError(result.message || 'Failed to sign in.');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!otpCode || otpCode.length < 6) {
      setError('Please enter a valid 6-digit code.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await verify2FA(otpCode);
      if (result.success && result.user) {
        toast.success('Login successful!');
        if (result.user.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError(result.message || 'Invalid code.');
      }
    } catch {
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      const result = await resend2FACode();
      if (result.success) {
        toast.success('New code sent!');
        setResendCooldown(60);
      } else {
        toast.error(result.message || 'Failed to resend code.');
      }
    } catch {
      toast.error('Failed to resend code.');
    }
  };

  const handleBack = () => {
    clearTwoFactorPending();
    setOtpCode('');
    setError(null);
  };

  // ─── 2FA OTP Screen ───────────────────────────
  if (twoFactorPending) {
    const is2FAEmail = twoFactorPending.method === 'EMAIL';

    return (
      <div className="space-y-5">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to login
        </button>

        <div className="space-y-1">
          <h3 className="text-lg font-bold text-gray-900">Two-step verification</h3>
          <p className="text-sm text-gray-500">
            {is2FAEmail
              ? 'Enter the 6-digit code sent to your email.'
              : 'Enter the code from your authenticator app.'}
          </p>
        </div>

        <div className="flex justify-center py-3">
          <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center">
            {is2FAEmail ? (
              <Mail size={26} className="text-[#C0000C]" />
            ) : (
              <Smartphone size={26} className="text-[#C0000C]" />
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
            Verification Code
          </label>
          <input
            ref={otpInputRef}
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleVerify2FA();
            }}
            placeholder="000000"
            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-center text-2xl font-mono tracking-[0.5em] text-gray-900 placeholder-gray-300 focus:outline-none focus:border-[#C0000C] focus:ring-2 focus:ring-[#C0000C]/10 transition-colors"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button
          onClick={handleVerify2FA}
          disabled={isLoading || otpCode.length < 6}
          className="w-full py-3 bg-[#C0000C] hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Verifying...
            </span>
          ) : (
            <>
              <Shield size={16} />
              Verify &amp; Sign In
            </>
          )}
        </button>

        {is2FAEmail && (
          <div className="text-center">
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className="text-sm text-[#C0000C] hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
            </button>
          </div>
        )}
      </div>
    );
  }

  // ─── Normal Login Form ───────────────────────────
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
          Email Address
        </label>
        <input
          {...register('email')}
          type="email"
          id="email"
          placeholder="you@example.com"
          className={inputBase}
        />
        {errors.email && (
          <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
          Password
        </label>
        <div className="relative">
          <input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            id="password"
            placeholder="••••••••"
            className={`${inputBase} pr-11`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Remember Me */}
      <div className="flex items-center gap-2 pt-0.5">
        <input
          type="checkbox"
          id="remember"
          className="w-4 h-4 border-gray-300 rounded accent-[#C0000C] cursor-pointer"
        />
        <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer select-none">
          Keep me signed in
        </label>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-[#C0000C] hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Signing in...
          </span>
        ) : (
          'Sign In'
        )}
      </button>
    </form>
  );
}
