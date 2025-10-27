"use client";

import React, { useState, useEffect } from "react";
import { 
  Shield, 
  Key, 
  Lock, 
  Unlock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Database,
  Activity,
  BarChart3,
  Settings,
  Trash2,
  TestTube,
  Clock
} from "lucide-react";

interface EncryptionStatus {
  isValid: boolean;
  warnings: string[];
  algorithm: string;
  status: string;
}

interface ConnectionStats {
  total: number;
  active: number;
  inactive: number;
  byCategory: Record<string, number>;
  byType: Record<string, number>;
}

interface StoredConnection {
  id: string;
  integrationId: string;
  name: string;
  category: string;
  type: string;
  status: string;
  isConnected: boolean;
  connectedAt: string;
  lastUsed?: string;
  hasCredentials: boolean;
  metadata: Record<string, any>;
}

export default function SecurityDashboard() {
  const [encryptionStatus, setEncryptionStatus] = useState<EncryptionStatus | null>(null);
  const [connections, setConnections] = useState<StoredConnection[]>([]);
  const [stats, setStats] = useState<ConnectionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<StoredConnection | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [showEncryptionDetails, setShowEncryptionDetails] = useState(false);

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load encryption status
      const encryptionResponse = await fetch('/api/settings/integrations/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'validate_encryption'
        })
      });
      const encryptionResult = await encryptionResponse.json();
      
      if (encryptionResult.success) {
        setEncryptionStatus(encryptionResult.data.encryption);
      }

      // Load stored connections
      const connectionsResponse = await fetch('/api/settings/integrations/connections?userId=demo-user');
      const connectionsResult = await connectionsResponse.json();
      
      if (connectionsResult.success) {
        setConnections(connectionsResult.data.connections || []);
        setStats(connectionsResult.data.stats);
      }

    } catch (err) {
      setError('Failed to load security data');
      console.error('Security dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async (connectionId: string) => {
    setTesting(connectionId);
    
    try {
      const response = await fetch('/api/settings/integrations/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test',
          connectionId,
          userId: 'demo-user'
        })
      });
      const result = await response.json();
      
      if (result.success) {
        // Update connection status
        setConnections(connections.map(conn => 
          conn.id === connectionId 
            ? { ...conn, lastUsed: new Date().toISOString() }
            : conn
        ));
      } else {
        setError(result.error || 'Connection test failed');
      }
    } catch (err) {
      setError('Failed to test connection');
    } finally {
      setTesting(null);
    }
  };

  const deleteConnection = async (connectionId: string) => {
    if (!confirm('Are you sure you want to delete this connection? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/settings/integrations/connections?connectionId=${connectionId}&userId=demo-user`, {
        method: 'DELETE'
      });
      const result = await response.json();
      
      if (result.success) {
        setConnections(connections.filter(conn => conn.id !== connectionId));
        setSelectedConnection(null);
      } else {
        setError(result.error || 'Failed to delete connection');
      }
    } catch (err) {
      setError('Failed to delete connection');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      error: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status as keyof typeof colors] || colors.inactive;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
        <span className="ml-2">Loading security dashboard...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Security Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor encryption status and manage stored connections</p>
        </div>
        <button
          onClick={loadSecurityData}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Encryption Status */}
      {encryptionStatus && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${encryptionStatus.isValid ? 'bg-green-100' : 'bg-yellow-100'}`}>
                {encryptionStatus.isValid ? (
                  <Shield className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold">Encryption Status</h2>
                <p className="text-sm text-gray-600">
                  {encryptionStatus.algorithm} • {encryptionStatus.status}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowEncryptionDetails(!showEncryptionDetails)}
              className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              {showEncryptionDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showEncryptionDetails ? 'Hide' : 'Show'} Details
            </button>
          </div>

          {showEncryptionDetails && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {encryptionStatus.isValid ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                )}
                <span className="text-sm">
                  Encryption: {encryptionStatus.isValid ? 'Secure' : 'Needs Attention'}
                </span>
              </div>
              
              {encryptionStatus.warnings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-yellow-800 mb-2">Security Warnings:</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {encryptionStatus.warnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Connection Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Database className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-gray-600">Total Connections</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-sm text-gray-600">Active</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Lock className="w-8 h-8 text-gray-500" />
              <div>
                <p className="text-2xl font-bold">{stats.inactive}</p>
                <p className="text-sm text-gray-600">Inactive</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{Object.keys(stats.byCategory).length}</p>
                <p className="text-sm text-gray-600">Categories</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stored Connections */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Stored Connections</h2>
          <p className="text-sm text-gray-600 mt-1">
            All credentials are encrypted with AES-256 encryption
          </p>
        </div>

        {connections.length === 0 ? (
          <div className="p-8 text-center">
            <Database className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No stored connections found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {connections.map((connection) => (
              <div key={connection.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Key className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">{connection.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{connection.category}</span>
                        <span>•</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(connection.status)}`}>
                          {connection.status}
                        </span>
                        <span>•</span>
                        <span>{connection.hasCredentials ? 'Encrypted' : 'No credentials'}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Connected: {formatDate(connection.connectedAt)}
                        {connection.lastUsed && (
                          <span> • Last used: {formatDate(connection.lastUsed)}</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => testConnection(connection.id)}
                      disabled={testing === connection.id}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm border border-blue-500 text-blue-500 rounded hover:bg-blue-50 disabled:opacity-50"
                    >
                      {testing === connection.id ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <TestTube className="w-4 h-4" />
                      )}
                      Test
                    </button>
                    <button
                      onClick={() => deleteConnection(connection.id)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm border border-red-500 text-red-500 rounded hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}