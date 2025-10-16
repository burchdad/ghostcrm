"use client";

import React, { useState } from "react";
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
  BarChart3
} from "lucide-react";
import { 
  BaseIntegration, 
  IntegrationTemplate, 
  IntegrationCategory, 
  CredentialField,
  getAllIntegrations, 
  searchIntegrations, 
  getIntegrationsByCategory,
  getFeaturedIntegrations,
  getPopularIntegrations,
  getAllCategories,
  TOTAL_INTEGRATION_COUNT
} from "@/integrations";

// Mock data for existing integrations
const mockActiveIntegrations: BaseIntegration[] = [
  {
    id: 'slack-1',
    name: 'Slack Workspace',
    description: 'Main team communication',
    category: 'Communication',
    type: 'oauth',
    icon: '💬',
    color: 'bg-purple-500',
    isConnected: true,
    status: 'active',
    lastSync: '2024-10-14T10:30:00Z',
    connectedAt: '2024-09-01T14:20:00Z',
    syncCount: 1247,
    errorCount: 2,
    settings: {
      channels: ['#sales', '#general'],
      notifications: ['deal-closed', 'new-lead']
    }
  },
  {
    id: 'openai-1',
    name: 'OpenAI GPT-4',
    description: 'AI-powered lead scoring and insights',
    category: 'AI & ML',
    type: 'api-key',
    icon: '🤖',
    color: 'bg-black',
    isConnected: true,
    status: 'active',
    lastSync: '2024-10-14T11:15:00Z',
    connectedAt: '2024-08-15T09:30:00Z',
    syncCount: 892,
    errorCount: 0,
    settings: {
      model: 'gpt-4',
      temperature: 0.7
    }
  },
  {
    id: 'mysql-1',
    name: 'Customer Database',
    description: 'Main customer data warehouse',
    category: 'Database',
    type: 'database',
    icon: '🗄️',
    color: 'bg-orange-500',
    isConnected: true,
    status: 'error',
    lastSync: '2024-10-13T16:20:00Z',
    connectedAt: '2024-08-20T09:15:00Z',
    syncCount: 567,
    errorCount: 12,
    settings: {
      syncFrequency: '30min',
      autoSync: true
    }
  }
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<BaseIntegration[]>(mockActiveIntegrations);
  const [selectedIntegration, setSelectedIntegration] = useState<BaseIntegration | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<IntegrationTemplate | null>(null);
  const [showMarketplace, setShowMarketplace] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [testingConnection, setTestingConnection] = useState(false);
  const [credentials, setCredentials] = useState<Record<string, any>>({});

  const allCategories: IntegrationCategory[] = [
    'Database', 'AI & ML', 'Communication', 'Email', 'Productivity', 
    'Finance', 'CRM', 'Marketing', 'Automation', 'Analytics', 
    'Storage', 'API', 'Webhook', 'Custom'
  ];

  const getCategoryIcon = (category: IntegrationCategory) => {
    switch (category) {
      case 'Database': return <Database className="w-4 h-4" />;
      case 'AI & ML': return <Brain className="w-4 h-4" />;
      case 'Communication': return <MessageSquare className="w-4 h-4" />;
      case 'Email': return <Mail className="w-4 h-4" />;
      case 'Productivity': return <Calendar className="w-4 h-4" />;
      case 'Finance': return <CreditCard className="w-4 h-4" />;
      case 'CRM': return <BarChart3 className="w-4 h-4" />;
      case 'Marketing': return <BarChart3 className="w-4 h-4" />;
      case 'Automation': return <Zap className="w-4 h-4" />;
      case 'Analytics': return <BarChart3 className="w-4 h-4" />;
      case 'Storage': return <HardDrive className="w-4 h-4" />;
      case 'API': return <Code className="w-4 h-4" />;
      case 'Webhook': return <Link2 className="w-4 h-4" />;
      case 'Custom': return <Settings className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'pending': return <RefreshCw className="w-4 h-4 text-yellow-600 animate-spin" />;
      case 'testing': return <TestTube className="w-4 h-4 text-blue-600 animate-pulse" />;
      case 'disabled': return <X className="w-4 h-4 text-gray-600" />;
      default: return <X className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'testing': return 'bg-blue-100 text-blue-800';
      case 'disabled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || integration.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || integration.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const filteredTemplates = getAllIntegrations().filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const testConnection = async (integration: BaseIntegration) => {
    setTestingConnection(true);
    // Simulate connection test
    setTimeout(() => {
      setTestingConnection(false);
      // Update integration status
      setIntegrations(prev => prev.map(int => 
        int.id === integration.id 
          ? { ...int, status: Math.random() > 0.3 ? 'active' : 'error' }
          : int
      ));
    }, 2000);
  };

  const addIntegration = (template: IntegrationTemplate) => {
    const newIntegration: BaseIntegration = {
      id: `${template.id}-${Date.now()}`,
      name: template.name,
      description: template.description,
      category: template.category,
      type: template.type,
      icon: template.icon,
      color: template.color,
      isConnected: false,
      status: 'disabled',
      settings: template.defaultSettings,
      credentials: {
        type: template.type,
        fields: template.credentialFields,
        encrypted: true
      }
    };
    setIntegrations(prev => [...prev, newIntegration]);
    setSelectedTemplate(null);
    setSelectedIntegration(newIntegration);
    setShowMarketplace(false);
  };

  const toggleIntegration = (integrationId: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { 
            ...integration, 
            isConnected: !integration.isConnected,
            status: integration.isConnected ? 'disabled' : 'active' 
          }
        : integration
    ));
  };

  const saveCredentials = () => {
    if (selectedIntegration) {
      setIntegrations(prev => prev.map(integration =>
        integration.id === selectedIntegration.id
          ? { ...integration, isConnected: true, status: 'testing' }
          : integration
      ));
      testConnection(selectedIntegration);
      setSelectedIntegration(null);
      setCredentials({});
    }
  };

  const renderCredentialField = (field: CredentialField) => {
    const value = credentials[field.key] || '';
    
    return (
      <div key={field.key} className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        {field.type === 'select' ? (
          <select
            value={value}
            onChange={(e) => setCredentials(prev => ({ ...prev, [field.key]: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={field.required}
          >
            <option value="">Select...</option>
            {field.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        ) : field.type === 'textarea' ? (
          <textarea
            value={value}
            onChange={(e) => setCredentials(prev => ({ ...prev, [field.key]: e.target.value }))}
            placeholder={field.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            required={field.required}
          />
        ) : (
          <input
            type={field.type === 'password' ? 'password' : field.type === 'number' ? 'number' : 'text'}
            value={value}
            onChange={(e) => setCredentials(prev => ({ ...prev, [field.key]: e.target.value }))}
            placeholder={field.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={field.required}
          />
        )}
        
        {field.description && (
          <p className="text-xs text-gray-500">{field.description}</p>
        )}
      </div>
    );
  };

  if (showMarketplace) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowMarketplace(false)}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Integration Marketplace</h1>
              <p className="text-gray-600">Connect to databases, APIs, AI services, and more</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search integrations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {allCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {allCategories.map(category => {
            const count = filteredTemplates.filter(t => t.category === category).length;
            return (
              <button
                key={category}
                onClick={() => setFilterCategory(filterCategory === category ? 'all' : category)}
                className={`p-3 rounded-lg border text-center transition-all ${
                  filterCategory === category
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-center mb-1">
                  {getCategoryIcon(category)}
                </div>
                <div className="text-xs font-medium">{category}</div>
                <div className="text-xs text-gray-500">{count}</div>
              </button>
            );
          })}
        </div>

        {/* Integration Templates */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map(template => (
            <div key={template.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 ${template.color} rounded-lg flex items-center justify-center text-white text-xl`}>
                    {template.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                    <p className="text-sm text-gray-500">{template.category}</p>
                  </div>
                </div>
                {template.featured && <Star className="w-5 h-5 text-yellow-500 fill-current" />}
              </div>
              
              <p className="text-sm text-gray-600 mb-4">{template.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <ShieldCheck className="w-4 h-4" />
                  Secure {template.type}
                </div>
                <button
                  onClick={() => addIntegration(template)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  Add Integration
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (selectedIntegration) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedIntegration(null)}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 ${selectedIntegration.color} rounded-lg flex items-center justify-center text-white text-xl`}>
                {selectedIntegration.icon}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Configure {selectedIntegration.name}</h1>
                <p className="text-gray-600">{selectedIntegration.description}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(selectedIntegration.status)}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedIntegration.status)}`}>
              {selectedIntegration.status}
            </span>
          </div>
        </div>

        {/* Configuration Form */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Connection Settings</h2>
          
          {selectedIntegration.credentials && (
            <div className="space-y-4">
              {selectedIntegration.credentials.fields.map(field => renderCredentialField(field))}
              
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <ShieldCheck className="w-4 h-4" />
                  Credentials are encrypted and stored securely
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => testConnection(selectedIntegration)}
                    disabled={testingConnection}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {testingConnection ? (
                      <>
                        <TestTube className="w-4 h-4 animate-pulse" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <TestTube className="w-4 h-4" />
                        Test Connection
                      </>
                    )}
                  </button>
                  <button
                    onClick={saveCredentials}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save & Connect
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
          <p className="text-gray-600">Connect and manage integrations with external tools and services</p>
        </div>
        <button
          onClick={() => setShowMarketplace(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Integration
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Connected</p>
              <p className="text-2xl font-bold">{integrations.filter(i => i.isConnected).length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Active</p>
              <p className="text-2xl font-bold">{integrations.filter(i => i.status === 'active').length}</p>
            </div>
            <Zap className="w-8 h-8 text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100">Errors</p>
              <p className="text-2xl font-bold">{integrations.filter(i => i.status === 'error').length}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Available</p>
              <p className="text-2xl font-bold">{TOTAL_INTEGRATION_COUNT}</p>
            </div>
            <Database className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search integrations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Categories</option>
          {allCategories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="error">Error</option>
          <option value="pending">Pending</option>
          <option value="disabled">Disabled</option>
        </select>
      </div>

      {/* Integrations List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredIntegrations.map(integration => (
          <div key={integration.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 ${integration.color} rounded-lg flex items-center justify-center text-white text-xl`}>
                  {integration.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                  <p className="text-sm text-gray-500">{integration.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(integration.status)}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(integration.status)}`}>
                  {integration.status}
                </span>
              </div>
            </div>
            
            {integration.isConnected && integration.lastSync && (
              <div className="text-xs text-gray-500 mb-4">
                Last sync: {new Date(integration.lastSync).toLocaleString()}
                {integration.syncCount && ` • ${integration.syncCount} syncs`}
                {integration.errorCount && integration.errorCount > 0 && ` • ${integration.errorCount} errors`}
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {getCategoryIcon(integration.category)}
                {integration.category}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedIntegration(integration)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={() => testConnection(integration)}
                  disabled={testingConnection}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
                >
                  <TestTube className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleIntegration(integration.id)}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${
                    integration.isConnected
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {integration.isConnected ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredIntegrations.length === 0 && (
        <div className="text-center py-12">
          <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No integrations found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search or filters, or add a new integration.</p>
          <button
            onClick={() => setShowMarketplace(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Marketplace
          </button>
        </div>
      )}
    </div>
  );
}