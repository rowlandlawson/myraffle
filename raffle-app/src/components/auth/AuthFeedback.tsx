'use client';

import Link from 'next/link';

interface AuthFeedbackProps {
  type: 'success' | 'error';
  title: string;
  message: string;
  additionalMessage?: string;
  linkText?: string;
  linkHref?: string;
}

export default function AuthFeedback({
  type,
  title,
  message,
  additionalMessage,
  linkText,
  linkHref,
}: AuthFeedbackProps) {
  const isSuccess = type === 'success';

  return (
    <div className="text-center">
      {/* Icon */}
      <div
        className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
          isSuccess ? 'bg-green-100' : 'bg-red-100'
        }`}
      >
        {isSuccess ? (
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        )}
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>

      {/* Main Message */}
      <p className="text-gray-600">{message}</p>

      {/* Additional Message */}
      {additionalMessage && (
        <p className="text-gray-500 text-sm mt-4">{additionalMessage}</p>
      )}

      {/* Link */}
      {linkText && linkHref && (
        <Link
          href={linkHref}
          className="inline-block mt-6 text-red-600 font-semibold hover:text-red-500 transition-colors"
        >
          {linkText}
        </Link>
      )}
    </div>
  );
}
