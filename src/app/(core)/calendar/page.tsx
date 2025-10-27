"use client";
import React, { useState } from 'react';

function CalendarContent() {
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  
  // Get current date information
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-based (October = 9)
  const currentDate = today.getDate();
  
  // Get first day of the month and calculate starting position
  const firstDay = new Date(currentYear, currentMonth, 1);
  const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Get number of days in current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  // Get number of days in previous month for padding
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
  
  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Generate calendar days array
  const calendarDays = [];
  
  // Add previous month's trailing days
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    calendarDays.push({
      date: daysInPrevMonth - i,
      isCurrentMonth: false,
      isPrevMonth: true,
      isNextMonth: false,
      isToday: false
    });
  }
  
  // Add current month's days
  for (let date = 1; date <= daysInMonth; date++) {
    calendarDays.push({
      date: date,
      isCurrentMonth: true,
      isPrevMonth: false,
      isNextMonth: false,
      isToday: date === currentDate
    });
  }
  
  // Add next month's leading days to fill the grid (42 days = 6 weeks)
  const remainingDays = 42 - calendarDays.length;
  for (let date = 1; date <= remainingDays; date++) {
    calendarDays.push({
      date: date,
      isCurrentMonth: false,
      isPrevMonth: false,
      isNextMonth: true,
      isToday: false
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Calendar & Scheduling</h1>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
            📅 New Event
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2">
            🔗 Sync Calendar
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        {/* Calendar Header with Month/Year and Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900">{monthNames[currentMonth]} {currentYear}</h2>
            <p className="text-sm text-gray-500">Today is {monthNames[currentMonth]} {currentDate}, {currentYear}</p>
          </div>
          
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-7 gap-4 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-semibold text-gray-700 py-3 border-b border-gray-200">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => (
            <div 
              key={index} 
              className={`h-24 border border-gray-100 rounded p-2 transition-colors cursor-pointer ${
                day.isToday 
                  ? 'bg-blue-100 border-blue-300 hover:bg-blue-150' 
                  : day.isCurrentMonth 
                    ? 'hover:bg-gray-50' 
                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
              }`}
            >
              <div className={`text-sm font-medium ${
                day.isToday 
                  ? 'text-blue-700 font-bold' 
                  : day.isCurrentMonth 
                    ? 'text-gray-900' 
                    : 'text-gray-400'
              }`}>
                {day.date}
              </div>
              {/* Add sample events on specific days */}
              {day.isCurrentMonth && (day.date === 15 || day.date === 22 || day.date === 29) && (
                <div className="text-xs bg-blue-100 text-blue-700 rounded px-2 py-1 mt-1 truncate">
                  {day.date === 15 && 'Sales Meeting'}
                  {day.date === 22 && 'Vehicle Demo'}
                  {day.date === 29 && 'Team Review'}
                </div>
              )}
              {/* Highlight today with special event */}
              {day.isToday && (
                <div className="text-xs bg-green-100 text-green-700 rounded px-2 py-1 mt-1 truncate">
                  Today
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Events & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">Client Appointment - Vehicle Demo</div>
                <div className="text-sm text-gray-600">Tomorrow, 2:00 PM</div>
                <div className="text-xs text-gray-500 mt-1">Shared with: Sales Team</div>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => { setSelectedEvent('demo'); setShowShareModal(true); }}
                  className="text-xs bg-white text-blue-600 border border-blue-200 rounded px-2 py-1 hover:bg-blue-50 transition-colors"
                >
                  Share
                </button>
                <button className="text-xs bg-white text-blue-600 border border-blue-200 rounded px-2 py-1 hover:bg-blue-50 transition-colors">
                  Chat
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">Sales Team Meeting</div>
                <div className="text-sm text-gray-600">Friday, 10:00 AM</div>
                <div className="text-xs text-gray-500 mt-1">Shared with: All Admins</div>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => { setSelectedEvent('meeting'); setShowShareModal(true); }}
                  className="text-xs bg-white text-green-600 border border-green-200 rounded px-2 py-1 hover:bg-green-50 transition-colors"
                >
                  Share
                </button>
                <button className="text-xs bg-white text-green-600 border border-green-200 rounded px-2 py-1 hover:bg-green-50 transition-colors">
                  Chat
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
              <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">Inventory Review</div>
                <div className="text-sm text-gray-600">Monday, 9:00 AM</div>
                <div className="text-xs text-gray-500 mt-1">Private event</div>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => { setSelectedEvent('inventory'); setShowShareModal(true); }}
                  className="text-xs bg-white text-yellow-600 border border-yellow-200 rounded px-2 py-1 hover:bg-yellow-50 transition-colors"
                >
                  Share
                </button>
                <button className="text-xs bg-white text-yellow-600 border border-yellow-200 rounded px-2 py-1 hover:bg-yellow-50 transition-colors">
                  Chat
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Meeting Analytics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">This Week</span>
              <span className="font-semibold text-gray-900">12 appointments</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Average Duration</span>
              <span className="font-semibold text-gray-900">45 min</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">No-shows</span>
              <span className="font-semibold text-red-600">2</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Conversion Rate</span>
              <span className="font-semibold text-green-600">68%</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Event Sharing Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Share Event</h3>
              <button 
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Share with:</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 mr-2" />
                    <span className="text-sm">All Sales Reps</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 mr-2" />
                    <span className="text-sm">Admin Team</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 mr-2" />
                    <span className="text-sm">Specific Users</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Collaboration Options:</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 mr-2" />
                    <span className="text-sm">Send to team chat</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 mr-2" />
                    <span className="text-sm">Create shared workspace</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 mr-2" />
                    <span className="text-sm">Schedule video call</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message (optional):</label>
                <textarea 
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Add a note about this event..."
                ></textarea>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setShowShareModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  // Here you would integrate with the collaboration system
                  alert('Event shared with team via collaboration system!');
                  setShowShareModal(false);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Share Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CalendarPage() {
  return <CalendarContent />;
}
