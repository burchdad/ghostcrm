import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set');
}

// Initialize Stripe with the secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-09-30.clover',
  typescript: true,
});

// Stripe configuration constants
export const STRIPE_CONFIG = {
  // Trial configuration
  TRIAL_PERIOD_DAYS: 14,
  
  // Product and price configuration (these should be set in Stripe dashboard)
  PRODUCT_ID: process.env.STRIPE_PRODUCT_ID,
  PRICE_ID: process.env.STRIPE_PRICE_ID,
  
  // Webhook configuration
  WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  
  // Trial pricing (in cents)
  TRIAL_AMOUNT: 0, // $0.00 for trial
  FULL_AMOUNT: parseInt(process.env.STRIPE_FULL_AMOUNT || '9999'), // Default $99.99 per month in cents
  
  // Currency
  CURRENCY: 'usd',
  
  // Payment method types
  PAYMENT_METHODS: ['card'] as const,
} as const;

// Helper function to create a setup intent for collecting payment method during trial
export async function createTrialSetupIntent(customerId: string) {
  return await stripe.setupIntents.create({
    customer: customerId,
    usage: 'off_session',
    payment_method_types: [...STRIPE_CONFIG.PAYMENT_METHODS],
    metadata: {
      type: 'trial_setup',
      trial_period_days: STRIPE_CONFIG.TRIAL_PERIOD_DAYS.toString(),
    }
  });
}

// Helper function to create a customer
export async function createStripeCustomer(email: string, metadata: Record<string, string> = {}) {
  return await stripe.customers.create({
    email,
    metadata: {
      source: 'ghostcrm_trial',
      ...metadata
    }
  });
}

// Helper function to create a subscription with trial
export async function createTrialSubscription(customerId: string, priceId?: string) {
  const defaultPriceId = priceId || STRIPE_CONFIG.PRICE_ID;
  
  if (!defaultPriceId) {
    throw new Error('Price ID is required for subscription creation');
  }

  return await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: defaultPriceId }],
    trial_period_days: STRIPE_CONFIG.TRIAL_PERIOD_DAYS,
    payment_behavior: 'default_incomplete',
    payment_settings: {
      save_default_payment_method: 'on_subscription',
    },
    expand: ['latest_invoice.payment_intent'],
    metadata: {
      type: 'trial_subscription',
      trial_period_days: STRIPE_CONFIG.TRIAL_PERIOD_DAYS.toString(),
    }
  });
}

// Helper function to retrieve a subscription
export async function getSubscription(subscriptionId: string) {
  return await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['default_payment_method', 'latest_invoice.payment_intent']
  });
}

// Helper function to cancel a subscription
export async function cancelSubscription(subscriptionId: string, immediately = false) {
  if (immediately) {
    return await stripe.subscriptions.cancel(subscriptionId);
  } else {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });
  }
}

// Helper function to update payment method on subscription
export async function updateSubscriptionPaymentMethod(subscriptionId: string, paymentMethodId: string) {
  return await stripe.subscriptions.update(subscriptionId, {
    default_payment_method: paymentMethodId
  });
}

// Helper function to check if trial is expired
export function isTrialExpired(trialEnd: number): boolean {
  return Date.now() / 1000 > trialEnd;
}

// Helper function to calculate trial end date
export function calculateTrialEndDate(): Date {
  const now = new Date();
  const trialEnd = new Date(now.getTime() + (STRIPE_CONFIG.TRIAL_PERIOD_DAYS * 24 * 60 * 60 * 1000));
  return trialEnd;
}

// Helper function to format currency
export function formatCurrency(amount: number, currency = STRIPE_CONFIG.CURRENCY): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase()
  }).format(amount / 100);
}

export default stripe;