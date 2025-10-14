"use client";
import React from 'react';
import ComingSoonWrapper from '@/components/ComingSoonWrapper';

function ContractsContent() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Contract Management</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            📄 New Contract
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            ✍️ E-Signature
          </button>
        </div>
      </div>

      {/* Contract Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active Contracts</p>
              <p className="text-2xl font-bold text-blue-600">127</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              📋
            </div>
          </div>
          <p className="text-sm text-blue-600 mt-2">Total value: $2.4M</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending Signatures</p>
              <p className="text-2xl font-bold text-orange-600">8</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              ✍️
            </div>
          </div>
          <p className="text-sm text-orange-600 mt-2">Awaiting response</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Expiring Soon</p>
              <p className="text-2xl font-bold text-red-600">3</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              ⏰
            </div>
          </div>
          <p className="text-sm text-red-600 mt-2">Next 30 days</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Completed</p>
              <p className="text-2xl font-bold text-green-600">89%</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              ✅
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">Success rate</p>
        </div>
      </div>

      {/* Contract Templates */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">📝 Contract Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-blue-200 rounded-lg hover:bg-blue-50 cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-100 p-2 rounded-full">💼</div>
              <h4 className="font-medium">Service Agreement</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">Standard service contract template</p>
            <button className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              Use Template
            </button>
          </div>

          <div className="p-4 border border-green-200 rounded-lg hover:bg-green-50 cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-green-100 p-2 rounded-full">🤝</div>
              <h4 className="font-medium">Partnership Agreement</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">Business partnership contract</p>
            <button className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
              Use Template
            </button>
          </div>

          <div className="p-4 border border-purple-200 rounded-lg hover:bg-purple-50 cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-purple-100 p-2 rounded-full">📄</div>
              <h4 className="font-medium">NDA</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">Non-disclosure agreement</p>
            <button className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
              Use Template
            </button>
          </div>
        </div>
      </div>

      {/* E-Signature Integration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">✍️ E-Signature Solutions</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  📝
                </div>
                <div>
                  <div className="font-medium">DocuSign Integration</div>
                  <div className="text-sm text-gray-600">Industry-leading e-signature</div>
                </div>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                Connect
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  ✍️
                </div>
                <div>
                  <div className="font-medium">HelloSign Integration</div>
                  <div className="text-sm text-gray-600">Simple and secure signing</div>
                </div>
              </div>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                Connect
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-full">
                  🔐
                </div>
                <div>
                  <div className="font-medium">Built-in E-Signature</div>
                  <div className="text-sm text-gray-600">Native signing solution</div>
                </div>
              </div>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
                Enable
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <div>
                <div className="font-medium">Contract Signed</div>
                <div className="text-sm text-gray-600">Acme Corp - Service Agreement</div>
              </div>
              <div className="text-green-600 text-sm">✓ Completed</div>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <div>
                <div className="font-medium">Contract Sent</div>
                <div className="text-sm text-gray-600">TechStart Inc - Partnership</div>
              </div>
              <div className="text-blue-600 text-sm">📤 Sent</div>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <div>
                <div className="font-medium">Renewal Reminder</div>
                <div className="text-sm text-gray-600">Global Solutions - Expires in 15 days</div>
              </div>
              <div className="text-yellow-600 text-sm">⚠️ Pending</div>
            </div>
          </div>
        </div>
      </div>

      {/* Contract Analytics */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">📊 Contract Analytics</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">📈</div>
            <p className="text-gray-600">Contract Performance Dashboard</p>
            <p className="text-sm text-gray-500 mt-1">Track signing rates, completion times, and renewal analytics</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContractsPage() {
  return (
    <ComingSoonWrapper 
      feature="contracts" 
      enabled={false}
      comingSoonDate="April 2026"
      description="Complete contract lifecycle management with e-signature integrations and automated workflows"
    >
      <ContractsContent />
    </ComingSoonWrapper>
  );
}