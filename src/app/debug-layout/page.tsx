"use client";
import React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { usePathname } from 'next/navigation';
import { useFloatingUI } from '@/contexts/floating-ui-context';

export default function DebugLayoutPage() {
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const { shouldShowFloatingButtons } = useFloatingUI();

  // Same role detection logic as in Sidebar.tsx (updated)
  const hasOrganizationContext = (user?.tenantId && user.tenantId.trim() !== '') || 
                                 (user?.organizationId && user.organizationId.trim() !== '');
  const isOnTenantOwnerPath = pathname.startsWith('/tenant-owner');
  const isKnownTenantOwner = user?.email === 'burchsl4@gmail.com';
  const isTenantOwnerByPath = isOnTenantOwnerPath || isKnownTenantOwner;
  
  // Role-based access determination - handle multiple role formats
  const isOwnerRole = user?.role === 'owner' || user?.role === 'tenant-owner';
  
  // Special case: if user has 'user' role but is on tenant-owner path with organization, treat as tenant owner
  const isUserOnTenantPath = user?.role === 'user' && isOnTenantOwnerPath && hasOrganizationContext;
  
  const isSoftwareOwner = isOwnerRole && !hasOrganizationContext && !isTenantOwnerByPath;
  const isTenantOwner = isOwnerRole || isUserOnTenantPath || (hasOrganizationContext && isTenantOwnerByPath);
  const isTenantAdmin = user?.role === 'admin' && hasOrganizationContext;
  const isSalesManager = user?.role === 'manager' && hasOrganizationContext;
  const isSalesRep = user?.role === 'sales_rep' && hasOrganizationContext;

  return (
    <div className="p-8 bg-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Debug Layout & Role Detection</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Current User</h2>
          <pre className="text-sm">{JSON.stringify(user, null, 2)}</pre>
        </div>

        <div className="bg-blue-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Path Information</h2>
          <p><strong>pathname:</strong> {pathname}</p>
          <p><strong>isOnTenantOwnerPath:</strong> {isOnTenantOwnerPath.toString()}</p>
        </div>

        <div className="bg-green-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Role Detection Logic</h2>
          <p><strong>hasOrganizationContext:</strong> {(hasOrganizationContext ?? false).toString()}</p>
          <p><strong>isOnTenantOwnerPath:</strong> {isOnTenantOwnerPath.toString()}</p>
          <p><strong>isKnownTenantOwner:</strong> {isKnownTenantOwner.toString()}</p>
          <p><strong>isTenantOwnerByPath:</strong> {isTenantOwnerByPath.toString()}</p>
          <p><strong>isOwnerRole:</strong> {isOwnerRole.toString()}</p>
          <p><strong>isUserOnTenantPath:</strong> {(isUserOnTenantPath ?? false).toString()}</p>
          <p><strong>isSoftwareOwner:</strong> {isSoftwareOwner.toString()}</p>
          <p><strong>isTenantOwner:</strong> {(isTenantOwner ?? false).toString()}</p>
          <p><strong>isTenantAdmin:</strong> {(isTenantAdmin ?? false).toString()}</p>
          <p><strong>isSalesManager:</strong> {(isSalesManager ?? false).toString()}</p>
          <p><strong>isSalesRep:</strong> {(isSalesRep ?? false).toString()}</p>
        </div>

        <div className="bg-yellow-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Floating UI Context</h2>
          <p><strong>isAuthenticated:</strong> {isAuthenticated.toString()}</p>
          <p><strong>shouldShowFloatingButtons:</strong> {shouldShowFloatingButtons.toString()}</p>
          <p><strong>user?.tenantId:</strong> {user?.tenantId || 'undefined'}</p>
          <p><strong>user?.organizationId:</strong> {user?.organizationId || 'undefined'}</p>
        </div>
      </div>
    </div>
  );
}