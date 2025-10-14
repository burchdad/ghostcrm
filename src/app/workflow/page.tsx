"use client";
import React from 'react';
import ComingSoonWrapper from '@/components/ComingSoonWrapper';

function WorkflowContent() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Workflow Automation</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            ⚡ New Workflow
          </button>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            🎨 Visual Builder
          </button>
        </div>
      </div>

      {/* Workflow Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active Workflows</p>
              <p className="text-2xl font-bold text-blue-600">23</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              ⚡
            </div>
          </div>
          <p className="text-sm text-blue-600 mt-2">Running smoothly</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Tasks Automated</p>
              <p className="text-2xl font-bold text-green-600">1,247</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              🤖
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">This month</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Time Saved</p>
              <p className="text-2xl font-bold text-purple-600">42h</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              ⏰
            </div>
          </div>
          <p className="text-sm text-purple-600 mt-2">Per week</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Success Rate</p>
              <p className="text-2xl font-bold text-orange-600">98.2%</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              📊
            </div>
          </div>
          <p className="text-sm text-orange-600 mt-2">Execution rate</p>
        </div>
      </div>

      {/* Popular Workflow Templates */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">🚀 Popular Workflow Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-blue-200 rounded-lg hover:bg-blue-50 cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-100 p-2 rounded-full">📧</div>
              <h4 className="font-medium">Lead Nurture Sequence</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">Automatically follow up with new leads via email and SMS</p>
            <div className="flex justify-between items-center">
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Most Popular</span>
              <button className="text-blue-600 text-sm hover:underline">Use Template</button>
            </div>
          </div>

          <div className="p-4 border border-green-200 rounded-lg hover:bg-green-50 cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-green-100 p-2 rounded-full">🎯</div>
              <h4 className="font-medium">Deal Stage Automation</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">Move deals through pipeline stages based on actions</p>
            <div className="flex justify-between items-center">
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">High ROI</span>
              <button className="text-green-600 text-sm hover:underline">Use Template</button>
            </div>
          </div>

          <div className="p-4 border border-purple-200 rounded-lg hover:bg-purple-50 cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-purple-100 p-2 rounded-full">📋</div>
              <h4 className="font-medium">Task Assignment</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">Auto-assign tasks based on lead source and priority</p>
            <div className="flex justify-between items-center">
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Time Saver</span>
              <button className="text-purple-600 text-sm hover:underline">Use Template</button>
            </div>
          </div>
        </div>
      </div>

      {/* Active Workflows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Active Workflows</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <div>
                <div className="font-medium">Welcome Series</div>
                <div className="text-sm text-gray-600">New customer onboarding</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">Running</span>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <div>
                <div className="font-medium">Lead Qualification</div>
                <div className="text-sm text-gray-600">Score and route leads</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-blue-600">Running</span>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <div>
                <div className="font-medium">Follow-up Reminder</div>
                <div className="text-sm text-gray-600">Remind reps to follow up</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-yellow-600">Paused</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Visual Workflow Builder</h3>
          <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center mb-4">
            <div className="text-center">
              <div className="text-4xl mb-2">🎨</div>
              <p className="text-gray-600">Drag & Drop Workflow Designer</p>
            </div>
          </div>
          <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            Launch Visual Builder
          </button>
        </div>
      </div>

      {/* Workflow Analytics */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">📊 Workflow Performance</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">📈</div>
            <p className="text-gray-600">Workflow Analytics Dashboard</p>
            <p className="text-sm text-gray-500 mt-1">Track execution rates, success metrics, and optimization opportunities</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WorkflowPage() {
  return (
    <ComingSoonWrapper 
      feature="workflow" 
      enabled={false}
      comingSoonDate="December 2025"
      description="Advanced workflow automation with visual builder, smart triggers, and performance analytics"
    >
      <WorkflowContent />
    </ComingSoonWrapper>
  );
}