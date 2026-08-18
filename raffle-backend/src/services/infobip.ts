import { env } from '../config/environment';

export const normalizePhone = (phone: string): string => {
  let cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  if (cleaned.startsWith('0')) {
    cleaned = `234${cleaned.substring(1)}`;
  }
  if (cleaned.length <= 10) {
    cleaned = `234${cleaned}`;
  }
  return cleaned;
};

export const sendWhatsAppOTP = async (phone: string, code: string): Promise<boolean> => {
  const normalizedPhone = normalizePhone(phone);

  console.log('\n========================================');
  console.log(`🔑 DEV WHATSAPP OTP FOR ${normalizedPhone}: ${code}`);
  console.log('========================================\n');

  if (!env.INFOBIP_API_KEY || env.INFOBIP_API_KEY.includes('your_') || env.INFOBIP_API_KEY === '') {
    console.warn('[WhatsApp] INFOBIP_API_KEY not configured. Mocking WhatsApp send in dev mode.');
    return true;
  }

  try {
    const response = await fetch(`${env.INFOBIP_BASE_URL}/whatsapp/1/message/text`, {
      method: 'POST',
      headers: {
        Authorization: `App ${env.INFOBIP_API_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        from: env.INFOBIP_SENDER || 'myRaffle',
        to: normalizedPhone,
        content: {
          text: `Your myRaffle verification code is: ${code}\n\nThis code expires in 10 minutes.`,
        },
      }),
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as Record<string, unknown>;
      console.warn(
        '[WhatsApp] Infobip API response error (mocking success in dev):',
        (errorData?.requestError as Record<string, unknown>)?.serviceException || errorData,
      );
      return true;
    }

    console.log(`[WhatsApp] OTP sent successfully to ${normalizedPhone}`);
    return true;
  } catch (error) {
    console.error('[WhatsApp] Failed to send OTP:', error);
    return true;
  }
};

export const sendSMSOTP = async (phone: string, code: string): Promise<boolean> => {
  const normalizedPhone = normalizePhone(phone);

  console.log('\n========================================');
  console.log(`🔑 DEV SMS OTP FOR ${normalizedPhone}: ${code}`);
  console.log('========================================\n');

  if (!env.INFOBIP_API_KEY || env.INFOBIP_API_KEY.includes('your_') || env.INFOBIP_API_KEY === '') {
    console.warn('[SMS] INFOBIP_API_KEY not configured. Mocking SMS send in dev mode.');
    return true;
  }

  try {
    const response = await fetch(`${env.INFOBIP_BASE_URL}/sms/2/text/advanced`, {
      method: 'POST',
      headers: {
        Authorization: `App ${env.INFOBIP_API_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            destinations: [{ to: normalizedPhone }],
            from: env.INFOBIP_SENDER || 'myRaffle',
            text: `Your myRaffle verification code is: ${code}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as Record<string, unknown>;
      console.warn(
        '[SMS] Infobip API error (mocking success in dev):',
        (errorData?.requestError as Record<string, unknown>)?.serviceException || errorData,
      );
      return true;
    }

    console.log(`[SMS] OTP sent successfully to ${normalizedPhone}`);
    return true;
  } catch (error) {
    console.error('[SMS] Failed to send OTP:', error);
    return true;
  }
};
