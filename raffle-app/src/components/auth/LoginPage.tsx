'use client';

import Link from 'next/link';
import AuthLayout from './AuthLayout';
import { LoginForm } from './LoginForm';

export default function LoginPage() {
  return (
    <AuthLayout>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Welcome back</h2>
        <p className="text-sm text-gray-500 mt-1">
          Sign in to your account to continue
        </p>
      </div>

      <LoginForm />

      <div className="mt-6 space-y-3 text-center">
        <p className="text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="text-red-600 font-medium hover:text-red-700 transition-colors"
          >
            Sign up
          </Link>
        </p>

        <Link
          href="/forgot-password"
          className="block text-xs text-gray-400 hover:text-red-600 transition-colors"
        >
          Forgot your password?
        </Link>
      </div>
    </AuthLayout>
  );
}
