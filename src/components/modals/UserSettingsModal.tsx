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
  Database, 
  Zap, 
  Key, 
  Monitor,
  Users,
  Building,
  Mail,
  Phone, 
  MapPin, 
  Calendar,
  FileText,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info,
  Edit,
  Save,
  X,
  Search
} from "lucide-react";
import { useI18n } from "@/components/utils/I18nProvider";

interface UserSettingsModalProps {
  open: boolean;
  onClose: () => void;
}

type TabType = 'profile' | 'settings';

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
  const [activeTab, setActiveTab] = useState<TabType>('profile');
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
    },
    {
      id: "integrations",
      title: "Integrations",
      description: "Connect with external tools and services",
      icon: Zap,
      color: "yellow",
      route: "/settings/integrations",
      status: "inactive",
      lastUpdated: "Never"
    },
    {
      id: "api",
      title: "API Keys",
      description: "Manage API access tokens and webhooks",
      icon: Key,
      color: "gray",
      route: "/settings/api",
      status: "active",
      lastUpdated: "2 weeks ago"
    },
    {
      id: "billing",
      title: "Billing & Usage",
      description: "View your subscription and usage statistics",
      icon: FileText,
      color: "green",
      route: "/settings/billing",
      status: "active",
      lastUpdated: "1 day ago"
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
    // In real app, this would navigate to specific settings page or open sub-modal
  };

  const filteredSettings = settingsCards.filter(card =>
    card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: SettingsCard['status']) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getIconColor = (color: string) => {
    const colors = {
      blue: 'text-blue-600 bg-blue-100',
      green: 'text-green-600 bg-green-100',
      red: 'text-red-600 bg-red-100',
      purple: 'text-purple-600 bg-purple-100',
      indigo: 'text-indigo-600 bg-indigo-100',
      yellow: 'text-yellow-600 bg-yellow-100',
      gray: 'text-gray-600 bg-gray-100'
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header with Tabs */}
        <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between p-6 pb-0">
            <h2 className="text-2xl font-bold text-gray-900">User Settings</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex px-6 pt-4">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-4 py-3 rounded-t-lg font-medium transition-all ${
                activeTab === 'profile'
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-white/50'
              }`}
            >
              <User className="w-4 h-4" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-4 py-3 rounded-t-lg font-medium transition-all ${
                activeTab === 'settings'
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-white/50'
              }`}
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-start gap-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                <div className="relative">
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs shadow-lg hover:bg-blue-700 transition-colors">
                    <Edit className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{profile.name}</h3>
                    <button
                      onClick={() => setIsEditingProfile(!isEditingProfile)}
                      className="flex items-center gap-2 px-3 py-1 text-sm bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors"
                    >
                      {isEditingProfile ? (
                        <>
                          <Save className="w-4 h-4" />
                          Save
                        </>
                      ) : (
                        <>
                          <Edit className="w-4 h-4" />
                          Edit
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-gray-600 mb-1">{profile.title}</p>
                  <p className="text-sm text-gray-500">Member since {new Date(profile.joinDate).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Profile Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Full Name
                    </label>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => handleProfileInputChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg text-gray-900">{profile.name}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email Address
                    </label>
                    {isEditingProfile ? (
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => handleProfileInputChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg text-gray-900">{profile.email}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Phone Number
                    </label>
                    {isEditingProfile ? (
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => handleProfileInputChange('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg text-gray-900">{profile.phone}</div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Building className="w-4 h-4 inline mr-2" />
                      Job Title
                    </label>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        value={profile.title}
                        onChange={(e) => handleProfileInputChange('title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg text-gray-900">{profile.title}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Users className="w-4 h-4 inline mr-2" />
                      Department
                    </label>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        value={profile.department}
                        onChange={(e) => handleProfileInputChange('department', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg text-gray-900">{profile.department}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-2" />
                      Location
                    </label>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        value={profile.location}
                        onChange={(e) => handleProfileInputChange('location', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg text-gray-900">{profile.location}</div>
                    )}
                  </div>
                </div>
              </div>

              {isEditingProfile && (
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleProfileSave}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search settings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Settings Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSettings.map((setting) => {
                  const IconComponent = setting.icon;
                  return (
                    <div
                      key={setting.id}
                      onClick={() => handleSettingClick(setting)}
                      className="group p-6 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-lg transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-lg ${getIconColor(setting.color)}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(setting.status)}`}>
                          {setting.status}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {setting.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">{setting.description}</p>
                      <div className="text-xs text-gray-500">
                        Last updated: {setting.lastUpdated}
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredSettings.length === 0 && (
                <div className="text-center py-12">
                  <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No settings found matching your search.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}