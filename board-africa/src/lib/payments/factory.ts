import { PaymentAdapter, PaymentProvider } from './types';
import { StripeAdapter } from './providers/stripe';
import { FlutterwaveAdapter } from './providers/flutterwave';

export class PaymentAdapterFactory {
    static getAdapter(provider: PaymentProvider): PaymentAdapter {
        switch (provider) {
            case 'stripe':
                return new StripeAdapter();
            case 'flutterwave':
                return new FlutterwaveAdapter();
            case 'paystack':
                throw new Error('Paystack adapter not implemented yet');
            default:
                throw new Error(`Unsupported payment provider: ${provider}`);
        }
    }
}
