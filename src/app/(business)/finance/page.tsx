"use client";
import React from 'react';
import ComingSoonWrapper from '@/components/feedback/ComingSoonWrapper';

function FinanceContent() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Finance & Revenue Management</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            💰 New Invoice
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            📊 Revenue Report
          </button>
        </div>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Monthly Revenue</p>
              <p className="text-2xl font-bold text-green-600">$125,430</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              💰
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">↗ +12% from last month</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Outstanding Invoices</p>
              <p className="text-2xl font-bold text-orange-600">$23,450</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              📄
            </div>
          </div>
          <p className="text-sm text-orange-600 mt-2">15 invoices pending</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Average Deal Size</p>
              <p className="text-2xl font-bold text-blue-600">$4,250</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              📈
            </div>
          </div>
          <p className="text-sm text-blue-600 mt-2">↗ +8% improvement</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Commission Owed</p>
              <p className="text-2xl font-bold text-purple-600">$8,760</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              🎯
            </div>
          </div>
          <p className="text-sm text-purple-600 mt-2">To 12 sales reps</p>
        </div>
      </div>

      {/* Revenue Chart & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-gray-600">Interactive Revenue Chart</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <div>
                <div className="font-medium">Payment Received</div>
                <div className="text-sm text-gray-600">Acme Corp - INV-001</div>
              </div>
              <div className="text-green-600 font-semibold">+$5,200</div>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <div>
                <div className="font-medium">Invoice Sent</div>
                <div className="text-sm text-gray-600">TechStart Inc</div>
              </div>
              <div className="text-blue-600 font-semibold">$3,800</div>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <div>
                <div className="font-medium">Commission Paid</div>
                <div className="text-sm text-gray-600">John Smith</div>
              </div>
              <div className="text-purple-600 font-semibold">-$450</div>
            </div>
          </div>
        </div>
      </div>

      {/* Finance Tools */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">🔍 GhostUnderwriter</h3>
          <p className="text-gray-600 mb-4">AI-powered credit analysis and risk assessment</p>
          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Launch Underwriter
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">📋 Pre-Qualification</h3>
          <p className="text-gray-600 mb-4">Streamlined financial qualification forms</p>
          <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Create Form
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">📄 Document Portal</h3>
          <p className="text-gray-600 mb-4">Secure document upload and management</p>
          <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            Open Portal
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FinancePage() {
  return (
    <ComingSoonWrapper 
      feature="finance" 
      enabled={false}
      comingSoonDate="January 2026"
      description="Complete financial management with AI underwriting, automated invoicing, and revenue analytics"
    >
      <FinanceContent />
    </ComingSoonWrapper>
  );
}
