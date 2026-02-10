'use client';

import Link from 'next/link';
import AuthLayout from './AuthLayout';
import { RegisterForm } from './RegisterForm';

export default function RegisterPage() {
  return (
    <AuthLayout>
      <h2 className="text-2xl font-bold text-gray-800 mb-1">Create Account</h2>
      <p className="text-gray-600 mb-6">Start winning today</p>

      <RegisterForm />

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-red-600 font-semibold hover:text-red-500 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
