import { env } from '../config/environment';

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

const getHeaders = () => ({
    Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
});

interface PaystackResponse<T> {
    status: boolean;
    message: string;
    data: T;
}

interface InitializePaymentData {
    authorization_url: string;
    access_code: string;
    reference: string;
}

interface VerifyPaymentData {
    status: string;
    reference: string;
    amount: number; // in kobo
    currency: string;
    channel: string;
    paid_at: string;
    customer: {
        email: string;
    };
}

interface TransferRecipientData {
    recipient_code: string;
    name: string;
    details: {
        account_number: string;
        bank_code: string;
        bank_name: string;
    };
}

interface TransferData {
    transfer_code: string;
    reference: string;
    status: string;
}

interface Bank {
    name: string;
    code: string;
    active: boolean;
    country: string;
    currency: string;
    type: string;
}

// Initialize a payment transaction
// Amount is in Naira — converted to kobo (×100) for Paystack
export const initializePayment = async (
    email: string,
    amount: number,
    metadata?: Record<string, unknown>
): Promise<InitializePaymentData> => {
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
            email,
            amount: Math.round(amount * 100), // Naira → kobo
            currency: 'NGN',
            metadata: metadata || {},
        }),
    });

    const result = (await response.json()) as PaystackResponse<InitializePaymentData>;

    if (!result.status) {
        throw new Error(`Paystack initialization failed: ${result.message}`);
    }

    return result.data;
};

// Verify a payment by reference
export const verifyPayment = async (
    reference: string
): Promise<VerifyPaymentData> => {
    const response = await fetch(
        `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
        {
            method: 'GET',
            headers: getHeaders(),
        }
    );

    const result = (await response.json()) as PaystackResponse<VerifyPaymentData>;

    if (!result.status) {
        throw new Error(`Paystack verification failed: ${result.message}`);
    }

    return result.data;
};

// Create a transfer recipient (for withdrawals)
export const createTransferRecipient = async (
    name: string,
    accountNumber: string,
    bankCode: string
): Promise<TransferRecipientData> => {
    const response = await fetch(`${PAYSTACK_BASE_URL}/transferrecipient`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
            type: 'nuban',
            name,
            account_number: accountNumber,
            bank_code: bankCode,
            currency: 'NGN',
        }),
    });

    const result = (await response.json()) as PaystackResponse<TransferRecipientData>;

    if (!result.status) {
        throw new Error(`Paystack create recipient failed: ${result.message}`);
    }

    return result.data;
};

// Initiate a transfer (payout)
// Amount is in Naira — converted to kobo (×100) for Paystack
export const initiateTransfer = async (
    amount: number,
    recipientCode: string,
    reason?: string
): Promise<TransferData> => {
    const response = await fetch(`${PAYSTACK_BASE_URL}/transfer`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
            source: 'balance',
            amount: Math.round(amount * 100), // Naira → kobo
            recipient: recipientCode,
            reason: reason || 'RaffleHub withdrawal',
        }),
    });

    const result = (await response.json()) as PaystackResponse<TransferData>;

    if (!result.status) {
        throw new Error(`Paystack transfer failed: ${result.message}`);
    }

    return result.data;
};

// List all Nigerian banks
export const listBanks = async (): Promise<Bank[]> => {
    const response = await fetch(`${PAYSTACK_BASE_URL}/bank?country=nigeria`, {
        method: 'GET',
        headers: getHeaders(),
    });

    const result = (await response.json()) as PaystackResponse<Bank[]>;

    if (!result.status) {
        throw new Error(`Paystack list banks failed: ${result.message}`);
    }

    return result.data;
};
