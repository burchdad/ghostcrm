"use client";

import React, { useState } from "react";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { 
  Palette, 
  Monitor, 
  Sun, 
  Moon, 
  Eye, 
  Layout, 
  Type, 
  Grid,
  Sidebar,
  Navigation,
  Save,
  RefreshCw,
  Check,
  Settings,
  Zap,
  RotateCcw
} from "lucide-react";

const ThemeAndAppearanceSettings = () => {
  const { theme, updateTheme, resetTheme, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('appearance');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const colorSchemes = [
    { name: 'Blue', value: 'blue', color: '#3B82F6' },
    { name: 'Green', value: 'green', color: '#10B981' },
    { name: 'Purple', value: 'purple', color: '#8B5CF6' },
    { name: 'Pink', value: 'pink', color: '#EC4899' },
    { name: 'Orange', value: 'orange', color: '#F97316' },
    { name: 'Red', value: 'red', color: '#EF4444' },
    { name: 'Indigo', value: 'indigo', color: '#6366F1' },
    { name: 'Teal', value: 'teal', color: '#14B8A6' },
  ];

  const fontFamilies = [
    'Inter',
    'Roboto',
    'Open Sans',
    'Lato',
    'Poppins',
    'Source Sans Pro',
    'Nunito Sans',
    'System UI'
  ];

  const handleSave = async () => {
    setSaveStatus('saving');
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleReset = () => {
    resetTheme();
    setSaveStatus('idle');
  };

  const tabs = [
    { id: 'appearance', name: 'General', icon: Palette },
    { id: 'layout', name: 'Layout', icon: Layout },
    { id: 'typography', name: 'Typography', icon: Type },
    { id: 'components', name: 'Components', icon: Grid },
    { id: 'advanced', name: 'Advanced', icon: Settings },
    { id: 'preview', name: 'Preview', icon: Eye }
  ];

  const renderAppearanceTab = () => (
    <div className="space-y-8">
      {/* Theme Mode */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Monitor className="w-5 h-5" />
          Theme Mode
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: 'light', label: 'Light', icon: Sun },
            { value: 'dark', label: 'Dark', icon: Moon },
            { value: 'system', label: 'System', icon: Monitor }
          ].map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => updateTheme({ mode: value as 'light' | 'dark' | 'system' })}
              className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                theme.mode === value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Color Scheme */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Color Scheme
        </h3>
        <div className="grid grid-cols-4 gap-3">
          {colorSchemes.map((scheme) => (
            <button
              key={scheme.value}
              onClick={() => updateTheme({ 
                colorScheme: scheme.value,
                accentColor: scheme.color,
                customColors: { ...theme.customColors, primary: scheme.color }
              })}
              className={`p-3 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                theme.colorScheme === scheme.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div
                className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: scheme.color }}
              />
              <span className="text-sm font-medium">{scheme.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Accent Color */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Custom Accent Color</h3>
        <div className="flex items-center gap-4">
          <input
            type="color"
            value={theme.accentColor}
            onChange={(e) => updateTheme({ accentColor: e.target.value })}
            className="w-12 h-12 rounded border-2 border-gray-200 cursor-pointer"
          />
          <div>
            <p className="font-medium">Accent Color</p>
            <p className="text-sm text-gray-500">{theme.accentColor}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLayoutTab = () => (
    <div className="space-y-8">
      {/* Sidebar Position */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Sidebar className="w-5 h-5" />
          Sidebar Position
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { value: 'left', label: 'Left Side' },
            { value: 'right', label: 'Right Side' }
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => updateTheme({ sidebarPosition: value as 'left' | 'right' })}
              className={`p-4 border-2 rounded-lg text-center transition-all ${
                theme.sidebarPosition === value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sidebar Style */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Sidebar Style</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: 'compact', label: 'Compact', description: 'Icons only' },
            { value: 'expanded', label: 'Expanded', description: 'Full width' },
            { value: 'auto', label: 'Auto', description: 'Responsive' }
          ].map(({ value, label, description }) => (
            <button
              key={value}
              onClick={() => updateTheme({ sidebarStyle: value as 'compact' | 'expanded' | 'auto' })}
              className={`p-4 border-2 rounded-lg text-center transition-all ${
                theme.sidebarStyle === value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="font-medium">{label}</div>
              <div className="text-sm text-gray-500 mt-1">{description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Interface Density */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Interface Density</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: 'compact', label: 'Compact', description: 'More content' },
            { value: 'comfortable', label: 'Comfortable', description: 'Balanced' },
            { value: 'spacious', label: 'Spacious', description: 'More breathing room' }
          ].map(({ value, label, description }) => (
            <button
              key={value}
              onClick={() => updateTheme({ density: value as 'compact' | 'comfortable' | 'spacious' })}
              className={`p-4 border-2 rounded-lg text-center transition-all ${
                theme.density === value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="font-medium">{label}</div>
              <div className="text-sm text-gray-500 mt-1">{description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTypographyTab = () => (
    <div className="space-y-8">
      {/* Font Size */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Type className="w-5 h-5" />
          Font Size
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: 'small', label: 'Small', size: '14px' },
            { value: 'medium', label: 'Medium', size: '16px' },
            { value: 'large', label: 'Large', size: '18px' }
          ].map(({ value, label, size }) => (
            <button
              key={value}
              onClick={() => updateTheme({ fontSize: value as 'small' | 'medium' | 'large' })}
              className={`p-4 border-2 rounded-lg text-center transition-all ${
                theme.fontSize === value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="font-medium">{label}</div>
              <div className="text-sm text-gray-500 mt-1">{size}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Font Family */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Font Family</h3>
        <div className="grid grid-cols-2 gap-3">
          {fontFamilies.map((font) => (
            <button
              key={font}
              onClick={() => updateTheme({ fontFamily: font })}
              className={`p-3 border-2 rounded-lg text-left transition-all ${
                theme.fontFamily === font
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              style={{ fontFamily: font }}
            >
              <div className="font-medium">{font}</div>
              <div className="text-sm text-gray-500 mt-1">The quick brown fox jumps</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderComponentsTab = () => (
    <div className="space-y-8">
      {/* Card Style */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Card Style</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: 'flat', label: 'Flat', description: 'No shadow' },
            { value: 'elevated', label: 'Elevated', description: 'With shadow' },
            { value: 'outlined', label: 'Outlined', description: 'Border only' }
          ].map(({ value, label, description }) => (
            <button
              key={value}
              onClick={() => updateTheme({ cardStyle: value as 'flat' | 'elevated' | 'outlined' })}
              className={`p-4 border-2 rounded-lg text-center transition-all ${
                theme.cardStyle === value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="font-medium">{label}</div>
              <div className="text-sm text-gray-500 mt-1">{description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Button Style */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Button Style</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: 'rounded', label: 'Rounded' },
            { value: 'square', label: 'Square' },
            { value: 'pill', label: 'Pill' }
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => updateTheme({ buttonStyle: value as 'rounded' | 'square' | 'pill' })}
              className={`p-4 border-2 rounded-lg text-center transition-all ${
                theme.buttonStyle === value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="font-medium">{label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Border Radius */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Border Radius</h3>
        <div className="space-y-4">
          <input
            type="range"
            min="0"
            max="20"
            value={theme.borderRadius}
            onChange={(e) => updateTheme({ borderRadius: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>0px (Square)</span>
            <span className="font-medium">{theme.borderRadius}px</span>
            <span>20px (Very Rounded)</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdvancedTab = () => (
    <div className="space-y-8">
      {/* Animations */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Animations
        </h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={theme.animationsEnabled}
              onChange={(e) => updateTheme({ animationsEnabled: e.target.checked })}
              className="w-4 h-4"
            />
            <span>Enable animations and transitions</span>
          </label>
          
          {theme.animationsEnabled && (
            <div>
              <label className="block text-sm font-medium mb-2">Transition Speed</label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: 'slow', label: 'Slow', time: '500ms' },
                  { value: 'normal', label: 'Normal', time: '300ms' },
                  { value: 'fast', label: 'Fast', time: '150ms' }
                ].map(({ value, label, time }) => (
                  <button
                    key={value}
                    onClick={() => updateTheme({ transitionSpeed: value as 'slow' | 'normal' | 'fast' })}
                    className={`p-3 border-2 rounded-lg text-center transition-all ${
                      theme.transitionSpeed === value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="font-medium">{label}</div>
                    <div className="text-sm text-gray-500 mt-1">{time}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Colors */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Custom Colors</h3>
        <div className="grid grid-cols-2 gap-6">
          {Object.entries(theme.customColors).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium mb-2 capitalize">{key}</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={value}
                  onChange={(e) => updateTheme({ 
                    customColors: { ...theme.customColors, [key]: e.target.value }
                  })}
                  className="w-10 h-10 rounded border-2 border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => updateTheme({ 
                    customColors: { ...theme.customColors, [key]: e.target.value }
                  })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPreviewTab = () => (
    <div className="space-y-6">
      <div className="themed-bg-primary themed-border rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4 themed-text-primary">Live Preview</h3>
        <p className="themed-text-secondary mb-6">
          This preview shows how your theme settings will appear across the application.
        </p>
        
        <div className="space-y-6">
          <div className={`card themed-bg-secondary p-4 rounded-lg border themed-border ${theme.cardStyle === 'elevated' ? 'shadow-md' : ''}`}>
            <h4 className="font-semibold mb-2 themed-text-primary">Sample Card</h4>
            <p className="themed-text-secondary mb-4">This card shows your current theme settings in action.</p>
            
            <div className="flex gap-3">
              <button 
                className={`px-4 py-2 themed-primary-bg text-white transition-all ${
                  theme.buttonStyle === 'pill' ? 'rounded-full' : 
                  theme.buttonStyle === 'square' ? 'rounded-none' : 'rounded-md'
                }`}
                style={{ borderRadius: theme.buttonStyle === 'rounded' ? `${theme.borderRadius}px` : undefined }}
              >
                Primary Button
              </button>
              <button 
                className={`px-4 py-2 border themed-border themed-text-primary transition-all ${
                  theme.buttonStyle === 'pill' ? 'rounded-full' : 
                  theme.buttonStyle === 'square' ? 'rounded-none' : 'rounded-md'
                }`}
                style={{ borderRadius: theme.buttonStyle === 'rounded' ? `${theme.borderRadius}px` : undefined }}
              >
                Secondary Button
              </button>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="text-xl font-bold themed-text-primary" style={{ fontFamily: theme.fontFamily }}>
              Typography Preview
            </h4>
            <h5 className="text-lg font-semibold themed-text-primary" style={{ fontFamily: theme.fontFamily }}>
              Heading Level 2
            </h5>
            <p className="text-base themed-text-primary" style={{ fontFamily: theme.fontFamily }}>
              This shows how your font family and size settings affect readability.
            </p>
            <p className="text-sm themed-text-tertiary" style={{ fontFamily: theme.fontFamily }}>
              This is smaller text for captions or metadata.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 themed-text-primary">Theme & Appearance</h1>
        <p className="themed-text-secondary">
          Customize the look and feel of your GhostCRM interface
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b themed-border mb-8">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 themed-accent'
                    : 'border-transparent themed-text-secondary hover:text-gray-700 dark:hover:text-gray-300'
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
        {activeTab === 'appearance' && renderAppearanceTab()}
        {activeTab === 'layout' && renderLayoutTab()}
        {activeTab === 'typography' && renderTypographyTab()}
        {activeTab === 'components' && renderComponentsTab()}
        {activeTab === 'advanced' && renderAdvancedTab()}
        {activeTab === 'preview' && renderPreviewTab()}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t themed-border">
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 themed-text-secondary hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
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
          
          <button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className="flex items-center gap-2 px-6 py-2 themed-primary-bg text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {saveStatus === 'saving' ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeAndAppearanceSettings;