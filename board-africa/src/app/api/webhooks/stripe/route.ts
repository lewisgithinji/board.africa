import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { createAdminClient } from '@/lib/supabase/admin';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
    const body = await req.text();
    const headerList = await headers();
    const signature = headerList.get('stripe-signature') as string;

    let event: Stripe.Event;

    try {
        if (!webhookSecret) {
            // Allow skip verification if secret is not set (DEV ONLY)
            // In production this should be strict
            console.warn("STRIPE_WEBHOOK_SECRET not set, accepting event without verification");
            event = JSON.parse(body);
        } else {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        }
    } catch (err: any) {
        console.error(`Webhook signature verification failed.`, err.message);
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    const supabase = createAdminClient();

    try {
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            const subscriptionId = session.subscription as string;
            const customerId = session.customer as string;
            const userId = session.metadata?.userId;
            const tierId = session.metadata?.tierId;

            if (userId) {
                // Retrieve subscription details
                const subscription = await stripe.subscriptions.retrieve(subscriptionId);

                await supabase
                    .from('organizations')
                    .update({
                        stripe_customer_id: customerId,
                        stripe_subscription_id: subscriptionId,
                        plan_id: tierId,
                        subscription_status: subscription.status,
                        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                    })
                    .eq('id', userId);
            }
        } else if (event.type === 'invoice.payment_succeeded') {
            const invoice = event.data.object as Stripe.Invoice;
            const subscriptionId = invoice.subscription as string;

            if (subscriptionId) {
                // Renew
                const subscription = await stripe.subscriptions.retrieve(subscriptionId);

                await supabase
                    .from('organizations')
                    .update({
                        subscription_status: subscription.status,
                        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                    })
                    .eq('stripe_subscription_id', subscriptionId);
            }
        }
    } catch (err: any) {
        console.error('Error processing webhook event:', err);
        return new NextResponse('Error processing event', { status: 500 });
    }

    return new NextResponse(null, { status: 200 });
}
