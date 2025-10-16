"use client";

import React, { useState, useEffect } from "react";
import { 
  Shield, 
  Key, 
  Lock, 
  Eye, 
  EyeOff, 
  Smartphone, 
  Fingerprint, 
  Mail, 
  AlertTriangle, 
  CheckCircle,
  X,
  Plus,
  Trash2,
  Copy,
  QrCode,
  Download,
  Upload,
  Settings,
  Clock,
  Globe,
  User,
  RefreshCw
} from "lucide-react";

interface SecuritySetting {
  id: string;
  title: string;
  description: string;
  isEnabled: boolean;
  type: 'toggle' | 'action' | 'info';
  lastUpdated?: string;
  status?: 'active' | 'warning' | 'inactive';
}

interface LoginSession {
  id: string;
  device: string;
  location: string;
  ipAddress: string;
  browser: string;
  lastActive: string;
  isCurrent: boolean;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  lastUsed: string;
  createdAt: string;
  expiresAt?: string;
}

const mockSecuritySettings: SecuritySetting[] = [
  {
    id: 'two-factor',
    title: 'Two-Factor Authentication',
    description: 'Add an extra layer of security to your account',
    isEnabled: true,
    type: 'toggle',
    lastUpdated: '2024-10-12T14:30:00Z',
    status: 'active'
  },
  {
    id: 'webauthn',
    title: 'Biometric Authentication',
    description: 'Use fingerprint or face recognition to sign in',
    isEnabled: false,
    type: 'toggle',
    status: 'inactive'
  },
  {
    id: 'login-alerts',
    title: 'Login Alerts',
    description: 'Get notified of new sign-ins to your account',
    isEnabled: true,
    type: 'toggle',
    lastUpdated: '2024-10-10T09:15:00Z',
    status: 'active'
  },
  {
    id: 'session-timeout',
    title: 'Session Timeout',
    description: 'Automatically sign out after period of inactivity',
    isEnabled: true,
    type: 'toggle',
    lastUpdated: '2024-10-08T16:45:00Z',
    status: 'active'
  }
];

const mockLoginSessions: LoginSession[] = [
  {
    id: '1',
    device: 'MacBook Pro',
    location: 'New York, NY',
    ipAddress: '192.168.1.100',
    browser: 'Chrome 118.0',
    lastActive: '2024-10-14T10:30:00Z',
    isCurrent: true
  },
  {
    id: '2',
    device: 'iPhone 15',
    location: 'New York, NY',
    ipAddress: '192.168.1.101',
    browser: 'Safari Mobile',
    lastActive: '2024-10-14T08:45:00Z',
    isCurrent: false
  },
  {
    id: '3',
    device: 'Windows PC',
    location: 'Boston, MA',
    ipAddress: '203.0.113.42',
    browser: 'Edge 117.0',
    lastActive: '2024-10-13T14:20:00Z',
    isCurrent: false
  }
];

const mockApiKeys: ApiKey[] = [
  {
    id: '1',
    name: 'Production API',
    key: 'sk_live_1234567890abcdef',
    permissions: ['read', 'write', 'delete'],
    lastUsed: '2024-10-14T09:30:00Z',
    createdAt: '2024-09-01T10:00:00Z',
    expiresAt: '2025-09-01T10:00:00Z'
  },
  {
    id: '2',
    name: 'Mobile App',
    key: 'sk_test_abcdef1234567890',
    permissions: ['read', 'write'],
    lastUsed: '2024-10-13T16:15:00Z',
    createdAt: '2024-08-15T14:30:00Z'
  },
  {
    id: '3',
    name: 'Webhook Endpoint',
    key: 'sk_webhook_0987654321fedcba',
    permissions: ['webhook'],
    lastUsed: '2024-10-12T11:45:00Z',
    createdAt: '2024-07-20T09:20:00Z',
    expiresAt: '2024-12-20T09:20:00Z'
  }
];

export default function SecuritySettings() {
  const [securitySettings, setSecuritySettings] = useState<SecuritySetting[]>(mockSecuritySettings);
  const [loginSessions, setLoginSessions] = useState<LoginSession[]>(mockLoginSessions);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(mockApiKeys);
  const [activeTab, setActiveTab] = useState('overview');
  const [showNewApiKey, setShowNewApiKey] = useState(false);
  const [showApiKey, setShowApiKey] = useState<{[key: string]: boolean}>({});

  const toggleSetting = (settingId: string) => {
    setSecuritySettings(prev => prev.map(setting => 
      setting.id === settingId 
        ? { 
            ...setting, 
            isEnabled: !setting.isEnabled,
            lastUpdated: new Date().toISOString(),
            status: setting.isEnabled ? 'inactive' : 'active'
          }
        : setting
    ));
  };

  const revokeSession = (sessionId: string) => {
    setLoginSessions(prev => prev.filter(session => session.id !== sessionId));
  };

  const revokeApiKey = (keyId: string) => {
    setApiKeys(prev => prev.filter(key => key.id !== keyId));
  };

  const toggleApiKeyVisibility = (keyId: string) => {
    setShowApiKey(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'inactive': return <X className="w-4 h-4 text-gray-600" />;
      default: return <Shield className="w-4 h-4 text-gray-600" />;
    }
  };

  const getDeviceIcon = (device: string) => {
    if (device.includes('iPhone') || device.includes('Android')) {
      return <Smartphone className="w-4 h-4" />;
    }
    return <Globe className="w-4 h-4" />;
  };

  const maskApiKey = (key: string) => {
    return key.substring(0, 8) + '••••••••••••••••' + key.substring(key.length - 4);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Security & Privacy</h1>
            <p className="text-gray-600">Manage your account security settings and privacy preferences</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              Security Report
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Shield className="w-4 h-4" />
              Security Checkup
            </button>
          </div>
        </div>

        {/* Security Score */}
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-900">Good Security Score</h3>
                <p className="text-green-700">Your account is well protected with 2FA and strong passwords</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-900">85/100</div>
              <div className="text-sm text-green-700">Security Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: Shield },
              { id: 'authentication', label: 'Authentication', icon: Lock },
              { id: 'sessions', label: 'Login Sessions', icon: Globe },
              { id: 'api-keys', label: 'API Keys', icon: Key }
            ].map(tab => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Security Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
            <div className="space-y-4">
              {securitySettings.map(setting => (
                <div key={setting.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(setting.status || 'inactive')}
                    <div>
                      <h4 className="font-medium text-gray-900">{setting.title}</h4>
                      <p className="text-sm text-gray-600">{setting.description}</p>
                      {setting.lastUpdated && (
                        <p className="text-xs text-gray-500 mt-1">
                          Last updated: {new Date(setting.lastUpdated).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSetting(setting.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      setting.isEnabled ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        setting.isEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Security Activity */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Security Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Password updated successfully</p>
                  <p className="text-xs text-gray-500">October 12, 2024 at 2:30 PM</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Shield className="w-5 h-5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Two-factor authentication enabled</p>
                  <p className="text-xs text-gray-500">October 10, 2024 at 9:15 AM</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">New login from Boston, MA</p>
                  <p className="text-xs text-gray-500">October 8, 2024 at 4:45 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'authentication' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Authentication Methods</h3>
          
          {/* Password Section */}
          <div className="space-y-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-gray-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">Password</h4>
                    <p className="text-sm text-gray-600">Last changed 3 days ago</p>
                  </div>
                </div>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Change Password
                </button>
              </div>
            </div>

            {/* Two-Factor Authentication */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-green-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-600">Enabled with authenticator app</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    Active
                  </span>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    Reconfigure
                  </button>
                </div>
              </div>
              <div className="pl-8">
                <p className="text-sm text-gray-600 mb-3">Backup codes available: 8 remaining</p>
                <button className="text-sm text-blue-600 hover:text-blue-700">
                  View backup codes
                </button>
              </div>
            </div>

            {/* Biometric Authentication */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Fingerprint className="w-5 h-5 text-gray-400" />
                  <div>
                    <h4 className="font-medium text-gray-900">Biometric Authentication</h4>
                    <p className="text-sm text-gray-600">Use fingerprint or face recognition</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Set Up
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sessions' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Active Login Sessions</h3>
            <button className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors">
              <X className="w-4 h-4" />
              Revoke All
            </button>
          </div>
          
          <div className="space-y-4">
            {loginSessions.map(session => (
              <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getDeviceIcon(session.device)}
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">{session.device}</h4>
                        {session.isCurrent && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                            Current Session
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{session.browser}</p>
                      <p className="text-sm text-gray-500">{session.location} • {session.ipAddress}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Last active: {new Date(session.lastActive).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {!session.isCurrent && (
                    <button
                      onClick={() => revokeSession(session.id)}
                      className="px-3 py-1 text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'api-keys' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">API Keys</h3>
            <button 
              onClick={() => setShowNewApiKey(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New API Key
            </button>
          </div>
          
          <div className="space-y-4">
            {apiKeys.map(apiKey => (
              <div key={apiKey.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-gray-900">{apiKey.name}</h4>
                      <div className="flex items-center gap-1">
                        {apiKey.permissions.map(permission => (
                          <span key={permission} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {permission}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <code className="px-2 py-1 bg-gray-100 text-sm rounded font-mono">
                        {showApiKey[apiKey.id] ? apiKey.key : maskApiKey(apiKey.key)}
                      </code>
                      <button
                        onClick={() => toggleApiKeyVisibility(apiKey.id)}
                        className="p-1 text-gray-600 hover:text-gray-900"
                      >
                        {showApiKey[apiKey.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button className="p-1 text-gray-600 hover:text-gray-900">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-sm text-gray-500">
                      <p>Created: {new Date(apiKey.createdAt).toLocaleDateString()}</p>
                      <p>Last used: {new Date(apiKey.lastUsed).toLocaleDateString()}</p>
                      {apiKey.expiresAt && (
                        <p>Expires: {new Date(apiKey.expiresAt).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => revokeApiKey(apiKey.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
