"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/SupabaseAuthContext";
import { useRouter } from "next/navigation";
import { useRibbonPage } from "@/components/ribbon";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, ChevronLeft, ChevronRight, X, Plus, Phone, Mail, Car } from "lucide-react";
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
  type: 'meeting' | 'call' | 'demo' | 'follow-up' | 'test-drive' | 'appointment' | 'personal' | 'other';
  customer?: {
    name: string;
    email: string;
    phone: string;
  };
  vehicle?: {
    year: number;
    make: string;
    model: string;
    vin?: string;
  };
  location?: string;
  isAllDay: boolean;
  createdBy: string;
  tenantId: string;
  priority: 'high' | 'medium' | 'low';
}

interface NewEventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  endTime: string;
  type: 'meeting' | 'call' | 'demo' | 'follow-up' | 'test-drive' | 'appointment' | 'personal' | 'other';
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  vehicleInfo: string;
  location: string;
  isAllDay: boolean;
  priority: 'high' | 'medium' | 'low';
}

export default function TenantSalesRepCalendarPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useI18n();
  const { toast } = useToast();

  // Role-based access control
  useEffect(() => {
    if (user && !['sales-rep', 'admin', 'manager'].includes(user.role)) {
      console.log("🚨 [TENANT_SALES_REP_CALENDAR] Access denied - redirecting");
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
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    vehicleInfo: '',
    location: '',
    isAllDay: false,
    priority: 'medium'
  });

  // Check if user has proper access
  if (user && !['sales-rep', 'admin', 'manager'].includes(user.role)) {
    return null;
  }

  useEffect(() => {
    loadEvents();
  }, [currentMonth, currentYear]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      
      // Mock personal calendar events for sales rep
      const mockEvents: CalendarEvent[] = [
        {
          id: '1',
          title: 'Test Drive - Honda Accord',
          description: 'Customer test drive appointment',
          date: 15,
          month: currentMonth,
          year: currentYear,
          time: '10:00',
          endTime: '11:00',
          type: 'test-drive',
          customer: {
            name: 'Jennifer Martinez',
            email: 'j.martinez@email.com',
            phone: '(555) 123-4567'
          },
          vehicle: {
            year: 2024,
            make: 'Honda',
            model: 'Accord',
            vin: '1HGCY1F30PA123456'
          },
          location: 'Dealership Lot',
          isAllDay: false,
          createdBy: user?.id || 'sales-rep',
          tenantId: user?.tenantId || 'default',
          priority: 'high'
        },
        {
          id: '2',
          title: 'Follow-up Call - Robert Chen',
          description: 'Price negotiation follow-up',
          date: 16,
          month: currentMonth,
          year: currentYear,
          time: '14:00',
          endTime: '14:30',
          type: 'follow-up',
          customer: {
            name: 'Robert Chen',
            email: 'r.chen@email.com',
            phone: '(555) 987-6543'
          },
          location: 'Phone Call',
          isAllDay: false,
          createdBy: user?.id || 'sales-rep',
          tenantId: user?.tenantId || 'default',
          priority: 'high'
        },
        {
          id: '3',
          title: 'Vehicle Demo - Toyota Camry',
          description: 'Product demonstration for new customer',
          date: 18,
          month: currentMonth,
          year: currentYear,
          time: '15:30',
          endTime: '16:30',
          type: 'demo',
          customer: {
            name: 'Sarah Williams',
            email: 's.williams@email.com',
            phone: '(555) 234-5678'
          },
          vehicle: {
            year: 2024,
            make: 'Toyota',
            model: 'Camry'
          },
          location: 'Showroom',
          isAllDay: false,
          createdBy: user?.id || 'sales-rep',
          tenantId: user?.tenantId || 'default',
          priority: 'medium'
        },
        {
          id: '4',
          title: 'Financing Meeting',
          description: 'Discuss financing options with customer',
          date: 20,
          month: currentMonth,
          year: currentYear,
          time: '11:00',
          endTime: '12:00',
          type: 'meeting',
          customer: {
            name: 'Michael Johnson',
            email: 'm.johnson@email.com',
            phone: '(555) 345-6789'
          },
          vehicle: {
            year: 2024,
            make: 'Ford',
            model: 'F-150'
          },
          location: 'Finance Office',
          isAllDay: false,
          createdBy: user?.id || 'sales-rep',
          tenantId: user?.tenantId || 'default',
          priority: 'high'
        },
        {
          id: '5',
          title: 'Delivery Appointment',
          description: 'Vehicle delivery to customer',
          date: 25,
          month: currentMonth,
          year: currentYear,
          time: '13:00',
          endTime: '14:00',
          type: 'appointment',
          customer: {
            name: 'Jennifer Martinez',
            email: 'j.martinez@email.com',
            phone: '(555) 123-4567'
          },
          vehicle: {
            year: 2024,
            make: 'Honda',
            model: 'Accord'
          },
          location: 'Customer Location',
          isAllDay: false,
          createdBy: user?.id || 'sales-rep',
          tenantId: user?.tenantId || 'default',
          priority: 'high'
        },
        {
          id: '6',
          title: 'Lunch Break',
          description: 'Personal time',
          date: 23,
          month: currentMonth,
          year: currentYear,
          time: '12:00',
          endTime: '13:00',
          type: 'personal',
          location: 'Local Restaurant',
          isAllDay: false,
          createdBy: user?.id || 'sales-rep',
          tenantId: user?.tenantId || 'default',
          priority: 'low'
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
      'test-drive': 'bg-purple-500',
      'appointment': 'bg-green-500',
      'follow-up': 'bg-blue-500',
      'meeting': 'bg-orange-500',
      'demo': 'bg-indigo-500',
      'call': 'bg-red-500',
      'personal': 'bg-gray-500',
      'other': 'bg-yellow-500'
    };
    return colors[type] || colors.other;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'high': 'border-red-500',
      'medium': 'border-yellow-500',
      'low': 'border-green-500'
    };
    return colors[priority] || colors.medium;
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
        customer: newEventForm.customerName ? {
          name: newEventForm.customerName,
          email: newEventForm.customerEmail,
          phone: newEventForm.customerPhone
        } : undefined,
        vehicle: newEventForm.vehicleInfo ? {
          year: 2024,
          make: newEventForm.vehicleInfo.split(' ')[0] || '',
          model: newEventForm.vehicleInfo.split(' ').slice(1).join(' ') || ''
        } : undefined,
        location: newEventForm.location,
        isAllDay: newEventForm.isAllDay,
        priority: newEventForm.priority,
        createdBy: user?.id || 'sales-rep',
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
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        vehicleInfo: '',
        location: '',
        isAllDay: false,
        priority: 'medium'
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

  const handleContactCustomer = (customer: any, type: 'call' | 'email') => {
    if (type === 'call') {
      window.location.href = `tel:${customer.phone}`;
    } else {
      window.location.href = `mailto:${customer.email}`;
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
                className={`event-pill ${getEventTypeColor(event.type)} ${getPriorityColor(event.priority)}`}
                title={`${event.title} - ${event.time}${event.customer ? ` (${event.customer.name})` : ''}`}
              >
                {event.customer ? `${event.customer.name}: ` : ''}{event.title}
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
          <h1 className="text-3xl font-bold text-gray-900">My Calendar</h1>
          <p className="text-gray-600 mt-1">Manage your schedule and appointments</p>
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
                        <span className={`px-2 py-1 text-xs rounded border ${getPriorityColor(event.priority)}`}>
                          {event.priority}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{event.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {event.time} {event.endTime && `- ${event.endTime}`}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {event.location}
                          </div>
                        )}
                      </div>
                      {event.customer && (
                        <div className="bg-blue-50 p-2 rounded text-sm">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-blue-900">{event.customer.name}</p>
                              <p className="text-blue-700">{event.customer.email}</p>
                              {event.vehicle && (
                                <p className="text-blue-700">
                                  <Car className="w-3 h-3 inline mr-1" />
                                  {event.vehicle.year} {event.vehicle.make} {event.vehicle.model}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleContactCustomer(event.customer, 'call')}
                              >
                                <Phone className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleContactCustomer(event.customer, 'email')}
                              >
                                <Mail className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        )}
      </Card>

      {/* New Event Modal */}
      {showNewEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <Card className="p-6 w-full max-w-md mx-4 my-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Schedule New Event</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowNewEventModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
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
                  className="w-full p-2 border rounded-lg h-16"
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
                    <option value="demo">Demo</option>
                    <option value="follow-up">Follow-up</option>
                    <option value="meeting">Meeting</option>
                    <option value="call">Call</option>
                    <option value="personal">Personal</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  value={newEventForm.priority}
                  onChange={(e) => setNewEventForm({...newEventForm, priority: e.target.value as any})}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Customer Name</label>
                <input
                  type="text"
                  value={newEventForm.customerName}
                  onChange={(e) => setNewEventForm({...newEventForm, customerName: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Customer name"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Customer Email</label>
                  <input
                    type="email"
                    value={newEventForm.customerEmail}
                    onChange={(e) => setNewEventForm({...newEventForm, customerEmail: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Customer Phone</label>
                  <input
                    type="tel"
                    value={newEventForm.customerPhone}
                    onChange={(e) => setNewEventForm({...newEventForm, customerPhone: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Vehicle Info</label>
                <input
                  type="text"
                  value={newEventForm.vehicleInfo}
                  onChange={(e) => setNewEventForm({...newEventForm, vehicleInfo: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  placeholder="2024 Honda Accord"
                />
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
          border-left: 3px solid;
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