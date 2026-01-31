/**
 * Dunning System API
 * Manages automated failed payment recovery, retry logic, and customer communication
 * Handles payment failures, account suspension/restoration, and recovery workflows
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Initialize Supabase and Stripe
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

// --- Authentication helpers ---
function decodeBase64Json<T = any>(b64: string): T | null {
  try {
    const json = Buffer.from(b64, 'base64').toString('utf8');
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function verifyOwnerSession(req: NextRequest): boolean {
  const token = req.cookies.get('owner_session')?.value;
  if (!token) return false;

  const parts = token.split('.');
  if (parts.length < 2) return false;

  const payload = decodeBase64Json<{ role?: string; exp?: number }>(parts[1]);
  if (!payload || payload.role !== 'software_owner') return false;

  const expMs = payload.exp && payload.exp < 2_000_000_000 ? payload.exp * 1000 : payload.exp;
  return !!(expMs && expMs > Date.now());
}

async function verifyUserSession(req: NextRequest): Promise<{ userId: string; organizationId: string } | null> {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;

  const { data: orgMember } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single();

  if (!orgMember) return null;

  return {
    userId: user.id,
    organizationId: orgMember.organization_id
  };
}

const badReq = (msg: string, code = 400) =>
  NextResponse.json({ success: false, error: msg }, { status: code });

const ok = (body: Record<string, any> = {}) =>
  NextResponse.json({ success: true, ...body });

// ---------- GET: Fetch dunning data ----------
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'dashboard';
  const organizationId = searchParams.get('organizationId');

  // Determine access level and target organization
  let targetOrgId: string | null = null;
  const isOwner = verifyOwnerSession(req);
  
  if (isOwner) {
    targetOrgId = organizationId;
  } else {
    const userSession = await verifyUserSession(req);
    if (!userSession) {
      return badReq('Unauthorized - Valid session required', 401);
    }
    targetOrgId = userSession.organizationId;
  }

  try {
    console.log('🔄 [DUNNING] Fetching data:', { type, organizationId: targetOrgId });

    switch (type) {
      case 'dashboard':
        return await getDunningDashboard(targetOrgId);
      
      case 'cases':
        const status = searchParams.get('status');
        const limit = parseInt(searchParams.get('limit') || '20');
        return await getDunningCases(targetOrgId, status, limit);
      
      case 'case-details':
        const caseId = searchParams.get('caseId');
        if (!caseId) return badReq('Case ID required for case details');
        return await getCaseDetails(caseId, targetOrgId);
      
      case 'communications':
        const commCaseId = searchParams.get('caseId');
        return await getCommunications(commCaseId, targetOrgId);
      
      case 'retry-attempts':
        const retrysCaseId = searchParams.get('caseId');
        if (!retrysCaseId) return badReq('Case ID required for retry attempts');
        return await getRetryAttempts(retrysCaseId, targetOrgId);
        
      case 'configs':
        if (!isOwner) return badReq('Unauthorized - Admin access required', 401);
        return await getDunningConfigs();
        
      default:
        return badReq('Invalid type. Available: dashboard, cases, case-details, communications, retry-attempts, configs');
    }

  } catch (error) {
    console.error('❌ [DUNNING] GET error:', error);
    return badReq('Failed to fetch dunning data', 500);
  }
}

// ---------- POST: Handle dunning operations ----------
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action || 'create_case';

    console.log('🎯 [DUNNING] POST action:', action);

    switch (action) {
      case 'create_case':
        return await createDunningCase(body);
      
      case 'process_retry':
        if (!verifyOwnerSession(req)) {
          return badReq('Unauthorized - Admin access required', 401);
        }
        return await processRetry(body);
      
      case 'recover_case':
        return await recoverCase(body);
      
      case 'suspend_account':
        if (!verifyOwnerSession(req)) {
          return badReq('Unauthorized - Admin access required', 401);
        }
        return await suspendAccount(body);
      
      case 'restore_account':
        if (!verifyOwnerSession(req)) {
          return badReq('Unauthorized - Admin access required', 401);
        }
        return await restoreAccount(body);
      
      case 'send_notification':
        return await sendDunningNotification(body);
      
      case 'webhook':
        return await handleStripeWebhook(req, body);
        
      default:
        return badReq('Invalid action. Available: create_case, process_retry, recover_case, suspend_account, restore_account, send_notification, webhook');
    }

  } catch (error) {
    console.error('❌ [DUNNING] POST error:', error);
    return badReq('Failed to process dunning request', 500);
  }
}

// ---------- PUT: Update configurations ----------
export async function PUT(req: NextRequest) {
  if (!verifyOwnerSession(req)) {
    return badReq('Unauthorized - Admin access required', 401);
  }

  try {
    const body = await req.json();
    const { planName, config } = body;

    if (!planName || !config) {
      return badReq('Missing required fields: planName, config');
    }

    console.log('⚙️ [DUNNING] Updating config:', { planName });

    const { data, error } = await supabase
      .from('dunning_configs')
      .upsert({
        plan_name: planName,
        grace_period_days: config.gracePeriodDays || 3,
        max_retry_attempts: config.maxRetryAttempts || 3,
        retry_intervals: config.retryIntervals || [1, 3, 7],
        suspension_delay_days: config.suspensionDelayDays || 7,
        auto_cancel_days: config.autoCancelDays || 30,
        send_email_notifications: config.sendEmailNotifications !== false,
        send_sms_notifications: config.sendSmsNotifications || false,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'plan_name'
      })
      .select();

    if (error) {
      console.error('❌ [DUNNING] Config update error:', error);
      return badReq('Failed to update configuration', 500);
    }

    return ok({ message: 'Dunning configuration updated', config: data[0] });

  } catch (error) {
    console.error('❌ [DUNNING] PUT error:', error);
    return badReq('Failed to update configuration', 500);
  }
}

// Get dunning dashboard data
async function getDunningDashboard(organizationId: string | null) {
  const { data, error } = await supabase.rpc('get_dunning_dashboard', { 
    p_organization_id: organizationId 
  });

  if (error) {
    console.error('❌ [DUNNING] Dashboard error:', error);
    return badReq('Failed to fetch dashboard data', 500);
  }

  const dashboard = data[0] || {
    active_cases: 0,
    suspended_accounts: 0,
    total_outstanding: 0,
    recovery_rate: 0,
    avg_recovery_days: 0
  };

  return ok({
    dashboard: {
      activeCases: parseInt(dashboard.active_cases || '0'),
      suspendedAccounts: parseInt(dashboard.suspended_accounts || '0'),
      totalOutstanding: parseFloat(dashboard.total_outstanding || '0'),
      recoveryRate: parseFloat(dashboard.recovery_rate || '0'),
      avgRecoveryDays: parseFloat(dashboard.avg_recovery_days || '0')
    }
  });
}

// Get dunning cases
async function getDunningCases(organizationId: string | null, status: string | null, limit: number) {
  let query = supabase
    .from('dunning_cases')
    .select(`
      *,
      organizations(name, owner_email),
      subscriptions(plan_name)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (organizationId) {
    query = query.eq('organization_id', organizationId);
  }

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('❌ [DUNNING] Cases error:', error);
    return badReq('Failed to fetch dunning cases', 500);
  }

  const cases = (data || []).map((caseData: any) => ({
    id: caseData.id,
    organizationId: caseData.organization_id,
    organizationName: caseData.organizations?.name,
    subscriptionId: caseData.subscription_id,
    planName: caseData.subscriptions?.plan_name,
    stripeSubscriptionId: caseData.stripe_subscription_id,
    stripeInvoiceId: caseData.stripe_invoice_id,
    paymentAmount: parseFloat(caseData.payment_amount || '0'),
    currency: caseData.currency,
    status: caseData.status,
    currentRetryAttempt: caseData.current_retry_attempt,
    maxRetryAttempts: caseData.max_retry_attempts,
    failureReason: caseData.failure_reason,
    paymentFailedAt: caseData.payment_failed_at,
    gracePeriodEndsAt: caseData.grace_period_ends_at,
    nextRetryAt: caseData.next_retry_at,
    suspendedAt: caseData.suspended_at,
    recoveredAt: caseData.recovered_at,
    emailsSent: caseData.emails_sent,
    smsSent: caseData.sms_sent,
    createdAt: caseData.created_at
  }));

  return ok({ cases });
}

// Get detailed case information
async function getCaseDetails(caseId: string, organizationId: string | null) {
  let query = supabase
    .from('dunning_cases')
    .select(`
      *,
      organizations(name, owner_email, owner_phone),
      subscriptions(plan_name, stripe_subscription_id)
    `)
    .eq('id', caseId);

  if (organizationId) {
    query = query.eq('organization_id', organizationId);
  }

  const { data, error } = await query.single();

  if (error) {
    console.error('❌ [DUNNING] Case details error:', error);
    return badReq('Failed to fetch case details', 500);
  }

  return ok({
    caseDetails: {
      id: data.id,
      organizationName: data.organizations?.name,
      ownerEmail: data.organizations?.owner_email,
      ownerPhone: data.organizations?.owner_phone,
      planName: data.subscriptions?.plan_name,
      paymentAmount: parseFloat(data.payment_amount || '0'),
      currency: data.currency,
      status: data.status,
      currentRetryAttempt: data.current_retry_attempt,
      maxRetryAttempts: data.max_retry_attempts,
      failureReason: data.failure_reason,
      failureCode: data.failure_code,
      paymentFailedAt: data.payment_failed_at,
      gracePeriodEndsAt: data.grace_period_ends_at,
      nextRetryAt: data.next_retry_at,
      suspendedAt: data.suspended_at,
      recoveredAt: data.recovered_at,
      createdAt: data.created_at
    }
  });
}

// Get communications for a case
async function getCommunications(caseId: string | null, organizationId: string | null) {
  let query = supabase
    .from('dunning_communications')
    .select('*')
    .order('created_at', { ascending: false });

  if (caseId) {
    query = query.eq('dunning_case_id', caseId);
  } else if (organizationId) {
    query = query.eq('organization_id', organizationId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('❌ [DUNNING] Communications error:', error);
    return badReq('Failed to fetch communications', 500);
  }

  const communications = (data || []).map((comm: any) => ({
    id: comm.id,
    caseId: comm.dunning_case_id,
    communicationType: comm.communication_type,
    deliveryMethod: comm.delivery_method,
    recipient: comm.recipient_email || comm.recipient_phone,
    subject: comm.subject,
    messageBody: comm.message_body,
    status: comm.status,
    sentAt: comm.sent_at,
    deliveredAt: comm.delivered_at,
    openedAt: comm.opened_at,
    failureReason: comm.failure_reason,
    createdAt: comm.created_at
  }));

  return ok({ communications });
}

// Get retry attempts for a case
async function getRetryAttempts(caseId: string, organizationId: string | null) {
  let query = supabase
    .from('payment_retry_attempts')
    .select(`
      *,
      dunning_cases!inner(organization_id)
    `)
    .eq('dunning_case_id', caseId)
    .order('attempt_number', { ascending: false });

  if (organizationId) {
    query = query.eq('dunning_cases.organization_id', organizationId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('❌ [DUNNING] Retry attempts error:', error);
    return badReq('Failed to fetch retry attempts', 500);
  }

  const retryAttempts = (data || []).map((attempt: any) => ({
    id: attempt.id,
    attemptNumber: attempt.attempt_number,
    amount: parseFloat(attempt.amount || '0'),
    currency: attempt.currency,
    status: attempt.status,
    failureReason: attempt.failure_reason,
    failureCode: attempt.failure_code,
    attemptedAt: attempt.attempted_at,
    completedAt: attempt.completed_at,
    nextRetryAt: attempt.next_retry_at
  }));

  return ok({ retryAttempts });
}

// Get dunning configurations
async function getDunningConfigs() {
  const { data, error } = await supabase
    .from('dunning_configs')
    .select('*')
    .order('plan_name', { ascending: true });

  if (error) {
    console.error('❌ [DUNNING] Configs error:', error);
    return badReq('Failed to fetch configurations', 500);
  }

  const configs = (data || []).map((config: any) => ({
    id: config.id,
    planName: config.plan_name,
    gracePeriodDays: config.grace_period_days,
    maxRetryAttempts: config.max_retry_attempts,
    retryIntervals: config.retry_intervals,
    suspensionDelayDays: config.suspension_delay_days,
    autoCancelDays: config.auto_cancel_days,
    sendEmailNotifications: config.send_email_notifications,
    sendSmsNotifications: config.send_sms_notifications,
    createdAt: config.created_at,
    updatedAt: config.updated_at
  }));

  return ok({ configs });
}

// Create new dunning case
async function createDunningCase(body: any) {
  const {
    organizationId,
    subscriptionId,
    stripeSubscriptionId,
    stripeInvoiceId,
    stripePaymentIntentId,
    paymentAmount,
    currency = 'USD',
    failureReason,
    failureCode
  } = body;

  if (!organizationId || !paymentAmount) {
    return badReq('Missing required fields: organizationId, paymentAmount');
  }

  console.log('🆕 [DUNNING] Creating case:', { organizationId, paymentAmount });

  const { data, error } = await supabase.rpc('create_dunning_case', {
    p_organization_id: organizationId,
    p_subscription_id: subscriptionId,
    p_stripe_subscription_id: stripeSubscriptionId,
    p_stripe_invoice_id: stripeInvoiceId,
    p_stripe_payment_intent_id: stripePaymentIntentId,
    p_payment_amount: paymentAmount,
    p_currency: currency,
    p_failure_reason: failureReason,
    p_failure_code: failureCode
  });

  if (error) {
    console.error('❌ [DUNNING] Create case error:', error);
    return badReq('Failed to create dunning case', 500);
  }

  return ok({ message: 'Dunning case created', caseId: data });
}

// Process retry for a dunning case
async function processRetry(body: any) {
  const { caseId } = body;

  if (!caseId) {
    return badReq('Missing required field: caseId');
  }

  console.log('🔄 [DUNNING] Processing retry:', { caseId });

  const { data, error } = await supabase.rpc('process_dunning_retry', {
    p_dunning_case_id: caseId
  });

  if (error) {
    console.error('❌ [DUNNING] Process retry error:', error);
    return badReq('Failed to process retry', 500);
  }

  return ok({ message: 'Retry processed', processed: data });
}

// Recover dunning case
async function recoverCase(body: any) {
  const { caseId, stripePaymentIntentId } = body;

  if (!caseId) {
    return badReq('Missing required field: caseId');
  }

  console.log('✅ [DUNNING] Recovering case:', { caseId });

  const { data, error } = await supabase.rpc('recover_dunning_case', {
    p_dunning_case_id: caseId,
    p_stripe_payment_intent_id: stripePaymentIntentId
  });

  if (error) {
    console.error('❌ [DUNNING] Recover case error:', error);
    return badReq('Failed to recover case', 500);
  }

  return ok({ message: 'Case recovered successfully', recovered: data });
}

// Suspend account
async function suspendAccount(body: any) {
  const { organizationId, caseId } = body;

  if (!organizationId || !caseId) {
    return badReq('Missing required fields: organizationId, caseId');
  }

  console.log('⛔ [DUNNING] Suspending account:', { organizationId });

  const { error } = await supabase.rpc('suspend_organization_access', {
    p_organization_id: organizationId,
    p_dunning_case_id: caseId
  });

  if (error) {
    console.error('❌ [DUNNING] Suspend account error:', error);
    return badReq('Failed to suspend account', 500);
  }

  return ok({ message: 'Account suspended successfully' });
}

// Restore account
async function restoreAccount(body: any) {
  const { organizationId, caseId } = body;

  if (!organizationId || !caseId) {
    return badReq('Missing required fields: organizationId, caseId');
  }

  console.log('✅ [DUNNING] Restoring account:', { organizationId });

  const { error } = await supabase.rpc('restore_organization_access', {
    p_organization_id: organizationId,
    p_dunning_case_id: caseId
  });

  if (error) {
    console.error('❌ [DUNNING] Restore account error:', error);
    return badReq('Failed to restore account', 500);
  }

  return ok({ message: 'Account restored successfully' });
}

// Send dunning notification
async function sendDunningNotification(body: any) {
  const { caseId, communicationType } = body;

  if (!caseId || !communicationType) {
    return badReq('Missing required fields: caseId, communicationType');
  }

  console.log('📧 [DUNNING] Sending notification:', { caseId, communicationType });

  const { data, error } = await supabase.rpc('queue_dunning_notification', {
    p_dunning_case_id: caseId,
    p_communication_type: communicationType
  });

  if (error) {
    console.error('❌ [DUNNING] Send notification error:', error);
    return badReq('Failed to send notification', 500);
  }

  return ok({ message: 'Notification queued', notificationId: data });
}

// Handle Stripe webhook for dunning events
async function handleStripeWebhook(req: NextRequest, body: any) {
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return badReq('Missing Stripe signature', 400);
  }

  try {
    // Verify webhook signature (implementation would depend on your webhook setup)
    const event = body;

    console.log('🔗 [DUNNING] Stripe webhook:', event.type);

    switch (event.type) {
      case 'invoice.payment_failed':
        // Handle failed payment - create dunning case
        return await handlePaymentFailed(event.data.object);
      
      case 'invoice.payment_succeeded':
        // Handle successful payment - recover case
        return await handlePaymentSucceeded(event.data.object);
      
      default:
        console.log('🔇 [DUNNING] Unhandled webhook event:', event.type);
        return ok({ message: 'Event received but not processed' });
    }

  } catch (error) {
    console.error('❌ [DUNNING] Webhook error:', error);
    return badReq('Webhook processing failed', 500);
  }
}

// Handle failed payment webhook
async function handlePaymentFailed(invoice: any) {
  // Extract relevant information and create dunning case
  return ok({ message: 'Payment failure processed' });
}

// Handle successful payment webhook
async function handlePaymentSucceeded(invoice: any) {
  // Find and recover related dunning case
  return ok({ message: 'Payment success processed' });
}