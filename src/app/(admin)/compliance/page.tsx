"use client";
import React from 'react';
import ComingSoonWrapper from '@/components/feedback/ComingSoonWrapper';

function ComplianceContent() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Compliance & Risk Management</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            🔍 Run Audit
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            📋 Generate Report
          </button>
        </div>
      </div>

      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Compliance Score</p>
              <p className="text-2xl font-bold text-green-600">94%</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              ✅
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">Excellent standing</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active Audits</p>
              <p className="text-2xl font-bold text-blue-600">3</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              🔍
            </div>
          </div>
          <p className="text-sm text-blue-600 mt-2">2 automated, 1 manual</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Issues Found</p>
              <p className="text-2xl font-bold text-yellow-600">7</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              ⚠️
            </div>
          </div>
          <p className="text-sm text-yellow-600 mt-2">5 low, 2 medium</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Last Audit</p>
              <p className="text-2xl font-bold text-gray-700">2d</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-full">
              📅
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">ago</p>
        </div>
      </div>

      {/* Compliance Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Regulatory Compliance</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <div>
                <div className="font-medium">GDPR</div>
                <div className="text-sm text-gray-600">Data protection & privacy</div>
              </div>
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                ✓ Compliant
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <div>
                <div className="font-medium">SOX</div>
                <div className="text-sm text-gray-600">Financial controls</div>
              </div>
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                ✓ Compliant
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <div>
                <div className="font-medium">CCPA</div>
                <div className="text-sm text-gray-600">California privacy</div>
              </div>
              <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                ⚠ Review Required
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Security Audits</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <div>
                <div className="font-medium">Data Access Audit</div>
                <div className="text-sm text-gray-600">Last run: 2 days ago</div>
              </div>
              <button className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm hover:bg-blue-200">
                View Report
              </button>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <div>
                <div className="font-medium">Permission Review</div>
                <div className="text-sm text-gray-600">Last run: 1 week ago</div>
              </div>
              <button className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm hover:bg-green-200">
                View Report
              </button>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <div>
                <div className="font-medium">Activity Monitor</div>
                <div className="text-sm text-gray-600">Real-time monitoring</div>
              </div>
              <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                🟢 Active
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Automated Compliance Tools */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">🤖 Automated Compliance Tools</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900">Smart Audit Scheduler</h4>
            <p className="text-sm text-gray-600 mt-2">AI-powered audit scheduling based on risk assessment</p>
            <button className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              Configure Rules
            </button>
          </div>
          <div className="p-4 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-900">Policy Enforcement</h4>
            <p className="text-sm text-gray-600 mt-2">Automated policy compliance monitoring</p>
            <button className="mt-3 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
              Manage Policies
            </button>
          </div>
          <div className="p-4 border border-purple-200 rounded-lg">
            <h4 className="font-medium text-purple-900">Risk Assessment</h4>
            <p className="text-sm text-gray-600 mt-2">Continuous risk evaluation and alerting</p>
            <button className="mt-3 w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
              View Risks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CompliancePage() {
  return (
    <ComingSoonWrapper 
      feature="compliance" 
      enabled={false}
      comingSoonDate="March 2026"
      description="Enterprise-grade compliance management with automated audits, regulatory tracking, and risk assessment"
    >
      <ComplianceContent />
    </ComingSoonWrapper>
  );
}
