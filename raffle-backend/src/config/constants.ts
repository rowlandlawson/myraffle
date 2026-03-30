export const CONSTANTS = {
    APP_NAME: 'RaffleHub',
    CURRENCY: 'NGN',
    LOCALE: 'en-NG',

    // Points System (1000 points = 100 Naira)
    POINTS: {
        WATCH_AD_VIDEO: 200,
        WATCH_AD_PICTURE: 100,
        WATCH_AD_BANNER: 50,
        WHATSAPP_SHARE: 50,
        REFERRAL_BONUS: 500,
        DAILY_LOGIN: 25,
        SURVEY_COMPLETE: 100,
        POINTS_PER_NAIRA: 10, // 1,000 points = ₦100
    },

    // Token Expiry
    JWT_ACCESS_EXPIRY: '24h',
    JWT_REFRESH_EXPIRY: '7d',

    // Commission Rates
    COMMISSION_RATE: 0.15, // 15% platform fee
} as const;
