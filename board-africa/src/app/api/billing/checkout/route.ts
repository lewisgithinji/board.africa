import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { PaymentAdapterFactory } from '@/lib/payments/factory';
import { PaymentProvider } from '@/lib/payments/types';

const PLAN_PRICES = {
    'tier-growth': 49,
    'tier-enterprise': 199,
};

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { tierId, isAnnual, provider = 'stripe' } = await req.json();

        // Basic validation
        if (!['stripe', 'flutterwave', 'paystack'].includes(provider)) {
            return new NextResponse('Invalid payment provider', { status: 400 });
        }

        // Calculate amount (for Flutterwave/Paystack which might need raw amount)
        let amount = PLAN_PRICES[tierId as keyof typeof PLAN_PRICES] || 0;
        if (isAnnual) amount = amount * 10 * 0.8; // Rough logic matching UI

        // Get Adapter
        const adapter = PaymentAdapterFactory.getAdapter(provider as PaymentProvider);

        const response = await adapter.initiateCheckout({
            userId: user.id,
            email: user.email!,
            amount: amount,
            currency: provider === 'flutterwave' ? 'KES' : 'USD', // Simple logic: FW uses KES, Stripe USD
            planId: tierId,
            isAnnual,
            callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
        });

        return NextResponse.json({
            url: response.checkoutUrl,
            providerRef: response.providerReference
        });

    } catch (error: any) {
        console.error('Checkout Error:', error);
        return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
    }
}
