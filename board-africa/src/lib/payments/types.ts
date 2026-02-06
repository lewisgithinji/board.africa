export type PaymentProvider = 'stripe' | 'flutterwave' | 'paystack';

export interface PaymentInitiateResponse {
    checkoutUrl?: string; // For redirect flows (Stripe, Paystack Standard, Flutterwave Standard)
    transactionId?: string; // Reference for the transaction
    providerReference?: string; // Provider specific ID
    instructions?: string; // display instructions (e.g. "Check your phone for STK push")
}

export interface PaymentVerifyResponse {
    status: 'success' | 'failed' | 'pending';
    transactionId: string;
    amount: number;
    currency: string;
    customerEmail: string;
    metadata?: any;
}

export interface PaymentAdapter {
    initiateCheckout(params: {
        userId: string;
        email: string;
        amount: number;
        currency: string;
        planId: string;
        isAnnual: boolean;
        callbackUrl: string;
    }): Promise<PaymentInitiateResponse>;

    verifyTransaction(transactionId: string): Promise<PaymentVerifyResponse>;
}
