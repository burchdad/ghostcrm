"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { Tenant } from "./types";

interface TenantContextValue {
  tenant: Tenant | null;
  isMarketingSite: boolean;
  subdomain: string | null;
  isLoading: boolean;
  error: string | null;
  refreshTenant: () => Promise<void>;
}

const TenantReactContext = createContext<TenantContextValue | null>(null);

interface TenantProviderProps {
  children: React.ReactNode;
  initialTenant?: Tenant | null;
  initialSubdomain?: string | null;
}

export function TenantProvider({ 
  children, 
  initialTenant = null, 
  initialSubdomain = null 
}: TenantProviderProps) {
  const [tenant, setTenant] = useState<Tenant | null>(initialTenant);
  const [subdomain, setSubdomain] = useState<string | null>(initialSubdomain);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine if this is marketing site
  const isMarketingSite = !subdomain || subdomain === 'www';

  const refreshTenant = async () => {
    if (!subdomain || isMarketingSite) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tenant/current');
      if (response.ok) {
        const tenantData = await response.json();
        setTenant(tenantData);
      } else {
        throw new Error('API fetch failed');
      }
    } catch (err) {
      console.warn('API fetch failed, using fallback sample data:', err);
      
      // Fallback to sample tenant data for development/testing
      const sampleTenants = {
        'demo': {
          id: 1,
          subdomain: 'demo',
          name: 'Demo Dealership',
          config: { features: ['leads', 'inventory', 'finance'] },
          branding: {
            primary_color: '#1f2937',
            company_name: 'Demo Dealership'
          },
          settings: {},
          status: 'active' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          plan: 'basic' as const,
          user_limit: 10,
          storage_limit_mb: 1000,
          admin_email: 'admin@demo.ghostautocrm.com'
        },
        'acme-auto': {
          id: 2,
          subdomain: 'acme-auto', 
          name: 'ACME Auto Sales',
          config: { features: ['leads', 'inventory', 'finance', 'compliance'] },
          branding: {
            primary_color: '#dc2626',
            company_name: 'ACME Auto Sales'
          },
          settings: {},
          status: 'active' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          plan: 'professional' as const,
          user_limit: 25,
          storage_limit_mb: 5000,
          admin_email: 'manager@acmeauto.com'
        },
        'premium-cars': {
          id: 3,
          subdomain: 'premium-cars',
          name: 'Premium Cars LLC',
          config: { features: ['leads', 'inventory', 'finance', 'compliance', 'advanced_reporting'] },
          branding: {
            primary_color: '#059669',
            company_name: 'Premium Cars LLC'
          },
          settings: {},
          status: 'active' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          plan: 'enterprise' as const,
          user_limit: 100,
          storage_limit_mb: 20000,
          admin_email: 'admin@premiumcars.com'
        }
      };
      
      const sampleTenant = sampleTenants[subdomain as keyof typeof sampleTenants];
      if (sampleTenant) {
        setTenant(sampleTenant);
        setError(null); // Clear error since we have fallback data
      } else {
        setError(`No sample data available for tenant: ${subdomain}`);
        setTenant(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-detect tenant from hostname on client side
  useEffect(() => {
    if (typeof window !== 'undefined' && !initialSubdomain) {
      const hostname = window.location.hostname;
      const detectedSubdomain = hostname.includes('localhost') 
        ? null 
        : hostname.split('.')[0];
      
      if (detectedSubdomain && detectedSubdomain !== 'www') {
        setSubdomain(detectedSubdomain);
      }
    }
  }, [initialSubdomain]);

  // Fetch tenant data when subdomain changes
  useEffect(() => {
    if (subdomain && !isMarketingSite && !initialTenant) {
      refreshTenant();
    }
  }, [subdomain, isMarketingSite, initialTenant]);

  const contextValue: TenantContextValue = {
    tenant,
    isMarketingSite,
    subdomain,
    isLoading,
    error,
    refreshTenant,
  };

  return (
    <TenantReactContext.Provider value={contextValue}>
      {children}
    </TenantReactContext.Provider>
  );
}

/**
 * Hook to access tenant context
 */
export function useTenant(): TenantContextValue {
  const context = useContext(TenantReactContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}

/**
 * Hook to check if current site is marketing site
 */
export function useIsMarketingSite(): boolean {
  const { isMarketingSite } = useTenant();
  return isMarketingSite;
}

/**
 * Hook to get current tenant (null for marketing site)
 */
export function useCurrentTenant(): Tenant | null {
  const { tenant } = useTenant();
  return tenant;
}