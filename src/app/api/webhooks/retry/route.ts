export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/utils/supabase/server';

export const runtime = 'nodejs';

/**
 * POST /api/webhooks/retry
 * Retry failed webhook operations manually or via cron job
 */
export async function POST(req: NextRequest) {
  return handleRetryRequest(req);
}

/**
 * GET /api/webhooks/retry
 * Alternative endpoint for Vercel Cron (supports GET requests)
 */
export async function GET(req: NextRequest) {
  return handleRetryRequest(req);
}

async function handleRetryRequest(req: NextRequest) {
  try {
    let authHeader: string | null = null;
    
    // Handle different auth methods
    // 1. Vercel Cron (via Authorization header)
    const authHeaderFromHeader = req.headers.get('Authorization');
    if (authHeaderFromHeader?.startsWith('Bearer ')) {
      authHeader = authHeaderFromHeader.replace('Bearer ', '');
    }
    
    // 2. Manual/external cron (via JSON body)
    try {
      const body = await req.json();
      authHeader = authHeader || body.authHeader;
    } catch (e) {
      // No JSON body, that's fine for Vercel Cron
    }
    
    // 3. Check for cron secret in headers (Vercel's cron secret)
    const cronSecret = req.headers.get('x-vercel-cron-secret');
    if (cronSecret === process.env.CRON_SECRET) {
      authHeader = process.env.WEBHOOK_RETRY_SECRET; // Allow Vercel cron
    }
    
    // Auth check
    if (authHeader !== process.env.WEBHOOK_RETRY_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { supabaseAdmin } = await import('@/lib/supabaseAdmin');
    
    // Get all pending retry entries
    const { data: retryEntries, error: fetchError } = await supabaseAdmin
      .from('webhook_retries')
      .select('*')
      .eq('status', 'pending')
      .lt('retry_count', 3) // Max 3 retries
      .order('created_at', { ascending: true })
      .limit(10); // Process 10 at a time

    if (fetchError) {
      console.error('❌ [WEBHOOK-RETRY] Error fetching retry entries:', fetchError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!retryEntries || retryEntries.length === 0) {
      return NextResponse.json({ 
        message: 'No pending retries', 
        processed: 0 
      });
    }

    let successCount = 0;
    let failureCount = 0;

    // Process each retry entry
    for (const entry of retryEntries) {
      try {
        let result = false;

        switch (entry.type) {
          case 'user_not_found':
            result = await retryUserLookup(entry);
            break;
          case 'dns_provisioning_failed':
          case 'dns_provisioning_error':
            result = await retryDnsProvisioning(entry);
            break;
          case 'provisioning_failed':
            result = await retrySubdomainProvisioning(entry);
            break;
          default:
            console.warn('⚠️ [WEBHOOK-RETRY] Unknown retry type:', entry.type);
            continue;
        }

        if (result) {
          // Mark as completed
          await supabaseAdmin
            .from('webhook_retries')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString(),
              retry_count: entry.retry_count + 1
            })
            .eq('id', entry.id);
          
          successCount++;
          console.log('✅ [WEBHOOK-RETRY] Successfully retried:', entry.type, entry.id);
        } else {
          // Increment retry count
          await supabaseAdmin
            .from('webhook_retries')
            .update({
              retry_count: entry.retry_count + 1,
              last_retry_at: new Date().toISOString()
            })
            .eq('id', entry.id);
          
          failureCount++;
          console.log('❌ [WEBHOOK-RETRY] Retry failed:', entry.type, entry.id);
        }
      } catch (error) {
        console.error('❌ [WEBHOOK-RETRY] Error processing retry entry:', entry.id, error);
        failureCount++;
      }
    }

    return NextResponse.json({
      message: 'Retry processing completed',
      processed: retryEntries.length,
      successes: successCount,
      failures: failureCount
    });

  } catch (error) {
    console.error('❌ [WEBHOOK-RETRY] Error in retry endpoint:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

/**
 * Retry user lookup for failed payments
 */
async function retryUserLookup(entry: any): Promise<boolean> {
  try {
    const { supabaseAdmin } = await import('@/lib/supabaseAdmin');
    
    // Try to find user again
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('id, organization_id, email')
      .eq('email', entry.email)
      .single();
    
    if (userData) {
      // User found - we can't automatically continue the webhook processing,
      // but we can log this for manual intervention
      console.log('✅ [WEBHOOK-RETRY] User now found for email:', entry.email);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ [WEBHOOK-RETRY] Error retrying user lookup:', error);
    return false;
  }
}

/**
 * Retry DNS provisioning
 */
async function retryDnsProvisioning(entry: any): Promise<boolean> {
  try {
    const { supabaseAdmin } = await import('@/lib/supabaseAdmin');
    
    // Get subdomain details
    const { data: subdomainData } = await supabaseAdmin
      .from('subdomains')
      .select('*')
      .eq('id', entry.subdomain_id)
      .single();
    
    if (!subdomainData) {
      console.warn('⚠️ [WEBHOOK-RETRY] Subdomain not found:', entry.subdomain_id);
      return false;
    }
    
    // Retry DNS provisioning
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ghostcrm.ai';
    const response = await fetch(`${baseUrl}/api/subdomains/provision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subdomain: subdomainData.subdomain,
        organizationId: subdomainData.organization_id,
        organizationName: subdomainData.organization_name,
        autoProvision: true,
        retry: true
      })
    });
    
    if (response.ok) {
      // Update subdomain status to active
      await supabaseAdmin
        .from('subdomains')
        .update({
          status: 'active',
          provisioned_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', entry.subdomain_id);
      
      console.log('✅ [WEBHOOK-RETRY] DNS provisioning successful:', subdomainData.subdomain);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ [WEBHOOK-RETRY] Error retrying DNS provisioning:', error);
    return false;
  }
}

/**
 * Retry subdomain provisioning
 */
async function retrySubdomainProvisioning(entry: any): Promise<boolean> {
  try {
    const { supabaseAdmin } = await import('@/lib/supabaseAdmin');
    
    // Retry marking subdomain as provisioning
    const { error } = await supabaseAdmin
      .from('subdomains')
      .update({
        status: 'provisioning',
        updated_at: new Date().toISOString()
      })
      .eq('id', entry.subdomain_id);
    
    return !error;
  } catch (error) {
    console.error('❌ [WEBHOOK-RETRY] Error retrying subdomain provisioning:', error);
    return false;
  }
}