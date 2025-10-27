'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// Update the import path if the Tabs components are located elsewhere, for example:
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// Or, if you need to create the file, create 'tabs.tsx' in 'src/components/ui/' and export these components.
import { DeploymentManager } from '@/components/deployment/DeploymentManager';
import { featureFlagService, FeatureFlag, DeploymentBundle, EnvironmentConfigDB } from '@/lib/features/persistent-flags';
import { getCurrentEnvironment } from '@/lib/environments/config';
import { 
  Rocket, 
  Settings, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users,
  GitBranch,
  Database,
  Shield,
  BarChart3
} from 'lucide-react';

interface EnvironmentStatus {
  name: string;
  displayName: string;
  url: string;
  status: 'healthy' | 'warning' | 'error' | 'maintenance';
  lastDeployment?: string;
  activeFeatures: number;
  pendingDeployments: number;
  uptime: string;
}

interface SystemMetrics {
  totalFeatureFlags: number;
  activeDeployments: number;
  pendingApprovals: number;
  totalEnvironments: number;
  deploymentsToday: number;
  successRate: number;
}

export default function DeploymentDashboard() {
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [deploymentBundles, setDeploymentBundles] = useState<DeploymentBundle[]>([]);
  const [environmentConfigs, setEnvironmentConfigs] = useState<EnvironmentConfigDB[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    totalFeatureFlags: 0,
    activeDeployments: 0,
    pendingApprovals: 0,
    totalEnvironments: 0,
    deploymentsToday: 0,
    successRate: 0
  });
  const [environmentStatuses, setEnvironmentStatuses] = useState<EnvironmentStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentEnv, setCurrentEnv] = useState<string>('');

  useEffect(() => {
    setCurrentEnv(getCurrentEnvironment());
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load all data in parallel
      const [flags, bundles, configs] = await Promise.all([
        featureFlagService.getFeatureFlags(),
        featureFlagService.getDeploymentBundles(),
        featureFlagService.getEnvironmentConfigs()
      ]);

      setFeatureFlags(flags);
      setDeploymentBundles(bundles);
      setEnvironmentConfigs(configs);

      // Calculate system metrics
      const metrics: SystemMetrics = {
        totalFeatureFlags: flags.length,
        activeDeployments: bundles.filter(b => b.status === 'deployed').length,
        pendingApprovals: bundles.filter(b => b.status === 'pending').length,
        totalEnvironments: configs.length,
        deploymentsToday: bundles.filter(b => {
          const today = new Date().toDateString();
          return new Date(b.created_at).toDateString() === today;
        }).length,
        successRate: bundles.length > 0 ? 
          (bundles.filter(b => b.status === 'deployed').length / bundles.length) * 100 : 0
      };
      setSystemMetrics(metrics);

      // Generate environment statuses
      const statuses: EnvironmentStatus[] = configs.map(config => {
        const envBundles = bundles.filter(b => b.target_environment === config.environment_name);
        const lastDeployment = envBundles
          .filter(b => b.deployed_at)
          .sort((a, b) => new Date(b.deployed_at!).getTime() - new Date(a.deployed_at!).getTime())[0];
        
        return {
          name: config.environment_name,
          displayName: config.display_name,
          url: config.base_url,
          status: config.is_active ? 'healthy' : 'maintenance',
          lastDeployment: lastDeployment?.deployed_at,
          activeFeatures: flags.filter(f => f.environments[config.environment_name]?.enabled).length,
          pendingDeployments: envBundles.filter(b => b.status === 'pending').length,
          uptime: '99.9%' // This would come from actual monitoring
        };
      });
      setEnvironmentStatuses(statuses);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      case 'maintenance': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getBundleStatusVariant = (status: string) => {
    switch (status) {
      case 'deployed': return 'default';
      case 'pending': return 'secondary';
      case 'approved': return 'outline';
      case 'failed': return 'destructive';
      case 'rolled_back': return 'secondary';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading deployment dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Deployment Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Multi-environment CI/CD management for GhostCRM
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="px-3 py-1">
              Current: {currentEnv}
            </Badge>
            <Button onClick={loadDashboardData} disabled={isLoading}>
              <Activity className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* System Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Feature Flags</p>
                  <p className="text-2xl font-bold">{systemMetrics.totalFeatureFlags}</p>
                </div>
                <Settings className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Deployments</p>
                  <p className="text-2xl font-bold">{systemMetrics.activeDeployments}</p>
                </div>
                <Rocket className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                  <p className="text-2xl font-bold">{systemMetrics.pendingApprovals}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Environments</p>
                  <p className="text-2xl font-bold">{systemMetrics.totalEnvironments}</p>
                </div>
                <Database className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Deployments Today</p>
                  <p className="text-2xl font-bold">{systemMetrics.deploymentsToday}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold">{systemMetrics.successRate.toFixed(1)}%</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Environment Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Environment Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {environmentStatuses.map((env) => (
                <div
                  key={env.name}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(env.status)}`}></div>
                      <h3 className="font-medium">{env.displayName}</h3>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {env.name}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Active Features:</span>
                      <span className="font-medium">{env.activeFeatures}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending Deployments:</span>
                      <span className="font-medium">{env.pendingDeployments}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Uptime:</span>
                      <span className="font-medium text-green-600">{env.uptime}</span>
                    </div>
                    {env.lastDeployment && (
                      <div className="flex justify-between">
                        <span>Last Deployment:</span>
                        <span className="font-medium">
                          {new Date(env.lastDeployment).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 pt-3 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => window.open(env.url, '_blank')}
                    >
                      Open Environment
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="deployments" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="deployments">Deployment Manager</TabsTrigger>
            <TabsTrigger value="features">Feature Flags</TabsTrigger>
            <TabsTrigger value="bundles">Deployment Bundles</TabsTrigger>
            <TabsTrigger value="history">Deployment History</TabsTrigger>
          </TabsList>

          <TabsContent value="deployments" className="space-y-4">
            <DeploymentManager />
          </TabsContent>

          <TabsContent value="features" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Feature Flags Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {featureFlags.map((flag) => (
                    <div key={flag.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{flag.name}</h3>
                        <Badge variant={flag.is_active ? "default" : "secondary"}>
                          {flag.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{flag.description}</p>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        {Object.entries(flag.environments).map(([env, config]) => (
                          <div key={env} className="space-y-1">
                            <div className="font-medium capitalize">{env}</div>
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${config.enabled ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                              <span>{config.enabled ? 'Enabled' : 'Disabled'}</span>
                            </div>
                            <div className="text-gray-500">Rollout: {config.rollout}%</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bundles" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Deployment Bundles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deploymentBundles.map((bundle) => (
                    <div key={bundle.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{bundle.bundle_name}</h3>
                        <div className="flex items-center space-x-2">
                          <Badge variant={getBundleStatusVariant(bundle.status)}>
                            {bundle.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            v{bundle.version}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <span className="font-medium">Source:</span> {bundle.source_environment}
                        </div>
                        <div>
                          <span className="font-medium">Target:</span> {bundle.target_environment}
                        </div>
                        <div>
                          <span className="font-medium">Features:</span> {bundle.features.length}
                        </div>
                        <div>
                          <span className="font-medium">Created:</span> {new Date(bundle.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      
                      {bundle.changelog && (
                        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          <strong>Changelog:</strong> {bundle.changelog}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Deployment History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Deployment history will be available here</p>
                  <p className="text-sm">Track all deployment activities across environments</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}