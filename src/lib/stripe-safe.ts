import Stripe from 'stripe';

/**
 * Safe Stripe client creation that handles missing environment variables during builds
 * Returns null if Stripe is not configured, allowing builds to succeed
 */
export function createSafeStripeClient(): Stripe | null {
  // Check if Stripe secret key is available
  if (!process.env.STRIPE_SECRET_KEY) {
    console.log('Using placeholder Stripe credentials for build/development');
    return null;
  }

  try {
    return new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-09-30.clover',
      typescript: true,
    });
  } catch (error) {
    console.error('Failed to initialize Stripe client:', error);
    return null;
  }
}

/**
 * Helper function to wrap Stripe operations with proper error handling
 */
export async function withStripe<T>(
  operation: (stripe: Stripe) => Promise<T>,
  fallback: T
): Promise<T> {
  const stripe = createSafeStripeClient();
  
  if (!stripe) {
    console.log('Stripe not configured, returning fallback response');
    return fallback;
  }

  try {
    return await operation(stripe);
  } catch (error) {
    console.error('Stripe operation failed:', error);
    return fallback;
  }
}

// Stripe configuration constants with safe defaults
export const STRIPE_CONFIG = {
  // Trial configuration
  TRIAL_PERIOD_DAYS: 14,
  
  // Product and price configuration (these should be set in Stripe dashboard)
  PRODUCT_ID: process.env.STRIPE_PRODUCT_ID || '',
  PRICE_ID: process.env.STRIPE_PRICE_ID || '',
  
  // Webhook configuration
  WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
  
  // Trial pricing (in cents)
  TRIAL_AMOUNT: 0, // $0.00 for trial
  FULL_AMOUNT: parseInt(process.env.STRIPE_FULL_AMOUNT || '9999'), // Default $99.99 per month in cents
  
  // Currency
  CURRENCY: 'usd',
  
  // Feature flags
  BILLING_ENABLED: !!process.env.STRIPE_SECRET_KEY,
};

/**
 * Check if Stripe is properly configured
 */
export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

/**
 * Get mock subscription data for development/builds
 */
export function getMockSubscription() {
  return {
    id: 'sub_mock',
    status: 'trialing' as any,
    // Mock the basic properties needed by the app
    trial_end: Math.floor(Date.now() / 1000) + (14 * 24 * 60 * 60),
  } as any;
}

/**
 * Safe subscription retrieval
 */
export async function getSubscription(subscriptionId: string) {
  return withStripe(
    async (stripe) => {
      const response = await stripe.subscriptions.retrieve(subscriptionId);
      // Return the subscription data directly
      return response;
    },
    getMockSubscription()
  );
}

/**
 * Safe trial expiration check
 */
export function isTrialExpired(trialEnd: number | null | undefined): boolean {
  if (!trialEnd) return false;
  return Date.now() / 1000 > trialEnd;
}