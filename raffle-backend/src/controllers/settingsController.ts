import { Request, Response } from 'express';
import { prisma } from '../config/database';

// Default initial Terms & Conditions content if none exists yet
const DEFAULT_TERMS = `
<h2>1. General Terms</h2>
<p>Welcome to MyRaffle. By accessing and participating in our platform, you agree to abide by these Terms and Conditions.</p>

<h2>2. Eligibility</h2>
<p>Participation in raffles is open to legal residents aged 18 and older. Multiple accounts per user are strictly prohibited.</p>

<h2>3. Ticket Purchases & Wallet</h2>
<p>Tickets can be purchased using your account wallet balance (Naira ₦) or supported payment gateways. All ticket sales are final and non-refundable once purchased.</p>

<h2>4. Draw Fair Selection</h2>
<p>Winners are selected using a cryptographically fair random draw algorithm automatically as soon as all available tickets for a raffle are sold out.</p>

<h2>5. Prize Claim & Delivery</h2>
<p>Winners will be notified via email and in their user dashboard. Prize delivery details must be confirmed within 14 business days of winning.</p>
`;

// GET /api/settings/:key — Public, fetch setting by key
export const getSetting = async (req: Request, res: Response) => {
    try {
        const key = req.params.key as string;

        const setting = await (prisma as any).setting.findUnique({
            where: { key },
        });

        if (!setting) {
            // Return default content if requesting terms_and_conditions
            if (key === 'terms_and_conditions') {
                res.status(200).json({
                    success: true,
                    data: { key, value: DEFAULT_TERMS.trim() },
                });
                return;
            }

            res.status(404).json({ success: false, message: `Setting '${key}' not found.` });
            return;
        }

        res.status(200).json({
            success: true,
            data: setting,
        });
    } catch (error) {
        console.error('[Settings] Get setting error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch setting.' });
    }
};

// PUT /api/admin/settings/:key — Admin only, update setting by key
export const updateSetting = async (req: Request, res: Response) => {
    try {
        const key = req.params.key as string;
        const { value } = req.body;

        if (typeof value !== 'string') {
            res.status(400).json({ success: false, message: 'Setting value must be a string.' });
            return;
        }

        const setting = await (prisma as any).setting.upsert({
            where: { key },
            update: { value },
            create: { key, value },
        });

        res.status(200).json({
            success: true,
            message: 'Setting updated successfully.',
            data: setting,
        });
    } catch (error) {
        console.error('[Settings] Update setting error:', error);
        res.status(500).json({ success: false, message: 'Failed to update setting.' });
    }
};

// GET /api/admin/bonus-settings — Fetch registration & referral bonus settings
export const getBonusSettings = async (req: Request, res: Response) => {
    try {
        const [signupSetting, referralSetting] = await Promise.all([
            (prisma as any).setting.findUnique({ where: { key: 'signup_bonus' } }),
            (prisma as any).setting.findUnique({ where: { key: 'referral_bonus' } }),
        ]);

        const signupBonus = signupSetting ? parseFloat(signupSetting.value) || 1000 : 1000;
        const referralBonus = referralSetting ? parseFloat(referralSetting.value) || 500 : 500;

        res.status(200).json({
            success: true,
            data: {
                signupBonus,
                referralBonus,
            },
        });
    } catch (error) {
        console.error('[Settings] Get bonus settings error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch bonus settings.' });
    }
};

// PUT /api/admin/bonus-settings — Update registration & referral bonus settings
export const updateBonusSettings = async (req: Request, res: Response) => {
    try {
        const { signupBonus, referralBonus } = req.body;

        if (signupBonus !== undefined) {
            const signupVal = Number(signupBonus);
            if (isNaN(signupVal) || signupVal < 0) {
                res.status(400).json({ success: false, message: 'Signup bonus must be a non-negative number.' });
                return;
            }
            await (prisma as any).setting.upsert({
                where: { key: 'signup_bonus' },
                update: { value: signupVal.toString() },
                create: { key: 'signup_bonus', value: signupVal.toString() },
            });
        }

        if (referralBonus !== undefined) {
            const refVal = Number(referralBonus);
            if (isNaN(refVal) || refVal < 0) {
                res.status(400).json({ success: false, message: 'Referral bonus must be a non-negative number.' });
                return;
            }
            await (prisma as any).setting.upsert({
                where: { key: 'referral_bonus' },
                update: { value: refVal.toString() },
                create: { key: 'referral_bonus', value: refVal.toString() },
            });
        }

        res.status(200).json({
            success: true,
            message: 'Registration and Referral bonuses updated successfully!',
        });
    } catch (error) {
        console.error('[Settings] Update bonus settings error:', error);
        res.status(500).json({ success: false, message: 'Failed to update bonus settings.' });
    }
};

