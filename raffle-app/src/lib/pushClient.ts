import { api } from './api';

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }
  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    console.log('[SW] Service worker registered successfully:', registration.scope);
    return registration;
  } catch (error) {
    console.error('[SW] Service worker registration failed:', error);
    return null;
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeUserToPush(): Promise<boolean> {
  if (
    typeof window === 'undefined' ||
    !('serviceWorker' in navigator) ||
    !('PushManager' in window)
  ) {
    console.warn('Push messaging is not supported in this browser');
    return false;
  }

  try {
    // Request permission first
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Push notification permission denied by user');
      return false;
    }

    const registration = await navigator.serviceWorker.ready;

    // Fetch VAPID public key from backend with robust fallback
    const vapidRes = await api.get<{ publicKey: string }>('/api/push/vapid-public-key');
    const publicKey =
      vapidRes.data?.publicKey ||
      (vapidRes as unknown as { publicKey?: string })?.publicKey ||
      'BFfkAhwtSS9RrJUmkMJP4NFFHQHEllxjwECA4Whg2390uNrm0poGeXO9W1-PP3QInlhjrNu-4qSOetwyv3jrwac';

    if (!publicKey) {
      throw new Error('VAPID public key not received');
    }

    const applicationServerKey = urlBase64ToUint8Array(publicKey);

    // Subscribe browser PushManager
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey as unknown as BufferSource,
    });

    // Send subscription payload to backend
    await api.post('/api/push/subscribe', subscription.toJSON());
    console.log('Successfully subscribed to Push Notifications');
    return true;
  } catch (error) {
    console.error('Failed to subscribe user to push notifications:', error);
    return false;
  }
}

export async function unsubscribeUserFromPush(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await api
        .delete('/api/push/unsubscribe', { endpoint: subscription.endpoint })
        .catch(() => {});

      await subscription.unsubscribe();
      console.log('Successfully unsubscribed from Push Notifications');
    }
    return true;
  } catch (error) {
    console.error('Failed to unsubscribe from push notifications:', error);
    return false;
  }
}

export async function getPushSubscriptionStatus(): Promise<{
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
}> {
  if (
    typeof window === 'undefined' ||
    !('serviceWorker' in navigator) ||
    !('PushManager' in window)
  ) {
    return { isSupported: false, permission: 'denied', isSubscribed: false };
  }

  const permission = Notification.permission;
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return {
      isSupported: true,
      permission,
      isSubscribed: !!subscription,
    };
  } catch {
    return { isSupported: true, permission, isSubscribed: false };
  }
}
