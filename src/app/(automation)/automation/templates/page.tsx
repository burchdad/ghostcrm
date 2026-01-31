"use client";

import React, { useState } from "react";
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Download, 
  Upload, 
  Copy, 
  Star, 
  StarOff,
  Filter,
  Search,
  Mail,
  Phone,
  MessageCircle,
  Users,
  Calendar,
  Target,
  Zap,
  Clock,
  CheckCircle,
  Play,
  Settings
} from "lucide-react";

interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  industry: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  type: 'email' | 'sms' | 'workflow' | 'nurture' | 'sales';
  icon: any;
  isFavorite: boolean;
  isActive: boolean;
  usageCount: number;
  successRate: number;
  estimatedTime: string;
  steps: number;
  tags: string[];
  preview: {
    triggers: string[];
    actions: string[];
    conditions: string[];
  };
  createdAt: string;
  lastUsed?: string;
}

const templateData: AutomationTemplate[] = [
  {
    id: '1',
    name: 'New Lead Welcome Series',
    description: 'A 5-email welcome sequence for new leads with personalized content',
    category: 'Lead Nurturing',
    industry: 'General',
    difficulty: 'beginner',
    type: 'email',
    icon: Mail,
    isFavorite: true,
    isActive: true,
    usageCount: 156,
    successRate: 0.87,
    estimatedTime: '15 min',
    steps: 5,
    tags: ['welcome', 'email', 'nurturing', 'onboarding'],
    preview: {
      triggers: ['New lead created'],
      actions: ['Send welcome email', 'Wait 2 days', 'Send follow-up', 'Assign to rep'],
      conditions: ['Lead source not referral', 'Email valid']
    },
    createdAt: '2024-01-01T10:00:00Z',
    lastUsed: '2024-01-15T14:30:00Z'
  },
  {
    id: '2',
    name: 'Demo No-Show Recovery',
    description: 'Automated follow-up sequence for prospects who miss demo appointments',
    category: 'Sales Process',
    industry: 'SaaS',
    difficulty: 'intermediate',
    type: 'workflow',
    icon: Calendar,
    isFavorite: false,
    isActive: true,
    usageCount: 89,
    successRate: 0.73,
    estimatedTime: '20 min',
    steps: 7,
    tags: ['demo', 'no-show', 'recovery', 'sales'],
    preview: {
      triggers: ['Demo appointment missed'],
      actions: ['Wait 2 hours', 'Send apology SMS', 'Create follow-up task', 'Schedule callback'],
      conditions: ['Appointment type is demo', 'No reschedule in 24h']
    },
    createdAt: '2024-01-05T12:00:00Z',
    lastUsed: '2024-01-14T11:00:00Z'
  },
  {
    id: '3',
    name: 'High-Value Lead Alert System',
    description: 'Instant notifications when high-value prospects enter your pipeline',
    category: 'Lead Scoring',
    industry: 'Enterprise',
    difficulty: 'advanced',
    type: 'workflow',
    icon: Target,
    isFavorite: true,
    isActive: true,
    usageCount: 67,
    successRate: 0.94,
    estimatedTime: '30 min',
    steps: 4,
    tags: ['scoring', 'alerts', 'high-value', 'priority'],
    preview: {
      triggers: ['Lead score updated', 'Company size detected'],
      actions: ['Send Slack alert', 'Create priority task', 'Assign top rep'],
      conditions: ['Score > 85', 'Company size > 100 employees']
    },
    createdAt: '2024-01-08T09:00:00Z',
    lastUsed: '2024-01-15T16:15:00Z'
  },
  {
    id: '4',
    name: 'Abandoned Cart Recovery',
    description: 'Re-engage prospects who abandon trial signup or checkout process',
    category: 'E-commerce',
    industry: 'Retail',
    difficulty: 'intermediate',
    type: 'email',
    icon: MessageCircle,
    isFavorite: false,
    isActive: false,
    usageCount: 134,
    successRate: 0.82,
    estimatedTime: '25 min',
    steps: 6,
    tags: ['cart', 'abandonment', 'recovery', 'e-commerce'],
    preview: {
      triggers: ['Cart abandoned', 'Trial not completed'],
      actions: ['Wait 1 hour', 'Send reminder email', 'Offer discount', 'Create task'],
      conditions: ['Items in cart', 'No purchase in 24h']
    },
    createdAt: '2024-01-10T14:00:00Z',
    lastUsed: '2024-01-12T10:30:00Z'
  },
  {
    id: '5',
    name: 'Customer Onboarding Journey',
    description: 'Complete onboarding automation for new customers',
    category: 'Customer Success',
    industry: 'SaaS',
    difficulty: 'advanced',
    type: 'nurture',
    icon: Users,
    isFavorite: true,
    isActive: true,
    usageCount: 203,
    successRate: 0.91,
    estimatedTime: '45 min',
    steps: 12,
    tags: ['onboarding', 'customer-success', 'retention', 'training'],
    preview: {
      triggers: ['Customer signs contract', 'Payment confirmed'],
      actions: ['Send welcome package', 'Schedule kick-off', 'Create training tasks'],
      conditions: ['Payment successful', 'Contract signed']
    },
    createdAt: '2024-01-03T16:00:00Z',
    lastUsed: '2024-01-15T09:45:00Z'
  },
  {
    id: '6',
    name: 'Weekly Performance Report',
    description: 'Automated weekly performance reports for sales managers',
    category: 'Reporting',
    industry: 'General',
    difficulty: 'beginner',
    type: 'workflow',
    icon: Clock,
    isFavorite: false,
    isActive: true,
    usageCount: 45,
    successRate: 1.0,
    estimatedTime: '10 min',
    steps: 3,
    tags: ['reporting', 'weekly', 'performance', 'management'],
    preview: {
      triggers: ['Every Monday 9 AM'],
      actions: ['Generate report', 'Email managers', 'Create summary'],
      conditions: ['Business hours', 'Data available']
    },
    createdAt: '2024-01-12T11:00:00Z',
    lastUsed: '2024-01-15T09:00:00Z'
  }
];

export default function AutomationTemplatesPage() {
  const [templates, setTemplates] = useState<AutomationTemplate[]>(templateData);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const categories = Array.from(new Set(templates.map(t => t.category)));
  const types = Array.from(new Set(templates.map(t => t.type)));

  const filteredTemplates = templates.filter(template => {
    if (searchQuery && !template.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !template.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))) {
      return false;
    }
    if (filterCategory !== 'all' && template.category !== filterCategory) return false;
    if (filterDifficulty !== 'all' && template.difficulty !== filterDifficulty) return false;
    if (filterType !== 'all' && template.type !== filterType) return false;
    if (showFavoritesOnly && !template.isFavorite) return false;
    return true;
  });

  const toggleFavorite = (templateId: string) => {
    setTemplates(prev => prev.map(template => 
      template.id === templateId 
        ? { ...template, isFavorite: !template.isFavorite }
        : template
    ));
  };

  const toggleTemplateStatus = (templateId: string) => {
    setTemplates(prev => prev.map(template => 
      template.id === templateId 
        ? { ...template, isActive: !template.isActive }
        : template
    ));
  };

  const deployTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      console.log(`Deploying template: ${template.name}`);
      // Update usage count and last used
      setTemplates(prev => prev.map(t => 
        t.id === templateId 
          ? { ...t, usageCount: t.usageCount + 1, lastUsed: new Date().toISOString() }
          : t
      ));
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'sms': return <Phone className="w-4 h-4" />;
      case 'workflow': return <Zap className="w-4 h-4" />;
      case 'nurture': return <Users className="w-4 h-4" />;
      case 'sales': return <Target className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Automation Templates</h1>
            <p className="text-gray-600">Pre-built workflows to accelerate your automation setup</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />
              Create Template
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Upload className="w-4 h-4" />
              Import
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Templates</p>
                <p className="text-2xl font-bold text-blue-900">{templates.length}</p>
              </div>
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Active Templates</p>
                <p className="text-2xl font-bold text-green-900">
                  {templates.filter(t => t.isActive).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Total Usage</p>
                <p className="text-2xl font-bold text-purple-900">
                  {templates.reduce((sum, t) => sum + t.usageCount, 0)}
                </p>
              </div>
              <Play className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Avg Success Rate</p>
                <p className="text-2xl font-bold text-orange-900">
                  {Math.round(templates.reduce((sum, t) => sum + t.successRate, 0) / templates.length * 100)}%
                </p>
              </div>
              <Target className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Templates List */}
        <div className="col-span-8 bg-white rounded-lg shadow-sm">
          {/* Filters */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  showFavoritesOnly ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <Star className="w-4 h-4" />
                Favorites
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All Types</option>
                {types.map(type => (
                  <option key={type} value={type} className="capitalize">{type}</option>
                ))}
              </select>
              
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All Difficulty</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Template Grid */}
          <div className="p-4">
            <div className="grid grid-cols-1 gap-4">
              {filteredTemplates.map(template => (
                <div
                  key={template.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedTemplate === template.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${
                        template.type === 'email' ? 'bg-blue-100 text-blue-600' :
                        template.type === 'workflow' ? 'bg-purple-100 text-purple-600' :
                        template.type === 'nurture' ? 'bg-green-100 text-green-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        <template.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{template.name}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(template.difficulty)}`}>
                            {template.difficulty}
                          </span>
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                            {template.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            {getTypeIcon(template.type)}
                            {template.type}
                          </span>
                          <span>{template.steps} steps</span>
                          <span>{template.estimatedTime}</span>
                          <span>Used {template.usageCount} times</span>
                          <span>{Math.round(template.successRate * 100)}% success</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {template.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                              {tag}
                            </span>
                          ))}
                          {template.tags.length > 3 && (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                              +{template.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(template.id);
                        }}
                        className={`p-2 rounded-lg transition-colors ${
                          template.isFavorite 
                            ? 'text-yellow-500 hover:bg-yellow-50'
                            : 'text-gray-400 hover:bg-gray-100'
                        }`}
                      >
                        {template.isFavorite ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deployTemplate(template.id);
                        }}
                        className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Deploy
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Template Details */}
        <div className="col-span-4 bg-white rounded-lg shadow-sm p-4">
          {selectedTemplate ? (
            <TemplateDetails 
              template={templates.find(t => t.id === selectedTemplate)!}
              onToggleStatus={toggleTemplateStatus}
              onDeploy={deployTemplate}
            />
          ) : (
            <div className="text-center text-gray-500 py-12">
              <Zap className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Select a template to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TemplateDetails({ 
  template, 
  onToggleStatus, 
  onDeploy 
}: { 
  template: AutomationTemplate;
  onToggleStatus: (id: string) => void;
  onDeploy: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className={`p-2 rounded-lg ${
            template.type === 'email' ? 'bg-blue-100 text-blue-600' :
            template.type === 'workflow' ? 'bg-purple-100 text-purple-600' :
            template.type === 'nurture' ? 'bg-green-100 text-green-600' :
            'bg-gray-100 text-gray-600'
          }`}>
            <template.icon className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-gray-900">{template.name}</h3>
        </div>
        <p className="text-sm text-gray-600">{template.description}</p>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Template Info</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Category:</span>
              <span>{template.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Industry:</span>
              <span>{template.industry}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Difficulty:</span>
              <span className="capitalize">{template.difficulty}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Setup Time:</span>
              <span>{template.estimatedTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Steps:</span>
              <span>{template.steps}</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-2">Performance</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Usage Count:</span>
              <span>{template.usageCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Success Rate:</span>
              <span>{Math.round(template.successRate * 100)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Used:</span>
              <span>{template.lastUsed ? new Date(template.lastUsed).toLocaleDateString() : 'Never'}</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-2">Workflow Preview</h4>
          <div className="space-y-3">
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-1">Triggers</h5>
              <div className="space-y-1">
                {template.preview.triggers.map((trigger, index) => (
                  <div key={index} className="p-2 bg-green-50 rounded text-sm text-green-800">
                    {trigger}
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-1">Conditions</h5>
              <div className="space-y-1">
                {template.preview.conditions.map((condition, index) => (
                  <div key={index} className="p-2 bg-yellow-50 rounded text-sm text-yellow-800">
                    {condition}
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-1">Actions</h5>
              <div className="space-y-1">
                {template.preview.actions.map((action, index) => (
                  <div key={index} className="p-2 bg-blue-50 rounded text-sm text-blue-800">
                    {action}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
          <div className="flex flex-wrap gap-1">
            {template.tags.map(tag => (
              <span key={tag} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t">
        <button
          onClick={() => onDeploy(template.id)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Deploy Template
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Copy className="w-4 h-4" />
            Duplicate
          </button>
          <button className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Edit3 className="w-4 h-4" />
            Customize
          </button>
        </div>
      </div>
    </div>
  );
}
