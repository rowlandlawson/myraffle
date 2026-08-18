'use client';

import Link from 'next/link';
import AuthLayout from './AuthLayout';
import { RegisterForm } from './RegisterForm';

export default function RegisterPage() {
  return (
    <AuthLayout>
      <div className="space-y-7">
        {/* Header */}
        <div className="space-y-1.5">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Create your account</h2>
          <p className="text-sm text-gray-500">Join thousands of participants winning weekly</p>
        </div>

        <RegisterForm />

        <div className="pt-2 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-[#E10600] font-bold hover:text-red-700 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
