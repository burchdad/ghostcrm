"use client";
import React from 'react';

export default function CustomChartBuilder() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Custom Chart Builder</h1>
          <p className="text-lg text-gray-600">Build completely custom charts from scratch with full control</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Custom Builder Studio</h2>
          <p className="text-gray-600 mb-6">
            Design and build custom charts with our drag-and-drop interface, 
            advanced styling options, and real-time data connectivity.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
