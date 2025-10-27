"use client";

import React, { useState, useEffect } from 'react';
import { 
  Environment, 
  getAllEnvironmentUrls, 
  getEnvironmentConfig, 
  getCurrentEnvironment 
} from '@/lib/environments/config';

interface DeploymentBundle {
  id: string;
  name: string;
  description: string;
  features: string[];
  sourceEnvironment: Environment;
  targetEnvironment: Environment | null;
  status: 'draft' | 'testing' | 'ready' | 'deployed' | 'failed';
  createdAt: Date;
  deployedAt?: Date;
  approvals: {
    required: number;
    received: number;
    approvers: string[];
  };
}

interface EnvironmentStatus {
  environment: Environment;
  url: string;
  status: 'healthy' | 'degraded' | 'down';
  lastDeployment?: Date;
  version: string;
  activeFeatures: string[];
}

export default function DeploymentManager() {
  const [bundles, setBundles] = useState<DeploymentBundle[]>([]);
  const [environments, setEnvironments] = useState<EnvironmentStatus[]>([]);
  const [selectedBundle, setSelectedBundle] = useState<string | null>(null);
  const [showCreateBundle, setShowCreateBundle] = useState(false);
  const [newBundle, setNewBundle] = useState({
    name: '',
    description: '',
    features: [] as string[],
    sourceEnvironment: 'development' as Environment,
    targetEnvironment: 'staging' as Environment,
  });

  const currentEnv = getCurrentEnvironment();
  const envUrls = getAllEnvironmentUrls();

  useEffect(() => {
    loadDeploymentData();
    loadEnvironmentStatus();
  }, []);

  const loadDeploymentData = async () => {
    // Mock data - in real implementation, this would fetch from API
    const mockBundles: DeploymentBundle[] = [
      {
        id: '1',
        name: 'AI Assistant v2.1',
        description: 'Enhanced AI assistant with multi-language support',
        features: ['aiAssistant', 'multiLanguage', 'smartSuggestions'],
        sourceEnvironment: 'development',
        targetEnvironment: 'staging',
        status: 'ready',
        createdAt: new Date('2025-10-20'),
        approvals: { required: 2, received: 1, approvers: ['john.doe'] },
      },
      {
        id: '2',
        name: 'Advanced Reports Module',
        description: 'New reporting dashboard with custom charts',
        features: ['advancedReports', 'customCharts', 'exportPDF'],
        sourceEnvironment: 'development',
        targetEnvironment: null,
        status: 'testing',
        createdAt: new Date('2025-10-22'),
        approvals: { required: 1, received: 0, approvers: [] },
      },
    ];
    setBundles(mockBundles);
  };

  const loadEnvironmentStatus = async () => {
    // Mock environment status - in real implementation, this would check actual health
    const mockStatus: EnvironmentStatus[] = [
      {
        environment: 'development',
        url: envUrls.development,
        status: 'healthy',
        lastDeployment: new Date('2025-10-25'),
        version: 'v1.2.3-dev.45',
        activeFeatures: ['aiAssistant', 'newDashboard', 'betaFeatures'],
      },
      {
        environment: 'staging',
        url: envUrls.staging,
        status: 'healthy',
        lastDeployment: new Date('2025-10-24'),
        version: 'v1.2.2',
        activeFeatures: ['aiAssistant', 'newDashboard'],
      },
      {
        environment: 'production',
        url: envUrls.production,
        status: 'healthy',
        lastDeployment: new Date('2025-10-23'),
        version: 'v1.2.1',
        activeFeatures: ['aiAssistant'],
      },
    ];
    setEnvironments(mockStatus);
  };

  const createBundle = () => {
    const bundle: DeploymentBundle = {
      id: Date.now().toString(),
      ...newBundle,
      status: 'draft',
      createdAt: new Date(),
      approvals: { required: 1, received: 0, approvers: [] },
    };
    setBundles([...bundles, bundle]);
    setNewBundle({
      name: '',
      description: '',
      features: [],
      sourceEnvironment: 'development',
      targetEnvironment: 'staging',
    });
    setShowCreateBundle(false);
  };

  const promoteBundle = async (bundleId: string) => {
    const bundle = bundles.find(b => b.id === bundleId);
    if (!bundle) return;

    // In real implementation, this would trigger actual deployment
    setBundles(bundles.map(b => 
      b.id === bundleId 
        ? { ...b, status: 'deployed', deployedAt: new Date() }
        : b
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'degraded': return 'text-yellow-600 bg-yellow-100';
      case 'down': return 'text-red-600 bg-red-100';
      case 'ready': return 'text-blue-600 bg-blue-100';
      case 'testing': return 'text-purple-600 bg-purple-100';
      case 'deployed': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Deployment Manager</h1>
          <p className="text-gray-600">Manage feature deployments across environments</p>
        </div>

        {/* Environment Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {environments.map((env) => (
            <div key={env.environment} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold capitalize">{env.environment}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(env.status)}`}>
                  {env.status}
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>URL:</strong> <a href={env.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{env.url}</a></p>
                <p><strong>Version:</strong> {env.version}</p>
                <p><strong>Last Deploy:</strong> {env.lastDeployment?.toLocaleDateString()}</p>
                <p><strong>Features:</strong> {env.activeFeatures.length}</p>
              </div>
              <div className="mt-4">
                <a 
                  href={env.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  Access Environment →
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Deployment Bundles */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Deployment Bundles</h2>
              <button
                onClick={() => setShowCreateBundle(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Create Bundle
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {bundles.map((bundle) => (
              <div key={bundle.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{bundle.name}</h3>
                    <p className="text-gray-600">{bundle.description}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bundle.status)}`}>
                      {bundle.status}
                    </span>
                    {bundle.status === 'ready' && (
                      <button
                        onClick={() => promoteBundle(bundle.id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Deploy to {bundle.targetEnvironment}
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-700">Features</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {bundle.features.map((feature) => (
                        <span key={feature} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Route</p>
                    <p className="text-gray-600">
                      {bundle.sourceEnvironment} → {bundle.targetEnvironment || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Approvals</p>
                    <p className="text-gray-600">
                      {bundle.approvals.received}/{bundle.approvals.required}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Created</p>
                    <p className="text-gray-600">{bundle.createdAt.toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create Bundle Modal */}
        {showCreateBundle && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Create Deployment Bundle</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={newBundle.name}
                    onChange={(e) => setNewBundle({ ...newBundle, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Feature Bundle Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newBundle.description}
                    onChange={(e) => setNewBundle({ ...newBundle, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                    placeholder="Describe the changes in this bundle"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Environment</label>
                  <select
                    value={newBundle.targetEnvironment}
                    onChange={(e) => setNewBundle({ ...newBundle, targetEnvironment: e.target.value as Environment })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="staging">Staging</option>
                    <option value="production">Production</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateBundle(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={createBundle}
                  disabled={!newBundle.name || !newBundle.description}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Create Bundle
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export { DeploymentManager };