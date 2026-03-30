import { env } from '../config/environment';

/**
 * Normalize a phone number to E.164 format for Infobip.
 * Strips spaces, dashes, parentheses. Ensures leading country code (defaults to 234 for Nigeria).
 */
export const normalizePhone = (phone: string): string => {
    let cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
    // Remove leading + if present
    if (cleaned.startsWith('+')) {
        cleaned = cleaned.substring(1);
    }
    // If starts with 0, assume Nigerian local number
    if (cleaned.startsWith('0')) {
        cleaned = '234' + cleaned.substring(1);
    }
    // If doesn't start with country code, prepend 234
    if (cleaned.length <= 10) {
        cleaned = '234' + cleaned;
    }
    return cleaned;
};

/**
 * Send a WhatsApp OTP message via Infobip API.
 * Falls back to console logging if INFOBIP_API_KEY is not set.
 */
export const sendWhatsAppOTP = async (
    phone: string,
    code: string,
): Promise<boolean> => {
    const normalizedPhone = normalizePhone(phone);

    if (!env.INFOBIP_API_KEY) {
        console.warn('[WhatsApp] INFOBIP_API_KEY not set. Skipping WhatsApp send.');
        console.log(`[WhatsApp] Would have sent OTP ${code} to: ${normalizedPhone}`);
        return true; // Return true in dev mode so flow continues
    }

    try {
        const response = await fetch(`${env.INFOBIP_BASE_URL}/whatsapp/1/message/text`, {
            method: 'POST',
            headers: {
                'Authorization': `App ${env.INFOBIP_API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                from: env.INFOBIP_SENDER,
                to: normalizedPhone,
                content: {
                    text: `Your myRaffle verification code is: ${code}\n\nThis code expires in 10 minutes. Do not share it with anyone.`,
                },
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('[WhatsApp] Infobip API error:', errorData);
            return false;
        }

        console.log(`[WhatsApp] OTP sent successfully to ${normalizedPhone}`);
        return true;
    } catch (error) {
        console.error('[WhatsApp] Failed to send OTP:', error);
        return false;
    }
};

/**
 * Send an SMS OTP message via Infobip API.
 */
export const sendSMSOTP = async (
    phone: string,
    code: string,
): Promise<boolean> => {
    const normalizedPhone = normalizePhone(phone);

    if (!env.INFOBIP_API_KEY) {
        console.warn('[SMS] INFOBIP_API_KEY not set. Skipping SMS send.');
        console.log(`[SMS] Would have sent OTP ${code} to: ${normalizedPhone}`);
        return true;
    }

    try {
        const response = await fetch(`${env.INFOBIP_BASE_URL}/sms/2/text/advanced`, {
            method: 'POST',
            headers: {
                'Authorization': `App ${env.INFOBIP_API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                messages: [
                    {
                        destinations: [{ to: normalizedPhone }],
                        from: env.INFOBIP_SENDER || 'myRaffle',
                        text: `Your myRaffle verification code is: ${code}`,
                    }
                ]
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('[SMS] Infobip API error:', errorData);
            return false;
        }

        console.log(`[SMS] OTP sent successfully to ${normalizedPhone}`);
        return true;
    } catch (error) {
        console.error('[SMS] Failed to send OTP:', error);
        return false;
    }
};
