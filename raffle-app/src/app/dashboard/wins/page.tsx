'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardWinsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/tickets');
  }, [router]);

  return null;
}
