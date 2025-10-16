"use client";

import React, { useState, useEffect } from "react";
import { 
  Monitor, 
  Moon, 
  Sun, 
  Globe, 
  Bell, 
  Layout, 
  Keyboard, 
  Eye, 
  Volume2, 
  Zap,
  Save,
  RefreshCw,
  Check,
  X,
  Settings,
  Palette,
  Clock,
  Calendar,
  Mail,
  Smartphone,
  Computer,
  Tablet
} from "lucide-react";

interface UserPreference {
  id: string;
  category: string;
  title: string;
  description: string;
  type: 'toggle' | 'select' | 'slider' | 'color' | 'text';
  value: any;
  options?: { label: string; value: any }[];
  min?: number;
  max?: number;
}

const mockPreferences: UserPreference[] = [
  // Appearance
  {
    id: 'theme',
    category: 'Appearance',
    title: 'Theme',
    description: 'Choose your preferred interface theme',
    type: 'select',
    value: 'system',
    options: [
      { label: 'System Default', value: 'system' },
      { label: 'Light Mode', value: 'light' },
      { label: 'Dark Mode', value: 'dark' }
    ]
  },
  {
    id: 'compactMode',
    category: 'Appearance',
    title: 'Compact Mode',
    description: 'Use a more compact interface with smaller spacing',
    type: 'toggle',
    value: false
  },
  {
    id: 'accentColor',
    category: 'Appearance',
    title: 'Accent Color',
    description: 'Choose your preferred accent color',
    type: 'color',
    value: '#3B82F6'
  },
  {
    id: 'fontSize',
    category: 'Appearance',
    title: 'Font Size',
    description: 'Adjust the interface font size',
    type: 'slider',
    value: 14,
    min: 12,
    max: 18
  },

  // Language & Localization
  {
    id: 'language',
    category: 'Localization',
    title: 'Language',
    description: 'Select your preferred language',
    type: 'select',
    value: 'en-US',
    options: [
      { label: 'English (US)', value: 'en-US' },
      { label: 'English (UK)', value: 'en-GB' },
      { label: 'Spanish', value: 'es-ES' },
      { label: 'French', value: 'fr-FR' },
      { label: 'German', value: 'de-DE' },
      { label: 'Chinese (Simplified)', value: 'zh-CN' }
    ]
  },
  {
    id: 'timezone',
    category: 'Localization',
    title: 'Timezone',
    description: 'Set your local timezone',
    type: 'select',
    value: 'America/New_York',
    options: [
      { label: 'Eastern Time (ET)', value: 'America/New_York' },
      { label: 'Central Time (CT)', value: 'America/Chicago' },
      { label: 'Mountain Time (MT)', value: 'America/Denver' },
      { label: 'Pacific Time (PT)', value: 'America/Los_Angeles' },
      { label: 'GMT', value: 'Europe/London' }
    ]
  },
  {
    id: 'dateFormat',
    category: 'Localization',
    title: 'Date Format',
    description: 'Choose your preferred date format',
    type: 'select',
    value: 'MM/DD/YYYY',
    options: [
      { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
      { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
      { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
      { label: 'MMM DD, YYYY', value: 'MMM DD, YYYY' }
    ]
  },

  // Notifications
  {
    id: 'emailNotifications',
    category: 'Notifications',
    title: 'Email Notifications',
    description: 'Receive notifications via email',
    type: 'toggle',
    value: true
  },
  {
    id: 'pushNotifications',
    category: 'Notifications',
    title: 'Push Notifications',
    description: 'Receive browser push notifications',
    type: 'toggle',
    value: true
  },
  {
    id: 'notificationSound',
    category: 'Notifications',
    title: 'Notification Sounds',
    description: 'Play sounds for notifications',
    type: 'toggle',
    value: false
  },
  {
    id: 'notificationFrequency',
    category: 'Notifications',
    title: 'Notification Frequency',
    description: 'How often to receive digest notifications',
    type: 'select',
    value: 'realtime',
    options: [
      { label: 'Real-time', value: 'realtime' },
      { label: 'Hourly', value: 'hourly' },
      { label: 'Daily', value: 'daily' },
      { label: 'Weekly', value: 'weekly' }
    ]
  },

  // Productivity
  {
    id: 'keyboardShortcuts',
    category: 'Productivity',
    title: 'Keyboard Shortcuts',
    description: 'Enable keyboard shortcuts for quick actions',
    type: 'toggle',
    value: true
  },
  {
    id: 'autoSave',
    category: 'Productivity',
    title: 'Auto-save',
    description: 'Automatically save changes as you work',
    type: 'toggle',
    value: true
  },
  {
    id: 'defaultView',
    category: 'Productivity',
    title: 'Default Dashboard View',
    description: 'Choose your default dashboard layout',
    type: 'select',
    value: 'kanban',
    options: [
      { label: 'Kanban Board', value: 'kanban' },
      { label: 'List View', value: 'list' },
      { label: 'Calendar View', value: 'calendar' },
      { label: 'Chart View', value: 'chart' }
    ]
  },
  {
    id: 'recordsPerPage',
    category: 'Productivity',
    title: 'Records Per Page',
    description: 'Number of records to display per page',
    type: 'slider',
    value: 25,
    min: 10,
    max: 100
  }
];

export default function PreferencesPage() {
  const [preferences, setPreferences] = useState<UserPreference[]>(mockPreferences);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Appearance');

  const categories = [...new Set(preferences.map(p => p.category))];

  const updatePreference = (id: string, value: any) => {
    setPreferences(prev => prev.map(pref => 
      pref.id === id ? { ...pref, value } : pref
    ));
    setUnsavedChanges(true);
  };

  const savePreferences = () => {
    // Save preferences to backend
    setUnsavedChanges(false);
  };

  const resetPreferences = () => {
    setPreferences(mockPreferences);
    setUnsavedChanges(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Appearance': return <Palette className="w-5 h-5" />;
      case 'Localization': return <Globe className="w-5 h-5" />;
      case 'Notifications': return <Bell className="w-5 h-5" />;
      case 'Productivity': return <Zap className="w-5 h-5" />;
      default: return <Settings className="w-5 h-5" />;
    }
  };

  const renderPreferenceControl = (preference: UserPreference) => {
    switch (preference.type) {
      case 'toggle':
        return (
          <div className="flex items-center">
            <button
              onClick={() => updatePreference(preference.id, !preference.value)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preference.value ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preference.value ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        );

      case 'select':
        return (
          <select
            value={preference.value}
            onChange={(e) => updatePreference(preference.id, e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {preference.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'slider':
        return (
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={preference.min}
              max={preference.max}
              value={preference.value}
              onChange={(e) => updatePreference(preference.id, parseInt(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm font-medium text-gray-700 min-w-[3rem]">
              {preference.value}{preference.id === 'fontSize' ? 'px' : ''}
            </span>
          </div>
        );

      case 'color':
        return (
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={preference.value}
              onChange={(e) => updatePreference(preference.id, e.target.value)}
              className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
            />
            <span className="text-sm text-gray-600">{preference.value}</span>
          </div>
        );

      case 'text':
        return (
          <input
            type="text"
            value={preference.value}
            onChange={(e) => updatePreference(preference.id, e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );

      default:
        return null;
    }
  };

  const filteredPreferences = preferences.filter(p => p.category === activeCategory);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Preferences</h1>
            <p className="text-gray-600">Customize your CRM experience with personal preferences and settings</p>
          </div>
          <div className="flex items-center gap-3">
            {unsavedChanges && (
              <span className="flex items-center gap-2 text-yellow-600 text-sm">
                <Clock className="w-4 h-4" />
                Unsaved changes
              </span>
            )}
            <button
              onClick={resetPreferences}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={savePreferences}
              disabled={!unsavedChanges}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                unsavedChanges
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Category Sidebar */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
          <nav className="space-y-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeCategory === category
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

        {/* Preferences Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              {getCategoryIcon(activeCategory)}
              <h2 className="text-xl font-semibold text-gray-900">{activeCategory}</h2>
            </div>

            <div className="space-y-6">
              {filteredPreferences.map(preference => (
                <div key={preference.id} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{preference.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{preference.description}</p>
                  </div>
                  <div className="ml-6">
                    {renderPreferenceControl(preference)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Preview Section */}
          {activeCategory === 'Appearance' && (
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Theme Preview</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="border-2 border-gray-200 rounded-lg p-4 text-center">
                  <Sun className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                  <span className="text-sm font-medium">Light Theme</span>
                </div>
                <div className="border-2 border-blue-500 rounded-lg p-4 text-center bg-blue-50">
                  <Monitor className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <span className="text-sm font-medium">System Default</span>
                </div>
                <div className="border-2 border-gray-200 rounded-lg p-4 text-center bg-gray-900 text-white">
                  <Moon className="w-8 h-8 mx-auto mb-2" />
                  <span className="text-sm font-medium">Dark Theme</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}