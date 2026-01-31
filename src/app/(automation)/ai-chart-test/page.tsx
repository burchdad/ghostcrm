"use client";
import React, { useState } from "react";
// TODO: Fix these imports - files don't exist
// import AIChartAdminInterface from "../../(app)/dashboard/components/marketplace/ai/components/AIChartAdminInterface";
// import EnhancedAIChartBuilder from "../../(app)/dashboard/components/marketplace/ai/components/EnhancedAIChartBuilder";

export default function AIChartTestPage() {
  const [showAdmin, setShowAdmin] = useState(false);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [showAIChartBuilder, setShowAIChartBuilder] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Chart Marketplace Test
          </h1>
          <p className="text-gray-600">
            Test the complete AI chart generation and organizational sharing workflow
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* AI Chart Builder Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h2 className="text-lg font-semibold mb-4">AI Chart Builder</h2>
              <button
                onClick={() => setShowAIChartBuilder(true)}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all font-medium"
              >
                🤖 Open AI Chart Builder
              </button>
              <p className="text-sm text-gray-600 mt-3">
                Create intelligent charts using natural language descriptions. Charts can be saved to your organization's marketplace.
              </p>
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Chart Management</h2>
                <button
                  onClick={() => setShowAdmin(!showAdmin)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {showAdmin ? "Hide Admin" : "Show Admin Panel"}
                </button>
              </div>
              
              {showAdmin && (
                <div className="border rounded-lg p-4">
                  {/* <AIChartAdminInterface /> */}
                  <p className="text-gray-500">Admin interface not available</p>
                </div>
              )}
              
              {!showAdmin && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-xl font-semibold mb-2">AI Chart Marketplace</h3>
                  <p className="text-gray-600 mb-6">
                    Use the AI Chart Builder to create intelligent charts that can be shared with your organization.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="text-purple-600 text-2xl mb-2">🤖</div>
                      <h4 className="font-semibold text-purple-900 mb-1">AI Generation</h4>
                      <p className="text-sm text-purple-700">
                        Click "Open AI Chart Builder" to generate smart charts using natural language
                      </p>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="text-blue-600 text-2xl mb-2">👥</div>
                      <h4 className="font-semibold text-blue-900 mb-1">Organization Sharing</h4>
                      <p className="text-sm text-blue-700">
                        Save charts to your organization with role-based access control
                      </p>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="text-green-600 text-2xl mb-2">✅</div>
                      <h4 className="font-semibold text-green-900 mb-1">Approval Workflow</h4>
                      <p className="text-sm text-green-700">
                        Charts go through approval process before being published
                      </p>
                    </div>
                    
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="text-orange-600 text-2xl mb-2">📈</div>
                      <h4 className="font-semibold text-orange-900 mb-1">Marketplace Access</h4>
                      <p className="text-sm text-orange-700">
                        Approved charts appear in marketplace for team usage
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setIsBuilderOpen(true)}
                    className="mt-6 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
                  >
                    Open AI Chart Builder
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Workflow Steps</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">1</div>
              <div>
                <span className="font-medium">Generate AI Chart:</span> Use the "Charts" tab in AI Assistant to create intelligent charts
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">2</div>
              <div>
                <span className="font-medium">Set Visibility:</span> Choose organization visibility and role-based access controls
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold">3</div>
              <div>
                <span className="font-medium">Admin Approval:</span> Charts require admin approval before publication (use Admin Panel)
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-semibold">4</div>
              <div>
                <span className="font-medium">Marketplace Access:</span> Approved charts become available in the chart marketplace
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* AI Chart Builder Modal */}
      {isBuilderOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-4">AI Chart Builder</h3>
            <p className="text-gray-500 mb-4">Chart builder not available</p>
            <button 
              onClick={() => setIsBuilderOpen(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
        /* <EnhancedAIChartBuilder 
          isOpen={isBuilderOpen}
          onClose={() => setIsBuilderOpen(false)}
        /> */
      )}
    </div>
  );
}
