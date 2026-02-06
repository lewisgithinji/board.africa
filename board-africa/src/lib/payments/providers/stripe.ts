import { PaymentAdapter, PaymentInitiateResponse, PaymentVerifyResponse } from '../types';
import { stripe } from '@/lib/stripe/server';

const PRICING_PLANS = {
    'tier-growth': {
        monthly: 'price_growth_monthly',
        annually: 'price_growth_annually',
    },
    'tier-enterprise': {
        monthly: 'price_enterprise_monthly',
        annually: 'price_enterprise_annually',
    },
};

export class StripeAdapter implements PaymentAdapter {
    async initiateCheckout(params: {
        userId: string;
        email: string;
        amount: number;
        currency: string;
        planId: string;
        isAnnual: boolean;
        callbackUrl: string;
    }): Promise<PaymentInitiateResponse> {
        const plan = PRICING_PLANS[params.planId as keyof typeof PRICING_PLANS];
        if (!plan) throw new Error('Invalid plan selected');

        const priceId = params.isAnnual ? plan.annually : plan.monthly;

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            customer_email: params.email,
            success_url: `${params.callbackUrl}?success=true&provider=stripe`,
            cancel_url: `${params.callbackUrl}?canceled=true`,
            metadata: {
                userId: params.userId,
                tierId: params.planId,
            },
            subscription_data: {
                metadata: {
                    userId: params.userId,
                    tierId: params.planId,
                }
            }
        });

        return {
            checkoutUrl: session.url || '',
            transactionId: session.id,
            providerReference: session.id,
        };
    }

    async verifyTransaction(transactionId: string): Promise<PaymentVerifyResponse> {
        const session = await stripe.checkout.sessions.retrieve(transactionId);

        return {
            status: session.payment_status === 'paid' ? 'success' : 'pending',
            transactionId: session.id,
            amount: session.amount_total || 0,
            currency: session.currency || 'usd',
            customerEmail: session.customer_details?.email || '',
            metadata: session.metadata,
        };
    }
}
