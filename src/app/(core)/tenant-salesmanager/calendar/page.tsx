"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useRibbonPage } from "@/components/ribbon";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, Plus, ChevronLeft, ChevronRight, X, User } from "lucide-react";
import { useI18n } from "@/components/utils/I18nProvider";
import { useToast } from "@/hooks/use-toast";

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: number;
  month: number;
  year: number;
  time: string;
  endTime?: string;
  type: 'meeting' | 'call' | 'review' | 'demo' | 'appointment' | 'test-drive' | 'team-meeting' | 'training' | 'other';
  attendees: string[];
  assignedRep?: string;
  location?: string;
  isAllDay: boolean;
  createdBy: string;
  tenantId: string;
}

interface NewEventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  endTime: string;
  type: 'meeting' | 'call' | 'review' | 'demo' | 'appointment' | 'test-drive' | 'team-meeting' | 'training' | 'other';
  attendees: string;
  assignedRep: string;
  location: string;
  isAllDay: boolean;
}

export default function TenantSalesManagerCalendarPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useI18n();
  const { toast } = useToast();

  // Role-based access control
  useEffect(() => {
    if (user && !['admin', 'manager'].includes(user.role)) {
      console.log("🚨 [TENANT_SALES_MANAGER_CALENDAR] Access denied - redirecting");
      router.push('/');
    }
  }, [user, router]);

  useRibbonPage({
    context: "dashboard",
    enable: ["quickActions", "export", "profile", "notifications"],
    disable: ["saveLayout", "aiTools", "developer", "billing"]
  });

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<{ date: number; month: number; year: number } | null>(null);
  const [view, setView] = useState<'month' | 'week' | 'day' | 'agenda'>('month');
  const [loading, setLoading] = useState(true);

  const [newEventForm, setNewEventForm] = useState<NewEventFormData>({
    title: '',
    description: '',
    date: '',
    time: '',
    endTime: '',
    type: 'appointment',
    attendees: '',
    assignedRep: '',
    location: '',
    isAllDay: false
  });

  // Team members for assignment
  const teamMembers = [
    'Sarah Johnson',
    'Mike Rodriguez', 
    'Emily Chen',
    'David Thompson'
  ];

  // Check if user has proper access
  if (user && !['admin', 'manager'].includes(user.role)) {
    return null;
  }

  useEffect(() => {
    loadEvents();
  }, [currentMonth, currentYear]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      
      // Mock team calendar events for sales manager
      const mockEvents: CalendarEvent[] = [
        {
          id: '1',
          title: 'Team Sales Meeting',
          description: 'Weekly team standup and pipeline review',
          date: 15,
          month: currentMonth,
          year: currentYear,
          time: '09:00',
          endTime: '10:00',
          type: 'team-meeting',
          attendees: ['Sarah Johnson', 'Mike Rodriguez', 'Emily Chen'],
          location: 'Conference Room A',
          isAllDay: false,
          createdBy: user?.id || 'manager',
          tenantId: user?.tenantId || 'default'
        },
        {
          id: '2',
          title: 'Customer Appointment - Honda Civic',
          description: 'Test drive appointment assigned to Sarah',
          date: 16,
          month: currentMonth,
          year: currentYear,
          time: '14:00',
          endTime: '15:00',
          type: 'test-drive',
          attendees: ['Customer: Johnson Family'],
          assignedRep: 'Sarah Johnson',
          location: 'Sales Floor',
          isAllDay: false,
          createdBy: user?.id || 'manager',
          tenantId: user?.tenantId || 'default'
        },
        {
          id: '3',
          title: 'Monthly Performance Review',
          description: 'Review team metrics and individual performance',
          date: 20,
          month: currentMonth,
          year: currentYear,
          time: '11:00',
          endTime: '12:30',
          type: 'review',
          attendees: ['All Team Members'],
          location: 'Manager Office',
          isAllDay: false,
          createdBy: user?.id || 'manager',
          tenantId: user?.tenantId || 'default'
        },
        {
          id: '4',
          title: 'Sales Training Session',
          description: 'New product training for 2025 models',
          date: 22,
          month: currentMonth,
          year: currentYear,
          time: '10:00',
          endTime: '12:00',
          type: 'training',
          attendees: teamMembers,
          location: 'Training Room',
          isAllDay: false,
          createdBy: user?.id || 'manager',
          tenantId: user?.tenantId || 'default'
        }
      ];

      setEvents(mockEvents);
    } catch (error) {
      console.error('Failed to load events:', error);
      toast({
        title: "Error",
        description: "Failed to load calendar events.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const firstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const getEventsForDate = (date: number, month: number, year: number) => {
    return events.filter(event => 
      event.date === date && 
      event.month === month && 
      event.year === year
    );
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      'team-meeting': 'bg-blue-500',
      'appointment': 'bg-green-500',
      'test-drive': 'bg-purple-500',
      'review': 'bg-orange-500',
      'training': 'bg-yellow-500',
      'call': 'bg-red-500',
      'demo': 'bg-indigo-500',
      'other': 'bg-gray-500'
    };
    return colors[type] || colors.other;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const handleDateClick = (date: number) => {
    setSelectedDate({ date, month: currentMonth, year: currentYear });
    setNewEventForm({
      ...newEventForm,
      date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`
    });
    setShowNewEventModal(true);
  };

  const handleCreateEvent = async () => {
    try {
      if (!newEventForm.title || !newEventForm.date || !newEventForm.time) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }

      const [year, month, date] = newEventForm.date.split('-').map(Number);
      
      const newEvent: CalendarEvent = {
        id: Date.now().toString(),
        title: newEventForm.title,
        description: newEventForm.description,
        date,
        month: month - 1, // JavaScript months are 0-indexed
        year,
        time: newEventForm.time,
        endTime: newEventForm.endTime,
        type: newEventForm.type,
        attendees: newEventForm.attendees.split(',').map(a => a.trim()).filter(Boolean),
        assignedRep: newEventForm.assignedRep,
        location: newEventForm.location,
        isAllDay: newEventForm.isAllDay,
        createdBy: user?.id || 'manager',
        tenantId: user?.tenantId || 'default'
      };

      setEvents([...events, newEvent]);
      setShowNewEventModal(false);
      setNewEventForm({
        title: '',
        description: '',
        date: '',
        time: '',
        endTime: '',
        type: 'appointment',
        attendees: '',
        assignedRep: '',
        location: '',
        isAllDay: false
      });

      toast({
        title: "Event Created",
        description: "Calendar event has been created successfully.",
      });

    } catch (error) {
      console.error('Failed to create event:', error);
      toast({
        title: "Error",
        description: "Failed to create calendar event.",
        variant: "destructive",
      });
    }
  };

  const renderCalendarGrid = () => {
    const daysCount = daysInMonth(currentMonth, currentYear);
    const firstDay = firstDayOfMonth(currentMonth, currentYear);
    const days: any[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-cell empty"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysCount; day++) {
      const dayEvents = getEventsForDate(day, currentMonth, currentYear);
      const isToday = new Date().getDate() === day && 
                     new Date().getMonth() === currentMonth && 
                     new Date().getFullYear() === currentYear;

      days.push(
        <div
          key={day}
          className={`calendar-cell ${isToday ? 'today' : ''} ${dayEvents.length > 0 ? 'has-events' : ''}`}
          onClick={() => handleDateClick(day)}
        >
          <div className="day-number">{day}</div>
          <div className="events-container">
            {dayEvents.slice(0, 3).map(event => (
              <div
                key={event.id}
                className={`event-pill ${getEventTypeColor(event.type)}`}
                title={`${event.title} - ${event.time}`}
              >
                {event.assignedRep ? `${event.assignedRep}: ` : ''}{event.title}
              </div>
            ))}
            {dayEvents.length > 3 && (
              <div className="more-events">+{dayEvents.length - 3} more</div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Calendar</h1>
          <p className="text-gray-600 mt-1">Manage team schedules and appointments</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setView(view === 'month' ? 'agenda' : 'month')}
          >
            {view === 'month' ? 'Agenda View' : 'Month View'}
          </Button>
          <Button onClick={() => setShowNewEventModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Schedule Event
          </Button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <Button variant="ghost" onClick={() => navigateMonth('prev')}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-xl font-semibold">
            {monthNames[currentMonth]} {currentYear}
          </h2>
          <Button variant="ghost" onClick={() => navigateMonth('next')}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {view === 'month' ? (
          <div className="calendar-container">
            <div className="calendar-grid">
              <div className="calendar-header">
                <div className="day-header">Sun</div>
                <div className="day-header">Mon</div>
                <div className="day-header">Tue</div>
                <div className="day-header">Wed</div>
                <div className="day-header">Thu</div>
                <div className="day-header">Fri</div>
                <div className="day-header">Sat</div>
              </div>
              <div className="calendar-body">
                {renderCalendarGrid()}
              </div>
            </div>
          </div>
        ) : (
          <div className="agenda-view space-y-4">
            {events
              .filter(event => event.month === currentMonth && event.year === currentYear)
              .sort((a, b) => a.date - b.date)
              .map(event => (
                <Card key={event.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-3 h-3 rounded-full ${getEventTypeColor(event.type)}`}></div>
                        <h3 className="font-semibold">{event.title}</h3>
                        <span className="text-sm text-gray-500">
                          {monthNames[event.month]} {event.date}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{event.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {event.time} {event.endTime && `- ${event.endTime}`}
                        </div>
                        {event.assignedRep && (
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {event.assignedRep}
                          </div>
                        )}
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {event.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        )}
      </Card>

      {/* New Event Modal */}
      {showNewEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Schedule New Event</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowNewEventModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Event Title *</label>
                <input
                  type="text"
                  value={newEventForm.title}
                  onChange={(e) => setNewEventForm({...newEventForm, title: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter event title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newEventForm.description}
                  onChange={(e) => setNewEventForm({...newEventForm, description: e.target.value})}
                  className="w-full p-2 border rounded-lg h-20"
                  placeholder="Event description"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Date *</label>
                  <input
                    type="date"
                    value={newEventForm.date}
                    onChange={(e) => setNewEventForm({...newEventForm, date: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Time *</label>
                  <input
                    type="time"
                    value={newEventForm.time}
                    onChange={(e) => setNewEventForm({...newEventForm, time: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">End Time</label>
                  <input
                    type="time"
                    value={newEventForm.endTime}
                    onChange={(e) => setNewEventForm({...newEventForm, endTime: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={newEventForm.type}
                    onChange={(e) => setNewEventForm({...newEventForm, type: e.target.value as any})}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="appointment">Appointment</option>
                    <option value="test-drive">Test Drive</option>
                    <option value="team-meeting">Team Meeting</option>
                    <option value="training">Training</option>
                    <option value="review">Review</option>
                    <option value="call">Call</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Assign to Rep</label>
                <select
                  value={newEventForm.assignedRep}
                  onChange={(e) => setNewEventForm({...newEventForm, assignedRep: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Select team member...</option>
                  {teamMembers.map(member => (
                    <option key={member} value={member}>{member}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input
                  type="text"
                  value={newEventForm.location}
                  onChange={(e) => setNewEventForm({...newEventForm, location: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Meeting location"
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowNewEventModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleCreateEvent} className="flex-1">
                  Create Event
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      <style jsx>{`
        .calendar-container {
          background: white;
          border-radius: 8px;
          overflow: hidden;
        }

        .calendar-grid {
          display: grid;
          grid-template-rows: auto 1fr;
        }

        .calendar-header {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .day-header {
          padding: 12px;
          text-align: center;
          font-weight: 600;
          color: #64748b;
          font-size: 14px;
        }

        .calendar-body {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          grid-auto-rows: minmax(100px, auto);
        }

        .calendar-cell {
          border-right: 1px solid #e2e8f0;
          border-bottom: 1px solid #e2e8f0;
          padding: 8px;
          min-height: 100px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .calendar-cell:hover {
          background-color: #f1f5f9;
        }

        .calendar-cell.today {
          background-color: #dbeafe;
        }

        .calendar-cell.empty {
          background-color: #f8fafc;
          cursor: default;
        }

        .calendar-cell.empty:hover {
          background-color: #f8fafc;
        }

        .day-number {
          font-weight: 600;
          margin-bottom: 4px;
          color: #1e293b;
        }

        .events-container {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .event-pill {
          padding: 2px 6px;
          border-radius: 4px;
          color: white;
          font-size: 11px;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .more-events {
          font-size: 10px;
          color: #64748b;
          margin-top: 2px;
        }
      `}</style>
    </div>
  );
}