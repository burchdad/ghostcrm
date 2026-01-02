"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Sparkles, 
  BarChart3, 
  LineChart, 
  PieChart, 
  ArrowLeft,
  Wand2,
  Database,
  Settings,
  Download,
  Share2,
  Crown
} from 'lucide-react';

export default function TenantOwnerChartBuilder() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'basic';
  const [selectedChartType, setSelectedChartType] = useState<string>('');
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Redirect non-owners
  useEffect(() => {
    if (user && user.role !== 'owner') {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Chart type options for AI builder
  const chartTypes = [
    { id: 'bar', name: 'Bar Chart', icon: BarChart3, description: 'Compare values across categories' },
    { id: 'line', name: 'Line Chart', icon: LineChart, description: 'Show trends over time' },
    { id: 'pie', name: 'Pie Chart', icon: PieChart, description: 'Display proportions of a whole' },
    { id: 'doughnut', name: 'Doughnut Chart', icon: PieChart, description: 'Modern alternative to pie charts' }
  ];

  const handleGenerateChart = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      setIsGenerating(false);
      // Redirect back to tenant dashboard with success message
      router.push('/tenant-owner/dashboard?chart_generated=true');
    }, 2000);
  };

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
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
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">AI Chart Builder</h1>
                  <p className="text-sm text-gray-500">
                    {user?.tenantId?.replace('-', ' ')?.replace(/\b\w/g, l => l.toUpperCase()) || 'Your Business'} • {mode === 'advanced' ? 'Advanced Mode' : 'Basic Mode'}
                  </p>
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {mode === 'advanced' ? (
          /* Advanced AI Mode */
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full text-purple-700 font-medium mb-4">
                <Wand2 className="w-4 h-4" />
                AI-Powered Chart Generation for {user?.tenantId?.replace('-', ' ')?.replace(/\b\w/g, l => l.toUpperCase()) || 'Your Business'}
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Describe Your Business Chart Vision
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Tell our AI what kind of chart you want to create for your business dashboard. 
                Be specific about your data, the business story you want to tell, and any visual preferences.
              </p>
            </div>

            {/* AI Prompt Input */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Describe your business chart in natural language
              </label>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder={`Example: Create a bar chart showing my dealership's monthly sales revenue for the last 6 months, with different colors for each month and a trend line overlay. Include data for new vs. used vehicle sales. Make it suitable for business presentations.`}
                className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {aiPrompt.length}/500 characters
                </div>
                <button
                  onClick={handleGenerateChart}
                  disabled={!aiPrompt.trim() || isGenerating}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                    !aiPrompt.trim() || isGenerating
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg transform hover:scale-105'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Generating Chart...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Business Chart
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Business-focused Examples */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <h3 className="font-semibold text-gray-900 mb-3">💡 Business Chart Ideas:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  "Show monthly sales performance by sales rep",
                  "Create a pie chart of revenue by vehicle type (new, used, parts, service)",
                  "Display customer satisfaction scores over the last quarter",
                  "Visualize inventory turnover rates by vehicle category"
                ].map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setAiPrompt(example)}
                    className="text-left p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-300 hover:shadow-sm transition-all text-sm"
                  >
                    "{example}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Basic Mode */
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Chart Type</h2>
              <p className="text-lg text-gray-600">Select the type of chart you'd like to create for your business</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {chartTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedChartType(type.id)}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      selectedChartType === type.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${
                        selectedChartType === type.id ? 'bg-purple-500' : 'bg-gray-100'
                      }`}>
                        <IconComponent className={`w-6 h-6 ${
                          selectedChartType === type.id ? 'text-white' : 'text-gray-600'
                        }`} />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900">{type.name}</h3>
                        <p className="text-gray-600 text-sm">{type.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedChartType && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Configure Your Business Chart</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chart Title
                    </label>
                    <input
                      type="text"
                      placeholder="Enter chart title (e.g., Monthly Sales Performance)"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex gap-4">
                    <button className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                      <Database className="w-4 h-4" />
                      Connect Business Data
                    </button>
                    <button 
                      onClick={handleGenerateChart}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Use Sample Data
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}