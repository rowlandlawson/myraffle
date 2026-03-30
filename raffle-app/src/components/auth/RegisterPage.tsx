'use client';

import Link from 'next/link';
import AuthLayout from './AuthLayout';
import { RegisterForm } from './RegisterForm';

export default function RegisterPage() {
  return (
    <AuthLayout>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Create your account
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Join thousands of raffle participants
        </p>
      </div>

      <RegisterForm />

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-red-600 font-medium hover:text-red-700 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
