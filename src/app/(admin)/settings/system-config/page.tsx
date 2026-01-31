"use client";

import React, { useState, useEffect } from "react";
import { 
  Database, 
  Server, 
  Users, 
  Shield, 
  HardDrive, 
  Activity, 
  RefreshCw, 
  Download, 
  Upload, 
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Globe,
  Mail,
  Key,
  Monitor,
  BarChart3,
  FileText,
  Calendar,
  User,
  Building,
  CreditCard,
  Bell,
  Lock
} from "lucide-react";

interface SystemMetric {
  id: string;
  label: string;
  value: string;
  status: 'good' | 'warning' | 'critical';
  description: string;
  lastUpdated: string;
}

interface SystemSetting {
  id: string;
  category: string;
  title: string;
  description: string;
  value: any;
  type: 'toggle' | 'text' | 'number' | 'select';
  options?: { label: string; value: any }[];
}

const mockSystemMetrics: SystemMetric[] = [
  {
    id: 'cpu',
    label: 'CPU Usage',
    value: '45%',
    status: 'good',
    description: 'Current CPU utilization across all cores',
    lastUpdated: '2024-10-14T10:30:00Z'
  },
  {
    id: 'memory',
    label: 'Memory Usage',
    value: '68%',
    status: 'warning',
    description: 'RAM utilization including cache and buffers',
    lastUpdated: '2024-10-14T10:30:00Z'
  },
  {
    id: 'disk',
    label: 'Disk Usage',
    value: '34%',
    status: 'good',
    description: 'Primary disk storage utilization',
    lastUpdated: '2024-10-14T10:30:00Z'
  },
  {
    id: 'database',
    label: 'Database Size',
    value: '2.4 GB',
    status: 'good',
    description: 'Total database storage consumption',
    lastUpdated: '2024-10-14T10:30:00Z'
  },
  {
    id: 'uptime',
    label: 'System Uptime',
    value: '15 days',
    status: 'good',
    description: 'Time since last system restart',
    lastUpdated: '2024-10-14T10:30:00Z'
  },
  {
    id: 'users',
    label: 'Active Users',
    value: '247',
    status: 'good',
    description: 'Currently logged in users',
    lastUpdated: '2024-10-14T10:30:00Z'
  }
];

const mockSystemSettings: SystemSetting[] = [
  // General Settings
  {
    id: 'siteName',
    category: 'General',
    title: 'Site Name',
    description: 'The name displayed across the application',
    value: 'GhostCRM',
    type: 'text'
  },
  {
    id: 'timezone',
    category: 'General',
    title: 'Default Timezone',
    description: 'System-wide default timezone',
    value: 'America/New_York',
    type: 'select',
    options: [
      { label: 'Eastern Time', value: 'America/New_York' },
      { label: 'Central Time', value: 'America/Chicago' },
      { label: 'Mountain Time', value: 'America/Denver' },
      { label: 'Pacific Time', value: 'America/Los_Angeles' }
    ]
  },
  {
    id: 'maintenanceMode',
    category: 'General',
    title: 'Maintenance Mode',
    description: 'Enable maintenance mode to block user access',
    value: false,
    type: 'toggle'
  },

  // Security Settings
  {
    id: 'sessionTimeout',
    category: 'Security',
    title: 'Session Timeout (minutes)',
    description: 'Auto-logout inactive users after specified time',
    value: 30,
    type: 'number'
  },
  {
    id: 'passwordPolicy',
    category: 'Security',
    title: 'Password Policy',
    description: 'Minimum password complexity requirements',
    value: 'strong',
    type: 'select',
    options: [
      { label: 'Basic', value: 'basic' },
      { label: 'Moderate', value: 'moderate' },
      { label: 'Strong', value: 'strong' },
      { label: 'Very Strong', value: 'very-strong' }
    ]
  },
  {
    id: 'loginAttempts',
    category: 'Security',
    title: 'Max Login Attempts',
    description: 'Lock account after failed login attempts',
    value: 5,
    type: 'number'
  },

  // Performance Settings
  {
    id: 'cacheEnabled',
    category: 'Performance',
    title: 'Enable Caching',
    description: 'Use Redis caching for improved performance',
    value: true,
    type: 'toggle'
  },
  {
    id: 'recordsPerPage',
    category: 'Performance',
    title: 'Default Records Per Page',
    description: 'Default pagination size for data tables',
    value: 25,
    type: 'select',
    options: [
      { label: '10', value: 10 },
      { label: '25', value: 25 },
      { label: '50', value: 50 },
      { label: '100', value: 100 }
    ]
  },

  // Email Settings
  {
    id: 'smtpHost',
    category: 'Email',
    title: 'SMTP Host',
    description: 'SMTP server hostname for outbound email',
    value: 'smtp.gmail.com',
    type: 'text'
  },
  {
    id: 'smtpPort',
    category: 'Email',
    title: 'SMTP Port',
    description: 'SMTP server port number',
    value: 587,
    type: 'number'
  },
  {
    id: 'emailNotifications',
    category: 'Email',
    title: 'System Email Notifications',
    description: 'Send automated system notifications via email',
    value: true,
    type: 'toggle'
  }
];

export default function SystemConfigPage() {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>(mockSystemMetrics);
  const [systemSettings, setSystemSettings] = useState<SystemSetting[]>(mockSystemSettings);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCategory, setSelectedCategory] = useState('General');
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const categories = [...new Set(systemSettings.map(s => s.category))];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'General': return <Settings className="w-5 h-5" />;
      case 'Security': return <Shield className="w-5 h-5" />;
      case 'Performance': return <Zap className="w-5 h-5" />;
      case 'Email': return <Mail className="w-5 h-5" />;
      default: return <Settings className="w-5 h-5" />;
    }
  };

  const updateSetting = (settingId: string, value: any) => {
    setSystemSettings(prev => prev.map(setting => 
      setting.id === settingId ? { ...setting, value } : setting
    ));
    setUnsavedChanges(true);
  };

  const saveSettings = () => {
    // Save system settings to backend
    setUnsavedChanges(false);
  };

  const renderSettingControl = (setting: SystemSetting) => {
    switch (setting.type) {
      case 'toggle':
        return (
          <button
            onClick={() => updateSetting(setting.id, !setting.value)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              setting.value ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                setting.value ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        );

      case 'select':
        return (
          <select
            value={setting.value}
            onChange={(e) => updateSetting(setting.id, e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {setting.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'number':
        return (
          <input
            type="number"
            value={setting.value}
            onChange={(e) => updateSetting(setting.id, parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-24"
          />
        );

      case 'text':
        return (
          <input
            type="text"
            value={setting.value}
            onChange={(e) => updateSetting(setting.id, e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );

      default:
        return null;
    }
  };

  const filteredSettings = systemSettings.filter(s => s.category === selectedCategory);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Configuration</h1>
            <p className="text-gray-600">Configure system-wide settings and monitor performance</p>
          </div>
          <div className="flex items-center gap-3">
            {unsavedChanges && (
              <span className="flex items-center gap-2 text-yellow-600 text-sm">
                <Clock className="w-4 h-4" />
                Unsaved changes
              </span>
            )}
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              Backup
            </button>
            <button
              onClick={saveSettings}
              disabled={!unsavedChanges}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                unsavedChanges
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Settings className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'System Overview', icon: Monitor },
              { id: 'settings', label: 'Configuration', icon: Settings },
              { id: 'users', label: 'User Management', icon: Users },
              { id: 'maintenance', label: 'Maintenance', icon: RefreshCw }
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
          {/* System Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {systemMetrics.map(metric => (
              <div key={metric.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{metric.label}</h3>
                  {getStatusIcon(metric.status)}
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">{metric.value}</div>
                <p className="text-sm text-gray-600 mb-2">{metric.description}</p>
                <p className="text-xs text-gray-500">
                  Updated: {new Date(metric.lastUpdated).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {/* System Status */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-gray-900">Database Connection</span>
                </div>
                <span className="text-green-600 text-sm">Connected</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-gray-900">Email Service</span>
                </div>
                <span className="text-green-600 text-sm">Operational</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <span className="font-medium text-gray-900">Background Jobs</span>
                </div>
                <span className="text-yellow-600 text-sm">2 Pending</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-gray-900">File Storage</span>
                </div>
                <span className="text-green-600 text-sm">Available</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Category Sidebar */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
            <nav className="space-y-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {getCategoryIcon(category)}
                  <span className="font-medium">{category}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                {getCategoryIcon(selectedCategory)}
                <h2 className="text-xl font-semibold text-gray-900">{selectedCategory} Settings</h2>
              </div>

              <div className="space-y-6">
                {filteredSettings.map(setting => (
                  <div key={setting.id} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{setting.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{setting.description}</p>
                    </div>
                    <div className="ml-6">
                      {renderSettingControl(setting)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">User Management</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total Users</p>
                  <p className="text-2xl font-bold text-blue-900">1,247</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Active Today</p>
                  <p className="text-2xl font-bold text-green-900">847</p>
                </div>
                <Activity className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Admins</p>
                  <p className="text-2xl font-bold text-purple-900">12</p>
                </div>
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-medium text-gray-900">User Actions</h4>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <User className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Add User</span>
              </button>
              <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors">
                <Upload className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Bulk Import</span>
              </button>
              <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
                <Shield className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium">Manage Roles</span>
              </button>
              <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-orange-300 transition-colors">
                <BarChart3 className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium">User Analytics</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'maintenance' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">System Maintenance</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Backup & Restore</h4>
                <div className="space-y-3">
                  <button className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                    <Download className="w-5 h-5 text-blue-600" />
                    <div className="text-left">
                      <div className="font-medium">Create Backup</div>
                      <div className="text-sm text-gray-500">Full system backup</div>
                    </div>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-green-300 transition-colors">
                    <Upload className="w-5 h-5 text-green-600" />
                    <div className="text-left">
                      <div className="font-medium">Restore Backup</div>
                      <div className="text-sm text-gray-500">Restore from backup file</div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">System Cleanup</h4>
                <div className="space-y-3">
                  <button className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-orange-300 transition-colors">
                    <RefreshCw className="w-5 h-5 text-orange-600" />
                    <div className="text-left">
                      <div className="font-medium">Clear Cache</div>
                      <div className="text-sm text-gray-500">Clear application cache</div>
                    </div>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-red-300 transition-colors">
                    <HardDrive className="w-5 h-5 text-red-600" />
                    <div className="text-left">
                      <div className="font-medium">Clean Logs</div>
                      <div className="text-sm text-gray-500">Remove old log files</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Scheduled Maintenance</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">Daily Backup</div>
                    <div className="text-sm text-gray-500">Runs every day at 2:00 AM</div>
                  </div>
                </div>
                <span className="text-blue-600 text-sm">Active</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium text-gray-900">Weekly Cleanup</div>
                    <div className="text-sm text-gray-500">Runs every Sunday at 3:00 AM</div>
                  </div>
                </div>
                <span className="text-green-600 text-sm">Active</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
