'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { registerSchema } from '@/lib/validation';
import { useAuthStore } from '@/lib/authStore';

type RegisterFormData = z.infer<typeof registerSchema>;

const inputBase =
  'w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#C0000C] focus:ring-2 focus:ring-[#C0000C]/10 transition-all';
const labelBase = 'block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide';

export function RegisterForm() {
  const router = useRouter();
  const registerUser = useAuthStore((s) => s.register);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await registerUser({
        name: data.fullName,
        email: data.email,
        phone: data.whatsapp,
        password: data.password,
      });
      if (result.success) {
        const userId = result.data?.userId;
        router.push(`/verify?userId=${userId}`);
      } else {
        setError(result.message || 'Failed to create account. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Full Name */}
      <div>
        <label htmlFor="fullName" className={labelBase}>Full Name</label>
        <input
          {...register('fullName')}
          id="fullName"
          type="text"
          placeholder="John Doe"
          className={inputBase}
        />
        {errors.fullName && (
          <p className="mt-1.5 text-xs text-red-500">{errors.fullName.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className={labelBase}>Email Address</label>
        <input
          {...register('email')}
          id="email"
          type="email"
          placeholder="you@example.com"
          className={inputBase}
        />
        {errors.email && (
          <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="whatsapp" className={labelBase}>Phone Number</label>
        <input
          {...register('whatsapp')}
          id="whatsapp"
          type="tel"
          placeholder="+234 800 000 0000"
          className={inputBase}
        />
        <p className="mt-1.5 text-[11px] text-gray-400">WhatsApp or SMS — used for notifications</p>
        {errors.whatsapp && (
          <p className="mt-1 text-xs text-red-500">{errors.whatsapp.message}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className={labelBase}>Password</label>
        <div className="relative">
          <input
            {...register('password')}
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Min 8 characters"
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

      {/* Confirm Password */}
      <div>
        <label htmlFor="confirmPassword" className={labelBase}>Confirm Password</label>
        <div className="relative">
          <input
            {...register('confirmPassword')}
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Re-enter password"
            className={`${inputBase} pr-11`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-1.5 text-xs text-red-500">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* Terms */}
      <div className="flex items-start gap-2.5 pt-1">
        <input
          type="checkbox"
          id="terms"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          className="w-4 h-4 mt-0.5 border border-gray-300 rounded accent-[#C0000C] cursor-pointer shrink-0"
        />
        <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer leading-snug">
          I agree to the{' '}
          <a href="#" className="text-[#C0000C] font-semibold hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-[#C0000C] font-semibold hover:underline">Privacy Policy</a>
        </label>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading || !termsAccepted}
        className={`w-full py-3 text-white text-sm font-bold rounded-xl transition-colors mt-1 flex items-center justify-center gap-2 ${
          !termsAccepted
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-[#C0000C] hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed'
        }`}
      >
        {isLoading ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Creating Account...
          </>
        ) : (
          'Create Account'
        )}
      </button>
    </form>
  );
}
