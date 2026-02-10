'use client';

import Link from 'next/link';
import AuthLayout from './AuthLayout';
import { LoginForm } from './LoginForm';

export default function LoginPage() {
  return (
    <AuthLayout>
      <h2 className="text-2xl font-bold text-gray-800 mb-1">Welcome Back</h2>
      <p className="text-gray-600 mb-6">Sign in to your account</p>

      <LoginForm />

      <div className="mt-6 text-center space-y-4">
        <p className="text-gray-600">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="text-red-600 font-semibold hover:text-red-500 transition-colors"
          >
            Sign up here
          </Link>
        </p>

        <Link
          href="/forgot-password"
          className="block text-sm text-gray-500 hover:text-red-600 transition-colors"
        >
          Forgot your password?
        </Link>
      </div>
    </AuthLayout>
  );
}
