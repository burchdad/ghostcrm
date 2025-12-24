"use client";
import React, { useState } from "react";
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

  // Mock user profile data
  const [profile, setProfile] = useState({
    name: "John Smith",
    email: "john.smith@company.com",
    phone: "(555) 123-4567",
    title: "Sales Manager",
    department: "Sales",
    location: "New York, NY",
    joinDate: "2023-01-15",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face"
  });

  const settingsCards: SettingsCard[] = [
    {
      id: "account",
      title: "Account Settings",
      description: "Manage your account preferences and security",
      icon: User,
      color: "blue",
      route: "/settings/account",
      status: "active",
      lastUpdated: "2 days ago"
    },
    {
      id: "notifications",
      title: "Notifications",
      description: "Configure email and push notification preferences",
      icon: Bell,
      color: "green",
      route: "/settings/notifications",
      status: "active",
      lastUpdated: "1 week ago"
    },
    {
      id: "security",
      title: "Security & Privacy",
      description: "Two-factor authentication, password, and privacy settings",
      icon: Shield,
      color: "red",
      route: "/settings/security",
      status: "warning",
      lastUpdated: "3 weeks ago"
    },
    {
      id: "appearance",
      title: "Appearance & Theme",
      description: "Customize the look and feel of your workspace",
      icon: Palette,
      color: "purple",
      route: "/settings/appearance",
      status: "active",
      lastUpdated: "5 days ago"
    },
    {
      id: "language",
      title: "Language & Region",
      description: "Set your preferred language and regional settings",
      icon: Globe,
      color: "indigo",
      route: "/settings/language",
      status: "active",
      lastUpdated: "1 month ago"
    }
  ];

  const handleProfileSave = () => {
    console.log("Saving profile:", profile);
    setIsEditingProfile(false);
  };

  const handleProfileInputChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSettingClick = (setting: SettingsCard) => {
    console.log(`Opening ${setting.title} settings`);
  };

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
                      src={profile.avatar}
                      alt={profile.name}
                      className={styles.avatar}
                    />
                    <button className={styles.avatarButton}>
                      <Edit className={styles.avatarIcon} />
                    </button>
                  </div>
                  <div className={styles.profileInfo}>
                    <h3 className={styles.profileName}>{profile.name}</h3>
                    <p className={styles.profileRole}>{profile.title}</p>
                    <p className={styles.profileMember}>
                      Member since {new Date(profile.joinDate).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    className={styles.editButton}
                  >
                    {isEditingProfile ? (
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
                <div className={styles.profileForm}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      <User className={styles.formLabelIcon} />
                      Full Name
                    </label>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => handleProfileInputChange('name', e.target.value)}
                        className={styles.formInput}
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
                        value={profile.email}
                        onChange={(e) => handleProfileInputChange('email', e.target.value)}
                        className={styles.formInput}
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
                        value={profile.phone}
                        onChange={(e) => handleProfileInputChange('phone', e.target.value)}
                        className={styles.formInput}
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
                        value={profile.title}
                        onChange={(e) => handleProfileInputChange('title', e.target.value)}
                        className={styles.formInput}
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
                        value={profile.department}
                        onChange={(e) => handleProfileInputChange('department', e.target.value)}
                        className={styles.formInput}
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
                        value={profile.location}
                        onChange={(e) => handleProfileInputChange('location', e.target.value)}
                        className={styles.formInput}
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
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleProfileSave}
                      className={styles.saveButton}
                    >
                      <Save style={{ width: '16px', height: '16px' }} />
                      Save Changes
                    </button>
                  </div>
                )}
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