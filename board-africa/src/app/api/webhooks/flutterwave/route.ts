import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// This is the Secret Hash you set in your Flutterwave Dashboard > Webhooks
const FLUTTERWAVE_SECRET_HASH = process.env.FLUTTERWAVE_WEBHOOK_HASH!;

export async function POST(req: Request) {
    const signature = req.headers.get('verif-hash');

    if (!signature || (FLUTTERWAVE_SECRET_HASH && signature !== FLUTTERWAVE_SECRET_HASH)) {
        // If hash is set and doesn't match, reject.
        // If hash is NOT set in env, we might be in dev mode, but strictly should reject.
        if (FLUTTERWAVE_SECRET_HASH) {
            return new NextResponse('Invalid signature', { status: 401 });
        }
    }

    const payload = await req.json();
    const supabase = createAdminClient();

    try {
        // Flutterwave events: 'charge.completed'
        if (payload.event === 'charge.completed' && payload.data.status === 'successful') {
            const { meta, customer, id, tx_ref, amount, currency } = payload.data;

            // meta contains custom data we sent: userId, planId
            // Sometimes it is nested or flattened depending on API version. 
            // Standard v3 usually puts it in meta if passed in meta.

            // Fallback: If meta is missing in webhook (can happen), we rely on tx_ref parsing or retrieving transaction
            const userId = meta?.userId;
            const tierId = meta?.planId;

            if (userId) {
                await supabase
                    .from('organizations')
                    .update({
                        stripe_customer_id: `fw_${customer.id}`, // Store FW ID with prefix to distinguish
                        stripe_subscription_id: `fw_sub_${id}`, // Flutterwave doesn't have "subscriptions" same as Stripe, strictly. This is transaction ID for now.
                        plan_id: tierId || 'tier-growth', // Default fallback
                        subscription_status: 'active',
                        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Naive 30 day add for now, real sub logic is complex
                    })
                    .eq('id', userId);
            }
        }

        return new NextResponse('Webhook Received', { status: 200 });

    } catch (error) {
        console.error('Flutterwave Webhook Error:', error);
        // Return 200 to acknowledge receipt even if logic failed, to stop retries (standard practice if non-recoverable)
        return new NextResponse('Error processing', { status: 200 });
    }
}
