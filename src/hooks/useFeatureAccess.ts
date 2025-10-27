/**
 * FEATURE ACCESS HOOKS
 * React hooks for checking feature permissions and subscription status
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { FeatureId } from '@/lib/features/definitions';
import { createClient } from '@/utils/supabase/client';

export interface FeatureAccessData {
  hasAccess: boolean;
  usageCount?: number;
  usageLimit?: number;
  isLoading: boolean;
  error?: string;
}

export interface SubscriptionData {
  planId?: string;
  status?: 'active' | 'trial' | 'cancelled' | 'past_due' | 'inactive';
  addOnFeatures: FeatureId[];
  isLoading: boolean;
  error?: string;
}

/**
 * Hook to check if user has access to a specific feature
 */
export function useFeatureAccess(featureId: FeatureId, tenantId?: string): FeatureAccessData {
  const [data, setData] = useState<FeatureAccessData>({
    hasAccess: false,
    isLoading: true
  });

  const checkAccess = useCallback(async () => {
    if (!tenantId) {
      setData({ hasAccess: false, isLoading: false, error: 'No tenant ID provided' });
      return;
    }

    try {
      const response = await fetch(`/api/features/check?tenantId=${tenantId}&featureId=${featureId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      setData({
        hasAccess: result.hasAccess,
        usageCount: result.usageCount,
        usageLimit: result.usageLimit,
        isLoading: false
      });
    } catch (error) {
      console.error('Feature access check failed:', error);
      setData({
        hasAccess: false,
        isLoading: false,
        error: (error as Error).message
      });
    }
  }, [featureId, tenantId]);

  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  return data;
}

/**
 * Hook to get current subscription data
 */
export function useSubscription(tenantId?: string): SubscriptionData {
  const [data, setData] = useState<SubscriptionData>({
    addOnFeatures: [],
    isLoading: true
  });

  const fetchSubscription = useCallback(async () => {
    if (!tenantId) {
      setData({ 
        addOnFeatures: [], 
        isLoading: false, 
        error: 'No tenant ID provided' 
      });
      return;
    }

    try {
      const supabase = createClient();
      
      const { data: subscription, error } = await supabase
        .from('tenant_subscriptions')
        .select(`
          plan_id,
          status,
          add_on_features,
          trial_end,
          billing_cycle
        `)
        .eq('tenant_id', tenantId)
        .single();

      if (error) {
        throw error;
      }

      setData({
        planId: subscription?.plan_id,
        status: subscription?.status,
        addOnFeatures: subscription?.add_on_features || [],
        isLoading: false
      });
    } catch (error) {
      console.error('Subscription fetch failed:', error);
      setData({
        addOnFeatures: [],
        isLoading: false,
        error: (error as Error).message
      });
    }
  }, [tenantId]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  return data;
}

/**
 * Hook to check multiple features at once
 */
export function useMultipleFeatureAccess(
  featureIds: FeatureId[], 
  tenantId?: string
): Partial<Record<FeatureId, FeatureAccessData>> {
  const [data, setData] = useState<Partial<Record<FeatureId, FeatureAccessData>>>({});

  const checkMultipleAccess = useCallback(async () => {
    if (!tenantId || featureIds.length === 0) {
      const emptyData: Partial<Record<FeatureId, FeatureAccessData>> = {};
      featureIds.forEach(featureId => {
        emptyData[featureId] = {
          hasAccess: false,
          isLoading: false,
          error: 'No tenant ID provided'
        };
      });
      setData(emptyData);
      return;
    }

    try {
      const promises = featureIds.map(async (featureId) => {
        const response = await fetch(`/api/features/check?tenantId=${tenantId}&featureId=${featureId}`);
        const result = await response.json();
        return { featureId, result };
      });

      const results = await Promise.all(promises);
      const newData: Partial<Record<FeatureId, FeatureAccessData>> = {};

      results.forEach(({ featureId, result }) => {
        newData[featureId] = {
          hasAccess: result.hasAccess,
          usageCount: result.usageCount,
          usageLimit: result.usageLimit,
          isLoading: false
        };
      });

      setData(newData);
    } catch (error) {
      console.error('Multiple feature access check failed:', error);
      const errorData: Partial<Record<FeatureId, FeatureAccessData>> = {};
      featureIds.forEach(featureId => {
        errorData[featureId] = {
          hasAccess: false,
          isLoading: false,
          error: (error as Error).message
        };
      });
      setData(errorData);
    }
  }, [featureIds, tenantId]);

  useEffect(() => {
    checkMultipleAccess();
  }, [checkMultipleAccess]);

  return data;
}

/**
 * Hook for usage tracking
 */
export function useFeatureUsage(featureId: FeatureId, tenantId?: string) {
  const trackUsage = useCallback(async () => {
    if (!tenantId) {
      throw new Error('No tenant ID provided');
    }

    try {
      const response = await fetch('/api/features/track-usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenantId,
          featureId,
          amount: 1
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Usage tracking failed:', error);
      throw error;
    }
  }, [featureId, tenantId]);

  return { trackUsage };
}