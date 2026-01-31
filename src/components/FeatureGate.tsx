/**
 * FEATURE GATE COMPONENTS
 * React components for conditional rendering based on feature access
 */

'use client';

import React, { ReactNode } from 'react';
import { FeatureId } from '@/lib/features/definitions';
import { useFeatureAccess, useSubscription } from '@/hooks/useFeatureAccess';

interface FeatureGateProps {
  featureId: FeatureId;
  tenantId: string;
  children: ReactNode;
  fallback?: ReactNode;
  loadingComponent?: ReactNode;
  showUpgrade?: boolean;
  upgradeComponent?: ReactNode;
}

interface PlanGateProps {
  requiredPlan: 'starter' | 'professional' | 'business' | 'enterprise';
  tenantId: string;
  children: ReactNode;
  fallback?: ReactNode;
  loadingComponent?: ReactNode;
  showUpgrade?: boolean;
}

interface UsageLimitProps {
  featureId: FeatureId;
  tenantId: string;
  children: ReactNode;
  warningThreshold?: number; // Show warning when this percentage of limit is reached
  warningComponent?: ReactNode;
  limitReachedComponent?: ReactNode;
}

/**
 * FeatureGate Component
 * Conditionally renders children based on feature access
 */
export function FeatureGate({
  featureId,
  tenantId,
  children,
  fallback = null,
  loadingComponent = <div>Loading...</div>,
  showUpgrade = false,
  upgradeComponent
}: FeatureGateProps) {
  const { hasAccess, isLoading, error } = useFeatureAccess(featureId, tenantId);

  if (isLoading) {
    return <>{loadingComponent}</>;
  }

  if (error) {
    console.error(`FeatureGate error for ${featureId}:`, error);
    return <>{fallback}</>;
  }

  if (!hasAccess) {
    if (showUpgrade && upgradeComponent) {
      return <>{upgradeComponent}</>;
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * PlanGate Component
 * Conditionally renders children based on subscription plan level
 */
export function PlanGate({
  requiredPlan,
  tenantId,
  children,
  fallback = null,
  loadingComponent = <div>Loading...</div>,
  showUpgrade = false
}: PlanGateProps) {
  const { planId, status, isLoading, error } = useSubscription(tenantId);

  const planHierarchy = {
    starter: 1,
    professional: 2,
    business: 3,
    enterprise: 4
  };

  if (isLoading) {
    return <>{loadingComponent}</>;
  }

  if (error || !planId || status !== 'active') {
    if (showUpgrade) {
      return (
        <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
          <h3 className="font-semibold text-yellow-800">Upgrade Required</h3>
          <p className="text-yellow-700">
            This feature requires a {requiredPlan} plan or higher.
          </p>
        </div>
      );
    }
    return <>{fallback}</>;
  }

  const currentPlanLevel = planHierarchy[planId as keyof typeof planHierarchy] || 0;
  const requiredPlanLevel = planHierarchy[requiredPlan];

  if (currentPlanLevel < requiredPlanLevel) {
    if (showUpgrade) {
      return (
        <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800">Upgrade Required</h3>
          <p className="text-blue-700">
            This feature requires a {requiredPlan} plan or higher.
            You&apos;re currently on the {planId} plan.
          </p>
        </div>
      );
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * UsageLimit Component
 * Shows usage information and warnings for features with limits
 */
export function UsageLimit({
  featureId,
  tenantId,
  children,
  warningThreshold = 80,
  warningComponent,
  limitReachedComponent
}: UsageLimitProps) {
  const { hasAccess, usageCount = 0, usageLimit, isLoading } = useFeatureAccess(featureId, tenantId);

  if (isLoading || !hasAccess || !usageLimit) {
    return <>{children}</>;
  }

  const usagePercentage = (usageCount / usageLimit) * 100;

  // Limit reached
  if (usageCount >= usageLimit) {
    if (limitReachedComponent) {
      return <>{limitReachedComponent}</>;
    }
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
        <h3 className="font-semibold text-red-800">Usage Limit Reached</h3>
        <p className="text-red-700">
          You&apos;ve reached your limit of {usageLimit} for this feature.
          Please upgrade your plan to continue.
        </p>
      </div>
    );
  }

  // Show warning
  if (usagePercentage >= warningThreshold) {
    return (
      <>
        {warningComponent || (
          <div className="mb-2 p-2 border border-yellow-200 bg-yellow-50 rounded text-sm">
            <span className="text-yellow-800">
              Usage: {usageCount}/{usageLimit} ({Math.round(usagePercentage)}%)
            </span>
          </div>
        )}
        {children}
      </>
    );
  }

  return <>{children}</>;
}

/**
 * FeatureToggle Component
 * Simple toggle for showing/hiding content based on feature access
 */
export function FeatureToggle({
  featureId,
  tenantId,
  children,
  fallback = null
}: {
  featureId: FeatureId;
  tenantId: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { hasAccess, isLoading } = useFeatureAccess(featureId, tenantId);

  if (isLoading) {
    return null;
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

/**
 * SubscriptionStatus Component
 * Shows current subscription information
 */
export function SubscriptionStatus({ tenantId }: { tenantId: string }) {
  const { planId, status, addOnFeatures, isLoading, error } = useSubscription(tenantId);

  if (isLoading) {
    return <div>Loading subscription...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error loading subscription: {error}</div>;
  }

  const statusColors = {
    active: 'text-green-600 bg-green-100',
    trial: 'text-blue-600 bg-blue-100',
    cancelled: 'text-red-600 bg-red-100',
    past_due: 'text-yellow-600 bg-yellow-100',
    inactive: 'text-gray-600 bg-gray-100'
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-semibold mb-2">Subscription Status</h3>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">Plan:</span>
          <span className="capitalize">{planId || 'No Plan'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium">Status:</span>
          <span 
            className={`px-2 py-1 rounded text-xs capitalize ${
              statusColors[status as keyof typeof statusColors] || statusColors.inactive
            }`}
          >
            {status || 'Unknown'}
          </span>
        </div>
        {addOnFeatures.length > 0 && (
          <div>
            <span className="font-medium">Add-ons:</span>
            <div className="mt-1 space-y-1">
              {addOnFeatures.map(feature => (
                <span 
                  key={feature}
                  className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded mr-1"
                >
                  {feature.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * UpgradePrompt Component
 * Reusable upgrade prompt for features
 */
export function UpgradePrompt({
  featureId,
  requiredPlan,
  customMessage,
  onUpgradeClick
}: {
  featureId?: FeatureId;
  requiredPlan?: string;
  customMessage?: string;
  onUpgradeClick?: () => void;
}) {
  const defaultMessage = requiredPlan 
    ? `This feature requires a ${requiredPlan} plan or higher.`
    : 'This feature is not available in your current plan.';

  return (
    <div className="p-6 border border-gray-200 rounded-lg bg-gray-50 text-center">
      <div className="mb-4">
        <svg 
          className="mx-auto h-12 w-12 text-gray-400" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Feature Locked
      </h3>
      <p className="text-gray-600 mb-4">
        {customMessage || defaultMessage}
      </p>
      <button
        onClick={onUpgradeClick}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        Upgrade Plan
      </button>
    </div>
  );
}