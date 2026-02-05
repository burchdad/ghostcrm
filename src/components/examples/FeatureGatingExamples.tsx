/**
 * FEATURE GATING EXAMPLES
 * Example components showing how to use the feature gating system
 */

'use client';

import React from 'react';
import { 
  FeatureGate, 
  PlanGate, 
  UsageLimit, 
  FeatureToggle, 
  SubscriptionStatus,
  UpgradePrompt 
} from '@/components/FeatureGate';
import { useFeatureAccess, useFeatureUsage } from '@/hooks/useFeatureAccess';
import { FeatureId } from '@/lib/features/definitions';

interface ExampleComponentProps {
  tenantId: string;
}

/**
 * Example: Basic Feature Gating
 */
export function BasicFeatureExample({ tenantId }: ExampleComponentProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Basic Feature Examples</h2>
      
      {/* Simple feature toggle */}
      <FeatureToggle 
        featureId="advanced_reporting" 
        tenantId={tenantId}
        fallback={<p className="text-gray-500">Advanced reporting not available</p>}
      >
        <div className="p-4 bg-blue-50 border border-blue-200 rounded">
          <h3 className="font-semibold">Advanced Reports</h3>
          <p>This content is only visible if the user has access to advanced reporting.</p>
        </div>
      </FeatureToggle>

      {/* Feature gate with loading and error states */}
      <FeatureGate
        featureId="ai_insights"
        tenantId={tenantId}
        loadingComponent={<div className="animate-pulse bg-gray-200 h-20 rounded"></div>}
        fallback={<p className="text-gray-500">AI Assistant requires a higher plan</p>}
        showUpgrade={true}
        upgradeComponent={
          <UpgradePrompt 
            featureId="ai_insights"
            requiredPlan="Professional"
            onUpgradeClick={() => window.location.href = '/marketing/pricing'}
          />
        }
      >
        <div className="p-4 bg-green-50 border border-green-200 rounded">
          <h3 className="font-semibold">AI Assistant</h3>
          <p>Ask me anything about your CRM data!</p>
          <button className="mt-2 bg-green-600 text-white px-4 py-2 rounded">
            Start Chat
          </button>
        </div>
      </FeatureGate>
    </div>
  );
}

/**
 * Example: Plan-Based Gating
 */
export function PlanGatingExample({ tenantId }: ExampleComponentProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Plan-Based Examples</h2>
      
      {/* Professional plan required */}
      <PlanGate
        requiredPlan="professional"
        tenantId={tenantId}
        showUpgrade={true}
        fallback={<p className="text-gray-500">This feature requires Professional plan</p>}
      >
        <div className="p-4 bg-purple-50 border border-purple-200 rounded">
          <h3 className="font-semibold">Professional Features</h3>
          <p>Advanced pipeline management, custom fields, and more!</p>
        </div>
      </PlanGate>

      {/* Enterprise plan required */}
      <PlanGate
        requiredPlan="enterprise"
        tenantId={tenantId}
        showUpgrade={true}
      >
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h3 className="font-semibold">Enterprise Features</h3>
          <p>SSO, advanced security, white-labeling, and premium support.</p>
        </div>
      </PlanGate>
    </div>
  );
}

/**
 * Example: Usage Limits
 */
export function UsageLimitExample({ tenantId }: ExampleComponentProps) {
  const { trackUsage } = useFeatureUsage('contacts_management', tenantId);

  const handleAddContact = async () => {
    try {
      await trackUsage();
      // Add contact logic here
      console.log('Contact added and usage tracked');
    } catch (error) {
      console.error('Failed to track usage:', error);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Usage Limit Examples</h2>
      
      {/* Contact limit example */}
      <UsageLimit
        featureId="contacts_management"
        tenantId={tenantId}
        warningThreshold={90}
        warningComponent={
          <div className="mb-2 p-2 border border-orange-200 bg-orange-50 rounded text-sm">
            <span className="text-orange-800">
              ⚠️ You&apos;re approaching your contact limit. Consider upgrading.
            </span>
          </div>
        }
        limitReachedComponent={
          <UpgradePrompt 
            customMessage="You've reached your contact limit. Upgrade to add more contacts."
            onUpgradeClick={() => window.location.href = '/marketing/pricing'}
          />
        }
      >
        <div className="p-4 bg-blue-50 border border-blue-200 rounded">
          <h3 className="font-semibold">Add New Contact</h3>
          <p className="mb-3">Create a new contact in your CRM.</p>
          <button 
            onClick={handleAddContact}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Contact
          </button>
        </div>
      </UsageLimit>

      {/* API usage example */}
      <UsageLimit
        featureId="api_access"
        tenantId={tenantId}
        warningThreshold={80}
      >
        <div className="p-4 bg-gray-50 border border-gray-200 rounded">
          <h3 className="font-semibold">API Access</h3>
          <p>Make API calls to integrate with other systems.</p>
        </div>
      </UsageLimit>
    </div>
  );
}

/**
 * Example: Navigation Menu with Feature Gating
 */
export function NavigationExample({ tenantId }: ExampleComponentProps) {
  const menuItems = [
    { 
      label: 'Dashboard', 
      href: '/dashboard', 
      featureId: null 
    },
    { 
      label: 'Advanced Reports', 
      href: '/reports/advanced', 
      featureId: 'advanced_reporting' as const 
    },
    { 
      label: 'AI Assistant', 
      href: '/ai', 
      featureId: 'ai_insights' as const 
    },
    { 
      label: 'API Access', 
      href: '/api', 
      featureId: 'api_access' as const 
    },
    { 
      label: 'White Label', 
      href: '/branding', 
      featureId: 'custom_branding' as const 
    }
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Navigation with Feature Gating</h2>
      
      <nav className="bg-white border border-gray-200 rounded-lg p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.label}>
              {item.featureId ? (
                <FeatureToggle
                  featureId={item.featureId}
                  tenantId={tenantId}
                  fallback={
                    <span className="text-gray-400 cursor-not-allowed">
                      {item.label} (Locked)
                    </span>
                  }
                >
                  <a 
                    href={item.href}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {item.label}
                  </a>
                </FeatureToggle>
              ) : (
                <a 
                  href={item.href}
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {item.label}
                </a>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

/**
 * Example: Subscription Status Dashboard
 */
export function SubscriptionDashboard({ tenantId }: ExampleComponentProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Subscription Dashboard</h2>
      
      <SubscriptionStatus tenantId={tenantId} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FeatureStatusCard featureId="advanced_reporting" tenantId={tenantId} />
        <FeatureStatusCard featureId="ai_insights" tenantId={tenantId} />
        <FeatureStatusCard featureId="api_access" tenantId={tenantId} />
        <FeatureStatusCard featureId="custom_branding" tenantId={tenantId} />
      </div>
    </div>
  );
}

/**
 * Individual feature status card
 */
function FeatureStatusCard({ 
  featureId, 
  tenantId 
}: { 
  featureId: 'advanced_reporting' | 'ai_insights' | 'api_access' | 'custom_branding';
  tenantId: string;
}) {
  const { hasAccess, usageCount, usageLimit, isLoading } = useFeatureAccess(featureId, tenantId);

  if (isLoading) {
    return (
      <div className="p-4 border rounded-lg animate-pulse">
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-3 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className={`p-4 border rounded-lg ${hasAccess ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium capitalize">
          {featureId.replace(/_/g, ' ')}
        </h3>
        <span className={`px-2 py-1 text-xs rounded ${
          hasAccess ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {hasAccess ? 'Active' : 'Locked'}
        </span>
      </div>
      
      {hasAccess && usageLimit && (
        <div className="text-sm text-gray-600">
          Usage: {usageCount || 0} / {usageLimit === -1 ? 'Unlimited' : usageLimit}
        </div>
      )}
    </div>
  );
}

/**
 * Complete Feature Gating Demo
 */
export function FeatureGatingDemo({ tenantId }: ExampleComponentProps) {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Feature Gating System Demo</h1>
      
      <BasicFeatureExample tenantId={tenantId} />
      <PlanGatingExample tenantId={tenantId} />
      <UsageLimitExample tenantId={tenantId} />
      <NavigationExample tenantId={tenantId} />
      <SubscriptionDashboard tenantId={tenantId} />
    </div>
  );
}