'use client';

import { useState, useEffect } from 'react';
import TopNav from '@/components/navbar/TopNav';
import BottomNav from '@/components/navbar/BottomNav';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function TermsPage() {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get('/api/settings/terms_and_conditions')
      .then((res: any) => {
        if (res.success && res.data?.value) {
          setContent(res.data.value);
        }
      })
      .catch((err) => {
        console.error('Fetch terms error:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <TopNav />

      <main className="max-w-3xl mx-auto px-4 py-8 pb-20">
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-100 space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
              Terms & Conditions
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Official MyRaffle Platform Terms and Rules
            </p>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-gray-400">Loading terms...</div>
          ) : (
            <div
              dangerouslySetInnerHTML={{ __html: content }}
              className="prose prose-red max-w-none text-gray-700 text-sm leading-relaxed space-y-4"
            />
          )}

          <div className="pt-4 border-t border-gray-100 flex justify-center">
            <Link
              href="/"
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl transition shadow"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
