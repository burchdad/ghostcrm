"use client";
import React from 'react';
import ComingSoonWrapper from '@/components/ComingSoonWrapper';

function CalendarContent() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Calendar & Scheduling</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            📅 New Event
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            🔗 Sync Calendar
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-7 gap-4 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-semibold text-gray-700 py-2">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-4">
          {Array.from({ length: 35 }, (_, i) => (
            <div key={i} className="h-24 border border-gray-200 rounded-lg p-2 hover:bg-gray-50">
              <div className="text-sm text-gray-600">{i % 30 + 1}</div>
              {i % 7 === 0 && (
                <div className="text-xs bg-blue-100 text-blue-800 rounded px-2 py-1 mt-1">
                  Team Meeting
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Upcoming Events</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div>
                <div className="font-medium">Client Call - Acme Corp</div>
                <div className="text-sm text-gray-600">Tomorrow, 2:00 PM</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <div className="font-medium">Product Demo</div>
                <div className="text-sm text-gray-600">Friday, 10:00 AM</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Meeting Analytics</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">This Week</span>
              <span className="font-semibold">12 meetings</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Average Duration</span>
              <span className="font-semibold">45 min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">No-shows</span>
              <span className="font-semibold text-red-600">2</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CalendarPage() {
  return (
    <ComingSoonWrapper 
      feature="calendar" 
      enabled={false}
      comingSoonDate="November 2025"
      description="AI-powered calendar with smart scheduling, conflict resolution, and meeting analytics"
    >
      <CalendarContent />
    </ComingSoonWrapper>
  );
}