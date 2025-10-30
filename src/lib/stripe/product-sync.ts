/**
 * STRIPE PRODUCT SYNCHRONIZATION SYSTEM
 * Automatically creates and syncs products between GhostCRM and Stripe
 */

import { createSafeStripeClient, withStripe } from '@/lib/stripe-safe';
import { createSupabaseServer } from '@/utils/supabase/server';
import { PRICING_PLANS, PlanId, getAllPlans, ADD_ON_PACKAGES } from '@/lib/features/pricing';
import { PRICING_CONFIG } from '@/lib/pricing';
import { ORG_PLANS } from '@/lib/pricing.org';

export interface ProductSyncResult {
  success: boolean;
  created: number;
  updated: number;
  errors: string[];
  syncedProducts: SyncedProduct[];
}

export interface SyncedProduct {
  localId: string;
  localName: string;
  stripeProductId: string;
  stripePriceId: string;
  price: number;
  status: 'created' | 'updated' | 'synced' | 'error';
}

export interface ProductMapping {
  localId: string;
  localName: string;
  description: string;
  price: number;
  billing: 'monthly' | 'yearly' | 'one_time';
  currency: string;
  metadata: Record<string, string>;
}

/**
 * Main synchronization function that syncs all products
 */
export async function syncAllProductsWithStripe(options: {
  dryRun?: boolean;
  forceUpdate?: boolean;
} = {}): Promise<ProductSyncResult> {
  const result: ProductSyncResult = {
    success: false,
    created: 0,
    updated: 0,
    errors: [],
    syncedProducts: []
  };

  try {
    console.log('🔄 Starting Stripe product synchronization...');

    // Collect all products from different sources
    const allProducts = await collectAllLocalProducts();
    console.log(`📦 Found ${allProducts.length} local products to sync`);

    // Sync each product with Stripe
    for (const product of allProducts) {
      try {
        const syncResult = await syncSingleProduct(product, options);
        result.syncedProducts.push(syncResult);
        
        if (syncResult.status === 'created') result.created++;
        if (syncResult.status === 'updated') result.updated++;
        
      } catch (error) {
        console.error(`❌ Error syncing product ${product.localId}:`, error);
        result.errors.push(`${product.localId}: ${String(error)}`);
      }
    }

    // Update local database with sync results
    if (!options.dryRun) {
      await updateLocalProductMappings(result.syncedProducts);
    }

    result.success = result.errors.length === 0;
    
    console.log(`✅ Sync complete: ${result.created} created, ${result.updated} updated, ${result.errors.length} errors`);
    return result;

  } catch (error) {
    console.error('❌ Product sync failed:', error);
    result.errors.push(`Global sync error: ${String(error)}`);
    return result;
  }
}

/**
 * Collect all products from different configuration files
 */
async function collectAllLocalProducts(): Promise<ProductMapping[]> {
  const products: ProductMapping[] = [];

  // 1. Main pricing plans (starter, professional, business, enterprise)
  getAllPlans().forEach(plan => {
    // Monthly subscription
    products.push({
      localId: `plan_${plan.id}_monthly`,
      localName: `${plan.name} Plan (Monthly)`,
      description: `${plan.description} - Monthly billing`,
      price: plan.monthlyPrice,
      billing: 'monthly',
      currency: 'usd',
      metadata: {
        source: 'pricing_plans',
        planId: plan.id,
        billing: 'monthly',
        maxUsers: String(plan.maxUsers),
        maxContacts: String(plan.maxContacts)
      }
    });

    // Yearly subscription with discount
    products.push({
      localId: `plan_${plan.id}_yearly`,
      localName: `${plan.name} Plan (Yearly)`,
      description: `${plan.description} - Yearly billing (${plan.yearlyDiscount}% discount)`,
      price: plan.yearlyPrice,
      billing: 'yearly',
      currency: 'usd',
      metadata: {
        source: 'pricing_plans',
        planId: plan.id,
        billing: 'yearly',
        discount: String(plan.yearlyDiscount),
        maxUsers: String(plan.maxUsers),
        maxContacts: String(plan.maxContacts)
      }
    });
  });

  // 2. Add-on packages
  Object.values(ADD_ON_PACKAGES).forEach(addon => {
    products.push({
      localId: `addon_${addon.id}`,
      localName: `${addon.name} Add-on`,
      description: addon.description,
      price: addon.monthlyPrice,
      billing: 'monthly',
      currency: 'usd',
      metadata: {
        source: 'add_on_packages',
        addonId: addon.id,
        features: addon.features.join(','),
        availableForPlans: addon.availableForPlans.join(',')
      }
    });
  });

  // 3. Role-based pricing tiers
  PRICING_CONFIG.forEach(roleConfig => {
    roleConfig.tiers.forEach(tier => {
      products.push({
        localId: `role_${roleConfig.role}_${tier.id}`,
        localName: `${roleConfig.displayName} - ${tier.name}`,
        description: `${tier.description} for ${roleConfig.displayName}`,
        price: tier.price,
        billing: 'monthly',
        currency: 'usd',
        metadata: {
          source: 'role_pricing',
          role: roleConfig.role,
          tierId: tier.id,
          tierName: tier.name
        }
      });
    });
  });

  // 4. Organization-level plans
  ORG_PLANS.forEach(orgPlan => {
    // Monthly subscription
    products.push({
      localId: `org_${orgPlan.id}_monthly`,
      localName: `Organization ${orgPlan.name}`,
      description: orgPlan.description,
      price: orgPlan.priceMonthly,
      billing: 'monthly',
      currency: 'usd',
      metadata: {
        source: 'org_plans',
        orgPlanId: orgPlan.id,
        setupFee: String(orgPlan.setupFee)
      }
    });

    // Setup fee as one-time payment
    if (orgPlan.setupFee > 0) {
      products.push({
        localId: `org_${orgPlan.id}_setup`,
        localName: `${orgPlan.name} Setup Fee`,
        description: `One-time setup fee for ${orgPlan.name} organization plan`,
        price: orgPlan.setupFee,
        billing: 'one_time',
        currency: 'usd',
        metadata: {
          source: 'org_setup_fees',
          orgPlanId: orgPlan.id,
          type: 'setup_fee'
        }
      });
    }
  });

  return products;
}

/**
 * Sync a single product with Stripe
 */
async function syncSingleProduct(
  product: ProductMapping, 
  options: { dryRun?: boolean; forceUpdate?: boolean }
): Promise<SyncedProduct> {
  
  console.log(`🔄 Syncing product: ${product.localName}`);

  if (options.dryRun) {
    console.log(`🧪 DRY RUN: Would sync ${product.localName} ($${product.price}/${product.billing})`);
    return {
      localId: product.localId,
      localName: product.localName,
      stripeProductId: 'dry_run_product_id',
      stripePriceId: 'dry_run_price_id',
      price: product.price,
      status: 'synced'
    };
  }

  return await withStripe(async (stripe) => {
    // Check if product already exists in our database
    const existingMapping = await getExistingProductMapping(product.localId);
    
    let stripeProductId: string;
    let stripePriceId: string;
    let status: 'created' | 'updated' | 'synced' = 'synced';

    if (existingMapping && !options.forceUpdate) {
      // Product exists, verify it's still valid in Stripe
      try {
        const stripeProduct = await stripe.products.retrieve(existingMapping.stripeProductId);
        const stripePrice = await stripe.prices.retrieve(existingMapping.stripePriceId);
        
        // Check if update is needed
        if (stripeProduct.name !== product.localName || 
            stripePrice.unit_amount !== product.price * 100) {
          
          // Update product name/description
          await stripe.products.update(existingMapping.stripeProductId, {
            name: product.localName,
            description: product.description,
            metadata: product.metadata
          });

          // Create new price if amount changed (can't update existing price)
          if (stripePrice.unit_amount !== product.price * 100) {
            const newPrice = await stripe.prices.create({
              product: existingMapping.stripeProductId,
              currency: product.currency,
              unit_amount: product.price * 100,
              recurring: product.billing !== 'one_time' ? {
                interval: product.billing === 'yearly' ? 'year' : 'month'
              } : undefined,
              metadata: product.metadata
            });

            // Archive old price
            await stripe.prices.update(existingMapping.stripePriceId, {
              active: false
            });

            stripePriceId = newPrice.id;
            status = 'updated';
          } else {
            stripePriceId = stripePrice.id;
            status = 'updated';
          }
        } else {
          stripePriceId = stripePrice.id;
        }
        
        stripeProductId = stripeProduct.id;
        
      } catch (error) {
        console.warn(`⚠️ Existing product not found in Stripe, recreating: ${product.localId}`);
        // Product doesn't exist in Stripe anymore, create new one
        const created = await createNewStripeProduct(stripe, product);
        stripeProductId = created.productId;
        stripePriceId = created.priceId;
        status = 'created';
      }
    } else {
      // Create new product
      const created = await createNewStripeProduct(stripe, product);
      stripeProductId = created.productId;
      stripePriceId = created.priceId;
      status = 'created';
    }

    return {
      localId: product.localId,
      localName: product.localName,
      stripeProductId,
      stripePriceId,
      price: product.price,
      status
    };

  }, {
    localId: product.localId,
    localName: product.localName,
    stripeProductId: 'fallback_product_id',
    stripePriceId: 'fallback_price_id',
    price: product.price,
    status: 'error'
  });
}

/**
 * Create a new product and price in Stripe
 */
async function createNewStripeProduct(stripe: any, product: ProductMapping) {
  console.log(`➕ Creating new Stripe product: ${product.localName}`);

  // Create product
  const stripeProduct = await stripe.products.create({
    name: product.localName,
    description: product.description,
    metadata: {
      ...product.metadata,
      localId: product.localId,
      syncedAt: new Date().toISOString()
    }
  });

  // Create price
  const stripePrice = await stripe.prices.create({
    product: stripeProduct.id,
    currency: product.currency,
    unit_amount: product.price * 100, // Stripe uses cents
    recurring: product.billing !== 'one_time' ? {
      interval: product.billing === 'yearly' ? 'year' : 'month'
    } : undefined,
    metadata: {
      ...product.metadata,
      localId: product.localId,
      billing: product.billing
    }
  });

  console.log(`✅ Created: ${stripeProduct.id} with price ${stripePrice.id}`);

  return {
    productId: stripeProduct.id,
    priceId: stripePrice.id
  };
}

/**
 * Get existing product mapping from database
 */
async function getExistingProductMapping(localId: string): Promise<{
  stripeProductId: string;
  stripePriceId: string;
} | null> {
  const supabase = await createSupabaseServer();
  
  const { data, error } = await supabase
    .from('stripe_product_mappings')
    .select('stripe_product_id, stripe_price_id')
    .eq('local_product_id', localId)
    .eq('active', true)
    .single();

  if (error || !data) return null;

  return {
    stripeProductId: data.stripe_product_id,
    stripePriceId: data.stripe_price_id
  };
}

/**
 * Update local database with sync results
 */
async function updateLocalProductMappings(syncedProducts: SyncedProduct[]) {
  const supabase = await createSupabaseServer();

  for (const product of syncedProducts) {
    if (product.status === 'error') continue;

    await supabase
      .from('stripe_product_mappings')
      .upsert({
        local_product_id: product.localId,
        local_product_name: product.localName,
        stripe_product_id: product.stripeProductId,
        stripe_price_id: product.stripePriceId,
        price_amount: product.price,
        sync_status: product.status,
        last_synced_at: new Date().toISOString(),
        active: true
      }, {
        onConflict: 'local_product_id'
      });
  }

  console.log(`💾 Updated ${syncedProducts.length} product mappings in database`);
}

/**
 * Get product mapping for checkout
 */
export async function getStripeProductMapping(localProductId: string): Promise<{
  stripeProductId: string;
  stripePriceId: string;
} | null> {
  return await getExistingProductMapping(localProductId);
}

/**
 * Validate that all products are properly synced
 */
export async function validateProductSync(): Promise<{
  isValid: boolean;
  missingSyncs: string[];
  invalidSyncs: string[];
}> {
  const allProducts = await collectAllLocalProducts();
  const missingSyncs: string[] = [];
  const invalidSyncs: string[] = [];

  for (const product of allProducts) {
    const mapping = await getExistingProductMapping(product.localId);
    
    if (!mapping) {
      missingSyncs.push(product.localId);
      continue;
    }

    // Validate the mapping is still valid in Stripe
    const isValid = await withStripe(async (stripe) => {
      try {
        await stripe.products.retrieve(mapping.stripeProductId);
        await stripe.prices.retrieve(mapping.stripePriceId);
        return true;
      } catch {
        return false;
      }
    }, false);

    if (!isValid) {
      invalidSyncs.push(product.localId);
    }
  }

  return {
    isValid: missingSyncs.length === 0 && invalidSyncs.length === 0,
    missingSyncs,
    invalidSyncs
  };
}