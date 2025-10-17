'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { CheckCircle, XCircle, Plus, Settings, Database, TestTube, Trash2 } from 'lucide-react';

interface ClientConfig {
  id: string;
  name: string;
  database_type: 'supabase' | 'mysql' | 'postgresql' | 'rest_api' | 'custom';
  connection_config: any;
  field_mappings?: Record<string, string>;
  custom_validations?: Record<string, any>;
  integration_settings?: any;
  created_at: string;
  updated_at: string;
  status: 'active' | 'inactive' | 'testing';
}

export default function ClientConfigManager() {
  const [clients, setClients] = useState<ClientConfig[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientConfig | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const response = await fetch('/api/admin/client-config');
      const result = await response.json();
      if (result.success) {
        setClients(result.data);
      }
    } catch (error) {
      console.error('Failed to load clients:', error);
    }
  };

  const saveClient = async (config: Partial<ClientConfig>) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/client-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: config.id ? 'update' : 'create',
          config
        })
      });

      const result = await response.json();
      if (result.success) {
        await loadClients();
        setIsEditing(false);
        setSelectedClient(result.data.config);
      }
    } catch (error) {
      console.error('Failed to save client:', error);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async (config: ClientConfig) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/client-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test_connection',
          config
        })
      });

      const result = await response.json();
      if (result.success) {
        setTestResult(result.data);
      }
    } catch (error) {
      console.error('Failed to test connection:', error);
      setTestResult({ success: false, message: 'Test failed' });
    } finally {
      setLoading(false);
    }
  };

  const deleteClient = async (clientId: string) => {
    if (!confirm('Are you sure you want to delete this client configuration?')) return;

    setLoading(true);
    try {
      const response = await fetch('/api/admin/client-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          client_id: clientId
        })
      });

      const result = await response.json();
      if (result.success) {
        await loadClients();
        setSelectedClient(null);
      }
    } catch (error) {
      console.error('Failed to delete client:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Client Database Configurations</h1>
          <p className="text-gray-600">Manage multi-tenant database integrations and field mappings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Client List */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="flex flex-row items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Clients</h3>
                  <p className="text-sm text-gray-500">Configure database connections</p>
                </div>
                <Button
                  onClick={() => {
                    setSelectedClient({
                      id: '',
                      name: '',
                      database_type: 'supabase',
                      connection_config: {},
                      status: 'testing',
                      created_at: '',
                      updated_at: ''
                    });
                    setIsEditing(true);
                  }}
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Client
                </Button>
              </div>
              
              <div className="space-y-2">
                {clients.map((client) => (
                  <div
                    key={client.id}
                    className={`p-4 border-l-4 cursor-pointer hover:bg-gray-50 rounded ${
                      selectedClient?.id === client.id ? 'bg-blue-50 border-l-blue-500' : 'border-l-gray-200'
                    }`}
                    onClick={() => {
                      setSelectedClient(client);
                      setIsEditing(false);
                      setTestResult(null);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{client.name}</h3>
                        <p className="text-sm text-gray-500">{client.database_type}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        client.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : client.status === 'testing' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {client.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Client Details */}
          <div className="lg:col-span-2">
            {selectedClient ? (
              <Card className="p-6">
                <div className="flex flex-row items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold">{isEditing ? 'Edit Client' : selectedClient.name}</h3>
                    <p className="text-sm text-gray-500">
                      {isEditing ? 'Configure database connection and mappings' : 'View and manage client configuration'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!isEditing && (
                      <>
                        <Button onClick={() => testConnection(selectedClient)} variant="outline" disabled={loading}>
                          <TestTube className="h-4 w-4 mr-2" />
                          Test Connection
                        </Button>
                        <Button onClick={() => setIsEditing(true)} variant="outline">
                          <Settings className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        {selectedClient.id !== 'default' && (
                          <Button 
                            onClick={() => deleteClient(selectedClient.id)} 
                            variant="outline"
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {testResult && (
                  <div className={`mb-4 p-3 rounded border ${testResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-center">
                      {testResult.success ? (
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500 mr-2" />
                      )}
                      <p className="text-sm">{testResult.message}</p>
                    </div>
                  </div>
                )}

                {isEditing ? (
                  <ClientConfigForm
                    client={selectedClient}
                    onSave={saveClient}
                    onCancel={() => setIsEditing(false)}
                    loading={loading}
                  />
                ) : (
                  <ClientConfigView client={selectedClient} />
                )}
              </Card>
            ) : (
              <Card className="p-6">
                <div className="flex items-center justify-center h-96 text-gray-500">
                  <div className="text-center">
                    <Database className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Select a client to view configuration details</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ClientConfigForm({ 
  client, 
  onSave, 
  onCancel, 
  loading 
}: { 
  client: ClientConfig; 
  onSave: (config: Partial<ClientConfig>) => void; 
  onCancel: () => void; 
  loading: boolean; 
}) {
  const [formData, setFormData] = useState(client);
  const [activeTab, setActiveTab] = useState('basic');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'basic', label: 'Basic Info' },
            { id: 'connection', label: 'Connection' },
            { id: 'mappings', label: 'Field Mappings' },
            { id: 'settings', label: 'Settings' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'basic' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter client name"
                required
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select 
                value={formData.status} 
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="testing">Testing</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="database_type" className="block text-sm font-medium text-gray-700 mb-1">Database Type</label>
            <select 
              value={formData.database_type} 
              onChange={(e) => setFormData({ ...formData, database_type: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="supabase">Supabase</option>
              <option value="rest_api">REST API</option>
              <option value="mysql">MySQL</option>
              <option value="postgresql">PostgreSQL</option>
              <option value="custom">Custom</option>
            </select>
          </div>
        </div>
      )}

      {activeTab === 'connection' && (
        <div className="space-y-4">
          {formData.database_type === 'supabase' && (
            <>
              <div>
                <label htmlFor="supabase_url" className="block text-sm font-medium text-gray-700 mb-1">Supabase URL</label>
                <Input
                  id="supabase_url"
                  value={formData.connection_config?.url || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    connection_config: { ...formData.connection_config, url: e.target.value }
                  })}
                  placeholder="https://your-project.supabase.co"
                />
              </div>
              <div>
                <label htmlFor="supabase_key" className="block text-sm font-medium text-gray-700 mb-1">Service Role Key</label>
                <Input
                  id="supabase_key"
                  type="password"
                  value={formData.connection_config?.key || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    connection_config: { ...formData.connection_config, key: e.target.value }
                  })}
                  placeholder="Your service role key"
                />
              </div>
            </>
          )}

          {formData.database_type === 'rest_api' && (
            <>
              <div>
                <label htmlFor="api_url" className="block text-sm font-medium text-gray-700 mb-1">API Base URL</label>
                <Input
                  id="api_url"
                  value={formData.connection_config?.baseUrl || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    connection_config: { ...formData.connection_config, baseUrl: e.target.value }
                  })}
                  placeholder="https://api.example.com/v1"
                />
              </div>
              <div>
                <label htmlFor="api_key" className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                <Input
                  id="api_key"
                  type="password"
                  value={formData.connection_config?.apiKey || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    connection_config: { ...formData.connection_config, apiKey: e.target.value }
                  })}
                  placeholder="Your API key"
                />
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'mappings' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Field Mappings</label>
            <p className="text-sm text-gray-500 mb-2">Map standard CRM fields to client-specific fields</p>
            <textarea
              value={JSON.stringify(formData.field_mappings || {}, null, 2)}
              onChange={(e) => {
                try {
                  const mappings = JSON.parse(e.target.value);
                  setFormData({ ...formData, field_mappings: mappings });
                } catch {}
              }}
              placeholder='{\n  "stock_on_hand": "inventory_count",\n  "price_selling": "sale_price"\n}'
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Integration Settings</label>
            <p className="text-sm text-gray-500 mb-2">Configure sync settings and webhooks</p>
            <textarea
              value={JSON.stringify(formData.integration_settings || {}, null, 2)}
              onChange={(e) => {
                try {
                  const settings = JSON.parse(e.target.value);
                  setFormData({ ...formData, integration_settings: settings });
                } catch {}
              }}
              placeholder='{\n  "sync_frequency": 30,\n  "auto_sync": true,\n  "webhook_url": "https://client.com/webhook"\n}'
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="bg-blue-600 text-white hover:bg-blue-700">
          {loading ? 'Saving...' : 'Save Configuration'}
        </Button>
      </div>
    </form>
  );
}

function ClientConfigView({ client }: { client: ClientConfig }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Client ID</label>
          <p className="font-mono text-sm">{client.id}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Database Type</label>
          <p className="capitalize">{client.database_type}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Status</label>
          <span className={`px-2 py-1 text-xs rounded-full ${
            client.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : client.status === 'testing' 
              ? 'bg-yellow-100 text-yellow-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {client.status}
          </span>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Last Updated</label>
          <p className="text-sm">{new Date(client.updated_at).toLocaleDateString()}</p>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-500">Connection Configuration</label>
        <div className="mt-2 p-3 bg-gray-50 rounded border">
          <pre className="text-xs overflow-auto">
            {JSON.stringify(client.connection_config, null, 2)}
          </pre>
        </div>
      </div>

      {client.field_mappings && Object.keys(client.field_mappings).length > 0 && (
        <div>
          <label className="text-sm font-medium text-gray-500">Field Mappings</label>
          <div className="mt-2 p-3 bg-gray-50 rounded border">
            <pre className="text-xs overflow-auto">
              {JSON.stringify(client.field_mappings, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}