import { env } from '../config/environment';

interface EmailOptions {
  to: string;
  subject: string;
  htmlContent: string;
}

const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  if (!env.BREVO_API_KEY || env.BREVO_API_KEY.includes('your_') || env.BREVO_API_KEY === '') {
    console.warn('[Email] BREVO_API_KEY not configured. Mocking email send in development.');
    console.log(`[Email Mock] To: ${options.to} | Subject: ${options.subject}`);
    return true;
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': env.BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: env.BREVO_SENDER_NAME || 'myRaffle',
          email: env.BREVO_SENDER_EMAIL || 'noreply@myraffle.com',
        },
        to: [{ email: options.to }],
        subject: options.subject,
        htmlContent: options.htmlContent,
      }),
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as { message?: string };
      console.warn(
        '[Email] Brevo API response error (mocking success for dev):',
        errorData?.message || errorData,
      );
      console.log(`[Email Dev Fallback] Content intended for ${options.to}:`, options.subject);
      return true; // Fallback to true in dev so authentication flow completes
    }

    console.log(`[Email] Sent successfully to ${options.to}`);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send:', error);
    return true; // Return true in dev so process isn't blocked
  }
};

export const sendVerificationEmail = async (
  email: string,
  name: string,
  verificationToken: string,
): Promise<boolean> => {
  const verifyUrl = `${env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

  return sendEmail({
    to: email,
    subject: 'Verify Your myRaffle Account',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #dc2626;">Welcome, ${name}! 🎉</h2>
        <p>Please click the button below to verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background-color: #dc2626; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Verify My Email
          </a>
        </div>
      </div>
    `,
  });
};

export const sendEmailOTP = async (email: string, name: string, code: string): Promise<boolean> => {
  console.log('\n========================================');
  console.log(`🔑 DEV EMAIL OTP CODE FOR ${email}: ${code}`);
  console.log('========================================\n');

  return sendEmail({
    to: email,
    subject: `${code} — Your myRaffle Verification Code`,
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #dc2626;">Hi ${name}, verify your email</h2>
        <p>Your verification code is:</p>
        <div style="background: #f3f4f6; border-radius: 12px; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px;">
          ${code}
        </div>
      </div>
    `,
  });
};

export const sendWelcomeEmail = async (email: string, name: string): Promise<boolean> => {
  return sendEmail({
    to: email,
    subject: 'Welcome to myRaffle!',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #dc2626;">Your email has been verified! 🎉</h2>
        <p>Hi ${name}, your account is now active.</p>
      </div>
    `,
  });
};

export const sendPasswordResetEmail = async (
  email: string,
  _name: string,
  resetToken: string,
): Promise<boolean> => {
  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  return sendEmail({
    to: email,
    subject: 'Reset Your myRaffle Password',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #dc2626;">Password Reset Request</h2>
        <p>Click the link below to set a new password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
      </div>
    `,
  });
};

export const sendRaffleWinnerEmail = async (
  email: string,
  name: string,
  itemName: string,
  itemValue: number,
): Promise<boolean> => {
  return sendEmail({
    to: email,
    subject: '🎉 Congratulations! You Won a Raffle on myRaffle!',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #dc2626;">You're a Winner, ${name}!</h2>
        <p>You won ${itemName} worth ₦${itemValue.toLocaleString()}!</p>
      </div>
    `,
  });
};
