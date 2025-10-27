"use client";
import React from 'react';

export default function ChartBuilder() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Chart Builder</h1>
          <p className="text-lg text-gray-600">Create intelligent, data-driven visualizations with AI assistance</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Advanced Chart Builder</h2>
          <p className="text-gray-600 mb-6">
            Our AI-powered chart builder will help you create stunning visualizations 
            by analyzing your data patterns and suggesting optimal chart types and configurations.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
