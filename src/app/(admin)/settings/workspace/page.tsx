"use client";

import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  Clock, 
  Shield, 
  Database, 
  Settings,
  Save,
  RefreshCw,
  Check,
  AlertCircle,
  Users,
  Palette,
  RotateCcw,
  Upload,
  X
} from "lucide-react";

interface WorkspaceSettings {
  organizationName: string;
  legalName: string;
  industry: string;
  companySize: string;
  website: string;
  description: string;
  primaryEmail: string;
  primaryPhone: string;
  supportEmail: string;
  salesEmail: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  timezone: string;
  businessHours: {
    [key: string]: {
      enabled: boolean;
      start: string;
      end: string;
    };
  };
  defaultCurrency: string;
  defaultLanguage: string;
  dateFormat: string;
  timeFormat: string;
  dataRetentionDays: number;
  autoDeleteLeads: boolean;
  anonymizeData: boolean;
  enableAuditLog: boolean;
  enabledFeatures: {
    leads: boolean;
    deals: boolean;
    calendar: boolean;
    inventory: boolean;
    reporting: boolean;
    aiAssistant: boolean;
    integrations: boolean;
    automation: boolean;
  };
  gdprCompliance: boolean;
  ccpaCompliance: boolean;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  faviconUrl?: string;
  createdAt: string;
  updatedAt: string;
}

const WorkspaceSettings = () => {
  const [settings, setSettings] = useState<WorkspaceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('organization');

  const tabs = [
    { id: 'organization', name: 'Organization', icon: Building2 },
    { id: 'contact', name: 'Contact Info', icon: Mail },
    { id: 'business', name: 'Business Hours', icon: Clock },
    { id: 'preferences', name: 'Preferences', icon: Settings },
    { id: 'features', name: 'Features', icon: Users },
    { id: 'privacy', name: 'Privacy & Data', icon: Shield },
    { id: 'branding', name: 'Branding', icon: Palette }
  ];

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Real Estate', 'Education',
    'Retail', 'Manufacturing', 'Consulting', 'Non-Profit', 'Other'
  ];

  const companySizes = [
    '1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'
  ];

  const timezones = [
    'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai'
  ];

  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF'];
  const languages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'zh'];

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings/workspace');
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
      const response = await fetch('/api/settings/workspace', {
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

  const resetSettings = async () => {
    setSaving(true);
    
    try {
      const response = await fetch('/api/settings/workspace', {
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

  const renderOrganizationTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Organization Name *</label>
          <input
            type="text"
            value={settings.organizationName}
            onChange={(e) => updateField('organizationName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter organization name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Legal Name</label>
          <input
            type="text"
            value={settings.legalName}
            onChange={(e) => updateField('legalName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Legal business name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Industry</label>
          <select
            value={settings.industry}
            onChange={(e) => updateField('industry', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {industries.map(industry => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Company Size</label>
          <select
            value={settings.companySize}
            onChange={(e) => updateField('companySize', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {companySizes.map(size => (
              <option key={size} value={size}>{size} employees</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Website</label>
          <input
            type="url"
            value={settings.website}
            onChange={(e) => updateField('website', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://example.com"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          value={settings.description}
          onChange={(e) => updateField('description', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Brief description of your organization"
        />
      </div>
    </div>
  );

  const renderContactTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Primary Email *</label>
          <input
            type="email"
            value={settings.primaryEmail}
            onChange={(e) => updateField('primaryEmail', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="contact@company.com"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Primary Phone</label>
          <input
            type="tel"
            value={settings.primaryPhone}
            onChange={(e) => updateField('primaryPhone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="+1 (555) 123-4567"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Support Email</label>
          <input
            type="email"
            value={settings.supportEmail}
            onChange={(e) => updateField('supportEmail', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="support@company.com"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Sales Email</label>
          <input
            type="email"
            value={settings.salesEmail}
            onChange={(e) => updateField('salesEmail', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="sales@company.com"
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Business Address
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Street Address</label>
            <input
              type="text"
              value={settings.address.street}
              onChange={(e) => updateField('address.street', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="123 Main Street"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">City</label>
            <input
              type="text"
              value={settings.address.city}
              onChange={(e) => updateField('address.city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="San Francisco"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">State/Province</label>
            <input
              type="text"
              value={settings.address.state}
              onChange={(e) => updateField('address.state', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="CA"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Postal Code</label>
            <input
              type="text"
              value={settings.address.postalCode}
              onChange={(e) => updateField('address.postalCode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="94105"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Country</label>
            <input
              type="text"
              value={settings.address.country}
              onChange={(e) => updateField('address.country', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="United States"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderBusinessHoursTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Timezone</label>
        <select
          value={settings.timezone}
          onChange={(e) => updateField('timezone', e.target.value)}
          className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {timezones.map(tz => (
            <option key={tz} value={tz}>{tz.replace('_', ' ')}</option>
          ))}
        </select>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Business Hours</h3>
        
        {Object.entries(settings.businessHours).map(([day, hours]) => (
          <div key={day} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
            <div className="w-20">
              <span className="font-medium capitalize">{day}</span>
            </div>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={hours.enabled}
                onChange={(e) => updateField(`businessHours.${day}.enabled`, e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm">Open</span>
            </label>
            
            {hours.enabled && (
              <>
                <div className="flex items-center gap-2">
                  <label className="text-sm">From:</label>
                  <input
                    type="time"
                    value={hours.start}
                    onChange={(e) => updateField(`businessHours.${day}.start`, e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <label className="text-sm">To:</label>
                  <input
                    type="time"
                    value={hours.end}
                    onChange={(e) => updateField(`businessHours.${day}.end`, e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Default Currency</label>
          <select
            value={settings.defaultCurrency}
            onChange={(e) => updateField('defaultCurrency', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {currencies.map(currency => (
              <option key={currency} value={currency}>{currency}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Default Language</label>
          <select
            value={settings.defaultLanguage}
            onChange={(e) => updateField('defaultLanguage', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {languages.map(lang => (
              <option key={lang} value={lang}>{lang.toUpperCase()}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Date Format</label>
          <select
            value={settings.dateFormat}
            onChange={(e) => updateField('dateFormat', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Time Format</label>
          <select
            value={settings.timeFormat}
            onChange={(e) => updateField('timeFormat', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="12h">12 Hour (AM/PM)</option>
            <option value="24h">24 Hour</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderFeaturesTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Enabled Features</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(settings.enabledFeatures).map(([feature, enabled]) => (
          <label key={feature} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => updateField(`enabledFeatures.${feature}`, e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="font-medium capitalize">{feature}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const renderPrivacyTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Data Retention</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Data Retention Period (days)</label>
            <input
              type="number"
              value={settings.dataRetentionDays}
              onChange={(e) => updateField('dataRetentionDays', parseInt(e.target.value))}
              className="w-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="30"
              max="3650"
            />
          </div>
          
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.autoDeleteLeads}
              onChange={(e) => updateField('autoDeleteLeads', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span>Automatically delete old leads</span>
          </label>
          
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.anonymizeData}
              onChange={(e) => updateField('anonymizeData', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span>Anonymize personal data after retention period</span>
          </label>
          
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.enableAuditLog}
              onChange={(e) => updateField('enableAuditLog', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span>Enable audit logging</span>
          </label>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Compliance</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.gdprCompliance}
              onChange={(e) => updateField('gdprCompliance', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span>GDPR Compliance</span>
          </label>
          
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.ccpaCompliance}
              onChange={(e) => updateField('ccpaCompliance', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span>CCPA Compliance</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderBrandingTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Primary Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={settings.primaryColor}
              onChange={(e) => updateField('primaryColor', e.target.value)}
              className="w-12 h-10 rounded border-2 border-gray-200 cursor-pointer"
            />
            <input
              type="text"
              value={settings.primaryColor}
              onChange={(e) => updateField('primaryColor', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Secondary Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={settings.secondaryColor}
              onChange={(e) => updateField('secondaryColor', e.target.value)}
              className="w-12 h-10 rounded border-2 border-gray-200 cursor-pointer"
            />
            <input
              type="text"
              value={settings.secondaryColor}
              onChange={(e) => updateField('secondaryColor', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Logo URL</label>
        <input
          type="url"
          value={settings.logoUrl || ''}
          onChange={(e) => updateField('logoUrl', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="https://example.com/logo.png"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Favicon URL</label>
        <input
          type="url"
          value={settings.faviconUrl || ''}
          onChange={(e) => updateField('faviconUrl', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="https://example.com/favicon.ico"
        />
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Workspace Settings</h1>
        <p className="text-gray-600">
          Configure your organization settings and preferences
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
        {activeTab === 'organization' && renderOrganizationTab()}
        {activeTab === 'contact' && renderContactTab()}
        {activeTab === 'business' && renderBusinessHoursTab()}
        {activeTab === 'preferences' && renderPreferencesTab()}
        {activeTab === 'features' && renderFeaturesTab()}
        {activeTab === 'privacy' && renderPrivacyTab()}
        {activeTab === 'branding' && renderBrandingTab()}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <button
          onClick={resetSettings}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
        >
          <RotateCcw className="w-4 h-4" />
          Reset to Defaults
        </button>
        
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

export default WorkspaceSettings;
