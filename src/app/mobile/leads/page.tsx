'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicle: string;
  status: 'new' | 'contacted' | 'scheduled' | 'sold' | 'lost';
  priority: 'high' | 'medium' | 'low';
  lastContact: string;
  source: string;
}

// Helper function to get tenant-aware route based on user role
function getTenantRoute(user: any, basePath: string): string {
  if (!user || !user.role) return basePath;
  
  const roleMapping: Record<string, string> = {
    'owner': 'tenant-owner',
    'admin': 'tenant-owner', // Admin can access owner routes
    'manager': 'tenant-salesmanager',
    'sales_rep': 'tenant-salesrep',
    'user': 'tenant-salesrep' // Default users to sales rep level
  };
  
  const tenantPrefix = roleMapping[user.role] || 'tenant-salesrep';
  return `/${tenantPrefix}${basePath}`;
}

export default function MobileLeads() {
  const { user, tenant } = useAuth();
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState<'all' | 'new' | 'hot' | 'scheduled'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeads();
  }, [filter]);

  const loadLeads = async () => {
    try {
      // Simulate API call
      const mockLeads: Lead[] = [
        {
          id: '1',
          name: 'John Smith',
          phone: '(555) 123-4567',
          email: 'john@email.com',
          vehicle: '2024 Honda Civic',
          status: 'new',
          priority: 'high',
          lastContact: '5 minutes ago',
          source: 'Website'
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          phone: '(555) 234-5678',
          email: 'sarah@email.com',
          vehicle: '2023 Toyota Camry',
          status: 'scheduled',
          priority: 'medium',
          lastContact: '2 hours ago',
          source: 'Facebook'
        },
        {
          id: '3',
          name: 'Mike Davis',
          phone: '(555) 345-6789',
          email: 'mike@email.com',
          vehicle: '2024 Ford F-150',
          status: 'contacted',
          priority: 'high',
          lastContact: '1 day ago',
          source: 'QR Code'
        }
      ];

      setLeads(mockLeads);
      setLoading(false);
    } catch (error) {
      console.error('Error loading leads:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-green-100 text-green-800';
      case 'contacted':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-purple-100 text-purple-800';
      case 'sold':
        return 'bg-green-100 text-green-800';
      case 'lost':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleCall = (phone: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = `tel:${phone}`;
    }
  };

  const handleEmail = (email: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = `mailto:${email}`;
    }
  };

  const handleSMS = (phone: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = `sms:${phone}`;
    }
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-300 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
        <button 
          onClick={() => {
            const newLeadRoute = getTenantRoute(user, "/new-lead");
            router.push(newLeadRoute);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + New Lead
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {[
          { key: 'all', label: 'All Leads', count: leads.length },
          { key: 'new', label: 'New', count: leads.filter(l => l.status === 'new').length },
          { key: 'hot', label: 'Hot', count: leads.filter(l => l.priority === 'high').length },
          { key: 'scheduled', label: 'Scheduled', count: leads.filter(l => l.status === 'scheduled').length }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
              filter === tab.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Leads List */}
      <div className="space-y-4">
        {leads
          .filter(lead => {
            if (filter === 'all') return true;
            if (filter === 'new') return lead.status === 'new';
            if (filter === 'hot') return lead.priority === 'high';
            if (filter === 'scheduled') return lead.status === 'scheduled';
            return true;
          })
          .map((lead) => (
            <div key={lead.id} className="bg-white rounded-lg shadow border border-gray-200 p-4">
              {/* Lead Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{lead.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{lead.vehicle}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`text-xs font-medium ${getPriorityColor(lead.priority)}`}>
                      {lead.priority.toUpperCase()} PRIORITY
                    </span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-500">{lead.source}</span>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{lead.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                  <span>{lead.email}</span>
                </div>
                <p className="text-xs text-gray-500">Last contact: {lead.lastContact}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleCall(lead.phone)}
                  className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center space-x-1 hover:bg-green-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>Call</span>
                </button>
                <button
                  onClick={() => handleSMS(lead.phone)}
                  className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center space-x-1 hover:bg-blue-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>SMS</span>
                </button>
                <button
                  onClick={() => handleEmail(lead.email)}
                  className="flex-1 bg-gray-600 text-white py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center space-x-1 hover:bg-gray-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                  <span>Email</span>
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* Empty State */}
      {leads.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No leads found</h3>
          <p className="text-gray-600 mb-4">Start capturing leads to see them here</p>
          <button 
            onClick={() => {
              const newLeadRoute = getTenantRoute(user, "/new-lead");
              router.push(newLeadRoute);
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            Create First Lead
          </button>
        </div>
      )}
    </div>
  );
}