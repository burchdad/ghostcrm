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
  Smartphone,
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

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

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

const settingsCards: SettingsCard[] = [
  {
    id: 'profile',
    title: 'Profile & Account',
    description: 'Manage your personal information, avatar, and account preferences',
    icon: User,
    color: 'bg-blue-500',
    route: '/settings/profile',
    status: 'active',
    lastUpdated: '2024-10-14'
  },
  {
    id: 'security',
    title: 'Security & Privacy',
    description: 'Configure password, 2FA, API keys, and privacy settings',
    icon: Shield,
    color: 'bg-green-500',
    route: '/settings/security',
    status: 'active',
    lastUpdated: '2024-10-12'
  },
  {
    id: 'preferences',
    title: 'User Preferences',
    description: 'Customize your workspace, notifications, and display settings',
    icon: Settings,
    color: 'bg-purple-500',
    route: '/settings/preferences',
    status: 'active',
    lastUpdated: '2024-10-10'
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Control email, SMS, and in-app notification preferences',
    icon: Bell,
    color: 'bg-orange-500',
    route: '/settings/notifications',
    status: 'warning',
    lastUpdated: '2024-10-08'
  },
  {
    id: 'integrations',
    title: 'Integrations',
    description: 'Connect third-party services and manage API integrations',
    icon: Zap,
    color: 'bg-yellow-500',
    route: '/settings/integrations',
    status: 'active',
    lastUpdated: '2024-10-14'
  },
  {
    id: 'organization',
    title: 'Organization',
    description: 'Manage company settings, teams, and organizational structure',
    icon: Building,
    color: 'bg-indigo-500',
    route: '/settings/organization',
    status: 'active',
    lastUpdated: '2024-10-11'
  },
  {
    id: 'system',
    title: 'System Configuration',
    description: 'Advanced system settings, database, and performance tuning',
    icon: Database,
    color: 'bg-red-500',
    route: '/settings/system-config',
    status: 'active',
    lastUpdated: '2024-10-13'
  },
  {
    id: 'appearance',
    title: 'Appearance & Theme',
    description: 'Customize UI themes, colors, and visual preferences',
    icon: Palette,
    color: 'bg-pink-500',
    route: '/settings/appearance',
    status: 'active',
    lastUpdated: '2024-10-09'
  }
];

const recentActivity = [
  {
    id: '1',
    action: 'Password updated',
    user: 'John Smith',
    timestamp: '2024-10-14T10:30:00Z',
    type: 'security'
  },
  {
    id: '2',
    action: 'Email notification settings changed',
    user: 'Sarah Johnson',
    timestamp: '2024-10-14T09:15:00Z',
    type: 'preferences'
  },
  {
    id: '3',
    action: 'Slack integration enabled',
    user: 'Mike Chen',
    timestamp: '2024-10-13T16:45:00Z',
    type: 'integrations'
  },
  {
    id: '4',
    action: 'New team member added',
    user: 'Emily Davis',
    timestamp: '2024-10-13T14:20:00Z',
    type: 'organization'
  },
  {
    id: '5',
    action: 'Theme changed to Dark Mode',
    user: 'Alex Rodriguez',
    timestamp: '2024-10-12T11:10:00Z',
    type: 'appearance'
  }
];

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'inactive': return <X className="w-4 h-4 text-red-600" />;
      default: return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'security': return <Shield className="w-4 h-4 text-green-600" />;
      case 'preferences': return <Settings className="w-4 h-4 text-purple-600" />;
      case 'integrations': return <Zap className="w-4 h-4 text-yellow-600" />;
      case 'organization': return <Building className="w-4 h-4 text-indigo-600" />;
      case 'appearance': return <Palette className="w-4 h-4 text-pink-600" />;
      default: return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  const filteredCards = settingsCards.filter(card => {
    const matchesSearch = card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || card.status === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSettingClick = (route: string) => {
    console.log('Opening setting:', route);
    // In a real app, you could either:
    // 1. Navigate to the setting page: router.push(route)
    // 2. Open a sub-modal for that specific setting
    // 3. Show an inline settings panel within the modal
    
    // For now, let's just close the modal and navigate
    onClose();
    // router.push(route); // Uncomment if you want to navigate
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div>
            <h2 className="text-xl font-semibold">Settings</h2>
            <p className="text-blue-100 text-sm">Manage your account, preferences, and system configuration</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button className="flex items-center gap-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm">
              <Upload className="w-4 h-4" />
              Import
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Active Settings</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {settingsCards.filter(c => c.status === 'active').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-medium">Need Attention</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {settingsCards.filter(c => c.status === 'warning').length}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Integrations</p>
                  <p className="text-2xl font-bold text-green-900">12</p>
                </div>
                <Zap className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Recent Changes</p>
                  <p className="text-2xl font-bold text-purple-900">{recentActivity.length}</p>
                </div>
                <RefreshCw className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Settings Cards */}
            <div className="lg:col-span-2">
              {/* Search and Filter */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search settings..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    <option value="active">Active</option>
                    <option value="warning">Need Attention</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Settings Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCards.map(card => {
                  const IconComponent = card.icon;
                  return (
                    <div 
                      key={card.id} 
                      className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleSettingClick(card.route)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center text-white`}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(card.status)}
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{card.title}</h3>
                      <p className="text-gray-600 text-sm mb-4">{card.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          Updated {new Date(card.lastUpdated).toLocaleDateString()}
                        </span>
                        <span className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          Configure →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity Sidebar */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.map(activity => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500">
                        by {activity.user} • {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 px-4 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm">
                View All Activity
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="flex items-center gap-3 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Key className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Reset API Keys</span>
              </button>
              <button className="flex items-center gap-3 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Backup Data</span>
              </button>
              <button className="flex items-center gap-3 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Users className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium">Manage Users</span>
              </button>
              <button className="flex items-center gap-3 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Monitor className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium">System Health</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}