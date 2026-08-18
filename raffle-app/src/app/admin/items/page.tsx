'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminItemsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/raffles');
  }, [router]);

  return null;
}
