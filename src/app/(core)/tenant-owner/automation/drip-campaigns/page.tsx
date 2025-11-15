"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Mail,
  Plus,
  Play,
  Pause,
  Edit,
  Users,
  Calendar,
  TrendingUp,
  Eye
} from "lucide-react";
import './drip-campaigns.css';

interface Campaign {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'draft';
  emailCount: number;
  subscribers: number;
  openRate: number;
  clickRate: number;
  startDate: string;
}

export default function DripCampaignsPage() {
  const [campaigns] = useState<Campaign[]>([
    {
      id: '1',
      name: 'Welcome Series',
      description: '5-email welcome sequence for new subscribers',
      status: 'active',
      emailCount: 5,
      subscribers: 234,
      openRate: 67,
      clickRate: 23,
      startDate: '2024-01-15'
    },
    {
      id: '2',
      name: 'Product Education',
      description: 'Educational content about our features',
      status: 'active',
      emailCount: 7,
      subscribers: 156,
      openRate: 72,
      clickRate: 31,
      startDate: '2024-01-10'
    },
    {
      id: '3',
      name: 'Re-engagement Campaign',
      description: 'Win back inactive subscribers',
      status: 'paused',
      emailCount: 3,
      subscribers: 89,
      openRate: 45,
      clickRate: 12,
      startDate: '2024-01-05'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.location.href = '/tenant-owner/automation'}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Drip Campaigns</h1>
              <p className="text-gray-600">Create and manage email drip campaigns</p>
            </div>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Plus size={18} />
            Create Campaign
          </button>
        </div>

        {/* Campaign Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4">{campaign.description}</p>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Emails:</span>
                  <span className="font-medium">{campaign.emailCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Subscribers:</span>
                  <span className="font-medium">{campaign.subscribers}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Open Rate:</span>
                  <span className="font-medium text-green-600">{campaign.openRate}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Click Rate:</span>
                  <span className="font-medium text-blue-600">{campaign.clickRate}%</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                {campaign.status === 'active' ? (
                  <button className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors">
                    <Pause size={14} />
                    Pause
                  </button>
                ) : (
                  <button className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                    <Play size={14} />
                    Resume
                  </button>
                )}
                <button className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                  <Edit size={14} />
                  Edit
                </button>
                <button className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Eye size={14} />
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}