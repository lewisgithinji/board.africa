import { PaymentAdapter, PaymentInitiateResponse, PaymentVerifyResponse } from '../types';

export class FlutterwaveAdapter implements PaymentAdapter {
    private secretKey = process.env.FLUTTERWAVE_SECRET_KEY!;
    private encryptionKey = process.env.FLUTTERWAVE_ENCRYPTION_KEY!;

    async initiateCheckout(params: {
        userId: string;
        email: string;
        amount: number;
        currency: string;
        planId: string;
        isAnnual: boolean;
        callbackUrl: string;
    }): Promise<PaymentInitiateResponse> {

        // Create a transaction reference
        const txRef = `board_africa_${params.userId}_${Date.now()}`;

        const payload = {
            tx_ref: txRef,
            amount: params.amount,
            currency: params.currency, // 'KES', 'USD', etc.
            redirect_url: `${params.callbackUrl}?provider=flutterwave`, // Helper to identify return
            customer: {
                email: params.email,
                name: params.email, // or full name if available
            },
            meta: {
                userId: params.userId,
                planId: params.planId,
                isAnnual: params.isAnnual,
            },
            customizations: {
                title: "Board.Africa Subscription",
                description: `Upgrade to ${params.planId === 'tier-growth' ? 'Growth' : 'Enterprise'} Plan`,
                logo: "https://board.africa/logo.png", // Replace with actual logo URL
            },
            payment_options: "card, mobilemoney, ussd",
        };

        const response = await fetch('https://api.flutterwave.com/v3/payments', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.secretKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Flutterwave Init Error:', errorText);
            throw new Error('Failed to initiate Flutterwave payment');
        }

        const data = await response.json();

        if (data.status !== 'success') {
            throw new Error(data.message || 'Flutterwave payment initiation failed');
        }

        return {
            checkoutUrl: data.data.link,
            transactionId: txRef,
            providerReference: data.data.id?.toString(), // Sometimes numeric
        };
    }

    async verifyTransaction(transactionId: string): Promise<PaymentVerifyResponse> {
        // Note: transactionId here could be tx_ref or valid transaction ID.
        // If it's a verify by ID: /transactions/:id/verify
        // If we only have tx_ref, we might need to query by tx_ref.
        // Usually the redirect URL has ?status=successful&tx_ref=...&transaction_id=...

        // For standard verification, we use transaction_id from the query param
        const response = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${this.secretKey}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to verify transaction');
        }

        const data = await response.json();

        if (data.status === 'success' && data.data.status === 'successful') {
            return {
                status: 'success',
                transactionId: data.data.id.toString(),
                amount: data.data.amount,
                currency: data.data.currency,
                customerEmail: data.data.customer.email,
                metadata: data.data.meta,
            };
        }

        return {
            status: 'failed',
            transactionId: transactionId,
            amount: 0,
            currency: 'KES',
            customerEmail: '',
        };
    }
}
