import type { Response } from 'express';
import { prisma } from '../config/database';
import { publicVapidKey, sendPushToUser } from '../lib/push';
import type { AuthRequest } from '../middleware/auth';

// GET /api/push/vapid-public-key
export const getVapidPublicKey = async (_req: AuthRequest, res: Response) => {
  try {
    res.json({
      success: true,
      message: 'VAPID public key retrieved',
      data: { publicKey: publicVapidKey },
      publicKey: publicVapidKey,
    });
  } catch (_error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve VAPID key' });
  }
};

// POST /api/push/subscribe
export const subscribe = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { endpoint, keys } = req.body;

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return res.status(400).json({ error: 'Invalid subscription object' });
    }

    const subscription = await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: {
        userId,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
      create: {
        userId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    });

    res.status(201).json({ message: 'Push notification subscription saved', subscription });
  } catch (error: unknown) {
    console.error('Error saving push subscription:', error);
    res.status(500).json({ error: 'Failed to subscribe to push notifications' });
  }
};

// DELETE /api/push/unsubscribe
export const unsubscribe = async (req: AuthRequest, res: Response) => {
  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({ error: 'Endpoint is required' });
    }

    await prisma.pushSubscription
      .delete({
        where: { endpoint },
      })
      .catch(() => {});

    res.json({ message: 'Unsubscribed successfully' });
  } catch (error: unknown) {
    console.error('Error unsubscribing push notification:', error);
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
};

// POST /api/push/test
export const testPushNotification = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    await sendPushToUser(userId, {
      title: '🎉 Push Notifications Active!',
      body: 'Notifications are working perfectly on myRaffle. You will receive alerts for wins, draws & transactions.',
      url: '/dashboard',
    });
    res.json({ message: 'Test notification sent' });
  } catch (_error: unknown) {
    res.status(500).json({ error: 'Failed to send test push notification' });
  }
};
