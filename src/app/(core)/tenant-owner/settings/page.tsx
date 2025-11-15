"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useRibbonPage } from "@/components/ribbon";
import { I18nProvider } from "@/components/utils/I18nProvider";
import { ToastProvider } from "@/components/utils/ToastProvider";
import SettingsConfirmationDialog from "@/components/SettingsConfirmationDialog";
import { 
  Settings, 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Palette,
  Bell,
  Shield,
  CreditCard,
  Globe,
  Save,
  Camera,
  Edit
} from "lucide-react";
import "./settings.css";

interface BusinessSettings {
  companyName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  website: string;
  businessHours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
    logo: string;
  };
  notifications: {
    emailAlerts: boolean;
    smsAlerts: boolean;
    pushNotifications: boolean;
    weeklyReports: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    passwordExpiry: number;
    sessionTimeout: number;
  };
}

function BusinessSettingsPage() {
  const { user, tenant } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState<BusinessSettings>({
    companyName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    website: '',
    businessHours: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '09:00', close: '17:00', closed: false },
      sunday: { open: '12:00', close: '16:00', closed: true },
    },
    branding: {
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      logo: '',
    },
    notifications: {
      emailAlerts: true,
      smsAlerts: false,
      pushNotifications: true,
      weeklyReports: true,
    },
    security: {
      twoFactorAuth: false,
      passwordExpiry: 90,
      sessionTimeout: 30,
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<any[]>([]);
  const [successMessage, setSuccessMessage] = useState('');

  useRibbonPage({
    context: "settings",
    enable: [
      "quickActions",
      "export",
      "profile",
      "notifications",
      "theme",
      "language"
    ],
    disable: []
  });

  // Redirect non-owners
  useEffect(() => {
    if (!loading && user && user.role !== 'owner') {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Load settings
  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        
        const response = await fetch("/api/owner/settings", {
          method: "GET",
          credentials: 'include' // Include cookies for JWT authentication
        });
        
        if (response.ok) {
          const data = await response.json();
          setSettings({ ...settings, ...data.settings });
        } else {
          // Use tenant data if available
          if (tenant) {
            setSettings(prev => ({
              ...prev,
              companyName: tenant.name || 'Your Dealership',
            }));
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadSettings();
    }
  }, [user, tenant]);

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // First, check for changes without confirming
      const response = await fetch("/api/owner/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: 'include', // Include cookies for JWT authentication
        body: JSON.stringify({ settings, confirm: false }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.requiresConfirmation) {
          // Show confirmation dialog with changes
          setPendingChanges(data.changes || []);
          setShowConfirmation(true);
        } else {
          // No changes to confirm, show message
          setSuccessMessage(data.message || 'No changes detected.');
          setTimeout(() => setSuccessMessage(''), 3000);
        }
      } else {
        const error = await response.json();
        console.error('Failed to check settings:', error);
        setSuccessMessage('Failed to check settings. Please try again.');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error checking settings:', error);
      setSuccessMessage('Error checking settings. Please try again.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmSave = async () => {
    try {
      setSaving(true);
      
      // Confirm and save the changes
      const response = await fetch("/api/owner/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: 'include', // Include cookies for JWT authentication
        body: JSON.stringify({ settings, confirm: true }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccessMessage(data.message || 'Settings saved successfully!');
        setShowConfirmation(false);
        setPendingChanges([]);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const error = await response.json();
        console.error('Failed to save settings:', error);
        setSuccessMessage('Failed to save settings. Please try again.');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSuccessMessage('Error saving settings. Please try again.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const updateBusinessHours = (day: string, field: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day as keyof typeof prev.businessHours],
          [field]: value,
        },
      },
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Business Settings...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'owner') {
    return null;
  }

  const tabs = [
    { id: 'general', name: 'General', icon: Building },
    { id: 'hours', name: 'Business Hours', icon: Clock },
    { id: 'branding', name: 'Branding', icon: Palette },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="settings-section">
            <h3 className="section-title">General Information</h3>
            
            <div className="form-grid">
              <div className="form-group full-width">
                <label className="form-label">
                  <Building size={16} />
                  Company Name
                </label>
                <input
                  type="text"
                  value={settings.companyName}
                  onChange={(e) => setSettings(prev => ({ ...prev, companyName: e.target.value }))}
                  className="form-input"
                  placeholder="Your dealership name"
                />
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label className="form-label">
                    <Phone size={16} />
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={settings.phone}
                    onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                    className="form-input"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    <Mail size={16} />
                    Email
                  </label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                    className="form-input"
                    placeholder="contact@dealership.com"
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <label className="form-label">
                  <MapPin size={16} />
                  Address
                </label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))}
                  className="form-input"
                  placeholder="123 Main Street"
                />
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    value={settings.city}
                    onChange={(e) => setSettings(prev => ({ ...prev, city: e.target.value }))}
                    className="form-input"
                    placeholder="Your City"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    value={settings.state}
                    onChange={(e) => setSettings(prev => ({ ...prev, state: e.target.value }))}
                    className="form-input"
                    placeholder="ST"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">ZIP Code</label>
                  <input
                    type="text"
                    value={settings.zipCode}
                    onChange={(e) => setSettings(prev => ({ ...prev, zipCode: e.target.value }))}
                    className="form-input"
                    placeholder="12345"
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <label className="form-label">
                  <Globe size={16} />
                  Website
                </label>
                <input
                  type="url"
                  value={settings.website}
                  onChange={(e) => setSettings(prev => ({ ...prev, website: e.target.value }))}
                  className="form-input"
                  placeholder="https://your-dealership.com"
                />
              </div>
            </div>
          </div>
        );

      case 'hours':
        return (
          <div className="settings-section">
            <h3 className="section-title">Business Hours</h3>
            
            <div className="business-hours-grid">
              {Object.entries(settings.businessHours).map(([day, hours]) => (
                <div key={day} className="hours-row">
                  <div className="day-label">
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </div>
                  
                  <div className="hours-controls">
                    <label className="checkbox-container">
                      <input
                        type="checkbox"
                        checked={!hours.closed}
                        onChange={(e) => updateBusinessHours(day, 'closed', !e.target.checked)}
                        className="checkbox-input"
                      />
                      <span className="checkbox-custom"></span>
                      <span className="checkbox-label">Open</span>
                    </label>
                    
                    {!hours.closed && (
                      <div className="time-inputs">
                        <input
                          type="time"
                          value={hours.open}
                          onChange={(e) => updateBusinessHours(day, 'open', e.target.value)}
                          className="time-input"
                        />
                        <span className="time-separator">to</span>
                        <input
                          type="time"
                          value={hours.close}
                          onChange={(e) => updateBusinessHours(day, 'close', e.target.value)}
                          className="time-input"
                        />
                      </div>
                    )}
                    
                    {hours.closed && (
                      <div className="closed-indicator">
                        <span className="closed-text">Closed</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'branding':
        return (
          <div className="settings-section">
            <h3 className="section-title">Branding & Colors</h3>
            
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Primary Color</label>
                <div className="color-picker-container">
                  <input
                    type="color"
                    value={settings.branding.primaryColor}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      branding: { ...prev.branding, primaryColor: e.target.value }
                    }))}
                    className="color-input"
                  />
                  <span className="color-value">{settings.branding.primaryColor}</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Secondary Color</label>
                <div className="color-picker-container">
                  <input
                    type="color"
                    value={settings.branding.secondaryColor}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      branding: { ...prev.branding, secondaryColor: e.target.value }
                    }))}
                    className="color-input"
                  />
                  <span className="color-value">{settings.branding.secondaryColor}</span>
                </div>
              </div>

              <div className="form-group full-width">
                <label className="form-label">
                  <Camera size={16} />
                  Logo
                </label>
                <div className="logo-upload-container">
                  <div className="logo-preview">
                    {settings.branding.logo ? (
                      <img src={settings.branding.logo} alt="Logo" className="logo-image" />
                    ) : (
                      <div className="logo-placeholder">
                        <Camera size={24} />
                        <span>No logo uploaded</span>
                      </div>
                    )}
                  </div>
                  <button className="upload-btn">
                    <Camera size={16} />
                    Upload Logo
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="settings-section">
            <h3 className="section-title">Notification Preferences</h3>
            
            <div className="notification-options">
              {Object.entries(settings.notifications).map(([key, value]) => (
                <div key={key} className="notification-item">
                  <div className="notification-info">
                    <span className="notification-title">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                    <p className="notification-description">
                      {key === 'emailAlerts' && 'Receive email notifications for important events'}
                      {key === 'smsAlerts' && 'Get SMS alerts for urgent notifications'}
                      {key === 'pushNotifications' && 'Browser push notifications for real-time updates'}
                      {key === 'weeklyReports' && 'Weekly summary reports via email'}
                    </p>
                  </div>
                  <label className="toggle-container">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, [key]: e.target.checked }
                      }))}
                      className="toggle-input"
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="settings-section">
            <h3 className="section-title">Security Settings</h3>
            
            <div className="security-options">
              <div className="security-item">
                <div className="security-info">
                  <span className="security-title">Two-Factor Authentication</span>
                  <p className="security-description">Add an extra layer of security to your account</p>
                </div>
                <label className="toggle-container">
                  <input
                    type="checkbox"
                    checked={settings.security.twoFactorAuth}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      security: { ...prev.security, twoFactorAuth: e.target.checked }
                    }))}
                    className="toggle-input"
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="form-group">
                <label className="form-label">Password Expiry</label>
                <select
                  value={settings.security.passwordExpiry}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    security: { ...prev.security, passwordExpiry: parseInt(e.target.value) }
                  }))}
                  className="form-select"
                >
                  <option value={30}>30 days</option>
                  <option value={60}>60 days</option>
                  <option value={90}>90 days</option>
                  <option value={180}>180 days</option>
                  <option value={365}>365 days</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Session Timeout</label>
                <select
                  value={settings.security.sessionTimeout}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    security: { ...prev.security, sessionTimeout: parseInt(e.target.value) }
                  }))}
                  className="form-select"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={120}>2 hours</option>
                  <option value={480}>8 hours</option>
                </select>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        {/* Header */}
        <div className="header-glass">
          <div className="header-content">
            <div className="header-left">
              <div className="settings-icon-container">
                <Settings size={24} />
              </div>
              <div>
                <h1 className="header-title">Business Settings</h1>
                <p className="header-subtitle">Configure your dealership preferences and settings</p>
              </div>
            </div>
            <div className="header-actions">
              <button
                onClick={handleSave}
                disabled={saving}
                className={`btn-primary ${saving ? 'saving' : ''}`}
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              >
                <Icon size={16} />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="settings-content">{renderTabContent()}</div>
        
        {/* Success Message */}
        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}
        
        {/* Confirmation Dialog */}
        <SettingsConfirmationDialog
          isOpen={showConfirmation}
          onClose={() => {
            setShowConfirmation(false);
            setPendingChanges([]);
            setSaving(false);
          }}
          onConfirm={handleConfirmSave}
          changes={pendingChanges}
          loading={saving}
        />
      </div>
    </div>
  );
}

export default function BusinessSettings() {
  return (
    <I18nProvider>
      <ToastProvider>
        <BusinessSettingsPage />
      </ToastProvider>
    </I18nProvider>
  );
}