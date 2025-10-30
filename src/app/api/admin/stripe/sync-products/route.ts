/**
 * STRIPE PRODUCT SYNC API
 * Endpoint to trigger synchronization of products between GhostCRM and Stripe
 */

import { NextRequest, NextResponse } from 'next/server';
import { syncAllProductsWithStripe, validateProductSync } from '@/lib/stripe/product-sync';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action = 'sync', dryRun = false, forceUpdate = false } = body;

    console.log(`🔄 Starting product sync: action=${action}, dryRun=${dryRun}, forceUpdate=${forceUpdate}`);

    switch (action) {
      case 'sync':
        const syncResult = await syncAllProductsWithStripe({ dryRun, forceUpdate });
        
        return NextResponse.json({
          success: syncResult.success,
          message: dryRun 
            ? 'Dry run completed - no changes made'
            : `Sync completed: ${syncResult.created} created, ${syncResult.updated} updated`,
          data: {
            created: syncResult.created,
            updated: syncResult.updated,
            errors: syncResult.errors,
            products: syncResult.syncedProducts
          }
        });

      case 'validate':
        const validation = await validateProductSync();
        
        return NextResponse.json({
          success: validation.isValid,
          message: validation.isValid 
            ? 'All products are properly synced'
            : `${validation.missingSyncs.length} missing syncs, ${validation.invalidSyncs.length} invalid syncs`,
          data: {
            isValid: validation.isValid,
            missingSyncs: validation.missingSyncs,
            invalidSyncs: validation.invalidSyncs
          }
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use "sync" or "validate"' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Product sync API error:', error);
    return NextResponse.json(
      { error: 'Failed to sync products', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get sync status and validation
    const validation = await validateProductSync();
    
    return NextResponse.json({
      success: true,
      data: {
        syncStatus: validation.isValid ? 'valid' : 'needs_sync',
        missingSyncs: validation.missingSyncs,
        invalidSyncs: validation.invalidSyncs,
        totalMissing: validation.missingSyncs.length,
        totalInvalid: validation.invalidSyncs.length
      }
    });

  } catch (error) {
    console.error('Product sync status error:', error);
    return NextResponse.json(
      { error: 'Failed to get sync status', details: String(error) },
      { status: 500 }
    );
  }
}