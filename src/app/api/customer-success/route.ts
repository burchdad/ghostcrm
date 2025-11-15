/**
 * Customer Success Workflows API
 * Manages trial-to-paid conversion automation, onboarding sequences, and engagement tracking
 * Provides endpoints for workflow management, customer journey tracking, and conversion analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// --- Supabase (service role: server-side only) ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

// ---------- GET: Fetch customer success data ----------
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
    console.log('🎯 [CUSTOMER_SUCCESS] Fetching data:', { type, organizationId: targetOrgId });

    switch (type) {
      case 'dashboard':
        return await getCustomerSuccessDashboard(targetOrgId);
      
      case 'enrollments':
        const status = searchParams.get('status');
        const limit = parseInt(searchParams.get('limit') || '20');
        return await getWorkflowEnrollments(targetOrgId, status, limit);
      
      case 'enrollment-details':
        const enrollmentId = searchParams.get('enrollmentId');
        if (!enrollmentId) return badReq('Enrollment ID required');
        return await getEnrollmentDetails(enrollmentId, targetOrgId);
      
      case 'workflows':
        return await getOnboardingWorkflows();
      
      case 'workflow-steps':
        const workflowId = searchParams.get('workflowId');
        if (!workflowId) return badReq('Workflow ID required');
        return await getWorkflowSteps(workflowId);
      
      case 'engagement-events':
        const days = parseInt(searchParams.get('days') || '30');
        return await getEngagementEvents(targetOrgId, days);
      
      case 'conversions':
        const conversionDays = parseInt(searchParams.get('days') || '30');
        return await getConversions(targetOrgId, conversionDays);
      
      case 'journey-stages':
        return await getJourneyStages();
        
      default:
        return badReq('Invalid type. Available: dashboard, enrollments, enrollment-details, workflows, workflow-steps, engagement-events, conversions, journey-stages');
    }

  } catch (error) {
    console.error('❌ [CUSTOMER_SUCCESS] GET error:', error);
    return badReq('Failed to fetch customer success data', 500);
  }
}

// ---------- POST: Handle workflow operations ----------
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action || 'enroll_customer';

    console.log('🎯 [CUSTOMER_SUCCESS] POST action:', action);

    switch (action) {
      case 'enroll_customer':
        return await enrollCustomer(body);
      
      case 'execute_step':
        return await executeWorkflowStep(body);
      
      case 'track_engagement':
        return await trackEngagement(body);
      
      case 'record_conversion':
        return await recordConversion(body);
      
      case 'auto_enroll_trials':
        if (!verifyOwnerSession(req)) {
          return badReq('Unauthorized - Admin access required', 401);
        }
        return await autoEnrollTrials();
      
      case 'process_scheduled_steps':
        if (!verifyOwnerSession(req)) {
          return badReq('Unauthorized - Admin access required', 401);
        }
        return await processScheduledSteps();
        
      default:
        return badReq('Invalid action. Available: enroll_customer, execute_step, track_engagement, record_conversion, auto_enroll_trials, process_scheduled_steps');
    }

  } catch (error) {
    console.error('❌ [CUSTOMER_SUCCESS] POST error:', error);
    return badReq('Failed to process customer success request', 500);
  }
}

// ---------- PUT: Update workflows and configurations ----------
export async function PUT(req: NextRequest) {
  if (!verifyOwnerSession(req)) {
    return badReq('Unauthorized - Admin access required', 401);
  }

  try {
    const body = await req.json();
    const updateType = body.updateType || 'workflow';

    console.log('⚙️ [CUSTOMER_SUCCESS] Updating:', updateType);

    switch (updateType) {
      case 'workflow':
        return await updateWorkflow(body);
      
      case 'workflow-step':
        return await updateWorkflowStep(body);
        
      default:
        return badReq('Invalid update type. Available: workflow, workflow-step');
    }

  } catch (error) {
    console.error('❌ [CUSTOMER_SUCCESS] PUT error:', error);
    return badReq('Failed to update configuration', 500);
  }
}

// Get customer success dashboard data
async function getCustomerSuccessDashboard(organizationId: string | null) {
  const { data, error } = await supabase.rpc('get_customer_success_dashboard', { 
    p_organization_id: organizationId 
  });

  if (error) {
    console.error('❌ [CUSTOMER_SUCCESS] Dashboard error:', error);
    return badReq('Failed to fetch dashboard data', 500);
  }

  const dashboard = data[0] || {
    active_enrollments: 0,
    completed_workflows: 0,
    trial_conversions: 0,
    avg_engagement_score: 0,
    conversion_rate: 0
  };

  return ok({
    dashboard: {
      activeEnrollments: parseInt(dashboard.active_enrollments || '0'),
      completedWorkflows: parseInt(dashboard.completed_workflows || '0'),
      trialConversions: parseInt(dashboard.trial_conversions || '0'),
      avgEngagementScore: parseFloat(dashboard.avg_engagement_score || '0'),
      conversionRate: parseFloat(dashboard.conversion_rate || '0')
    }
  });
}

// Get workflow enrollments
async function getWorkflowEnrollments(organizationId: string | null, status: string | null, limit: number) {
  let query = supabase
    .from('customer_workflow_enrollments')
    .select(`
      *,
      organizations(name, owner_email),
      onboarding_workflows(workflow_name, target_plan)
    `)
    .order('enrolled_at', { ascending: false })
    .limit(limit);

  if (organizationId) {
    query = query.eq('organization_id', organizationId);
  }

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('❌ [CUSTOMER_SUCCESS] Enrollments error:', error);
    return badReq('Failed to fetch enrollments', 500);
  }

  const enrollments = (data || []).map((enrollment: any) => ({
    id: enrollment.id,
    organizationId: enrollment.organization_id,
    organizationName: enrollment.organizations?.name,
    workflowId: enrollment.workflow_id,
    workflowName: enrollment.onboarding_workflows?.workflow_name,
    targetPlan: enrollment.onboarding_workflows?.target_plan,
    enrolledAt: enrollment.enrolled_at,
    enrollmentSource: enrollment.enrollment_source,
    currentStepOrder: enrollment.current_step_order,
    status: enrollment.status,
    completedAt: enrollment.completed_at,
    completionReason: enrollment.completion_reason,
    stepsCompleted: enrollment.steps_completed,
    totalSteps: enrollment.total_steps,
    completionPercentage: parseFloat(enrollment.completion_percentage || '0'),
    lastActivityAt: enrollment.last_activity_at,
    engagementScore: enrollment.engagement_score
  }));

  return ok({ enrollments });
}

// Get detailed enrollment information
async function getEnrollmentDetails(enrollmentId: string, organizationId: string | null) {
  let query = supabase
    .from('customer_workflow_enrollments')
    .select(`
      *,
      organizations(name, owner_email),
      onboarding_workflows(workflow_name, workflow_description, target_plan),
      workflow_steps!current_step_id(step_name, step_description, step_type)
    `)
    .eq('id', enrollmentId);

  if (organizationId) {
    query = query.eq('organization_id', organizationId);
  }

  const { data, error } = await query.single();

  if (error) {
    console.error('❌ [CUSTOMER_SUCCESS] Enrollment details error:', error);
    return badReq('Failed to fetch enrollment details', 500);
  }

  // Get step executions for this enrollment
  const { data: executions } = await supabase
    .from('workflow_step_executions')
    .select(`
      *,
      workflow_steps(step_name, step_type)
    `)
    .eq('enrollment_id', enrollmentId)
    .order('execution_order', { ascending: true });

  return ok({
    enrollmentDetails: {
      id: data.id,
      organizationName: data.organizations?.name,
      workflowName: data.onboarding_workflows?.workflow_name,
      workflowDescription: data.onboarding_workflows?.workflow_description,
      targetPlan: data.onboarding_workflows?.target_plan,
      enrolledAt: data.enrolled_at,
      status: data.status,
      currentStepName: data.workflow_steps?.step_name,
      currentStepType: data.workflow_steps?.step_type,
      completionPercentage: parseFloat(data.completion_percentage || '0'),
      engagementScore: data.engagement_score,
      stepExecutions: (executions || []).map((exec: any) => ({
        id: exec.id,
        stepName: exec.workflow_steps?.step_name,
        stepType: exec.workflow_steps?.step_type,
        executionOrder: exec.execution_order,
        scheduledAt: exec.scheduled_at,
        executedAt: exec.executed_at,
        status: exec.status,
        emailSent: exec.email_sent,
        emailOpened: exec.email_opened,
        inAppViewed: exec.in_app_viewed,
        successAchieved: exec.success_achieved,
        interactionScore: exec.interaction_score
      }))
    }
  });
}

// Get onboarding workflows
async function getOnboardingWorkflows() {
  const { data, error } = await supabase
    .from('onboarding_workflows')
    .select('*')
    .eq('is_active', true)
    .order('workflow_name', { ascending: true });

  if (error) {
    console.error('❌ [CUSTOMER_SUCCESS] Workflows error:', error);
    return badReq('Failed to fetch workflows', 500);
  }

  const workflows = (data || []).map((workflow: any) => ({
    id: workflow.id,
    workflowName: workflow.workflow_name,
    targetPlan: workflow.target_plan,
    workflowDescription: workflow.workflow_description,
    isActive: workflow.is_active,
    autoEnroll: workflow.auto_enroll,
    totalDurationDays: workflow.total_duration_days,
    stepIntervals: workflow.step_intervals,
    createdAt: workflow.created_at
  }));

  return ok({ workflows });
}

// Get workflow steps
async function getWorkflowSteps(workflowId: string) {
  const { data, error } = await supabase
    .from('workflow_steps')
    .select('*')
    .eq('workflow_id', workflowId)
    .order('step_order', { ascending: true });

  if (error) {
    console.error('❌ [CUSTOMER_SUCCESS] Workflow steps error:', error);
    return badReq('Failed to fetch workflow steps', 500);
  }

  const steps = (data || []).map((step: any) => ({
    id: step.id,
    stepOrder: step.step_order,
    stepName: step.step_name,
    stepDescription: step.step_description,
    triggerDelayDays: step.trigger_delay_days,
    stepType: step.step_type,
    emailTemplateId: step.email_template_id,
    inAppMessage: step.in_app_message,
    autoExecute: step.auto_execute,
    repeatable: step.repeatable,
    maxExecutions: step.max_executions
  }));

  return ok({ workflowSteps: steps });
}

// Get engagement events
async function getEngagementEvents(organizationId: string | null, days: number) {
  let query = supabase
    .from('customer_engagement_events')
    .select('*')
    .gte('occurred_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
    .order('occurred_at', { ascending: false })
    .limit(100);

  if (organizationId) {
    query = query.eq('organization_id', organizationId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('❌ [CUSTOMER_SUCCESS] Engagement events error:', error);
    return badReq('Failed to fetch engagement events', 500);
  }

  const events = (data || []).map((event: any) => ({
    id: event.id,
    organizationId: event.organization_id,
    eventType: event.event_type,
    eventName: event.event_name,
    eventData: event.event_data,
    engagementValue: event.engagement_value,
    milestoneAchieved: event.milestone_achieved,
    occurredAt: event.occurred_at
  }));

  return ok({ engagementEvents: events });
}

// Get conversions
async function getConversions(organizationId: string | null, days: number) {
  let query = supabase
    .from('conversion_events')
    .select(`
      *,
      customer_workflow_enrollments(workflow_id, enrolled_at),
      onboarding_workflows(workflow_name)
    `)
    .gte('converted_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
    .order('converted_at', { ascending: false })
    .limit(50);

  if (organizationId) {
    query = query.eq('organization_id', organizationId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('❌ [CUSTOMER_SUCCESS] Conversions error:', error);
    return badReq('Failed to fetch conversions', 500);
  }

  const conversions = (data || []).map((conversion: any) => ({
    id: conversion.id,
    organizationId: conversion.organization_id,
    conversionType: conversion.conversion_type,
    fromState: conversion.from_state,
    toState: conversion.to_state,
    revenueImpact: parseFloat(conversion.revenue_impact || '0'),
    workflowName: conversion.onboarding_workflows?.workflow_name,
    journeyDurationDays: conversion.journey_duration_days,
    touchpointCount: conversion.touchpoint_count,
    successScore: conversion.success_score,
    convertedAt: conversion.converted_at
  }));

  return ok({ conversions });
}

// Get journey stages
async function getJourneyStages() {
  const { data, error } = await supabase
    .from('customer_journey_stages')
    .select('*')
    .order('stage_order', { ascending: true });

  if (error) {
    console.error('❌ [CUSTOMER_SUCCESS] Journey stages error:', error);
    return badReq('Failed to fetch journey stages', 500);
  }

  const stages = (data || []).map((stage: any) => ({
    id: stage.id,
    stageName: stage.stage_name,
    stageOrder: stage.stage_order,
    description: stage.description,
    targetDurationDays: stage.target_duration_days,
    successCriteria: stage.success_criteria,
    automaticProgression: stage.automatic_progression
  }));

  return ok({ journeyStages: stages });
}

// Enroll customer in workflow
async function enrollCustomer(body: any) {
  const { organizationId, userId, workflowId, enrollmentSource = 'manual' } = body;

  if (!organizationId || !workflowId) {
    return badReq('Missing required fields: organizationId, workflowId');
  }

  console.log('📝 [CUSTOMER_SUCCESS] Enrolling customer:', { organizationId, workflowId });

  const { data, error } = await supabase.rpc('enroll_customer_in_workflow', {
    p_organization_id: organizationId,
    p_user_id: userId,
    p_workflow_id: workflowId,
    p_enrollment_source: enrollmentSource
  });

  if (error) {
    console.error('❌ [CUSTOMER_SUCCESS] Enroll error:', error);
    return badReq('Failed to enroll customer', 500);
  }

  return ok({ message: 'Customer enrolled successfully', enrollmentId: data });
}

// Execute workflow step
async function executeWorkflowStep(body: any) {
  const { executionId } = body;

  if (!executionId) {
    return badReq('Missing required field: executionId');
  }

  console.log('▶️ [CUSTOMER_SUCCESS] Executing step:', { executionId });

  const { data, error } = await supabase.rpc('execute_workflow_step', {
    p_execution_id: executionId
  });

  if (error) {
    console.error('❌ [CUSTOMER_SUCCESS] Execute step error:', error);
    return badReq('Failed to execute step', 500);
  }

  return ok({ message: 'Step executed successfully', executed: data });
}

// Track engagement event
async function trackEngagement(body: any) {
  const { 
    organizationId, 
    userId, 
    eventType, 
    eventName, 
    eventData = null, 
    engagementValue = 1 
  } = body;

  if (!organizationId || !eventType || !eventName) {
    return badReq('Missing required fields: organizationId, eventType, eventName');
  }

  console.log('📈 [CUSTOMER_SUCCESS] Tracking engagement:', { organizationId, eventType, eventName });

  const { data, error } = await supabase.rpc('track_engagement_event', {
    p_organization_id: organizationId,
    p_user_id: userId,
    p_event_type: eventType,
    p_event_name: eventName,
    p_event_data: eventData,
    p_engagement_value: engagementValue
  });

  if (error) {
    console.error('❌ [CUSTOMER_SUCCESS] Track engagement error:', error);
    return badReq('Failed to track engagement', 500);
  }

  return ok({ message: 'Engagement tracked successfully', eventId: data });
}

// Record conversion event
async function recordConversion(body: any) {
  const { 
    organizationId, 
    userId, 
    conversionType, 
    fromState, 
    toState, 
    revenueImpact = 0 
  } = body;

  if (!organizationId || !conversionType || !fromState || !toState) {
    return badReq('Missing required fields: organizationId, conversionType, fromState, toState');
  }

  console.log('🎉 [CUSTOMER_SUCCESS] Recording conversion:', { organizationId, conversionType });

  const { data, error } = await supabase.rpc('record_conversion_event', {
    p_organization_id: organizationId,
    p_user_id: userId,
    p_conversion_type: conversionType,
    p_from_state: fromState,
    p_to_state: toState,
    p_revenue_impact: revenueImpact
  });

  if (error) {
    console.error('❌ [CUSTOMER_SUCCESS] Record conversion error:', error);
    return badReq('Failed to record conversion', 500);
  }

  return ok({ message: 'Conversion recorded successfully', conversionId: data });
}

// Auto-enroll trial customers
async function autoEnrollTrials() {
  console.log('🔄 [CUSTOMER_SUCCESS] Auto-enrolling trial customers');

  // Get trial workflow
  const { data: workflow } = await supabase
    .from('onboarding_workflows')
    .select('id')
    .eq('target_plan', 'trial')
    .eq('is_active', true)
    .eq('auto_enroll', true)
    .single();

  if (!workflow) {
    return ok({ message: 'No active trial workflow found', enrolled: 0 });
  }

  // Get trial organizations not yet enrolled
  const { data: trialOrgs } = await supabase
    .from('organizations')
    .select('id, owner_id')
    .eq('subscription_status', 'trial')
    .not('id', 'in', 
      `(${`SELECT organization_id FROM customer_workflow_enrollments WHERE workflow_id = '${workflow.id}'`})`
    );

  let enrolled = 0;
  for (const org of trialOrgs || []) {
    try {
      await supabase.rpc('enroll_customer_in_workflow', {
        p_organization_id: org.id,
        p_user_id: org.owner_id,
        p_workflow_id: workflow.id,
        p_enrollment_source: 'automatic'
      });
      enrolled++;
    } catch (err) {
      console.error('Failed to enroll organization:', org.id, err);
    }
  }

  return ok({ message: 'Auto-enrollment completed', enrolled });
}

// Process scheduled workflow steps
async function processScheduledSteps() {
  console.log('⚡ [CUSTOMER_SUCCESS] Processing scheduled steps');

  const { data: pendingSteps } = await supabase
    .from('workflow_step_executions')
    .select('id')
    .eq('status', 'pending')
    .lte('scheduled_at', new Date().toISOString())
    .limit(50);

  let processed = 0;
  for (const step of pendingSteps || []) {
    try {
      await supabase.rpc('execute_workflow_step', {
        p_execution_id: step.id
      });
      processed++;
    } catch (err) {
      console.error('Failed to execute step:', step.id, err);
    }
  }

  return ok({ message: 'Scheduled steps processed', processed });
}

// Update workflow configuration
async function updateWorkflow(body: any) {
  const { workflowId, updates } = body;

  if (!workflowId || !updates) {
    return badReq('Missing required fields: workflowId, updates');
  }

  console.log('⚙️ [CUSTOMER_SUCCESS] Updating workflow:', { workflowId });

  const { data, error } = await supabase
    .from('onboarding_workflows')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', workflowId)
    .select();

  if (error) {
    console.error('❌ [CUSTOMER_SUCCESS] Update workflow error:', error);
    return badReq('Failed to update workflow', 500);
  }

  return ok({ message: 'Workflow updated successfully', workflow: data[0] });
}

// Update workflow step
async function updateWorkflowStep(body: any) {
  const { stepId, updates } = body;

  if (!stepId || !updates) {
    return badReq('Missing required fields: stepId, updates');
  }

  console.log('⚙️ [CUSTOMER_SUCCESS] Updating workflow step:', { stepId });

  const { data, error } = await supabase
    .from('workflow_steps')
    .update(updates)
    .eq('id', stepId)
    .select();

  if (error) {
    console.error('❌ [CUSTOMER_SUCCESS] Update step error:', error);
    return badReq('Failed to update workflow step', 500);
  }

  return ok({ message: 'Workflow step updated successfully', step: data[0] });
}