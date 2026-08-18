'use client';

import { registerServiceWorker } from '@/lib/pushClient';
import React, { useEffect } from 'react';
import NotificationPromptModal from './NotificationPromptModal';

export default function PushNotificationManager() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return <NotificationPromptModal />;
}
