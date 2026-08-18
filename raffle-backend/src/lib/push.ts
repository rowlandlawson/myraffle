import webPush from 'web-push';
import { prisma } from '../config/database';

const publicVapidKey =
  process.env.VAPID_PUBLIC_KEY ||
  'BFfkAhwtSS9RrJUmkMJP4NFFHQHEllxjwECA4Whg2390uNrm0poGeXO9W1-PP3QInlhjrNu-4qSOetwyv3jrwac';
const privateVapidKey =
  process.env.VAPID_PRIVATE_KEY || 'fe973Dxx9HyRYtNZTBtCrxs1geJ0bgfvJefaXEJTRg8';
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@myraffle.com';

webPush.setVapidDetails(vapidSubject, publicVapidKey, privateVapidKey);

export interface NotificationPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  badge?: string;
}

export const sendPushToUser = async (userId: string, payload: NotificationPayload) => {
  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    });

    if (subscriptions.length === 0) return;

    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      url: payload.url || '/dashboard',
      icon: payload.icon || '/images/icon.jpg',
      badge: payload.badge || '/images/icon.jpg',
    });

    await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          await webPush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            },
            notificationPayload,
          );
        } catch (err: unknown) {
          const pushErr = err as { statusCode?: number; message?: string };
          // If subscription has expired or is invalid (404/410), delete it
          if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
            await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
          }
          console.error(`Failed to send push to subscription ${sub.id}:`, pushErr.message || err);
        }
      }),
    );
  } catch (error) {
    console.error(`Push notification error for user ${userId}:`, error);
  }
};

export const sendPushToAll = async (payload: NotificationPayload) => {
  try {
    const subscriptions = await prisma.pushSubscription.findMany();
    if (subscriptions.length === 0) return;

    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      url: payload.url || '/dashboard',
      icon: payload.icon || '/images/icon.jpg',
      badge: payload.badge || '/images/icon.jpg',
    });

    await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          await webPush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            },
            notificationPayload,
          );
        } catch (err: unknown) {
          const pushErr = err as { statusCode?: number };
          if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
            await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
          }
        }
      }),
    );
  } catch (error) {
    console.error('Broadcast push notification error:', error);
  }
};

export { publicVapidKey };
