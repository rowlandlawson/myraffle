import { env } from '../config/environment';

interface EmailOptions {
    to: string;
    subject: string;
    htmlContent: string;
}

const sendEmail = async (options: EmailOptions): Promise<boolean> => {
    if (!env.BREVO_API_KEY) {
        console.warn('[Email] BREVO_API_KEY not set. Skipping email send.');
        console.log(`[Email] Would have sent to: ${options.to}`);
        console.log(`[Email] Subject: ${options.subject}`);
        return false;
    }

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': env.BREVO_API_KEY,
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                sender: {
                    name: env.BREVO_SENDER_NAME,
                    email: env.BREVO_SENDER_EMAIL,
                },
                to: [{ email: options.to }],
                subject: options.subject,
                htmlContent: options.htmlContent,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('[Email] Brevo API error:', errorData);
            return false;
        }

        console.log(`[Email] Sent successfully to ${options.to}`);
        return true;
    } catch (error) {
        console.error('[Email] Failed to send:', error);
        return false;
    }
};

export const sendVerificationEmail = async (
    email: string,
    name: string,
    verificationToken: string
): Promise<boolean> => {
    const verifyUrl = `${env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    return sendEmail({
        to: email,
        subject: 'Verify Your RaffleHub Account',
        htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #7c3aed; margin: 0;">RaffleHub</h1>
        </div>
        
        <h2 style="color: #1f2937;">Welcome, ${name}! 🎉</h2>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          Thank you for signing up for RaffleHub! Before you can start participating in raffles,
          please verify your email address by clicking the button below.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" 
             style="background-color: #7c3aed; color: white; padding: 14px 32px; 
                    text-decoration: none; border-radius: 8px; font-size: 16px; 
                    font-weight: bold; display: inline-block;">
            Verify My Email
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px;">
          If the button doesn't work, copy and paste this link into your browser:
          <br/>
          <a href="${verifyUrl}" style="color: #7c3aed;">${verifyUrl}</a>
        </p>
        
        <p style="color: #6b7280; font-size: 14px;">
          This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
        
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          © ${new Date().getFullYear()} RaffleHub. All rights reserved.
        </p>
      </div>
    `,
    });
};

export const sendWelcomeEmail = async (
    email: string,
    name: string
): Promise<boolean> => {
    return sendEmail({
        to: email,
        subject: 'Welcome to RaffleHub! 🎊',
        htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #7c3aed; margin: 0;">RaffleHub</h1>
        </div>
        
        <h2 style="color: #1f2937;">Your email has been verified! 🎉</h2>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          Hi ${name}, your account is now active. Here's what you can do next:
        </p>
        
        <ul style="color: #4b5563; font-size: 15px; line-height: 2;">
          <li>💰 Add funds to your wallet</li>
          <li>🎫 Browse items and buy raffle tickets</li>
          <li>🏆 Complete tasks to earn free raffle points</li>
          <li>👥 Invite friends for bonus points</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${env.FRONTEND_URL}/dashboard" 
             style="background-color: #7c3aed; color: white; padding: 14px 32px; 
                    text-decoration: none; border-radius: 8px; font-size: 16px; 
                    font-weight: bold; display: inline-block;">
            Go to Dashboard
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
        
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          © ${new Date().getFullYear()} RaffleHub. All rights reserved.
        </p>
      </div>
    `,
    });
};

export const sendPasswordResetEmail = async (
    email: string,
    name: string,
    resetToken: string
): Promise<boolean> => {
    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    return sendEmail({
        to: email,
        subject: 'Reset Your RaffleHub Password',
        htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #7c3aed; margin: 0;">RaffleHub</h1>
        </div>
        
        <h2 style="color: #1f2937;">Password Reset Request</h2>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          Hi ${name}, we received a request to reset your password. Click the button below to set a new password.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #7c3aed; color: white; padding: 14px 32px; 
                    text-decoration: none; border-radius: 8px; font-size: 16px; 
                    font-weight: bold; display: inline-block;">
            Reset Password
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px;">
          This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
        
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          © ${new Date().getFullYear()} RaffleHub. All rights reserved.
        </p>
      </div>
    `,
    });
};
