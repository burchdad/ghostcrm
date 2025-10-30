'use client'

import React, { useState, useEffect } from 'react'
import { 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Eye, 
  AlertTriangle,
  Package,
  ExternalLink,
  Play
} from 'lucide-react'

interface SyncStatus {
  syncStatus: string;
  missingSyncs: string[];
  invalidSyncs: string[];
  totalMissing: number;
  totalInvalid: number;
}

interface SyncResult {
  success: boolean;
  message: string;
  data: {
    created: number;
    updated: number;
    errors: string[];
    products: Array<{
      localId: string;
      localName: string;
      stripeProductId: string;
      stripePriceId: string;
      price: number;
      status: string;
    }>;
  };
}

export default function StripeProductSyncDashboard() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchSyncStatus();
  }, []);

  const fetchSyncStatus = async () => {
    try {
      const response = await fetch('/api/admin/stripe/sync-products');
      const result = await response.json();
      
      if (result.success) {
        setSyncStatus(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch sync status:', error);
    }
  };

  const performSync = async (dryRun: boolean = false, forceUpdate: boolean = false) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/stripe/sync-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync',
          dryRun,
          forceUpdate
        })
      });

      const result = await response.json();
      setLastSyncResult(result);
      
      if (result.success && !dryRun) {
        // Refresh status after successful sync
        await fetchSyncStatus();
      }
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateSync = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/stripe/sync-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'validate' })
      });

      const result = await response.json();
      setLastSyncResult(result);
      await fetchSyncStatus();
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSyncStatusColor = () => {
    if (!syncStatus) return 'bg-gray-500';
    if (syncStatus.syncStatus === 'valid') return 'bg-green-500';
    return 'bg-yellow-500';
  };

  const getSyncStatusText = () => {
    if (!syncStatus) return 'Unknown';
    if (syncStatus.syncStatus === 'valid') return 'All Synced';
    return 'Needs Sync';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-8 h-8 text-blue-600" />
              Stripe Product Synchronization
            </h1>
            <p className="text-gray-600 mt-1">
              Manage synchronization between GhostCRM products and Stripe
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getSyncStatusColor()}`}></div>
            <span className="text-sm font-medium">{getSyncStatusText()}</span>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Sync Status</p>
                <p className="text-lg font-bold text-blue-900">
                  {syncStatus?.syncStatus === 'valid' ? 'Valid' : 'Needs Sync'}
                </p>
              </div>
              <CheckCircle2 className={`w-8 h-8 ${
                syncStatus?.syncStatus === 'valid' ? 'text-green-500' : 'text-yellow-500'
              }`} />
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">Missing Syncs</p>
                <p className="text-lg font-bold text-yellow-900">
                  {syncStatus?.totalMissing || 0}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Invalid Syncs</p>
                <p className="text-lg font-bold text-red-900">
                  {syncStatus?.totalInvalid || 0}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => performSync(true)}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Eye className="w-4 h-4" />
            {isLoading ? 'Running...' : 'Preview Sync (Dry Run)'}
          </button>

          <button
            onClick={() => performSync(false)}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            {isLoading ? 'Syncing...' : 'Sync Products'}
          </button>

          <button
            onClick={() => performSync(false, true)}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" />
            {isLoading ? 'Updating...' : 'Force Update All'}
          </button>

          <button
            onClick={validateSync}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            Validate Sync
          </button>

          <button
            onClick={fetchSyncStatus}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Status
          </button>
        </div>

        {/* Missing/Invalid Products */}
        {syncStatus && (syncStatus.totalMissing > 0 || syncStatus.totalInvalid > 0) && (
          <div className="space-y-4">
            {syncStatus.totalMissing > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-medium text-yellow-800 mb-2">
                  Missing Syncs ({syncStatus.totalMissing})
                </h3>
                <div className="text-sm text-yellow-700 space-y-1">
                  {syncStatus.missingSyncs.map((productId) => (
                    <div key={productId} className="font-mono">
                      {productId}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {syncStatus.totalInvalid > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-medium text-red-800 mb-2">
                  Invalid Syncs ({syncStatus.totalInvalid})
                </h3>
                <div className="text-sm text-red-700 space-y-1">
                  {syncStatus.invalidSyncs.map((productId) => (
                    <div key={productId} className="font-mono">
                      {productId}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Last Sync Result */}
        {lastSyncResult && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-gray-900">Last Sync Result</h3>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                {showDetails ? 'Hide Details' : 'Show Details'}
              </button>
            </div>

            <div className={`p-4 rounded-lg border ${
              lastSyncResult.success 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {lastSyncResult.success ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className={`font-medium ${
                  lastSyncResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {lastSyncResult.message}
                </span>
              </div>

              {showDetails && lastSyncResult.data && (
                <div className="space-y-3 mt-4">
                  {lastSyncResult.data.created > 0 && (
                    <div className="text-sm">
                      <span className="font-medium text-green-700">Created:</span> {lastSyncResult.data.created}
                    </div>
                  )}
                  {lastSyncResult.data.updated > 0 && (
                    <div className="text-sm">
                      <span className="font-medium text-blue-700">Updated:</span> {lastSyncResult.data.updated}
                    </div>
                  )}
                  {lastSyncResult.data.errors?.length > 0 && (
                    <div className="text-sm">
                      <span className="font-medium text-red-700">Errors:</span>
                      <ul className="mt-1 ml-4 list-disc space-y-1">
                        {lastSyncResult.data.errors.map((error, index) => (
                          <li key={index} className="text-red-600">{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {lastSyncResult.data.products && (
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Products:</span>
                      <div className="mt-2 max-h-40 overflow-y-auto">
                        <table className="min-w-full text-xs">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="px-2 py-1 text-left">Product</th>
                              <th className="px-2 py-1 text-left">Price</th>
                              <th className="px-2 py-1 text-left">Status</th>
                              <th className="px-2 py-1 text-left">Stripe ID</th>
                            </tr>
                          </thead>
                          <tbody>
                            {lastSyncResult.data.products.map((product) => (
                              <tr key={product.localId} className="border-b">
                                <td className="px-2 py-1 font-mono text-xs">
                                  {product.localName}
                                </td>
                                <td className="px-2 py-1">${product.price}</td>
                                <td className="px-2 py-1">
                                  <span className={`px-2 py-1 rounded text-xs ${
                                    product.status === 'created' ? 'bg-green-100 text-green-800' :
                                    product.status === 'updated' ? 'bg-blue-100 text-blue-800' :
                                    product.status === 'synced' ? 'bg-gray-100 text-gray-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {product.status}
                                  </span>
                                </td>
                                <td className="px-2 py-1">
                                  <a
                                    href={`https://dashboard.stripe.com/products/${product.stripeProductId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                  >
                                    <span className="font-mono text-xs">{product.stripeProductId}</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}