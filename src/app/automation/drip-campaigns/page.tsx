"use client";

import React, { useState } from "react";
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Play, 
  Pause, 
  Copy, 
  BarChart3, 
  Settings, 
  Mail,
  Calendar,
  Users,
  TrendingUp,
  Eye,
  MousePointer,
  CheckCircle,
  Clock,
  Filter
} from "lucide-react";

interface DripCampaign {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'draft';
  emails: number;
  subscribers: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  createdAt: string;
  lastModified: string;
  tags: string[];
}

interface CampaignTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  emails: number;
  duration: string;
  tags: string[];
}

export default function DripCampaignsPage() {
  const [campaigns, setCampaigns] = useState<DripCampaign[]>([
    {
      id: '1',
      name: 'New Lead Welcome Series',
      description: 'Welcome sequence for new automotive leads',
      status: 'active',
      emails: 5,
      subscribers: 1247,
      openRate: 68.5,
      clickRate: 24.3,
      conversionRate: 12.8,
      createdAt: '2024-10-01',
      lastModified: '2024-10-15',
      tags: ['welcome', 'automotive', 'leads']
    },
    {
      id: '2',
      name: 'Vehicle Financing Education',
      description: 'Educational series about car financing options',
      status: 'active',
      emails: 7,
      subscribers: 856,
      openRate: 72.1,
      clickRate: 31.2,
      conversionRate: 18.5,
      createdAt: '2024-09-15',
      lastModified: '2024-10-10',
      tags: ['education', 'financing', 'nurture']
    },
    {
      id: '3',
      name: 'Seasonal Promotions',
      description: 'Quarterly promotional campaign series',
      status: 'paused',
      emails: 4,
      subscribers: 2134,
      openRate: 45.8,
      clickRate: 15.7,
      conversionRate: 8.2,
      createdAt: '2024-08-20',
      lastModified: '2024-10-01',
      tags: ['promotional', 'seasonal', 'offers']
    },
    {
      id: '4',
      name: 'Post-Purchase Follow-up',
      description: 'Follow-up sequence for recent customers',
      status: 'draft',
      emails: 3,
      subscribers: 0,
      openRate: 0,
      clickRate: 0,
      conversionRate: 0,
      createdAt: '2024-10-12',
      lastModified: '2024-10-16',
      tags: ['customer', 'follow-up', 'retention']
    }
  ]);

  const [templates] = useState<CampaignTemplate[]>([
    {
      id: '1',
      name: 'Welcome Series Template',
      description: 'Standard welcome email sequence',
      category: 'Onboarding',
      emails: 5,
      duration: '2 weeks',
      tags: ['welcome', 'onboarding']
    },
    {
      id: '2',
      name: 'Product Education Series',
      description: 'Educate leads about products/services',
      category: 'Education',
      emails: 6,
      duration: '3 weeks',
      tags: ['education', 'nurture']
    },
    {
      id: '3',
      name: 'Re-engagement Campaign',
      description: 'Win back inactive subscribers',
      category: 'Re-engagement',
      emails: 4,
      duration: '10 days',
      tags: ['re-engagement', 'winback']
    }
  ]);

  const [selectedTab, setSelectedTab] = useState('campaigns');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      case 'draft': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleStatusToggle = (campaignId: string) => {
    setCampaigns(campaigns.map(campaign => {
      if (campaign.id === campaignId) {
        const newStatus = campaign.status === 'active' ? 'paused' : 'active';
        return { ...campaign, status: newStatus };
      }
      return campaign;
    }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Drip Campaigns</h1>
          <p className="text-gray-600 mt-1">Create and manage automated email sequences</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            <BarChart3 size={20} />
            Analytics
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Create Campaign
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setSelectedTab('campaigns')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'campaigns'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Campaigns ({campaigns.length})
          </button>
          <button
            onClick={() => setSelectedTab('templates')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'templates'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Templates ({templates.length})
          </button>
        </nav>
      </div>

      {/* Campaigns Tab */}
      {selectedTab === 'campaigns' && (
        <div className="space-y-4">
          {/* Campaign Cards */}
          <div className="grid gap-4">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="bg-white border rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{campaign.description}</p>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Emails</p>
                        <p className="text-lg font-semibold text-gray-900">{campaign.emails}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Subscribers</p>
                        <p className="text-lg font-semibold text-gray-900">{campaign.subscribers.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Open Rate</p>
                        <p className="text-lg font-semibold text-gray-900">{campaign.openRate}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Click Rate</p>
                        <p className="text-lg font-semibold text-gray-900">{campaign.clickRate}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Conversion Rate</p>
                        <p className="text-lg font-semibold text-gray-900">{campaign.conversionRate}%</p>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {campaign.tags.map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleStatusToggle(campaign.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        campaign.status === 'active' 
                          ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                          : 'bg-green-100 text-green-600 hover:bg-green-200'
                      }`}
                      title={campaign.status === 'active' ? 'Pause campaign' : 'Start campaign'}
                    >
                      {campaign.status === 'active' ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <button className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                      <Edit3 size={16} />
                    </button>
                    <button className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                      <Copy size={16} />
                    </button>
                    <button className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                      <BarChart3 size={16} />
                    </button>
                    <button className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {selectedTab === 'templates' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <div key={template.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{template.description}</p>
                  
                  <div className="flex justify-between text-sm text-gray-500 mb-3">
                    <span>{template.emails} emails</span>
                    <span>{template.duration}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {template.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  Use Template
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Campaign</h2>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter campaign name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Describe your campaign"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>All Leads</option>
                    <option>New Leads</option>
                    <option>Hot Prospects</option>
                    <option>Past Customers</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Template</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Create from scratch</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>{template.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}