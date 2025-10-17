"use client";

import React, { useState, useEffect } from "react";
import { 
  Mail, 
  Smartphone, 
  Bell, 
  MessageSquare,
  Clock,
  Settings,
  Volume2,
  VolumeX,
  Shield,
  Send,
  Save,
  RefreshCw,
  Check,
  AlertCircle,
  X,
  TestTube,
  RotateCcw
} from "lucide-react";

interface NotificationSettings {
  emailNotifications: {
    enabled: boolean;
    newLeads: boolean;
    leadUpdates: boolean;
    dealClosed: boolean;
    taskReminders: boolean;
    systemAlerts: boolean;
    dailyDigest: boolean;
    weeklyReports: boolean;
    marketingEmails: boolean;
  };
  pushNotifications: {
    enabled: boolean;
    browserPush: boolean;
    mobilePush: boolean;
    newMessages: boolean;
    appointments: boolean;
    deadlines: boolean;
    mentions: boolean;
    criticalAlerts: boolean;
  };
  smsNotifications: {
    enabled: boolean;
    phoneNumber: string;
    urgentAlerts: boolean;
    appointmentReminders: boolean;
    leadStatusChanges: boolean;
    systemDowntime: boolean;
    securityAlerts: boolean;
  };
  inAppNotifications: {
    enabled: boolean;
    showDesktopAlerts: boolean;
    playSound: boolean;
    badgeCount: boolean;
    autoMarkRead: boolean;
    persistTime: number;
  };
  scheduling: {
    timezone: string;
    quietHours: {
      enabled: boolean;
      startTime: string;
      endTime: string;
    };
    weekendNotifications: boolean;
    batchDigest: {
      enabled: boolean;
      frequency: 'hourly' | 'daily' | 'weekly';
      time: string;
    };
  };
  advanced: {
    rateLimitPerHour: number;
    allowDuplicates: boolean;
    highPriorityBypass: boolean;
    deliveryMethod: 'immediate' | 'batched' | 'scheduled';
    retryFailedDeliveries: boolean;
    maxRetries: number;
  };
  createdAt: string;
  updatedAt: string;
}

const NotificationSettings = () => {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('email');

  const tabs = [
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'push', name: 'Push', icon: Smartphone },
    { id: 'sms', name: 'SMS', icon: MessageSquare },
    { id: 'inapp', name: 'In-App', icon: Bell },
    { id: 'scheduling', name: 'Scheduling', icon: Clock },
    { id: 'advanced', name: 'Advanced', icon: Settings }
  ];

  const timezones = [
    'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai'
  ];

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings/notifications');
      const result = await response.json();
      
      if (result.success) {
        setSettings(result.data);
      } else {
        setError(result.error || 'Failed to load settings');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: any) => {
    if (!settings) return;
    
    const keys = field.split('.');
    const newSettings = { ...settings };
    
    let current: any = newSettings;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    
    setSettings(newSettings);
  };

  const saveSettings = async () => {
    if (!settings) return;
    
    setSaving(true);
    setSaveStatus('saving');
    setError(null);
    
    try {
      const response = await fetch('/api/settings/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSettings(result.data);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setError(result.error || 'Failed to save settings');
        setSaveStatus('error');
      }
    } catch (err) {
      setError('Failed to connect to server');
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const sendTestNotification = async () => {
    setTesting(true);
    
    try {
      const response = await fetch('/api/settings/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'test',
          message: 'This is a test notification from GhostCRM'
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setError(result.error || 'Failed to send test notification');
      }
    } catch (err) {
      setError('Failed to send test notification');
    } finally {
      setTesting(false);
    }
  };

  const resetSettings = async () => {
    setSaving(true);
    
    try {
      const response = await fetch('/api/settings/notifications', {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSettings(result.data);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setError(result.error || 'Failed to reset settings');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Error Loading Settings</span>
          </div>
          <p className="text-red-600 mt-2">{error}</p>
          <button
            onClick={loadSettings}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const renderEmailTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Email Notifications</h3>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.emailNotifications.enabled}
            onChange={(e) => updateField('emailNotifications.enabled', e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <span className="font-medium">Enable Email Notifications</span>
        </label>
      </div>
      
      {settings.emailNotifications.enabled && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(settings.emailNotifications).filter(([key]) => key !== 'enabled').map(([key, value]) => (
            <label key={key} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
              <input
                type="checkbox"
                checked={value as boolean}
                onChange={(e) => updateField(`emailNotifications.${key}`, e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );

  const renderPushTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Push Notifications</h3>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.pushNotifications.enabled}
            onChange={(e) => updateField('pushNotifications.enabled', e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <span className="font-medium">Enable Push Notifications</span>
        </label>
      </div>
      
      {settings.pushNotifications.enabled && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(settings.pushNotifications).filter(([key]) => key !== 'enabled').map(([key, value]) => (
            <label key={key} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
              <input
                type="checkbox"
                checked={value as boolean}
                onChange={(e) => updateField(`pushNotifications.${key}`, e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );

  const renderSMSTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">SMS Notifications</h3>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.smsNotifications.enabled}
            onChange={(e) => updateField('smsNotifications.enabled', e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <span className="font-medium">Enable SMS Notifications</span>
        </label>
      </div>
      
      {settings.smsNotifications.enabled && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Phone Number</label>
            <input
              type="tel"
              value={settings.smsNotifications.phoneNumber}
              onChange={(e) => updateField('smsNotifications.phoneNumber', e.target.value)}
              className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="+1 (555) 123-4567"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(settings.smsNotifications).filter(([key]) => key !== 'enabled' && key !== 'phoneNumber').map(([key, value]) => (
              <label key={key} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                <input
                  type="checkbox"
                  checked={value as boolean}
                  onChange={(e) => updateField(`smsNotifications.${key}`, e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderInAppTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">In-App Notifications</h3>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.inAppNotifications.enabled}
            onChange={(e) => updateField('inAppNotifications.enabled', e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <span className="font-medium">Enable In-App Notifications</span>
        </label>
      </div>
      
      {settings.inAppNotifications.enabled && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
              <input
                type="checkbox"
                checked={settings.inAppNotifications.showDesktopAlerts}
                onChange={(e) => updateField('inAppNotifications.showDesktopAlerts', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="font-medium">Show Desktop Alerts</span>
            </label>
            
            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
              <input
                type="checkbox"
                checked={settings.inAppNotifications.playSound}
                onChange={(e) => updateField('inAppNotifications.playSound', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="font-medium">Play Sound</span>
            </label>
            
            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
              <input
                type="checkbox"
                checked={settings.inAppNotifications.badgeCount}
                onChange={(e) => updateField('inAppNotifications.badgeCount', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="font-medium">Show Badge Count</span>
            </label>
            
            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
              <input
                type="checkbox"
                checked={settings.inAppNotifications.autoMarkRead}
                onChange={(e) => updateField('inAppNotifications.autoMarkRead', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="font-medium">Auto Mark as Read</span>
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Notification Persist Time (seconds)</label>
            <input
              type="number"
              min="10"
              max="3600"
              value={settings.inAppNotifications.persistTime}
              onChange={(e) => updateField('inAppNotifications.persistTime', parseInt(e.target.value))}
              className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderSchedulingTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Timezone</label>
        <select
          value={settings.scheduling.timezone}
          onChange={(e) => updateField('scheduling.timezone', e.target.value)}
          className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {timezones.map(tz => (
            <option key={tz} value={tz}>{tz.replace('_', ' ')}</option>
          ))}
        </select>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Quiet Hours</h3>
        <label className="flex items-center gap-3 mb-4">
          <input
            type="checkbox"
            checked={settings.scheduling.quietHours.enabled}
            onChange={(e) => updateField('scheduling.quietHours.enabled', e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <span className="font-medium">Enable Quiet Hours</span>
        </label>
        
        {settings.scheduling.quietHours.enabled && (
          <div className="grid grid-cols-2 gap-4 max-w-md">
            <div>
              <label className="block text-sm font-medium mb-2">Start Time</label>
              <input
                type="time"
                value={settings.scheduling.quietHours.startTime}
                onChange={(e) => updateField('scheduling.quietHours.startTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">End Time</label>
              <input
                type="time"
                value={settings.scheduling.quietHours.endTime}
                onChange={(e) => updateField('scheduling.quietHours.endTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        )}
      </div>
      
      <div>
        <label className="flex items-center gap-3 mb-4">
          <input
            type="checkbox"
            checked={settings.scheduling.weekendNotifications}
            onChange={(e) => updateField('scheduling.weekendNotifications', e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <span className="font-medium">Weekend Notifications</span>
        </label>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Batch Digest</h3>
        <label className="flex items-center gap-3 mb-4">
          <input
            type="checkbox"
            checked={settings.scheduling.batchDigest.enabled}
            onChange={(e) => updateField('scheduling.batchDigest.enabled', e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <span className="font-medium">Enable Batch Digest</span>
        </label>
        
        {settings.scheduling.batchDigest.enabled && (
          <div className="grid grid-cols-2 gap-4 max-w-md">
            <div>
              <label className="block text-sm font-medium mb-2">Frequency</label>
              <select
                value={settings.scheduling.batchDigest.frequency}
                onChange={(e) => updateField('scheduling.batchDigest.frequency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Time</label>
              <input
                type="time"
                value={settings.scheduling.batchDigest.time}
                onChange={(e) => updateField('scheduling.batchDigest.time', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderAdvancedTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Rate Limit (per hour)</label>
        <input
          type="number"
          min="1"
          max="100"
          value={settings.advanced.rateLimitPerHour}
          onChange={(e) => updateField('advanced.rateLimitPerHour', parseInt(e.target.value))}
          className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Delivery Method</label>
        <select
          value={settings.advanced.deliveryMethod}
          onChange={(e) => updateField('advanced.deliveryMethod', e.target.value)}
          className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="immediate">Immediate</option>
          <option value="batched">Batched</option>
          <option value="scheduled">Scheduled</option>
        </select>
      </div>
      
      <div className="space-y-4">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={settings.advanced.allowDuplicates}
            onChange={(e) => updateField('advanced.allowDuplicates', e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <span className="font-medium">Allow Duplicate Notifications</span>
        </label>
        
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={settings.advanced.highPriorityBypass}
            onChange={(e) => updateField('advanced.highPriorityBypass', e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <span className="font-medium">High Priority Bypass Quiet Hours</span>
        </label>
        
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={settings.advanced.retryFailedDeliveries}
            onChange={(e) => updateField('advanced.retryFailedDeliveries', e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <span className="font-medium">Retry Failed Deliveries</span>
        </label>
      </div>
      
      {settings.advanced.retryFailedDeliveries && (
        <div>
          <label className="block text-sm font-medium mb-2">Max Retries</label>
          <input
            type="number"
            min="1"
            max="10"
            value={settings.advanced.maxRetries}
            onChange={(e) => updateField('advanced.maxRetries', parseInt(e.target.value))}
            className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Notification Settings</h1>
        <p className="text-gray-600">
          Configure how and when you receive notifications
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

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mb-8">
        {activeTab === 'email' && renderEmailTab()}
        {activeTab === 'push' && renderPushTab()}
        {activeTab === 'sms' && renderSMSTab()}
        {activeTab === 'inapp' && renderInAppTab()}
        {activeTab === 'scheduling' && renderSchedulingTab()}
        {activeTab === 'advanced' && renderAdvancedTab()}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <button
            onClick={resetSettings}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Defaults
          </button>
          
          <button
            onClick={sendTestNotification}
            disabled={testing || saving}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {testing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <TestTube className="w-4 h-4" />
            )}
            {testing ? 'Sending...' : 'Send Test'}
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          {saveStatus === 'saved' && (
            <div className="flex items-center gap-2 text-green-600">
              <Check className="w-4 h-4" />
              Settings saved
            </div>
          )}
          
          {saveStatus === 'error' && (
            <div className="flex items-center gap-2 text-red-600">
              <X className="w-4 h-4" />
              Failed to save
            </div>
          )}
          
          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;