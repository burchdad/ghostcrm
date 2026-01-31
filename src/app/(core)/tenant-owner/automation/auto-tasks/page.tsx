"use client";

import React from "react";
import { ArrowLeft, CheckCircle, Plus } from "lucide-react";
import "./auto-tasks.css";

export default function AutoTasksPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.location.href = '/tenant-owner/automation'}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Auto Tasks</h1>
            <p className="text-gray-600">Automate task creation and assignment</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-8 text-center">
          <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Auto Tasks</h3>
          <p className="text-gray-600 mb-6">This feature is coming soon. Automatically create and assign tasks based on triggers.</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            <Plus className="h-4 w-4 inline mr-2" />
            Create Auto Task
          </button>
        </div>
      </div>
    </div>
  );
}