"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useRibbonPage } from "@/components/ribbon";
import { I18nProvider } from "@/components/utils/I18nProvider";
import { ToastProvider } from "@/components/utils/ToastProvider";
import { 
  Settings, 
  Server, 
  Database, 
  Shield,
  Globe,
  Palette,
  Bell,
  Mail,
  Code,
  Key,
  Zap,
  Monitor,
  HardDrive,
  Wifi,
  Lock,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Edit,
  Copy
} from "lucide-react";

interface SystemSettings {
  general: {
    platformName: string;
    supportEmail: string;
    maintenanceMode: boolean;
    allowRegistrations: boolean;
    defaultUserRole: string;
    sessionTimeout: number;
  };
  database: {
    connectionString: string;
    maxConnections: number;
    backupFrequency: string;
    retentionDays: number;
    encryptionEnabled: boolean;
  };
  api: {
    rateLimitPerMinute: number;
    enableCors: boolean;
    allowedOrigins: string;
    apiVersion: string;
    documentationUrl: string;
  };
  security: {
    enforceHttps: boolean;
    requireTwoFactor: boolean;
    passwordMinLength: number;
    sessionEncryption: boolean;
    ipWhitelist: string;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUsername: string;
    smtpPassword: string;
    fromAddress: string;
    enableTls: boolean;
  };
  performance: {
    cacheEnabled: boolean;
    cacheTimeout: number;
    compressionEnabled: boolean;
    cdnEnabled: boolean;
    cdnUrl: string;
  };
  monitoring: {
    enableLogging: boolean;
    logLevel: string;
    enableMetrics: boolean;
    alertThresholds: {
      cpuUsage: number;
      memoryUsage: number;
      diskUsage: number;
      errorRate: number;
    };
  };
}

function SoftwareSettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      platformName: 'GhostCRM Platform',
      supportEmail: 'support@ghostcrm.app',
      maintenanceMode: false,
      allowRegistrations: true,
      defaultUserRole: 'sales_rep',
      sessionTimeout: 24
    },
    database: {
      connectionString: 'postgresql://****:****@localhost:5432/ghostcrm',
      maxConnections: 100,
      backupFrequency: 'daily',
      retentionDays: 30,
      encryptionEnabled: true
    },
    api: {
      rateLimitPerMinute: 1000,
      enableCors: true,
      allowedOrigins: '*.ghostcrm.app',
      apiVersion: 'v1',
      documentationUrl: 'https://docs.ghostcrm.app'
    },
    security: {
      enforceHttps: true,
      requireTwoFactor: false,
      passwordMinLength: 8,
      sessionEncryption: true,
      ipWhitelist: ''
    },
    email: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUsername: 'notifications@ghostcrm.app',
      smtpPassword: '****',
      fromAddress: 'noreply@ghostcrm.app',
      enableTls: true
    },
    performance: {
      cacheEnabled: true,
      cacheTimeout: 3600,
      compressionEnabled: true,
      cdnEnabled: true,
      cdnUrl: 'https://cdn.ghostcrm.app'
    },
    monitoring: {
      enableLogging: true,
      logLevel: 'info',
      enableMetrics: true,
      alertThresholds: {
        cpuUsage: 80,
        memoryUsage: 85,
        diskUsage: 90,
        errorRate: 5
      }
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [showPasswords, setShowPasswords] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useRibbonPage({
    context: "settings",
    enable: [
      "save",
      "export",
      "profile",
      "notifications",
      "theme",
      "language"
    ],
    disable: []
  });

  // Redirect non-software owners
  useEffect(() => {
    if (!loading && user) {
      const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
      const isSubdomain = hostname !== 'localhost' && hostname !== '127.0.0.1' && hostname.includes('.localhost');
      const isSoftwareOwner = user.role === 'owner' && !isSubdomain;
      
      if (!isSoftwareOwner) {
        router.push('/dashboard');
      }
    }
  }, [user, loading, router]);

  // Fetch settings
  useEffect(() => {
    async function fetchSettings() {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        // const response = await fetch('/api/owner/settings');
        // const data = await response.json();
        // setSettings(data);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  const updateSetting = (section: keyof SystemSettings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const updateThreshold = (field: string, value: number) => {
    setSettings(prev => ({
      ...prev,
      monitoring: {
        ...prev.monitoring,
        alertThresholds: {
          ...prev.monitoring.alertThresholds,
          [field]: value
        }
      }
    }));
    setHasChanges(true);
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // TODO: Replace with actual API call
      // await fetch('/api/owner/settings', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(settings)
      // });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'database', name: 'Database', icon: Database },
    { id: 'api', name: 'API', icon: Code },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'performance', name: 'Performance', icon: Zap },
    { id: 'monitoring', name: 'Monitoring', icon: Monitor }
  ];

  if (loading) {
    return (
      <I18nProvider>
        <ToastProvider>
          <div className="p-6">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="h-96 bg-gray-200 rounded"></div>
                <div className="lg:col-span-3 h-96 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </ToastProvider>
      </I18nProvider>
    );
  }

  return (
    <I18nProvider>
      <ToastProvider>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3">
                <Settings className="h-8 w-8 text-gray-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Software Settings</h1>
                  <p className="text-gray-600 mt-1">Configure platform backend and frontend settings</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Reset to Defaults
              </button>
              <button
                onClick={saveSettings}
                disabled={!hasChanges || saving}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  hasChanges && !saving
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Changes Indicator */}
          {hasChanges && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <p className="text-yellow-800 font-medium">You have unsaved changes</p>
                <button
                  onClick={saveSettings}
                  className="ml-auto px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                >
                  Save Now
                </button>
              </div>
            </div>
          )}

          {/* Settings Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Settings Panel */}
            <div className="lg:col-span-3 bg-white rounded-lg shadow-sm border p-6">
              {/* General Settings */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">General Settings</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Platform Name</label>
                      <input
                        type="text"
                        value={settings.general.platformName}
                        onChange={(e) => updateSetting('general', 'platformName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
                      <input
                        type="email"
                        value={settings.general.supportEmail}
                        onChange={(e) => updateSetting('general', 'supportEmail', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Default User Role</label>
                      <select
                        value={settings.general.defaultUserRole}
                        onChange={(e) => updateSetting('general', 'defaultUserRole', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="sales_rep">Sales Rep</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (hours)</label>
                      <input
                        type="number"
                        value={settings.general.sessionTimeout}
                        onChange={(e) => updateSetting('general', 'sessionTimeout', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Maintenance Mode</p>
                        <p className="text-sm text-gray-500">Temporarily disable access to the platform</p>
                      </div>
                      <button
                        onClick={() => updateSetting('general', 'maintenanceMode', !settings.general.maintenanceMode)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.general.maintenanceMode ? 'bg-red-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.general.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Allow Registrations</p>
                        <p className="text-sm text-gray-500">Allow new tenants to register</p>
                      </div>
                      <button
                        onClick={() => updateSetting('general', 'allowRegistrations', !settings.general.allowRegistrations)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.general.allowRegistrations ? 'bg-green-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.general.allowRegistrations ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Password Length</label>
                      <input
                        type="number"
                        value={settings.security.passwordMinLength}
                        onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">IP Whitelist</label>
                      <input
                        type="text"
                        value={settings.security.ipWhitelist}
                        onChange={(e) => updateSetting('security', 'ipWhitelist', e.target.value)}
                        placeholder="192.168.1.0/24, 10.0.0.0/8"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Enforce HTTPS</p>
                        <p className="text-sm text-gray-500">Redirect all HTTP traffic to HTTPS</p>
                      </div>
                      <button
                        onClick={() => updateSetting('security', 'enforceHttps', !settings.security.enforceHttps)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.security.enforceHttps ? 'bg-green-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.security.enforceHttps ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Require Two-Factor Authentication</p>
                        <p className="text-sm text-gray-500">Enforce 2FA for all admin users</p>
                      </div>
                      <button
                        onClick={() => updateSetting('security', 'requireTwoFactor', !settings.security.requireTwoFactor)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.security.requireTwoFactor ? 'bg-green-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.security.requireTwoFactor ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Monitoring Settings */}
              {activeTab === 'monitoring' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">Monitoring & Alerts</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Log Level</label>
                      <select
                        value={settings.monitoring.logLevel}
                        onChange={(e) => updateSetting('monitoring', 'logLevel', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="error">Error</option>
                        <option value="warn">Warning</option>
                        <option value="info">Info</option>
                        <option value="debug">Debug</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Alert Thresholds</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">CPU Usage (%)</label>
                        <input
                          type="number"
                          value={settings.monitoring.alertThresholds.cpuUsage}
                          onChange={(e) => updateThreshold('cpuUsage', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Memory Usage (%)</label>
                        <input
                          type="number"
                          value={settings.monitoring.alertThresholds.memoryUsage}
                          onChange={(e) => updateThreshold('memoryUsage', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Disk Usage (%)</label>
                        <input
                          type="number"
                          value={settings.monitoring.alertThresholds.diskUsage}
                          onChange={(e) => updateThreshold('diskUsage', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Error Rate (%)</label>
                        <input
                          type="number"
                          value={settings.monitoring.alertThresholds.errorRate}
                          onChange={(e) => updateThreshold('errorRate', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Add other tab content as needed */}
              {activeTab !== 'general' && activeTab !== 'security' && activeTab !== 'monitoring' && (
                <div className="text-center py-12">
                  <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{tabs.find(t => t.id === activeTab)?.name} Settings</h3>
                  <p className="text-gray-500">Configuration options for {activeTab} will be available soon.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </ToastProvider>
    </I18nProvider>
  );
}

export default function SoftwareSettings() {
  return <SoftwareSettingsPage />;
}