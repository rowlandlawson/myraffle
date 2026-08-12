'use client';

import Link from 'next/link';
import AuthLayout from './AuthLayout';
import { LoginForm } from './LoginForm';

export default function LoginPage() {
  return (
    <AuthLayout>
      <div className="space-y-7">
        {/* Header */}
        <div className="space-y-1.5">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Welcome back</h2>
          <p className="text-sm text-gray-500">
            Sign in to your account to continue
          </p>
        </div>

        <LoginForm />

        <div className="pt-2 border-t border-gray-100 space-y-3 text-center">
          <p className="text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="text-[#C0000C] font-bold hover:text-red-700 transition-colors"
            >
              Create one
            </Link>
          </p>
          <Link
            href="/forgot-password"
            className="block text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Forgot your password?
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
