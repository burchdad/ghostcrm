'use client';

import { useTenant, useCurrentTenant, useIsMarketingSite } from '@/lib/tenant';

export default function TenantTestPage() {
  const tenantContext = useTenant();
  const tenant = useCurrentTenant();
  const isMarketing = useIsMarketingSite();

  if (isMarketing) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-blue-900 mb-4">Marketing Site Detected</h1>
          <p className="text-blue-700">
            You're currently on the marketing site. This would show the main GhostCRM landing page.
          </p>
          <div className="mt-4">
            <h3 className="font-semibold text-blue-900">Test Tenant Links:</h3>
            <ul className="mt-2 space-y-1">
              <li>
                <a 
                  href="http://demo.ghostautocrm.local:3000/tenant-test" 
                  className="text-blue-600 hover:underline"
                >
                  Demo Dealership
                </a>
              </li>
              <li>
                <a 
                  href="http://acme-auto.ghostautocrm.local:3000/tenant-test"
                  className="text-blue-600 hover:underline" 
                >
                  ACME Auto Sales
                </a>
              </li>
              <li>
                <a 
                  href="http://premium-cars.ghostautocrm.local:3000/tenant-test"
                  className="text-blue-600 hover:underline"
                >
                  Premium Cars LLC
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (tenantContext.isLoading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-yellow-900 mb-4">Loading Tenant...</h1>
          <p className="text-yellow-700">Fetching tenant configuration...</p>
        </div>
      </div>
    );
  }

  if (tenantContext.error || !tenant) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-red-900 mb-4">Tenant Error</h1>
          <p className="text-red-700">
            {tenantContext.error || 'Tenant not found'}
          </p>
          <p className="text-sm text-red-600 mt-2">
            Subdomain: {tenantContext.subdomain || 'none'}
          </p>
        </div>
      </div>
    );
  }

  const primaryColor = tenant.branding?.primary_color || '#1f2937';
  const companyName = tenant.branding?.company_name || tenant.name;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div 
        className="bg-white border-l-4 rounded-lg shadow-lg p-6"
        style={{ borderLeftColor: primaryColor }}
      >
        <div className="flex items-center justify-between mb-6">
          <h1 
            className="text-3xl font-bold"
            style={{ color: primaryColor }}
          >
            {companyName}
          </h1>
          <span 
            className="px-3 py-1 rounded-full text-sm font-medium text-white"
            style={{ backgroundColor: primaryColor }}
          >
            {tenant.status.toUpperCase()}
          </span>
        </div>

        {/* Tenant Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Tenant Details</h2>
            <div className="space-y-2">
              <div>
                <span className="font-medium text-gray-600">ID:</span>
                <span className="ml-2 text-gray-900">{tenant.id}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Name:</span>
                <span className="ml-2 text-gray-900">{tenant.name}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Subdomain:</span>
                <span className="ml-2 text-gray-900">{tenant.subdomain}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Status:</span>
                <span className="ml-2 text-gray-900">{tenant.status}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Configuration</h2>
            <div className="space-y-2">
              <div>
                <span className="font-medium text-gray-600">Plan:</span>
                <span className="ml-2 text-gray-900">{tenant.plan}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Primary Color:</span>
                <div className="flex items-center mt-1">
                  <div
                    className="w-6 h-6 rounded border border-gray-300 mr-2"
                    style={{ backgroundColor: primaryColor }}
                  ></div>
                  <span className="text-gray-900">{primaryColor}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Available Features */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Features</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {(tenant.config?.features || []).map((feature) => (
              <div
                key={feature}
                className="bg-green-50 border border-green-200 rounded-lg p-3 text-center"
              >
                <span className="text-green-800 font-medium capitalize">
                  {feature.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Debug Information */}
        <details className="mb-6">
          <summary className="text-lg font-semibold text-gray-900 cursor-pointer mb-2">
            Debug Information
          </summary>
          <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm overflow-auto">
            <div className="mb-2 text-green-300">Tenant Context:</div>
            <pre>{JSON.stringify(tenantContext, null, 2)}</pre>
            <div className="mt-4 mb-2 text-green-300">Tenant Data:</div>
            <pre>{JSON.stringify(tenant, null, 2)}</pre>
          </div>
        </details>

        {/* Navigation Links */}
        <div className="flex gap-4">
          <a
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white"
            style={{ backgroundColor: primaryColor }}
          >
            Go to Dashboard
          </a>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Marketing Site
          </a>
        </div>
      </div>
    </div>
  );
}