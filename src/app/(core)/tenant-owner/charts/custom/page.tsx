"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Palette,
  BarChart3,
  LineChart,
  PieChart,
  Settings,
  Download,
  Share2,
  Plus,
  Code,
  Crown
} from 'lucide-react';

export default function TenantOwnerCustomChartBuilder() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedTool, setSelectedTool] = useState<string>('');

  // Redirect non-owners
  useEffect(() => {
    if (user && user.role !== 'owner') {
      router.push('/dashboard');
    }
  }, [user, router]);

  const tools = [
    {
      id: 'visual',
      name: 'Visual Builder',
      icon: Palette,
      description: 'Drag-and-drop interface for creating business charts',
      features: ['Visual editor', 'Real-time preview', 'Business templates']
    },
    {
      id: 'code',
      name: 'Advanced Builder',
      icon: Code,
      description: 'Advanced chart creation with custom configuration',
      features: ['Chart.js configuration', 'Custom styling', 'Business data integration']
    },
    {
      id: 'template',
      name: 'Business Templates',
      icon: Settings,
      description: 'Modify business-focused chart templates',
      features: ['Industry-specific layouts', 'KPI templates', 'Quick deployment']
    }
  ];

  const chartTypes = [
    { id: 'bar', name: 'Bar Chart', icon: BarChart3 },
    { id: 'line', name: 'Line Chart', icon: LineChart },
    { id: 'pie', name: 'Pie Chart', icon: PieChart }
  ];

  const goBack = () => {
    router.push('/tenant-owner/dashboard');
  };

  if (!user || user.role !== 'owner') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600 mb-6">This feature is only available to tenant owners.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={goBack}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Dashboard
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg">
                  <Palette className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Custom Chart Builder</h1>
                  <p className="text-sm text-gray-500">{user?.tenantId?.replace('-', ' ')?.replace(/\b\w/g, l => l.toUpperCase()) || 'Your Business'} • Build from scratch</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                <Crown className="w-4 h-4 inline mr-1" />
                Owner Access
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedTool ? (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-teal-100 rounded-full text-green-700 font-medium mb-4">
                <Palette className="w-4 h-4" />
                Custom Business Chart Creation
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Choose Your Building Method
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Create exactly what your business needs with our flexible chart building tools. 
                Choose the approach that works best for your requirements and expertise level.
              </p>
            </div>

            {/* Tool Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tools.map((tool) => {
                const IconComponent = tool.icon;
                return (
                  <div
                    key={tool.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg">
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{tool.name}</h3>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">{tool.description}</p>
                    <ul className="space-y-2 mb-6">
                      {tool.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => setSelectedTool(tool.id)}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Start Building
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Selected Tool Interface */
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedTool('')}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {tools.find(t => t.id === selectedTool)?.name}
                  </h2>
                  <p className="text-gray-600">
                    {tools.find(t => t.id === selectedTool)?.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <Download className="w-4 h-4" />
                  Save to Dashboard
                </button>
                <button
                  onClick={goBack}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Deploy to Dashboard
                </button>
              </div>
            </div>

            {/* Tool-specific interface */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {selectedTool === 'visual' && (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Palette className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Business Visual Builder</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Drag-and-drop interface for creating business charts visually. 
                    Perfect for creating professional dashboards quickly.
                  </p>
                  <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                    {chartTypes.map((type) => {
                      const IconComponent = type.icon;
                      return (
                        <button
                          key={type.id}
                          className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
                        >
                          <IconComponent className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                          <div className="text-sm text-gray-700">{type.name}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedTool === 'code' && (
                <div className="p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Advanced Chart Configuration</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Chart Configuration (JSON)
                      </label>
                      <textarea
                        className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm"
                        placeholder={`{
  "type": "bar",
  "data": {
    "labels": ["Q1", "Q2", "Q3", "Q4"],
    "datasets": [{
      "label": "Revenue ($)",
      "data": [125000, 150000, 135000, 180000],
      "backgroundColor": "rgba(34, 197, 94, 0.5)",
      "borderColor": "rgb(34, 197, 94)"
    }]
  },
  "options": {
    "responsive": true,
    "scales": {
      "y": {
        "beginAtZero": true,
        "ticks": {
          "callback": function(value) {
            return "$" + value.toLocaleString();
          }
        }
      }
    }
  }
}`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Live Preview
                      </label>
                      <div className="w-full h-64 bg-gray-50 border border-gray-300 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">Business chart preview</p>
                          <p className="text-sm text-gray-400">Configure your data to see preview</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedTool === 'template' && (
                <div className="p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Business Template Customizer</h3>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Business Template
                        </label>
                        <select className="w-full p-3 border border-gray-300 rounded-lg">
                          <option>Sales Performance Dashboard</option>
                          <option>Financial KPI Template</option>
                          <option>Customer Analytics Template</option>
                          <option>Inventory Management Dashboard</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Business Color Scheme
                        </label>
                        <select className="w-full p-3 border border-gray-300 rounded-lg">
                          <option>Professional Blue & Green</option>
                          <option>Corporate Gray & Blue</option>
                          <option>Success Green & Teal</option>
                          <option>Custom Brand Colors</option>
                        </select>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-3">
                          <Settings className="w-6 h-6 text-gray-600" />
                        </div>
                        <p className="text-gray-600">Business Template Preview</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Customize your selected template for {user?.tenantId?.replace('-', ' ')?.replace(/\b\w/g, l => l.toUpperCase()) || 'your business'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}