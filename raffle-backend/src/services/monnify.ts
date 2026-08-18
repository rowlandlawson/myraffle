import crypto from 'node:crypto';
import { env } from '../config/environment';

const MONNIFY_BASE_URL = env.MONNIFY_BASE_URL || 'https://sandbox.monnify.com';

interface MonnifyResponse<T = unknown> {
  requestSuccessful: boolean;
  responseMessage?: string;
  responseCode?: string;
  responseBody?: T;
}

interface MonnifyAuthBody {
  accessToken: string;
  expiresIn: number;
}

interface MonnifyInitResponseBody {
  transactionReference: string;
  paymentReference: string;
  checkoutUrl: string;
  [key: string]: unknown;
}

/**
 * Acquire Monnify Access Token via Basic Auth
 */
export async function getMonnifyAccessToken(): Promise<string> {
  const apiKey = env.MONNIFY_API_KEY;
  const secretKey = env.MONNIFY_SECRET_KEY;

  const credentials = Buffer.from(`${apiKey}:${secretKey}`).toString('base64');

  const response = await fetch(`${MONNIFY_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
  });

  const data = (await response.json()) as MonnifyResponse<MonnifyAuthBody>;
  if (!data.requestSuccessful || !data.responseBody?.accessToken) {
    throw new Error(data.responseMessage || 'Failed to authenticate with Monnify');
  }

  return data.responseBody.accessToken;
}

interface InitPaymentParams {
  amount: number; // In Naira
  customerName: string;
  customerEmail: string;
  paymentReference: string;
  paymentDescription: string;
  redirectUrl?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Initialize a transaction with Monnify
 */
export async function initializeMonnifyPayment(params: InitPaymentParams) {
  const token = await getMonnifyAccessToken();

  const body = {
    amount: params.amount,
    customerName: params.customerName,
    customerEmail: params.customerEmail,
    paymentReference: params.paymentReference,
    paymentDescription: params.paymentDescription,
    currencyCode: 'NGN',
    contractCode: env.MONNIFY_CONTRACT_CODE,
    redirectUrl: params.redirectUrl || `${env.FRONTEND_URL}/dashboard/wallet`,
    paymentMethods: ['CARD', 'ACCOUNT_TRANSFER', 'USSD'],
    metaData: params.metadata || {},
  };

  const response = await fetch(
    `${MONNIFY_BASE_URL}/api/v1/merchant/transactions/init-transaction`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
  );

  const data = (await response.json()) as MonnifyResponse<MonnifyInitResponseBody>;
  if (!data.requestSuccessful) {
    throw new Error(data.responseMessage || 'Monnify payment initialization failed');
  }

  return data.responseBody; // { transactionReference, paymentReference, checkoutUrl, ... }
}

/**
 * Verify SHA-512 Hash Signature from Monnify Webhook
 */
export function verifyMonnifySignature(reqBody: unknown, signatureHeader: string): boolean {
  const secretKey = env.MONNIFY_SECRET_KEY || '';
  if (!secretKey || !signatureHeader) return false;

  // Monnify hash format: SHA512(secretKey|JSON.stringify(reqBody))
  const computedHash = crypto
    .createHash('sha512')
    .update(`${secretKey}|${JSON.stringify(reqBody)}`)
    .digest('hex');

  return computedHash.toLowerCase() === signatureHeader.toLowerCase();
}
