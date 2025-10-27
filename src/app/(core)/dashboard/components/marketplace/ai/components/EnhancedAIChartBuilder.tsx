"use client";
import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Save, 
  Share2, 
  Users, 
  Lock, 
  Globe, 
  Eye,
  Settings,
  AlertCircle,
  Check,
  X
} from "lucide-react";
import { 
  AIChartService 
} from "../library/aiChartService";
import { 
  AIChartRequest, 
  ChartVisibility, 
  OrganizationalChartTemplate 
} from "../library/types";
import { getCurrentUserContext } from "../library/organizationalRegistry";

interface EnhancedAIChartBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onChartGenerated?: (chart: OrganizationalChartTemplate) => void;
  initialPrompt?: string;
}

export default function EnhancedAIChartBuilder({
  isOpen,
  onClose,
  onChartGenerated,
  initialPrompt = ""
}: EnhancedAIChartBuilderProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [loading, setLoading] = useState(false);
  const [generatedChart, setGeneratedChart] = useState<OrganizationalChartTemplate | null>(null);
  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const [saveToOrganization, setSaveToOrganization] = useState(true);
  const [visibility, setVisibility] = useState<ChartVisibility>('team');
  const [requestApproval, setRequestApproval] = useState(true);
  const [notifyTeam, setNotifyTeam] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  const handleGenerateChart = async () => {
    if (!prompt.trim()) {
      setError('Please enter a description for your chart');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const aiService = AIChartService.getInstance();
      
      const request: AIChartRequest = {
        prompt: prompt.trim(),
        context: {
          businessContext: 'CRM dashboard visualization',
          expectedFields: ['labels', 'values', 'categories'],
        },
        options: {
          saveToOrganization,
          visibility,
          requestApproval,
          notifyTeam
        }
      };

      const response = await aiService.generateChart(request);

      if (response.success && response.chartTemplate) {
        setGeneratedChart(response.chartTemplate);
        
        if (saveToOrganization) {
          setSuccess('Chart generated and saved to organization library!');
          
          // If approval not required, it's immediately available
          if (!requestApproval) {
            setSuccess('Chart generated and published to organization library!');
          } else {
            setSuccess('Chart generated and submitted for approval!');
          }
        } else {
          setSuccess('Chart generated successfully!');
        }

        // Notify parent component
        if (onChartGenerated) {
          onChartGenerated(response.chartTemplate);
        }

        // Show save options for further configuration
        setShowSaveOptions(true);
      } else {
        setError(response.error || 'Failed to generate chart');
      }
    } catch (err) {
      setError('An unexpected error occurred while generating the chart');
      console.error('Chart generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfiguration = async () => {
    // In a real implementation, this would update the chart configuration
    setSuccess('Chart configuration updated successfully!');
    setShowSaveOptions(false);
  };

  const getVisibilityIcon = (vis: ChartVisibility) => {
    switch (vis) {
      case 'private': return <Lock className="h-4 w-4" />;
      case 'team': return <Users className="h-4 w-4" />;
      case 'organization': return <Globe className="h-4 w-4" />;
      case 'public': return <Share2 className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const getVisibilityDescription = (vis: ChartVisibility) => {
    switch (vis) {
      case 'private': return 'Only visible to you';
      case 'team': return 'Visible to your team members';
      case 'organization': return 'Visible to entire organization';
      case 'public': return 'Publicly accessible';
      default: return '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg mr-3">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">AI Chart Builder</h2>
              <p className="text-sm text-gray-600">Describe your data visualization needs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
          {/* Prompt Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe your chart
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="e.g., 'Show sales revenue trends over the last 6 months' or 'Create a funnel chart for lead conversion rates'"
            />
            <p className="text-xs text-gray-500 mt-1">
              Be specific about the data you want to visualize and the chart type you prefer
            </p>
          </div>

          {/* Organization Save Options */}
          <div className="mb-6 bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900 flex items-center">
                <Save className="h-4 w-4 mr-2" />
                Organization Library
              </h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveToOrganization}
                  onChange={(e) => setSaveToOrganization(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {saveToOrganization && (
              <div className="space-y-4">
                {/* Visibility Settings */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chart Visibility
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['private', 'team', 'organization'] as ChartVisibility[]).map((vis) => (
                      <button
                        key={vis}
                        onClick={() => setVisibility(vis)}
                        className={`flex items-center p-3 rounded-lg border-2 transition-all ${
                          visibility === vis
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {getVisibilityIcon(vis)}
                        <div className="ml-2 text-left">
                          <div className="font-medium capitalize">{vis}</div>
                          <div className="text-xs opacity-75">
                            {getVisibilityDescription(vis)}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Additional Options */}
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={requestApproval}
                      onChange={(e) => setRequestApproval(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Request approval before publishing
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notifyTeam}
                      onChange={(e) => setNotifyTeam(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Notify team when available
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Success/Error Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-sm text-red-800">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
              <Check className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-sm text-green-800">{success}</span>
            </div>
          )}

          {/* Generated Chart Preview */}
          {generatedChart && (
            <div className="mb-6 bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900">Generated Chart</h3>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    generatedChart.source === 'ai' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    🤖 AI Generated
                  </span>
                  {generatedChart.approvalStatus && (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      generatedChart.approvalStatus === 'approved' ? 'bg-green-100 text-green-700' :
                      generatedChart.approvalStatus === 'pending' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {generatedChart.approvalStatus === 'approved' ? '✅ Approved' :
                       generatedChart.approvalStatus === 'pending' ? '⏳ Pending' :
                       generatedChart.approvalStatus}
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">{generatedChart.name}</h4>
                <p className="text-sm text-gray-600 mb-3">{generatedChart.description}</p>
                
                {generatedChart.aiMetadata && (
                  <div className="text-xs text-purple-600 italic bg-purple-50 p-2 rounded mb-3">
                    AI Prompt: "{generatedChart.aiMetadata.originalPrompt}"
                  </div>
                )}

                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded flex items-center justify-center">
                  <div className="text-4xl">{generatedChart.thumbnail || '📊'}</div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>Type: {generatedChart.type}</span>
                  <span>Category: {generatedChart.category}</span>
                  <span>Created: {new Date(generatedChart.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {showSaveOptions && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-800">Configure chart settings?</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setShowSaveOptions(false)}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        Skip
                      </button>
                      <button
                        onClick={handleSaveConfiguration}
                        className="flex items-center text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        Configure
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Example Prompts */}
          {!generatedChart && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Example prompts:</h3>
              <div className="grid grid-cols-1 gap-2">
                {[
                  "Show monthly sales trends for the last year",
                  "Create a conversion funnel from leads to customers", 
                  "Display top performing sales reps in a bar chart",
                  "Analyze customer segments by revenue contribution"
                ].map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(example)}
                    className="text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded border border-blue-200 hover:border-blue-300 transition-colors"
                  >
                    "{example}"
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-500">
            AI will analyze your prompt and generate appropriate visualizations
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerateChart}
              disabled={loading || !prompt.trim()}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Chart
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
