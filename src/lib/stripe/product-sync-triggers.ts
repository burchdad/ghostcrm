/**
 * AUTOMATIC PRODUCT SYNC TRIGGERS
 * Automatically syncs products with Stripe when they're modified in GhostCRM
 */

import { syncAllProductsWithStripe } from '@/lib/stripe/product-sync';

// Define which events should trigger a sync
const SYNC_TRIGGER_EVENTS = [
  'product.created',
  'product.updated', 
  'product.deleted',
  'plan.created',
  'plan.updated',
  'plan.price_changed',
  'addon.created',
  'addon.updated'
];

export interface ProductChangeEvent {
  type: string;
  productId: string;
  productType: 'plan' | 'addon' | 'role_tier' | 'org_plan';
  changes: Record<string, any>;
  timestamp: string;
  userId?: string;
}

/**
 * Queue for managing sync operations
 */
class ProductSyncQueue {
  private queue: Array<() => Promise<void>> = [];
  private isProcessing = false;
  private debounceTimer: NodeJS.Timeout | null = null;

  /**
   * Add a sync operation to the queue with debouncing
   */
  addSync(operation: () => Promise<void>, debounceMs = 5000) {
    // Clear existing debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Add operation to queue
    this.queue.push(operation);

    // Set new debounce timer
    this.debounceTimer = setTimeout(() => {
      this.processQueue();
    }, debounceMs);
  }

  /**
   * Process all queued sync operations
   */
  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    console.log(`🔄 Processing ${this.queue.length} queued sync operations...`);

    try {
      // Execute all queued operations
      const operations = [...this.queue];
      this.queue = []; // Clear queue

      // Run a single comprehensive sync instead of multiple operations
      await syncAllProductsWithStripe({ dryRun: false, forceUpdate: false });
      
      console.log('✅ Automatic product sync completed');
    } catch (error) {
      console.error('❌ Automatic product sync failed:', error);
    } finally {
      this.isProcessing = false;
    }
  }
}

// Global sync queue instance
const syncQueue = new ProductSyncQueue();

/**
 * Trigger product sync based on change event
 */
export async function triggerProductSync(event: ProductChangeEvent): Promise<void> {
  // Check if this event type should trigger a sync
  if (!SYNC_TRIGGER_EVENTS.includes(event.type)) {
    console.log(`⏭️  Skipping sync for event type: ${event.type}`);
    return;
  }

  console.log(`🔔 Product change detected: ${event.type} for ${event.productId}`);

  // Add sync operation to queue (debounced)
  syncQueue.addSync(async () => {
    console.log(`🔄 Syncing products due to ${event.type} on ${event.productId}`);
    
    // Log the change for audit purposes
    await logProductChange(event);
  });
}

/**
 * Log product changes for audit trail
 */
async function logProductChange(event: ProductChangeEvent): Promise<void> {
  try {
    const { createSupabaseServer } = await import('@/utils/supabase/server');
    const supabase = await createSupabaseServer();

    await supabase
      .from('product_change_log')
      .insert({
        event_type: event.type,
        product_id: event.productId,
        product_type: event.productType,
        changes: event.changes,
        user_id: event.userId,
        triggered_sync: true,
        created_at: new Date().toISOString()
      });

  } catch (error) {
    console.error('Failed to log product change:', error);
    // Don't throw - logging failure shouldn't break the sync
  }
}

/**
 * Hook for monitoring pricing plan changes
 */
export function onPricingPlanChange(
  planId: string, 
  changes: Record<string, any>,
  userId?: string
) {
  triggerProductSync({
    type: 'plan.updated',
    productId: planId,
    productType: 'plan',
    changes,
    timestamp: new Date().toISOString(),
    userId
  });
}

/**
 * Hook for monitoring add-on changes
 */
export function onAddOnChange(
  addonId: string,
  changes: Record<string, any>,
  userId?: string
) {
  triggerProductSync({
    type: 'addon.updated',
    productId: addonId,
    productType: 'addon',
    changes,
    timestamp: new Date().toISOString(),
    userId
  });
}

/**
 * Hook for monitoring role tier changes
 */
export function onRoleTierChange(
  roleId: string,
  tierId: string,
  changes: Record<string, any>,
  userId?: string
) {
  triggerProductSync({
    type: 'product.updated',
    productId: `${roleId}_${tierId}`,
    productType: 'role_tier',
    changes,
    timestamp: new Date().toISOString(),
    userId
  });
}

/**
 * Manual sync trigger (for admin use)
 */
export async function manualSyncTrigger(userId: string): Promise<void> {
  console.log(`👤 Manual sync triggered by user: ${userId}`);
  
  await triggerProductSync({
    type: 'product.manual_sync',
    productId: 'all',
    productType: 'plan',
    changes: { trigger: 'manual' },
    timestamp: new Date().toISOString(),
    userId
  });
}

/**
 * Schedule periodic sync (for cron jobs)
 */
export async function scheduledSyncTrigger(): Promise<void> {
  console.log('⏰ Scheduled sync triggered');
  
  // Run validation first
  const { validateProductSync } = await import('@/lib/stripe/product-sync');
  const validation = await validateProductSync();

  if (!validation.isValid) {
    console.log(`🔄 Scheduled sync needed: ${validation.missingSyncs.length} missing, ${validation.invalidSyncs.length} invalid`);
    
    await triggerProductSync({
      type: 'product.scheduled_sync',
      productId: 'all',
      productType: 'plan',
      changes: { 
        trigger: 'scheduled',
        missingSyncs: validation.missingSyncs.length,
        invalidSyncs: validation.invalidSyncs.length
      },
      timestamp: new Date().toISOString()
    });
  } else {
    console.log('✅ Scheduled sync: All products are already synced');
  }
}

/**
 * Initialize sync triggers (call this on app startup)
 */
export function initializeProductSyncTriggers(): void {
  console.log('🔧 Initializing automatic product sync triggers...');
  
  // Set up periodic validation (every hour)
  if (typeof window === 'undefined') { // Server-side only
    setInterval(() => {
      scheduledSyncTrigger().catch(error => {
        console.error('Scheduled sync failed:', error);
      });
    }, 60 * 60 * 1000); // 1 hour
  }
  
  console.log('✅ Product sync triggers initialized');
}