'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WalletPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/earnings');
  }, [router]);

  return null;
}
