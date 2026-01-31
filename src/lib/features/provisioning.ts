/**
 * FEATURE PROVISIONING SYSTEM
 * Handles automatic feature activation/deactivation based on subscription changes
 */

import { createSupabaseServer } from '@/utils/supabase/server';
import { PlanId } from '@/lib/features/pricing';
import { FeatureId } from '@/lib/features/definitions';

export interface ProvisioningContext {
  tenantId: string;
  subscriptionId: string;
  planId: PlanId;
  previousPlanId?: PlanId;
  addOnFeatures: FeatureId[];
  billingCycle: 'monthly' | 'yearly';
  status: 'active' | 'trial' | 'cancelled' | 'past_due' | 'inactive';
  metadata?: Record<string, any>;
}

export interface ProvisioningResult {
  success: boolean;
  featuresActivated: FeatureId[];
  featuresDeactivated: FeatureId[];
  limitsUpdated: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Main feature provisioning orchestrator
 */
export class FeatureProvisioner {
  private supabase: any;

  constructor() {
    // Don't initialize in constructor - will be done in methods
  }

  private async ensureSupabase() {
    if (!this.supabase) {
      this.supabase = await createSupabaseServer();
    }
    return this.supabase;
  }

  /**
   * Provision features for new subscription
   */
  async provisionNewSubscription(context: ProvisioningContext): Promise<ProvisioningResult> {
    const result: ProvisioningResult = {
      success: false,
      featuresActivated: [],
      featuresDeactivated: [],
      limitsUpdated: false,
      errors: [],
      warnings: []
    };

    try {
      // Ensure Supabase is initialized
      const supabase = await this.ensureSupabase();
      
      // 1. Activate subscription using stored procedure
      const { error: activationError } = await supabase.rpc(
        'activate_subscription',
        {
          p_tenant_id: context.tenantId,
          p_plan_id: context.planId,
          p_billing_cycle: context.billingCycle,
          p_add_on_features: context.addOnFeatures
        }
      );

      if (activationError) {
        result.errors.push(`Failed to activate subscription: ${activationError.message}`);
        return result;
      }

      // 2. Get the features that were activated
      const { data: subscription } = await supabase
        .from('tenant_subscriptions')
        .select('enabled_features, add_on_features')
        .eq('tenant_id', context.tenantId)
        .single();

      if (subscription) {
        result.featuresActivated = [
          ...(subscription.enabled_features || []),
          ...(subscription.add_on_features || [])
        ];
      }

      // 3. Perform post-activation tasks
      await this.executePostActivationTasks(context);

      // 4. Log provisioning event
      await this.logProvisioningEvent(context, 'subscription_provisioned', result);

      result.success = true;
      result.limitsUpdated = true;

    } catch (error) {
      const message = (error as Error)?.message || 'Unknown error';
      result.errors.push(`Provisioning failed: ${message}`);
      console.error('Feature provisioning error:', error);
    }

    return result;
  }

  /**
   * Update features for subscription changes
   */
  async updateSubscriptionFeatures(context: ProvisioningContext): Promise<ProvisioningResult> {
    const result: ProvisioningResult = {
      success: false,
      featuresActivated: [],
      featuresDeactivated: [],
      limitsUpdated: false,
      errors: [],
      warnings: []
    };

    try {
      // Ensure Supabase is initialized
      const supabase = await this.ensureSupabase();
      
      // 1. Get current subscription state
      const { data: currentSub } = await supabase
        .from('tenant_subscriptions')
        .select('enabled_features, add_on_features, plan_id')
        .eq('tenant_id', context.tenantId)
        .single();

      if (!currentSub) {
        result.errors.push('Current subscription not found');
        return result;
      }

      const currentFeatures = [
        ...(currentSub.enabled_features || []),
        ...(currentSub.add_on_features || [])
      ];

      // 2. Update subscription with new plan/features
      const { error: updateError } = await supabase.rpc(
        'activate_subscription',
        {
          p_tenant_id: context.tenantId,
          p_plan_id: context.planId,
          p_billing_cycle: context.billingCycle,
          p_add_on_features: context.addOnFeatures
        }
      );

      if (updateError) {
        result.errors.push(`Failed to update subscription: ${updateError.message}`);
        return result;
      }

      // 3. Calculate feature changes
      const { data: updatedSub } = await supabase
        .from('tenant_subscriptions')
        .select('enabled_features, add_on_features')
        .eq('tenant_id', context.tenantId)
        .single();

      if (updatedSub) {
        const newFeatures = [
          ...(updatedSub.enabled_features || []),
          ...(updatedSub.add_on_features || [])
        ];

        result.featuresActivated = newFeatures.filter(f => !currentFeatures.includes(f));
        result.featuresDeactivated = currentFeatures.filter(f => !newFeatures.includes(f));
      }

      // 4. Handle feature-specific provisioning
      await this.handleFeatureSpecificProvisioning(
        result.featuresActivated,
        result.featuresDeactivated,
        context
      );

      // 5. Log provisioning event
      await this.logProvisioningEvent(context, 'subscription_updated', result);

      result.success = true;
      result.limitsUpdated = true;

    } catch (error) {
      const message = (error as Error)?.message || 'Unknown error';
      result.errors.push(`Update failed: ${message}`);
      console.error('Feature update error:', error);
    }

    return result;
  }

  /**
   * Suspend features for cancelled/past due subscriptions
   */
  async suspendSubscriptionFeatures(context: ProvisioningContext): Promise<ProvisioningResult> {
    const result: ProvisioningResult = {
      success: false,
      featuresActivated: [],
      featuresDeactivated: [],
      limitsUpdated: false,
      errors: [],
      warnings: []
    };

    try {
      // Ensure Supabase is initialized
      const supabase = await this.ensureSupabase();
      
      // 1. Get current features
      const { data: currentSub } = await supabase
        .from('tenant_subscriptions')
        .select('enabled_features, add_on_features')
        .eq('tenant_id', context.tenantId)
        .single();

      if (currentSub) {
        result.featuresDeactivated = [
          ...(currentSub.enabled_features || []),
          ...(currentSub.add_on_features || [])
        ];
      }

      // 2. Keep only core features for suspended accounts
      const coreFeatures = [
        'contacts_management',
        'basic_leads',
        'basic_deals',
        'task_management',
        'basic_reporting'
      ];

      // 3. Update subscription status and features
      const { error: suspendError } = await supabase
        .from('tenant_subscriptions')
        .update({
          status: context.status,
          enabled_features: coreFeatures,
          add_on_features: [],
          updated_at: new Date().toISOString()
        })
        .eq('tenant_id', context.tenantId);

      if (suspendError) {
        result.errors.push(`Failed to suspend subscription: ${suspendError.message}`);
        return result;
      }

      // 4. Disable integrations and scheduled tasks
      await this.disableIntegrationsAndTasks(context.tenantId);

      // 5. Log suspension event
      await this.logProvisioningEvent(context, 'subscription_suspended', result);

      result.success = true;
      result.limitsUpdated = true;
      result.warnings.push('Account suspended - only core features available');

    } catch (error) {
      const message = (error as Error)?.message || 'Unknown error';
      result.errors.push(`Suspension failed: ${message}`);
      console.error('Feature suspension error:', error);
    }

    return result;
  }

  /**
   * Execute post-activation tasks (setup, initialization, etc.)
   */
  private async executePostActivationTasks(context: ProvisioningContext): Promise<void> {
    try {
      // 1. Initialize default data structures
      await this.initializeDefaultData(context);

      // 2. Setup integrations if included
      await this.setupIncludedIntegrations(context);

      // 3. Configure default workflows
      await this.setupDefaultWorkflows(context);

      // 4. Send welcome notifications
      await this.sendWelcomeNotifications(context);

    } catch (error) {
      console.error('Post-activation tasks error:', error);
      // Don't throw - these are nice-to-have tasks
    }
  }

  /**
   * Handle feature-specific provisioning logic
   */
  private async handleFeatureSpecificProvisioning(
    activated: FeatureId[],
    deactivated: FeatureId[],
    context: ProvisioningContext
  ): Promise<void> {
    // Handle activated features
    for (const featureId of activated) {
      switch (featureId) {
        case 'email_campaigns':
          await this.setupEmailCampaignInfrastructure(context.tenantId);
          break;
        case 'workflow_automation':
          await this.setupWorkflowEngine(context.tenantId);
          break;
        case 'api_access':
          await this.generateApiCredentials(context.tenantId);
          break;
        case 'custom_branding':
          await this.initializeBrandingSettings(context.tenantId);
          break;
        case 'sso_authentication':
          await this.setupSSOConfiguration(context.tenantId);
          break;
        // Add more feature-specific setup as needed
      }
    }

    // Handle deactivated features
    for (const featureId of deactivated) {
      switch (featureId) {
        case 'email_campaigns':
          await this.pauseEmailCampaigns(context.tenantId);
          break;
        case 'workflow_automation':
          await this.pauseWorkflows(context.tenantId);
          break;
        case 'api_access':
          await this.revokeApiCredentials(context.tenantId);
          break;
        // Add more feature-specific cleanup as needed
      }
    }
  }

  /**
   * Initialize default data for new subscriptions
   */
  private async initializeDefaultData(context: ProvisioningContext): Promise<void> {
    // Create default pipeline stages, custom fields, etc.
    // This would be specific to your application's data model
  }

  /**
   * Setup included integrations
   */
  private async setupIncludedIntegrations(context: ProvisioningContext): Promise<void> {
    // Setup default integrations based on plan
    // E.g., email integration for professional+ plans
  }

  /**
   * Setup default workflows
   */
  private async setupDefaultWorkflows(context: ProvisioningContext): Promise<void> {
    // Create template workflows based on plan
  }

  /**
   * Send welcome notifications
   */
  private async sendWelcomeNotifications(context: ProvisioningContext): Promise<void> {
    // Send onboarding emails, in-app notifications, etc.
  }

  /**
   * Feature-specific setup methods
   */
  private async setupEmailCampaignInfrastructure(tenantId: string): Promise<void> {
    // Initialize email campaign settings, templates, etc.
  }

  private async setupWorkflowEngine(tenantId: string): Promise<void> {
    // Initialize workflow engine, create default triggers, etc.
  }

  private async generateApiCredentials(tenantId: string): Promise<void> {
    // Generate API keys, setup rate limiting, etc.
  }

  private async initializeBrandingSettings(tenantId: string): Promise<void> {
    // Create default branding configuration
  }

  private async setupSSOConfiguration(tenantId: string): Promise<void> {
    // Initialize SSO settings, create SAML/OIDC configs, etc.
  }

  /**
   * Feature deactivation methods
   */
  private async pauseEmailCampaigns(tenantId: string): Promise<void> {
    // Pause active campaigns, prevent new ones
  }

  private async pauseWorkflows(tenantId: string): Promise<void> {
    // Pause active workflows, prevent new executions
  }

  private async revokeApiCredentials(tenantId: string): Promise<void> {
    // Revoke API keys, disable access
  }

  /**
   * Disable integrations and scheduled tasks for suspended accounts
   */
  private async disableIntegrationsAndTasks(tenantId: string): Promise<void> {
    // Disable all integrations, pause scheduled tasks
  }

  /**
   * Log provisioning events for audit trail
   */
  private async logProvisioningEvent(
    context: ProvisioningContext,
    eventType: string,
    result: ProvisioningResult
  ): Promise<void> {
    try {
      const supabase = await this.ensureSupabase();
      await supabase
        .from('billing_events')
        .insert({
          subscription_id: context.subscriptionId,
          event_type: eventType,
          description: `Feature provisioning: ${eventType}`,
          status: result.success ? 'processed' : 'failed',
          event_data: {
            tenant_id: context.tenantId,
            plan_id: context.planId,
            features_activated: result.featuresActivated,
            features_deactivated: result.featuresDeactivated,
            errors: result.errors,
            warnings: result.warnings
          }
        });
    } catch (error) {
      console.error('Failed to log provisioning event:', error);
    }
  }
}

/**
 * Utility functions for common provisioning tasks
 */
export async function provisionSubscription(context: ProvisioningContext): Promise<ProvisioningResult> {
  const provisioner = new FeatureProvisioner();
  return provisioner.provisionNewSubscription(context);
}

export async function updateSubscription(context: ProvisioningContext): Promise<ProvisioningResult> {
  const provisioner = new FeatureProvisioner();
  return provisioner.updateSubscriptionFeatures(context);
}

export async function suspendSubscription(context: ProvisioningContext): Promise<ProvisioningResult> {
  const provisioner = new FeatureProvisioner();
  return provisioner.suspendSubscriptionFeatures(context);
}

/**
 * Background job to check and update subscription statuses
 */
export async function processSubscriptionUpdates(): Promise<void> {
  const supabase = await createSupabaseServer();

  try {
    // Check for expired trials
    const { data: expiredTrials } = await supabase
      .from('tenant_subscriptions')
      .select('*')
      .eq('status', 'trial')
      .lt('trial_ends_at', new Date().toISOString());

    for (const subscription of expiredTrials || []) {
      await suspendSubscription({
        tenantId: subscription.tenant_id,
        subscriptionId: subscription.id,
        planId: subscription.plan_id,
        addOnFeatures: subscription.add_on_features || [],
        billingCycle: subscription.billing_cycle,
        status: 'inactive'
      });
    }

    // Check for past due subscriptions
    const { data: pastDueSubscriptions } = await supabase
      .from('tenant_subscriptions')
      .select('*')
      .eq('status', 'active')
      .lt('current_period_end', new Date().toISOString());

    for (const subscription of pastDueSubscriptions || []) {
      await suspendSubscription({
        tenantId: subscription.tenant_id,
        subscriptionId: subscription.id,
        planId: subscription.plan_id,
        addOnFeatures: subscription.add_on_features || [],
        billingCycle: subscription.billing_cycle,
        status: 'past_due'
      });
    }

  } catch (error) {
    console.error('Subscription update process error:', error);
  }
}