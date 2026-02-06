# Phase 12: Payments Verification Walkthrough

## Prerequisites
1.  **Environment Variables**: Ensure the following are set in `.env.local`:
    - `STRIPE_SECRET_KEY`
    - `NEXT_PUBLIC_APP_URL` (e.g., http://localhost:3000)
    - `FLUTTERWAVE_SECRET_KEY`
    - `FLUTTERWAVE_HASH` (Optional for webhook testing)

## 1. Upgrade Flow (UI Check)
1.  Log in as an **Organization**.
2.  Navigate to **Settings > Billing & Subscription**.
3.  Click **"Upgrade to Growth"**.
4.  Verify a dialog appears asking for "Payment Method".
    - [ ] Option 1: Credit Card (Stripe)
    - [ ] Option 2: M-Pesa / Mobile Money (Flutterwave) - *Recommended*

## 2. Stripe Test
1.  Select **Credit Card** and proceed.
2.  Verify you represent redirected to the Stripe Checkout page.
3.  (If keys valid): Complete payment with test card (`4242...`).
4.  Verify redirection back to `/settings/billing?success=true`.

## 3. Flutterwave Test
1.  Select **M-Pesa** and proceed.
2.  Verify you are redirected to the Flutterwave Checkout page.
3.  Simulate a standard mobile money payment.
4.  Verify redirection back to `/settings/billing`.

## 4. Database Check
1.  After a successful webhook simulation (can use Postman to `POST /api/webhooks/flutterwave`):
2.  Check the `organizations` table.
3.  Confirm `subscription_status`, `stripe_customer_id`, and `plan_id` are updated.
