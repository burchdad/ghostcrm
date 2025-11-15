"use client";

import React from "react";
import { CreditCard, RefreshCw } from "lucide-react";
import {
  SystemMetrics,
  SecurityAlert,
  SecuritySeverity,
} from "@/types/owner";

interface OverviewTabProps {
  systemMetrics: SystemMetrics;
  securityAlerts: SecurityAlert[];
  stripeLoading: boolean;
  lastStripeAction: string;
  stripeSyncResult: any;
  stripeError: string;
  testProductSync: () => Promise<void>;
  testProductMapping: () => Promise<void>;
  icons: {
    Database: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    Activity: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    Server: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    AlertTriangle: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    CheckCircle: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  };
}

const getSeverityColor = (severity: SecuritySeverity) => {
  switch (severity) {
    case "critical":
      return "text-red-600 bg-red-100";
    case "high":
      return "text-orange-600 bg-orange-100";
    case "medium":
      return "text-yellow-600 bg-yellow-100";
    case "low":
      return "text-blue-600 bg-blue-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

export default function OverviewTab({
  systemMetrics,
  securityAlerts,
  stripeLoading,
  lastStripeAction,
  stripeSyncResult,
  stripeError,
  testProductSync,
  testProductMapping,
  icons: { Database, Activity, Server, AlertTriangle, CheckCircle },
}: OverviewTabProps) {
  return (
    <div className="space-y-8">
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Users */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {systemMetrics.totalUsers.toLocaleString()}
              </p>
            </div>
            <svg className="w-8 h-8 text-blue-600">
              <use href="#users-icon" />
            </svg>
          </div>
        </div>

        {/* Active Tenants */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Active Tenants
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {systemMetrics.activeTenants}
              </p>
            </div>
            <Database className="w-8 h-8 text-green-600" />
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Monthly Revenue
              </p>
              <p className="text-2xl font-bold text-gray-900">
                ${systemMetrics.totalRevenue.toLocaleString()}
              </p>
            </div>
            <Activity className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        {/* Uptime */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Uptime</p>
              <p className="text-2xl font-bold text-gray-900">
                {systemMetrics.systemUptime}%
              </p>
            </div>
            <Server className="w-8 h-8 text-green-600" />
          </div>
        </div>

        {/* API Calls */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                API Calls (24h)
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {systemMetrics.apiCalls24h.toLocaleString()}
              </p>
            </div>
            <Activity className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        {/* Error Rate */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Error Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {systemMetrics.errorRate}%
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Security Alerts */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Security Alerts
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {securityAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${getSeverityColor(alert.severity)}`}>
                    {alert.resolved ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <AlertTriangle className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{alert.message}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(
                    alert.severity
                  )}`}
                >
                  {alert.severity}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stripe quick actions */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Stripe Integration Management
              </h3>
              <p className="text-sm text-gray-600">
                Test and manage Stripe product synchronization
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={testProductSync}
              disabled={stripeLoading}
              className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-lg"
            >
              {stripeLoading && lastStripeAction === "Product Sync" ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <RefreshCw className="w-5 h-5" />
              )}
              <span className="font-medium">Sync Stripe Products</span>
            </button>

            <button
              onClick={testProductMapping}
              disabled={stripeLoading}
              className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-lg"
            >
              {stripeLoading && lastStripeAction === "Product Mapping" ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Database className="w-5 h-5" />
              )}
              <span className="font-medium">Test Product Mapping</span>
            </button>
          </div>

          {(stripeSyncResult || stripeError) && (
            <div className="mt-4 p-4 rounded-lg border">
              {stripeError ? (
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-red-900">
                      Error in {lastStripeAction}
                    </h4>
                    <p className="text-red-700 mt-1">{stripeError}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-green-900">
                      {lastStripeAction} Successful
                    </h4>
                    {stripeSyncResult && (
                      <div className="mt-2 text-sm text-gray-700 space-y-1">
                        {lastStripeAction === "Product Sync" &&
                          stripeSyncResult.results && (
                            <>
                              <p>
                                ✅ Products synced:{" "}
                                {stripeSyncResult.results.length}
                              </p>
                              {stripeSyncResult.results.map(
                                (r: any, i: number) => (
                                  <p key={i} className="ml-4">
                                    • {r.name}:{" "}
                                    {r.success ? "Success" : r.error}
                                  </p>
                                )
                              )}
                            </>
                          )}

                        {lastStripeAction === "Product Mapping" &&
                          stripeSyncResult.mappings && (
                            <>
                              <p>
                                ✅ Product mappings found:{" "}
                                {stripeSyncResult.mappings.length}
                              </p>
                              {stripeSyncResult.mappings
                                .slice(0, 3)
                                .map((m: any, i: number) => (
                                  <p key={i} className="ml-4">
                                    • {m.product_name}: {m.stripe_price_id}
                                  </p>
                                ))}
                              {stripeSyncResult.mappings.length > 3 && (
                                <p className="ml-4 text-gray-500">
                                  ... and{" "}
                                  {stripeSyncResult.mappings.length - 3} more
                                </p>
                              )}
                            </>
                          )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}