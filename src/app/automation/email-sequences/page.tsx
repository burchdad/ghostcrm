"use client";

import React, { useState } from "react";
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Play, 
  Pause, 
  Copy, 
  Mail, 
  Clock, 
  Users, 
  BarChart3, 
  Settings,
  Eye,
  MousePointer,
  ArrowRight,
  Calendar,
  CheckCircle,
  AlertCircle,
  Send
} from "lucide-react";

interface EmailSequence {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'draft';
  emails: EmailStep[];
  subscribers: number;
  totalSent: number;
  openRate: number;
  clickRate: number;
  replyRate: number;
  createdAt: string;
  lastModified: string;
}

interface EmailStep {
  id: string;
  subject: string;
  delay: number; // days
  delayUnit: 'minutes' | 'hours' | 'days' | 'weeks';
  status: 'active' | 'inactive';
  openRate: number;
  clickRate: number;
  sent: number;
}

interface SequenceTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  steps: number;
  duration: string;
  industry: string;
}

export default function EmailSequencesPage() {
  const [sequences, setSequences] = useState<EmailSequence[]>([
    {
      id: '1',
      name: 'Vehicle Interest Follow-Up',
      description: 'Follow up with leads who showed interest in specific vehicles',
      status: 'active',
      emails: [
        { id: '1', subject: 'Thank you for your interest in the 2024 Honda Accord', delay: 0, delayUnit: 'hours', status: 'active', openRate: 78.5, clickRate: 24.3, sent: 156 },
        { id: '2', subject: 'Special financing options for your Honda Accord', delay: 2, delayUnit: 'days', status: 'active', openRate: 65.2, clickRate: 18.7, sent: 134 },
        { id: '3', subject: 'Schedule your test drive today', delay: 5, delayUnit: 'days', status: 'active', openRate: 58.9, clickRate: 22.1, sent: 98 },
        { id: '4', subject: 'Limited time offer on Honda Accord', delay: 1, delayUnit: 'weeks', status: 'active', openRate: 52.3, clickRate: 15.8, sent: 76 }
      ],
      subscribers: 234,
      totalSent: 464,
      openRate: 63.7,
      clickRate: 20.2,
      replyRate: 8.5,
      createdAt: '2024-09-15',
      lastModified: '2024-10-12'
    },
    {
      id: '2',
      name: 'Post-Test Drive Sequence',
      description: 'Nurture leads after they complete a test drive',
      status: 'active',
      emails: [
        { id: '1', subject: 'How was your test drive experience?', delay: 2, delayUnit: 'hours', status: 'active', openRate: 82.1, clickRate: 31.2, sent: 89 },
        { id: '2', subject: 'Ready to move forward? Let\'s discuss next steps', delay: 1, delayUnit: 'days', status: 'active', openRate: 74.6, clickRate: 28.5, sent: 73 },
        { id: '3', subject: 'Your personalized vehicle quote is ready', delay: 3, delayUnit: 'days', status: 'active', openRate: 69.2, clickRate: 34.1, sent: 54 }
      ],
      subscribers: 167,
      totalSent: 216,
      openRate: 75.3,
      clickRate: 31.3,
      replyRate: 12.4,
      createdAt: '2024-08-20',
      lastModified: '2024-10-08'
    },
    {
      id: '3',
      name: 'New Lead Welcome Series',
      description: 'Welcome new leads and introduce your dealership',
      status: 'paused',
      emails: [
        { id: '1', subject: 'Welcome to Premier Auto - Let\'s find your perfect car', delay: 0, delayUnit: 'minutes', status: 'active', openRate: 71.4, clickRate: 19.8, sent: 345 },
        { id: '2', subject: 'Browse our latest inventory', delay: 1, delayUnit: 'days', status: 'active', openRate: 58.3, clickRate: 16.2, sent: 246 },
        { id: '3', subject: 'Why choose Premier Auto?', delay: 3, delayUnit: 'days', status: 'active', openRate: 52.1, clickRate: 13.7, sent: 203 },
        { id: '4', subject: 'Schedule a no-obligation consultation', delay: 1, delayUnit: 'weeks', status: 'active', openRate: 45.8, clickRate: 11.2, sent: 156 }
      ],
      subscribers: 456,
      totalSent: 950,
      openRate: 56.9,
      clickRate: 15.2,
      replyRate: 6.8,
      createdAt: '2024-07-10',
      lastModified: '2024-09-25'
    }
  ]);

  const [templates] = useState<SequenceTemplate[]>([
    { id: '1', name: 'New Lead Welcome', description: 'Welcome sequence for new leads', category: 'Onboarding', steps: 4, duration: '2 weeks', industry: 'Automotive' },
    { id: '2', name: 'Test Drive Follow-Up', description: 'Post test drive nurturing', category: 'Follow-up', steps: 3, duration: '1 week', industry: 'Automotive' },
    { id: '3', name: 'Price Quote Follow-Up', description: 'Follow up on price quotes', category: 'Sales', steps: 5, duration: '2 weeks', industry: 'Automotive' },
    { id: '4', name: 'Re-engagement Series', description: 'Win back cold leads', category: 'Re-engagement', steps: 3, duration: '10 days', industry: 'General' }
  ]);

  const [selectedTab, setSelectedTab] = useState('sequences');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSequence, setSelectedSequence] = useState<string | null>(null);

  const handleToggleSequence = (sequenceId: string) => {
    setSequences(sequences.map(seq => {
      if (seq.id === sequenceId) {
        return { ...seq, status: seq.status === 'active' ? 'paused' : 'active' };
      }
      return seq;
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      case 'draft': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDelay = (delay: number, unit: string) => {
    if (delay === 0) return 'Immediately';
    return `${delay} ${unit}${delay > 1 ? '' : ''}`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Sequences</h1>
          <p className="text-gray-600 mt-1">Create and manage automated email sequences for lead nurturing</p>
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
            Create Sequence
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setSelectedTab('sequences')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'sequences'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Sequences ({sequences.length})
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

      {/* Sequences Tab */}
      {selectedTab === 'sequences' && (
        <div className="space-y-4">
          {sequences.map((sequence) => (
            <div key={sequence.id} className="bg-white border rounded-lg">
              {/* Sequence Header */}
              <div className="p-6 border-b">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{sequence.name}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(sequence.status)}`}>
                        {sequence.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{sequence.description}</p>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Subscribers</p>
                        <p className="text-lg font-semibold text-gray-900">{sequence.subscribers}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Sent</p>
                        <p className="text-lg font-semibold text-gray-900">{sequence.totalSent}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Open Rate</p>
                        <p className="text-lg font-semibold text-gray-900">{sequence.openRate}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Click Rate</p>
                        <p className="text-lg font-semibold text-gray-900">{sequence.clickRate}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Reply Rate</p>
                        <p className="text-lg font-semibold text-gray-900">{sequence.replyRate}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleToggleSequence(sequence.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        sequence.status === 'active' 
                          ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                          : 'bg-green-100 text-green-600 hover:bg-green-200'
                      }`}
                      title={sequence.status === 'active' ? 'Pause sequence' : 'Start sequence'}
                    >
                      {sequence.status === 'active' ? <Pause size={16} /> : <Play size={16} />}
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
                    <button 
                      onClick={() => setSelectedSequence(selectedSequence === sequence.id ? null : sequence.id)}
                      className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Eye size={16} />
                    </button>
                    <button className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Email Steps (Expandable) */}
              {selectedSequence === sequence.id && (
                <div className="p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Email Steps ({sequence.emails.length})</h4>
                  <div className="space-y-3">
                    {sequence.emails.map((email, index) => (
                      <div key={email.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium text-sm">
                          {index + 1}
                        </div>
                        
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{email.subject}</h5>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              {formatDelay(email.delay, email.delayUnit)}
                            </span>
                            <span>{email.sent} sent</span>
                            <span>{email.openRate}% opens</span>
                            <span>{email.clickRate}% clicks</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            email.status === 'active' ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'
                          }`}>
                            {email.status}
                          </span>
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <Edit3 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Templates Tab */}
      {selectedTab === 'templates' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <div key={template.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="text-blue-600" size={20} />
                    <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{template.description}</p>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm text-gray-500 mb-4">
                    <div>
                      <span className="font-medium">{template.steps}</span> emails
                    </div>
                    <div>
                      <span className="font-medium">{template.duration}</span> duration
                    </div>
                  </div>

                  <div className="flex gap-2 mb-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md">
                      {template.category}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                      {template.industry}
                    </span>
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

      {/* Create Sequence Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create Email Sequence</h2>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sequence Name</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter sequence name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Template</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Start from scratch</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>{template.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Describe your email sequence"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>All Leads</option>
                    <option>New Leads</option>
                    <option>Vehicle Interest Leads</option>
                    <option>Post-Test Drive</option>
                    <option>Custom Segment</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trigger Event</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Lead Created</option>
                    <option>Form Submitted</option>
                    <option>Test Drive Completed</option>
                    <option>Quote Requested</option>
                    <option>Manual Enrollment</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3">
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
                  Create Sequence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}