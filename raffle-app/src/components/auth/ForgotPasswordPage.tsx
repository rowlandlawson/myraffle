'use client';

import { useState } from 'react';
import AuthLayout from './AuthLayout';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import AuthFeedback from './AuthFeedback';

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <AuthLayout>
      {!submitted ? (
        <>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Forgot Password?
          </h2>
          <p className="text-gray-600 mb-6">
            Enter your email address and we&apos;ll send you a link to reset
            your password.
          </p>
          <ForgotPasswordForm onSuccess={() => setSubmitted(true)} />
        </>
      ) : (
        <AuthFeedback
          type="success"
          title="Check Your Email"
          message="We've sent you a password reset link. Check your email and follow the instructions."
          additionalMessage="Didn't receive it? Check your spam folder or request a new link."
          linkText="Back to Login"
          linkHref="/login"
        />
      )}
    </AuthLayout>
  );
}
