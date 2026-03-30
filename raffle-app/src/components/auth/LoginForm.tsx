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

  // Focus OTP input when 2FA screen appears
  useEffect(() => {
    if (twoFactorPending && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [twoFactorPending]);

  // Resend cooldown timer
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
        // 2FA required — show OTP screen
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

  // ─── 2FA OTP Screen ──────────────────────────
  if (twoFactorPending) {
    const is2FAEmail = twoFactorPending.method === 'EMAIL';

    return (
      <div className="space-y-5">
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition"
        >
          <ArrowLeft size={16} />
          Back to login
        </button>

        <div className="text-center space-y-3">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto">
            {is2FAEmail ? (
              <Mail size={28} className="text-red-600" />
            ) : (
              <Smartphone size={28} className="text-red-600" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Two-Factor Authentication</h3>
            <p className="text-sm text-gray-500 mt-1">
              {is2FAEmail
                ? 'Enter the 6-digit code sent to your email.'
                : 'Enter the code from your authenticator app.'}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
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
            className="w-full px-3 py-3 bg-white border border-gray-200 rounded-lg text-center text-2xl font-mono tracking-[0.5em] text-gray-900 placeholder-gray-300 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-colors"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <button
          onClick={handleVerify2FA}
          disabled={isLoading || otpCode.length < 6}
          className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Verifying...
            </span>
          ) : (
            <>
              <Shield size={16} />
              Verify & Sign In
            </>
          )}
        </button>

        {is2FAEmail && (
          <div className="text-center">
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className="text-sm text-red-600 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed transition"
            >
              {resendCooldown > 0
                ? `Resend code in ${resendCooldown}s`
                : 'Resend code'}
            </button>
          </div>
        )}
      </div>
    );
  }

  // ─── Normal Login Form ──────────────────────────
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Email Field */}
      <div>
        <label
          htmlFor="email"
          className="block text-xs font-medium text-gray-600 mb-1.5"
        >
          Email Address
        </label>
        <input
          {...register('email')}
          type="email"
          placeholder="you@example.com"
          className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-colors"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label
          htmlFor="password"
          className="block text-xs font-medium text-gray-600 mb-1.5"
        >
          Password
        </label>
        <div className="relative">
          <input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Remember Me */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="remember"
          className="w-3.5 h-3.5 border border-gray-300 rounded accent-red-600 cursor-pointer"
        />
        <label
          htmlFor="remember"
          className="ml-2 text-xs text-gray-500 cursor-pointer"
        >
          Keep me signed in
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            Signing in...
          </span>
        ) : (
          'Sign In'
        )}
      </button>

      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-gray-300"></div>
        <span className="text-xs text-gray-600">or continue with</span>
        <div className="flex-1 h-px bg-gray-300"></div>
      </div>
    </form>
  );
}
