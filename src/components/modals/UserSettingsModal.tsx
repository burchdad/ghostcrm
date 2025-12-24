"use client";
import React, { useState, useEffect } from "react";
import { Modal } from "./Modal";
import { 
  Settings, 
  User, 
  Shield, 
  Bell, 
  Palette, 
  Globe, 
  Building,
  Mail,
  Phone, 
  MapPin, 
  Users,
  Edit,
  Save,
  X,
  Search
} from "lucide-react";
import { useI18n } from "@/components/utils/I18nProvider";
import styles from "./UserSettingsModal.module.css";

interface UserSettingsModalProps {
  open: boolean;
  onClose: () => void;
}

type ActiveSection = 'profile' | 'settings';

interface SettingsCard {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  route: string;
  status: 'active' | 'inactive' | 'warning';
  lastUpdated: string;
}

export function UserSettingsModal({ open, onClose }: UserSettingsModalProps) {
  const { t } = useI18n();
  const [activeSection, setActiveSection] = useState<ActiveSection>('profile');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Real user profile data
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    title: "",
    department: "",
    location: "",
    joinDate: "",
    avatar: ""
  });

  // Editing profile state (separate from display state)
  const [editingProfile, setEditingProfile] = React.useState({
    name: "",
    email: "",
    phone: "",
    title: "",
    department: "",
    location: "",
    avatar: ""
  });

  // Settings state management
  const [appearanceSettings, setAppearanceSettings] = React.useState({
    theme: 'light' as 'light' | 'dark' | 'system',
    colorScheme: 'blue',
    layoutDensity: 'comfortable',
    fontSize: 'medium',
    reducedMotion: false,
    highContrast: false
  });

  const [localeSettings, setLocaleSettings] = React.useState({
    language: 'en',
    region: 'US',
    timezone: '',
    dateFormat: 'MM/dd/yyyy',
    timeFormat: '12-hour',
    numberFormat: 'US',
    currency: 'USD'
  });

  const [securitySettings, setSecuritySettings] = React.useState({
    twoFactorEnabled: false,
    loginNotifications: true,
    sessionTimeout: 30,
    dataSharing: false,
    analyticsOptOut: false
  });

  // New features state
  const [avatarUploading, setAvatarUploading] = React.useState(false);
  const [syncStatus, setSyncStatus] = React.useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [lastSync, setLastSync] = React.useState<string | null>(null);

  // Generate settings cards with dynamic status
  const settingsCards: SettingsCard[] = React.useMemo(() => [
    {
      id: "account",
      title: "Account Settings",
      description: "Manage your account preferences and personal information",
      icon: User,
      color: "blue",
      route: "/settings/account",
      status: "active",
      lastUpdated: "Always current"
    },
    {
      id: "notifications",
      title: "Notifications",
      description: "Configure email and push notification preferences",
      icon: Bell,
      color: "green",
      route: "/settings/notifications",
      status: "active",
      lastUpdated: "Not implemented"
    },
    {
      id: "security",
      title: "Security & Privacy",
      description: "Two-factor authentication, password, and privacy settings",
      icon: Shield,
      color: "red",
      route: "/settings/security",
      status: securitySettings.twoFactorEnabled ? "active" : "warning",
      lastUpdated: "Live data"
    },
    {
      id: "appearance",
      title: "Appearance & Theme",
      description: "Customize the look and feel of your workspace",
      icon: Palette,
      color: "purple",
      route: "/settings/appearance",
      status: "active",
      lastUpdated: `Theme: ${appearanceSettings.theme}`
    },
    {
      id: "language",
      title: "Language & Region",
      description: "Set your preferred language and regional settings",
      icon: Globe,
      color: "indigo",
      route: "/settings/language",
      status: "active",
      lastUpdated: `${localeSettings.language.toUpperCase()}-${localeSettings.region}`
    }
  ], [securitySettings.twoFactorEnabled, appearanceSettings.theme, localeSettings.language, localeSettings.region]);

  // API Functions
  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const profileData = data.profile;
          setProfile({
            name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim(),
            email: profileData.email || '',
            phone: profileData.phone || '',
            title: profileData.title || '',
            department: profileData.department || '',
            location: profileData.location || '',
            joinDate: profileData.created_at ? new Date(profileData.created_at).toLocaleDateString() : '',
            avatar: profileData.avatar_url || ''
          });
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile data');
    }
  };

  const handleProfileSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const [firstName, ...lastNameParts] = profile.name.split(' ');
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile: {
            first_name: firstName || '',
            last_name: lastNameParts.join(' ') || '',
            email: profile.email,
            phone: profile.phone,
            title: profile.title,
            department: profile.department,
            location: profile.location,
            avatar_url: profile.avatar
          }
        })
      });
      
      if (response.ok) {
        setIsEditingProfile(false);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  // Avatar upload handler
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Maximum size is 5MB.');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please use JPEG, PNG, WebP, or GIF.');
      return;
    }

    setAvatarUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(prev => ({ ...prev, avatar: data.avatarUrl }));
        setEditingProfile(prev => ({ ...prev, avatar: data.avatarUrl }));
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to upload avatar');
      }
    } catch (error) {
      setError('Network error during avatar upload');
    } finally {
      setAvatarUploading(false);
    }
  };

  // Avatar removal handler
  const handleAvatarRemove = async () => {
    setAvatarUploading(true);
    setError(null);

    try {
      const response = await fetch('/api/user/avatar', {
        method: 'DELETE'
      });

      if (response.ok) {
        setProfile(prev => ({ ...prev, avatar: '' }));
        setEditingProfile(prev => ({ ...prev, avatar: '' }));
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to remove avatar');
      }
    } catch (error) {
      setError('Network error during avatar removal');
    } finally {
      setAvatarUploading(false);
    }
  };

  // Settings export handler
  const handleExportSettings = async (format: 'json' | 'csv' = 'json') => {
    try {
      const response = await fetch(`/api/user/settings/export-import?format=${format}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ghostcrm-settings-${Date.now()}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        setError('Failed to export settings');
      }
    } catch (error) {
      setError('Network error during settings export');
    }
  };

  // Settings import handler
  const handleImportSettings = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importData = JSON.parse(text);

      const response = await fetch('/api/user/settings/export-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(importData)
      });

      if (response.ok) {
        const result = await response.json();
        // Refresh settings after import
        await Promise.all([
          fetchUserProfile(),
          fetchAppearanceSettings(),
          fetchLocaleSettings(),
          fetchSecuritySettings()
        ]);
        alert(`Settings imported successfully! ${result.results.success.length} sections updated.`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to import settings');
      }
    } catch (error) {
      setError('Invalid settings file or network error');
    }

    // Reset file input
    event.target.value = '';
  };

  // Settings sync handler
  const handleSettingsSync = async () => {
    setSyncStatus('syncing');
    
    try {
      const deviceId = localStorage.getItem('ghostcrm_device_id') || 
        Math.random().toString(36).substring(7);
      localStorage.setItem('ghostcrm_device_id', deviceId);

      const response = await fetch(`/api/user/settings/sync?deviceId=${deviceId}&lastSync=${lastSync || ''}`);
      
      if (response.ok) {
        const syncData = await response.json();
        
        if (syncData.syncInfo.hasUpdates) {
          // Apply updates from server
          if (syncData.updates.profile) {
            // Update local settings with server data
            if (syncData.updates.profile.settings?.appearance) {
              setAppearanceSettings(syncData.updates.profile.settings.appearance);
            }
            if (syncData.updates.profile.settings?.locale) {
              setLocaleSettings(syncData.updates.profile.settings.locale);
            }
            if (syncData.updates.profile.settings?.security) {
              setSecuritySettings(syncData.updates.profile.settings.security);
            }
          }
        }
        
        setLastSync(syncData.syncInfo.serverTimestamp);
        setSyncStatus('success');
        
        // Reset sync status after 2 seconds
        setTimeout(() => setSyncStatus('idle'), 2000);
      } else {
        setSyncStatus('error');
        setTimeout(() => setSyncStatus('idle'), 2000);
      }
    } catch (error) {
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 2000);
    }
  };

  // API Functions for settings
  const fetchAppearanceSettings = async () => {
    try {
      const response = await fetch('/api/user/appearance');
      if (response.ok) {
        const data = await response.json();
        setAppearanceSettings(data);
      }
    } catch (error) {
      console.error('Error fetching appearance settings:', error);
    }
  };

  const saveAppearanceSettings = async (settings: typeof appearanceSettings) => {
    try {
      const response = await fetch('/api/user/appearance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (response.ok) {
        setAppearanceSettings(settings);
        return true;
      }
    } catch (error) {
      console.error('Error saving appearance settings:', error);
    }
    return false;
  };

  const fetchLocaleSettings = async () => {
    try {
      const response = await fetch('/api/user/locale');
      if (response.ok) {
        const data = await response.json();
        setLocaleSettings(data);
      }
    } catch (error) {
      console.error('Error fetching locale settings:', error);
    }
  };

  const saveLocaleSettings = async (settings: typeof localeSettings) => {
    try {
      const response = await fetch('/api/user/locale', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (response.ok) {
        setLocaleSettings(settings);
        return true;
      }
    } catch (error) {
      console.error('Error saving locale settings:', error);
    }
    return false;
  };

  const fetchSecuritySettings = async () => {
    try {
      const response = await fetch('/api/user/security');
      if (response.ok) {
        const data = await response.json();
        setSecuritySettings(data);
      }
    } catch (error) {
      console.error('Error fetching security settings:', error);
    }
  };

  const saveSecuritySettings = async (settings: typeof securitySettings) => {
    try {
      const response = await fetch('/api/user/security', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (response.ok) {
        setSecuritySettings(settings);
        return true;
      }
    } catch (error) {
      console.error('Error saving security settings:', error);
    }
    return false;
  };

  const handleSettingClick = (setting: SettingsCard) => {
    // Navigate to specific settings panel or open dedicated modal
    switch (setting.id) {
      case 'appearance':
        fetchAppearanceSettings();
        break;
      case 'language':
        fetchLocaleSettings();
        break;
      case 'security':
        fetchSecuritySettings();
        break;
      case 'notifications':
        // TODO: Implement notifications settings
        console.log('Opening notifications settings');
        break;
      default:
        console.log(`Opening ${setting.title} settings`);
    }
  };

  // Load user data when modal opens
  React.useEffect(() => {
    if (open) {
      setLoading(true);
      setError(null);
      
      // Load all user data in parallel
      Promise.all([
        fetchUserProfile(),
        fetchAppearanceSettings(),
        fetchLocaleSettings(),
        fetchSecuritySettings()
      ]).catch((error) => {
        setError('Failed to load user settings');
        console.error('Error loading settings:', error);
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [open]);

  // Clean up state when modal closes
  React.useEffect(() => {
    if (!open) {
      setIsEditingProfile(false);
      setError(null);
    }
  }, [open]);

  const filteredSettings = settingsCards.filter(card =>
    card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getIconColorClass = (color: string) => {
    const colorClasses = {
      blue: styles.iconBlue,
      green: styles.iconGreen,
      red: styles.iconRed,
      purple: styles.iconPurple,
      indigo: styles.iconIndigo
    };
    return colorClasses[color as keyof typeof colorClasses] || styles.iconBlue;
  };

  if (!open) return null;

  return (
    <div className={styles.modal} onClick={onClose}>
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        {/* Sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h2 className={styles.title}>User Settings</h2>
            <p className={styles.subtitle}>Manage your profile and preferences</p>
          </div>
          
          <nav className={styles.sidebarNav}>
            <button
              onClick={() => setActiveSection('profile')}
              className={`${styles.navItem} ${activeSection === 'profile' ? styles.active : ''}`}
            >
              <User className={styles.navIcon} />
              Profile
            </button>
            
            <button
              onClick={() => setActiveSection('settings')}
              className={`${styles.navItem} ${activeSection === 'settings' ? styles.active : ''}`}
            >
              <Settings className={styles.navIcon} />
              Settings
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className={styles.content}>
          <div className={styles.contentHeader}>
            <h3 className={styles.contentTitle}>
              {activeSection === 'profile' ? 'Profile Information' : 'System Settings'}
            </h3>
            <button onClick={onClose} className={styles.closeButton}>
              <X style={{ width: '20px', height: '20px' }} />
            </button>
          </div>

          <div className={styles.contentBody}>
            {/* Profile Section */}
            {activeSection === 'profile' && (
              <div>
                {/* Profile Header */}
                <div className={styles.profileHeader}>
                  <div className={styles.avatarContainer}>
                    <img
                      src={profile.avatar || '/default-avatar.png'}
                      alt={profile.name}
                      className={styles.avatar}
                    />
                    <div className={styles.avatarActions}>
                      <input
                        type="file"
                        id="avatar-upload"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        style={{ display: 'none' }}
                        disabled={avatarUploading}
                      />
                      <label 
                        htmlFor="avatar-upload"
                        className={`${styles.avatarButton} ${avatarUploading ? styles.uploading : ''}`}
                        title="Upload avatar"
                      >
                        {avatarUploading ? (
                          <div className={styles.loadingSpinner}></div>
                        ) : (
                          <Edit className={styles.avatarIcon} />
                        )}
                      </label>
                      {profile.avatar && (
                        <button
                          onClick={handleAvatarRemove}
                          className={styles.avatarRemoveButton}
                          disabled={avatarUploading}
                          title="Remove avatar"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                  <div className={styles.profileInfo}>
                    <h3 className={styles.profileName}>{profile.name}</h3>
                    <p className={styles.profileRole}>{profile.title}</p>
                    <p className={styles.profileMember}>
                      Member since {new Date(profile.joinDate).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={isEditingProfile ? handleProfileSave : () => setIsEditingProfile(true)}
                    className={`${styles.editButton} ${loading ? styles.saving : ''}`}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className={styles.loadingSpinner}></div>
                        Saving...
                      </>
                    ) : isEditingProfile ? (
                      <>
                        <Save style={{ width: '16px', height: '16px' }} />
                        Save
                      </>
                    ) : (
                      <>
                        <Edit style={{ width: '16px', height: '16px' }} />
                        Edit
                      </>
                    )}
                  </button>
                </div>

                {/* Profile Form */}
                {error && (
                  <div className={styles.errorMessage}>
                    {error}
                  </div>
                )}

                <div className={styles.profileForm}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      <User className={styles.formLabelIcon} />
                      Full Name
                    </label>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        value={editingProfile.name}
                        onChange={(e) => handleProfileInputChange('name', e.target.value)}
                        className={styles.formInput}
                        disabled={loading}
                      />
                    ) : (
                      <div className={styles.formField}>{profile.name}</div>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      <Mail className={styles.formLabelIcon} />
                      Email Address
                    </label>
                    {isEditingProfile ? (
                      <input
                        type="email"
                        value={editingProfile.email}
                        onChange={(e) => handleProfileInputChange('email', e.target.value)}
                        className={styles.formInput}
                        disabled={loading}
                      />
                    ) : (
                      <div className={styles.formField}>{profile.email}</div>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      <Phone className={styles.formLabelIcon} />
                      Phone Number
                    </label>
                    {isEditingProfile ? (
                      <input
                        type="tel"
                        value={editingProfile.phone}
                        onChange={(e) => handleProfileInputChange('phone', e.target.value)}
                        className={styles.formInput}
                        disabled={loading}
                      />
                    ) : (
                      <div className={styles.formField}>{profile.phone}</div>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      <Building className={styles.formLabelIcon} />
                      Job Title
                    </label>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        value={editingProfile.title}
                        onChange={(e) => handleProfileInputChange('title', e.target.value)}
                        className={styles.formInput}
                        disabled={loading}
                      />
                    ) : (
                      <div className={styles.formField}>{profile.title}</div>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      <Users className={styles.formLabelIcon} />
                      Department
                    </label>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        value={editingProfile.department}
                        onChange={(e) => handleProfileInputChange('department', e.target.value)}
                        className={styles.formInput}
                        disabled={loading}
                      />
                    ) : (
                      <div className={styles.formField}>{profile.department}</div>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      <MapPin className={styles.formLabelIcon} />
                      Location
                    </label>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        value={editingProfile.location}
                        onChange={(e) => handleProfileInputChange('location', e.target.value)}
                        className={styles.formInput}
                        disabled={loading}
                      />
                    ) : (
                      <div className={styles.formField}>{profile.location}</div>
                    )}
                  </div>
                </div>

                {isEditingProfile && (
                  <div className={styles.formActions}>
                    <button
                      onClick={() => setIsEditingProfile(false)}
                      className={styles.cancelButton}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleProfileSave}
                      className={`${styles.saveButton} ${loading ? styles.saving : ''}`}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className={styles.loadingSpinner}></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save style={{ width: '16px', height: '16px' }} />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Advanced Settings Section */}
                <div className={styles.advancedSettings}>
                  <h4 className={styles.advancedSettingsTitle}>Settings Management</h4>
                  <div className={styles.advancedSettingsGrid}>
                    {/* Export Settings */}
                    <div className={styles.advancedSettingCard}>
                      <div className={styles.advancedSettingInfo}>
                        <h5>Export Settings</h5>
                        <p>Download your settings as JSON or CSV</p>
                      </div>
                      <div className={styles.advancedSettingActions}>
                        <button
                          onClick={() => handleExportSettings('json')}
                          className={styles.advancedButton}
                        >
                          JSON
                        </button>
                        <button
                          onClick={() => handleExportSettings('csv')}
                          className={styles.advancedButton}
                        >
                          CSV
                        </button>
                      </div>
                    </div>

                    {/* Import Settings */}
                    <div className={styles.advancedSettingCard}>
                      <div className={styles.advancedSettingInfo}>
                        <h5>Import Settings</h5>
                        <p>Restore settings from a backup file</p>
                      </div>
                      <div className={styles.advancedSettingActions}>
                        <input
                          type="file"
                          id="settings-import"
                          accept=".json"
                          onChange={handleImportSettings}
                          style={{ display: 'none' }}
                        />
                        <label
                          htmlFor="settings-import"
                          className={styles.advancedButton}
                        >
                          Import
                        </label>
                      </div>
                    </div>

                    {/* Sync Settings */}
                    <div className={styles.advancedSettingCard}>
                      <div className={styles.advancedSettingInfo}>
                        <h5>Sync Settings</h5>
                        <p>Sync settings across your devices</p>
                        {lastSync && (
                          <small>Last sync: {new Date(lastSync).toLocaleString()}</small>
                        )}
                      </div>
                      <div className={styles.advancedSettingActions}>
                        <button
                          onClick={handleSettingsSync}
                          className={`${styles.advancedButton} ${syncStatus === 'syncing' ? styles.syncing : ''}`}
                          disabled={syncStatus === 'syncing'}
                        >
                          {syncStatus === 'syncing' ? (
                            <>
                              <div className={styles.loadingSpinner}></div>
                              Syncing...
                            </>
                          ) : syncStatus === 'success' ? (
                            '✓ Synced'
                          ) : syncStatus === 'error' ? (
                            '✗ Error'
                          ) : (
                            'Sync Now'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Section */}
            {activeSection === 'settings' && (
              <div>
                {/* Search */}
                <div className={styles.searchContainer}>
                  <Search className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search settings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                  />
                </div>

                {/* Settings Grid */}
                <div className={styles.settingsGrid}>
                  {filteredSettings.map((setting) => {
                    const IconComponent = setting.icon;
                    return (
                      <div
                        key={setting.id}
                        onClick={() => handleSettingClick(setting)}
                        className={styles.settingCard}
                      >
                        <div className={styles.settingCardHeader}>
                          <div className={`${styles.settingIcon} ${getIconColorClass(setting.color)}`}>
                            <IconComponent style={{ width: '20px', height: '20px' }} />
                          </div>
                          <span className={`${styles.settingStatus} ${styles[setting.status]}`}>
                            {setting.status}
                          </span>
                        </div>
                        <h4 className={styles.settingTitle}>{setting.title}</h4>
                        <p className={styles.settingDescription}>{setting.description}</p>
                        <div className={styles.settingLastUpdated}>
                          Last updated: {setting.lastUpdated}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {filteredSettings.length === 0 && (
                  <div className={styles.emptyState}>
                    <Settings className={styles.emptyIcon} />
                    <p className={styles.emptyMessage}>No settings found matching your search.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}