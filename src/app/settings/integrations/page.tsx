"use client";

import React, { useState, useEffect } from "react";
import { 
  Zap, 
  Plus, 
  Settings, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  X,
  Search,
  TestTube,
  Star,
  ShieldCheck,
  Link2,
  Code,
  Brain,
  HardDrive,
  Globe,
  Save,
  ArrowLeft,
  Database,
  MessageSquare,
  Mail,
  Calendar,
  CreditCard,
  BarChart3,
  Play,
  Pause,
  Activity,
  Clock,
  TrendingUp,
  AlertTriangle,
  Eye,
  ExternalLink,
  Filter,
  Grid,
  List,
  Bookmark,
  Users,
  Webhook,
  Sparkles,
  Layers,
  ShoppingCart,
  Headphones,
  Share2,
  FileText,
  Palette
} from "lucide-react";

interface Integration {
  id: string;
  name: string;
  type: string;
  provider: string;
  description: string;
  isEnabled: boolean;
  isConnected: boolean;
  status: 'active' | 'inactive' | 'error' | 'pending' | 'configuring';
  category: string;
  features: string[];
  pricing: 'free' | 'paid' | 'freemium' | 'enterprise';
  configuration: {
    apiKey?: string;
    apiSecret?: string;
    clientId?: string;
    clientSecret?: string;
    webhookUrl?: string;
  };
  connectedAt?: string;
  connectionData?: {
    id?: string;
    configuration?: Record<string, any>;
    metadata?: Record<string, any>;
  };
  lastActivity?: string;
  createdAt: string;
  updatedAt: string;
}

interface ConnectIntegrationForm {
  apiKey: string;
  apiSecret: string;
  clientId: string;
  clientSecret: string;
  webhookUrl: string;
  customConfig: Record<string, string>;
}

interface IntegrationStats {
  total: number;
  connected: number;
  active: number;
  byType: Record<string, number>;
}

const IntegrationsSettings = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [stats, setStats] = useState<IntegrationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPricing, setSelectedPricing] = useState('');
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFeatured, setShowFeatured] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [connectForm, setConnectForm] = useState<ConnectIntegrationForm>({
    apiKey: '',
    apiSecret: '',
    clientId: '',
    clientSecret: '',
    webhookUrl: '',
    customConfig: {}
  });

  // Load integrations on mount
  useEffect(() => {
    loadIntegrations();
  }, [searchQuery, selectedType, selectedStatus, selectedPricing, page]);

  // Handle OAuth callback parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const connected = urlParams.get('connected');
    const status = urlParams.get('status');
    const error = urlParams.get('error');
    const description = urlParams.get('description');

    if (connected && status === 'success') {
      // OAuth connection successful
      setError(null);
      // Refresh integrations to show the newly connected one
      loadIntegrations();
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      // Could show a success toast here
      console.log(`Successfully connected ${connected} via OAuth`);
    } else if (error) {
      // OAuth connection failed
      setError(`OAuth failed: ${description || error}`);
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const loadIntegrations = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedType) params.append('type', selectedType);
      if (selectedStatus) params.append('status', selectedStatus);
      params.append('page', page.toString());
      params.append('limit', '50');

      const response = await fetch(`/api/settings/integrations?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setIntegrations(result.data.integrations);
        setStats(result.data.stats);
        setAvailableTypes(result.data.types);
        setTotalPages(result.data.pagination.pages);
      } else {
        setError(result.error || 'Failed to load integrations');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const connectIntegration = async () => {
    if (!selectedIntegration) return;

    setSaving(true);
    setError(null);
    
    try {
      let response;
      
      if (selectedIntegration.id === 'supabase') {
        // Special handling for Supabase
        response = await fetch('/api/settings/integrations/supabase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'connect',
            connection: {
              url: connectForm.customConfig.url,
              anonKey: connectForm.apiKey,
              serviceKey: connectForm.apiSecret || undefined
            }
          })
        });
      } else {
        // Use universal handler for all other integrations
        response = await fetch('/api/settings/integrations/generic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            integrationId: selectedIntegration.id,
            configuration: {
              ...connectForm,
              ...connectForm.customConfig
            }
          })
        });
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Handle OAuth redirect response
        if (result.data?.type === 'oauth_redirect') {
          // Close modal and redirect to OAuth
          setShowConnectModal(false);
          setSelectedIntegration(null);
          setConnectForm({
            apiKey: '',
            apiSecret: '',
            clientId: '',
            clientSecret: '',
            webhookUrl: '',
            customConfig: {}
          });
          
          // Redirect to OAuth authorization
          window.location.href = result.data.authUrl;
          return;
        }
        
        // Handle normal connection success
        setIntegrations(integrations.map(integration => 
          integration.id === selectedIntegration.id 
            ? { 
                ...integration, 
                isConnected: true, 
                status: 'active', 
                connectedAt: new Date().toISOString(),
                connectionData: result.data
              }
            : integration
        ));
        
        setShowConnectModal(false);
        setSelectedIntegration(null);
        setConnectForm({
          apiKey: '',
          apiSecret: '',
          clientId: '',
          clientSecret: '',
          webhookUrl: '',
          customConfig: {}
        });
        
        // Show success message based on integration type
        const connectionType = result.data?.metadata?.type || selectedIntegration.type;
        if (connectionType === 'oauth' && result.data?.metadata?.requiresAuth) {
          // For OAuth integrations, redirect to auth URL
          if (result.data.metadata.authUrl) {
            window.open(result.data.metadata.authUrl, '_blank');
          }
        }
      } else {
        setError(result.error || 'Failed to connect integration');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setSaving(false);
    }
  };

  const testConnectionBeforeConnect = async () => {
    if (!selectedIntegration) return;

    setSaving(true);
    setError(null);
    
    try {
      const response = await fetch('/api/settings/integrations/generic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          integrationId: selectedIntegration.id,
          configuration: {
            ...connectForm,
            ...connectForm.customConfig
          },
          testOnly: true
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setError(null);
        const connectionTime = result.data?.connectionTime || 0;
        // Show success message
        alert(`Connection test successful! (${connectionTime}ms)`);
      } else {
        setError(result.error || 'Connection test failed');
      }
    } catch (err) {
      setError('Failed to test connection');
    } finally {
      setSaving(false);
    }
  };

  const updateIntegration = async (integrationId: string, updates: any) => {
    setSaving(true);
    setError(null);
    
    try {
      const response = await fetch('/api/settings/integrations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          integrationId,
          ...updates
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setIntegrations(integrations.map(integration => 
          integration.id === integrationId ? result.data : integration
        ));
        setShowSettingsModal(false);
        setSelectedIntegration(null);
      } else {
        setError(result.error || 'Failed to update integration');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setSaving(false);
    }
  };

  const disconnectIntegration = async (integrationId: string) => {
    if (!confirm('Are you sure you want to disconnect this integration? This will stop all data syncing.')) {
      return;
    }

    setSaving(true);
    setError(null);
    
    try {
      const response = await fetch('/api/settings/integrations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integrationId })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setIntegrations(integrations.map(integration => 
          integration.id === integrationId 
            ? { ...integration, isConnected: false, isEnabled: false, status: 'inactive' }
            : integration
        ));
      } else {
        setError(result.error || 'Failed to disconnect integration');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setSaving(false);
    }
  };

  const testIntegration = async (integrationId: string, testType: string) => {
    setTesting(integrationId);
    setError(null);
    
    try {
      // For connection tests, use the universal handler
      if (testType === 'connection') {
        // Find the integration to get its configuration
        const integration = integrations.find(int => int.id === integrationId);
        if (!integration || !integration.isConnected) {
          setError('Integration not connected');
          return;
        }

        const response = await fetch('/api/settings/integrations/generic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            integrationId,
            configuration: integration.connectionData?.configuration || {},
            testOnly: true
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          // Show test results in a temporary success message
          setError(null);
          const connectionTime = result.data?.connectionTime || 0;
          // Could show test results in a modal or notification
          console.log(`Test successful for ${integrationId} (${connectionTime}ms)`);
        } else {
          setError(result.error || 'Connection test failed');
        }
      } else {
        // Other test types can use the actions endpoint
        const response = await fetch('/api/settings/integrations/actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'test',
            integrationId,
            testType
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          setError(null);
        } else {
          setError(result.error || 'Test failed');
        }
      }
    } catch (err) {
      setError('Failed to run test');
    } finally {
      setTesting(null);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      error: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      configuring: 'bg-blue-100 text-blue-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      'CRM': Database,
      'Email': Mail,
      'Communication': MessageSquare,
      'Productivity': Calendar,
      'Finance': CreditCard,
      'Marketing': BarChart3,
      'Analytics': TrendingUp,
      'Storage': HardDrive,
      'Social': Share2,
      'Database': Database,
      'AI & ML': Brain,
      'API': Code,
      'Webhook': Webhook,
      'E-commerce': ShoppingCart,
      'Support': Headphones,
      'Automation': Sparkles,
      'Custom': Settings
    };
    return icons[type as keyof typeof icons] || Settings;
  };

  const getPricingColor = (pricing: string) => {
    const colors = {
      free: 'bg-green-100 text-green-800',
      paid: 'bg-blue-100 text-blue-800',
      freemium: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-gray-100 text-gray-800'
    };
    return colors[pricing as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Filter integrations
  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = !searchQuery || 
      integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.provider.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = !selectedType || integration.type === selectedType;
    const matchesStatus = !selectedStatus || integration.status === selectedStatus;
    if (selectedPricing && integration.pricing !== selectedPricing) return false;
    if (showFeatured && !integration.pricing.includes('enterprise')) return false;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Group integrations by category
  const groupedIntegrations = filteredIntegrations.reduce((groups, integration) => {
    const category = integration.category || integration.type;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(integration);
    return groups;
  }, {} as Record<string, Integration[]>);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Integrations Library</h1>
        <p className="text-gray-600">
          Connect and manage over 180+ third-party integrations to enhance your CRM capabilities
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Error</span>
          </div>
          <p className="text-red-600 mt-1">{error}</p>
        </div>
      )}

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Available</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Zap className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Connected</p>
                <p className="text-2xl font-bold text-green-600">{stats.connected}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-purple-600">{Object.keys(stats.byType).length}</p>
              </div>
              <Layers className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search 180+ integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="flex gap-3 flex-wrap">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Categories</option>
            {availableTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Available</option>
            <option value="error">Error</option>
            <option value="pending">Pending</option>
          </select>

          <select
            value={selectedPricing}
            onChange={(e) => setSelectedPricing(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Pricing</option>
            <option value="free">Free</option>
            <option value="freemium">Freemium</option>
            <option value="paid">Paid</option>
            <option value="enterprise">Enterprise</option>
          </select>

          <button
            onClick={() => setShowFeatured(!showFeatured)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showFeatured 
                ? 'bg-blue-500 text-white' 
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Star className="w-4 h-4 inline mr-1" />
            Featured
          </button>

          <div className="flex border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-700'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-700'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Integration Categories */}
      {Object.keys(groupedIntegrations).map(category => (
        <div key={category} className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            {React.createElement(getTypeIcon(category), { className: "w-6 h-6 text-blue-500" })}
            <h2 className="text-2xl font-bold">{category}</h2>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {groupedIntegrations[category].length} integrations
            </span>
          </div>

          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {groupedIntegrations[category].map((integration) => {
              const TypeIcon = getTypeIcon(integration.type);
              
              return (
                <div key={integration.id} className={`bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow ${
                  viewMode === 'list' ? 'flex items-center gap-6' : ''
                }`}>
                  <div className={`${viewMode === 'list' ? 'flex items-center gap-4 flex-1' : ''}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <TypeIcon className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{integration.name}</h3>
                          <p className="text-sm text-gray-500">{integration.provider}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(integration.status)}`}>
                          {integration.status}
                        </span>
                        {integration.isConnected && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">{integration.description}</p>

                    {/* Connection status for connected integrations */}
                    {integration.isConnected && (
                      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700">
                          <CheckCircle className="w-4 h-4" />
                          <span className="font-medium">Connected & Active</span>
                        </div>
                        {integration.lastActivity && (
                          <p className="text-sm text-green-600 mt-1">
                            Last active: {new Date(integration.lastActivity).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Pricing */}
                    <div className="mb-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPricingColor(integration.pricing)}`}>
                        {integration.pricing.charAt(0).toUpperCase() + integration.pricing.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className={`flex gap-2 ${viewMode === 'list' ? 'flex-shrink-0' : ''}`}>
                    {!integration.isConnected ? (
                      <button
                        onClick={() => {
                          setSelectedIntegration(integration);
                          setShowConnectModal(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        <Link2 className="w-4 h-4" />
                        Connect
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => testIntegration(integration.id, 'connection')}
                          disabled={testing === integration.id}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
                        >
                          {testing === integration.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          Connected
                        </button>
                        
                        <button
                          onClick={() => disconnectIntegration(integration.id)}
                          className="px-3 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                          title="Disconnect"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {filteredIntegrations.length === 0 && (
        <div className="text-center py-12">
          <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No integrations found</h3>
          <p className="text-gray-600">
            {searchQuery || selectedType || selectedStatus || selectedPricing || showFeatured
              ? 'Try adjusting your search criteria'
              : 'No integrations available'
            }
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Previous
          </button>
          
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Connect Integration Modal */}
      {showConnectModal && selectedIntegration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Connect {selectedIntegration.name}</h2>
            
            {selectedIntegration.id === 'supabase' ? (
              // Supabase-specific form
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project URL</label>
                  <input
                    type="url"
                    value={connectForm.customConfig.url || ''}
                    onChange={(e) => setConnectForm({
                      ...connectForm, 
                      customConfig: { ...connectForm.customConfig, url: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://your-project.supabase.co"
                  />
                  <p className="text-xs text-gray-500 mt-1">Find this in your Supabase dashboard under Settings → API</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">API Key (anon/public)</label>
                  <input
                    type="password"
                    value={connectForm.apiKey}
                    onChange={(e) => setConnectForm({...connectForm, apiKey: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your anon public key"
                  />
                  <p className="text-xs text-gray-500 mt-1">This is safe to use in client-side code</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Role Key (Optional)</label>
                  <input
                    type="password"
                    value={connectForm.apiSecret}
                    onChange={(e) => setConnectForm({...connectForm, apiSecret: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your service role key (for server-side operations)"
                  />
                  <p className="text-xs text-gray-500 mt-1">Only needed for advanced operations</p>
                </div>
              </div>
            ) : (
              // Generic form for other integrations
              <div className="space-y-4">
                {selectedIntegration.type === 'oauth' ? (
                  // OAuth-specific fields
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
                      <input
                        type="text"
                        value={connectForm.clientId}
                        onChange={(e) => setConnectForm({...connectForm, clientId: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter OAuth Client ID"
                      />
                      <p className="text-xs text-gray-500 mt-1">Get this from your {selectedIntegration.name} app settings</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Client Secret</label>
                      <input
                        type="password"
                        value={connectForm.clientSecret}
                        onChange={(e) => setConnectForm({...connectForm, clientSecret: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter OAuth Client Secret"
                      />
                      <p className="text-xs text-gray-500 mt-1">Keep this secret and secure</p>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Brain className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-blue-900">OAuth Setup Required</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            After connecting, you'll be redirected to {selectedIntegration.name} to authorize access. 
                            Make sure to add the redirect URI in your app settings.
                          </p>
                          <p className="text-xs text-blue-600 mt-2 font-mono bg-blue-100 p-2 rounded">
                            {window.location.origin}/api/settings/integrations/oauth/callback
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  // Non-OAuth fields
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                      <input
                        type="text"
                        value={connectForm.apiKey}
                        onChange={(e) => setConnectForm({...connectForm, apiKey: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter API key"
                      />
                    </div>
                    
                    {selectedIntegration.type === 'CRM' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">API Secret</label>
                        <input
                          type="password"
                          value={connectForm.apiSecret}
                          onChange={(e) => setConnectForm({...connectForm, apiSecret: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter API secret"
                        />
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Webhook URL</label>
                      <input
                        type="url"
                        value={connectForm.webhookUrl}
                        onChange={(e) => setConnectForm({...connectForm, webhookUrl: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://ghostcrm.com/webhooks/..."
                      />
                    </div>
                  </>
                )}
              </div>
            )}
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowConnectModal(false);
                  setSelectedIntegration(null);
                  setConnectForm({
                    apiKey: '',
                    apiSecret: '',
                    clientId: '',
                    clientSecret: '',
                    webhookUrl: '',
                    customConfig: {}
                  });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={testConnectionBeforeConnect}
                disabled={saving || 
                  (selectedIntegration.type === 'oauth' && (!connectForm.clientId || !connectForm.clientSecret)) ||
                  (selectedIntegration.type !== 'oauth' && !connectForm.apiKey) ||
                  (selectedIntegration.id === 'supabase' && !connectForm.customConfig.url)
                }
                className="flex items-center justify-center gap-2 px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 disabled:opacity-50"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <TestTube className="w-4 h-4" />
                )}
                Test
              </button>
              <button
                onClick={connectIntegration}
                disabled={saving || 
                  (selectedIntegration.type === 'oauth' && (!connectForm.clientId || !connectForm.clientSecret)) ||
                  (selectedIntegration.type !== 'oauth' && !connectForm.apiKey) ||
                  (selectedIntegration.id === 'supabase' && !connectForm.customConfig.url)
                }
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Link2 className="w-4 h-4" />
                )}
                {selectedIntegration.type === 'oauth' ? 'Connect with OAuth' : 
                 selectedIntegration.id === 'supabase' ? 'Test & Connect' : 'Connect'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && selectedIntegration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{selectedIntegration.name} Settings</h2>
              <button
                onClick={() => {
                  setShowSettingsModal(false);
                  setSelectedIntegration(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Connection Status */}
              <div>
                <h3 className="text-lg font-medium mb-3">Connection Status</h3>
                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-medium text-green-900">Connected</p>
                    <p className="text-sm text-green-700">
                      Integration is active and working properly
                    </p>
                  </div>
                </div>
              </div>

              {/* Enable/Disable */}
              <div>
                <h3 className="text-lg font-medium mb-3">Integration Control</h3>
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedIntegration.isEnabled}
                    onChange={(e) => updateIntegration(selectedIntegration.id, {
                      isEnabled: e.target.checked
                    })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <div>
                    <span className="font-medium">Enable this integration</span>
                    <p className="text-sm text-gray-600">Allow this integration to sync data with your CRM</p>
                  </div>
                </label>
              </div>

              {/* Disconnect */}
              <div>
                <h3 className="text-lg font-medium mb-3 text-red-900">Disconnect Integration</h3>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700 mb-3">
                    Disconnecting will stop all data syncing and remove stored credentials. You can reconnect at any time.
                  </p>
                  <button
                    onClick={() => disconnectIntegration(selectedIntegration.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Disconnect Integration
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationsSettings;