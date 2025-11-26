"use client";
import React, { useState } from 'react';
import "./page.css";

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
  const calendarDays: any[] = [];
  
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
    <div className="calendar-page">
      <div className="calendar-content">
        <div className="calendar-header">
          <h1 className="calendar-title">Calendar & Scheduling</h1>
          <div className="header-actions">
            <button className="header-btn header-btn-new">
              📅 New Event
            </button>
            <button className="header-btn header-btn-sync">
              🔗 Sync Calendar
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="calendar-container">
          {/* Calendar Header with Month/Year and Navigation */}
          <div className="calendar-nav">
            <button className="nav-button">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="calendar-month-info">
              <h2 className="calendar-month-title">{monthNames[currentMonth]} {currentYear}</h2>
              <p className="calendar-today-info">Today is {monthNames[currentMonth]} {currentDate}, {currentYear}</p>
            </div>
            
            <button className="nav-button">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="calendar-days-header">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="day-header">
                {day}
              </div>
            ))}
          </div>
          
          <div className="calendar-grid">
            {calendarDays.map((day, index) => (
              <div 
                key={index} 
                className={`calendar-day ${
                  day.isToday 
                    ? 'calendar-day-today' 
                    : day.isCurrentMonth 
                      ? '' 
                      : 'calendar-day-other-month'
                }`}
              >
                <div className={`calendar-day-number ${
                  day.isToday 
                    ? 'calendar-day-number-today' 
                    : day.isCurrentMonth 
                      ? '' 
                      : 'calendar-day-number-other-month'
                }`}>
                  {day.date}
                </div>
                {/* Add sample events on specific days */}
                {day.isCurrentMonth && (day.date === 15 || day.date === 22 || day.date === 29) && (
                  <div className="calendar-event calendar-event-blue">
                    {day.date === 15 && 'Sales Meeting'}
                    {day.date === 22 && 'Vehicle Demo'}
                    {day.date === 29 && 'Team Review'}
                  </div>
                )}
                {/* Highlight today with special event */}
                {day.isToday && (
                  <div className="calendar-event calendar-event-green">
                    Today
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events & Analytics */}
        <div className="calendar-bottom-grid">
          <div className="upcoming-events-card">
            <h3 className="card-title">Upcoming Events</h3>
            <div className="events-list">
              <div className="event-item event-item-blue">
                <div className="event-dot event-dot-blue"></div>
                <div className="event-details">
                  <div className="event-title">Client Appointment - Vehicle Demo</div>
                  <div className="event-time">Tomorrow, 2:00 PM</div>
                  <div className="event-shared">Shared with: Sales Team</div>
                </div>
                <div className="event-actions">
                  <button 
                    onClick={() => { setSelectedEvent('demo'); setShowShareModal(true); }}
                    className="event-action-btn event-action-btn-blue"
                  >
                    Share
                  </button>
                  <button className="event-action-btn event-action-btn-blue">
                    Chat
                  </button>
                </div>
              </div>
              <div className="event-item event-item-green">
                <div className="event-dot event-dot-green"></div>
                <div className="event-details">
                  <div className="event-title">Sales Team Meeting</div>
                  <div className="event-time">Friday, 10:00 AM</div>
                  <div className="event-shared">Shared with: All Admins</div>
                </div>
                <div className="event-actions">
                  <button 
                    onClick={() => { setSelectedEvent('meeting'); setShowShareModal(true); }}
                    className="event-action-btn event-action-btn-green"
                  >
                    Share
                  </button>
                  <button className="event-action-btn event-action-btn-green">
                    Chat
                  </button>
                </div>
              </div>
              <div className="event-item event-item-yellow">
                <div className="event-dot event-dot-yellow"></div>
                <div className="event-details">
                  <div className="event-title">Inventory Review</div>
                  <div className="event-time">Monday, 9:00 AM</div>
                  <div className="event-shared">Private event</div>
                </div>
                <div className="event-actions">
                  <button 
                    onClick={() => { setSelectedEvent('inventory'); setShowShareModal(true); }}
                    className="event-action-btn event-action-btn-yellow"
                  >
                    Share
                  </button>
                  <button className="event-action-btn event-action-btn-yellow">
                    Chat
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="analytics-card">
            <h3 className="card-title">Meeting Analytics</h3>
            <div className="analytics-list">
              <div className="analytics-item">
                <span className="analytics-label">This Week</span>
                <span className="analytics-value">12 appointments</span>
              </div>
              <div className="analytics-item">
                <span className="analytics-label">Average Duration</span>
                <span className="analytics-value">45 min</span>
              </div>
              <div className="analytics-item">
                <span className="analytics-label">No-shows</span>
                <span className="analytics-value analytics-value-red">2</span>
              </div>
              <div className="analytics-item">
                <span className="analytics-label">Conversion Rate</span>
                <span className="analytics-value analytics-value-green">68%</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Event Sharing Modal */}
        {showShareModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title">Share Event</h3>
                <button 
                  onClick={() => setShowShareModal(false)}
                  className="modal-close"
                >
                  ✕
                </button>
              </div>
              
              <div className="modal-form">
                <div className="form-group">
                  <label className="form-label">Share with:</label>
                  <div className="checkbox-group">
                    <label className="checkbox-item">
                      <input type="checkbox" className="checkbox-input" />
                      <span className="checkbox-label">All Sales Reps</span>
                    </label>
                    <label className="checkbox-item">
                      <input type="checkbox" className="checkbox-input" />
                      <span className="checkbox-label">Admin Team</span>
                    </label>
                    <label className="checkbox-item">
                      <input type="checkbox" className="checkbox-input" />
                      <span className="checkbox-label">Specific Users</span>
                    </label>
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Collaboration Options:</label>
                  <div className="checkbox-group">
                    <label className="checkbox-item">
                      <input type="checkbox" defaultChecked className="checkbox-input" />
                      <span className="checkbox-label">Send to team chat</span>
                    </label>
                    <label className="checkbox-item">
                      <input type="checkbox" className="checkbox-input" />
                      <span className="checkbox-label">Create shared workspace</span>
                    </label>
                    <label className="checkbox-item">
                      <input type="checkbox" className="checkbox-input" />
                      <span className="checkbox-label">Schedule video call</span>
                    </label>
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Message (optional):</label>
                  <textarea 
                    className="form-textarea"
                    rows={3}
                    placeholder="Add a note about this event..."
                  ></textarea>
                </div>
              </div>
              
              <div className="modal-actions">
                <button 
                  onClick={() => setShowShareModal(false)}
                  className="modal-btn modal-btn-cancel"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    // Here you would integrate with the collaboration system
                    alert('Event shared with team via collaboration system!');
                    setShowShareModal(false);
                  }}
                  className="modal-btn modal-btn-share"
                >
                  Share Event
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CalendarPage() {
  return <CalendarContent />;
}
