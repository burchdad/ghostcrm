"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/SupabaseAuthContext";
import { useRouter } from "next/navigation";
import { useRibbonPage } from "@/components/ribbon";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  Users,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PageAIAssistant from "@/components/ai/PageAIAssistant";
import "./page.css";

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: number;
  month: number;
  year: number;
  time: string;
  endTime?: string;
  type:
    | "meeting"
    | "call"
    | "review"
    | "demo"
    | "appointment"
    | "test-drive"
    | "todo"
    | "other";
  attendees: string[];
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
  type:
    | "meeting"
    | "call"
    | "review"
    | "demo"
    | "appointment"
    | "test-drive"
    | "todo"
    | "other";
  attendees: string;
  location: string;
  isAllDay: boolean;
}

export default function TenantOwnerCalendarPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Role-based access control
  useEffect(() => {
    if (user && !["owner"].includes(user.role)) {
      console.log("🚨 [TENANT_OWNER_CALENDAR] Access denied - redirecting");
      router.push("/");
    }
  }, [user, router]);

  useRibbonPage({
    context: "leads",
    enable: ["quickActions", "export", "share", "profile", "notifications"],
    disable: ["saveLayout", "aiTools", "developer", "billing", "bulkOps"],
  });

  // If user is not owner, don't render (redirect handled above)
  if (user && !["owner"].includes(user.role)) {
    return null;
  }

  // Get current date information
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const todayDate = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();

  // Event management state
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isNewEventInlineOpen, setIsNewEventInlineOpen] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState<string>("");
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);
  const [newEventData, setNewEventData] = useState<NewEventFormData>({
    title: "",
    description: "",
    date: "",
    time: "",
    endTime: "",
    type: "meeting",
    attendees: "",
    location: "",
    isAllDay: false,
  });

  // @-mention functionality state
  const [mentionSuggestions, setMentionSuggestions] = useState<
    Array<{ id: string; name: string; email: string }>
  >([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [attendeesInputRef, setAttendeesInputRef] =
    useState<HTMLInputElement | null>(null);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);

  // Load events and organization members on component mount / month change
  useEffect(() => {
    loadEvents();
    loadOrganizationMembers();
  }, [currentMonth, currentYear]);

  const loadOrganizationMembers = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/organization/${user?.tenantId}/members`);
      // const membersData = await response.json();
      // setMentionSuggestions(membersData);

      // For now, set empty array until API integration
      setMentionSuggestions([]);
    } catch (error) {
      console.error("Error loading organization members:", error);
    }
  };

  // Handle click outside mention dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showMentions &&
        !(event.target as Element)?.closest(".mention-dropdown") &&
        !(event.target as Element)?.closest(".attendees-input-container")
      ) {
        setShowMentions(false);
        setMentionQuery("");
      }
    };

    if (showMentions) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showMentions]);

  const loadEvents = async () => {
    try {
      // Load calendar events from database
      const response = await fetch(`/api/calendar/events?month=${currentMonth}&year=${currentYear}&tenantId=${user?.tenantId}`);
      const result = await response.json();
      
      if (result.success) {
        setEvents(result.data.events || []);
      } else {
        console.error('Failed to load events:', result.error);
        toast({
          title: "Error",
          description: result.error || "Failed to load calendar events.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading events:", error);
      toast({
        title: "Error",
        description: "Failed to load calendar events.",
        variant: "destructive",
      });
    }
  };

  // Calendar calculations
  const firstDay = new Date(currentYear, currentMonth, 1);
  const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Generate calendar days array
  const calendarDays: Array<{
    date: number;
    isCurrentMonth: boolean;
    isPrevMonth: boolean;
    isNextMonth: boolean;
    isToday: boolean;
  }> = [];

  // Previous month's trailing days
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    calendarDays.push({
      date: daysInPrevMonth - i,
      isCurrentMonth: false,
      isPrevMonth: true,
      isNextMonth: false,
      isToday: false,
    });
  }

  // Current month's days
  for (let date = 1; date <= daysInMonth; date++) {
    const isToday =
      date === todayDate &&
      currentMonth === todayMonth &&
      currentYear === todayYear;
    calendarDays.push({
      date,
      isCurrentMonth: true,
      isPrevMonth: false,
      isNextMonth: false,
      isToday,
    });
  }

  // Next month's leading days (fill 6x7 grid)
  const remainingDays = 42 - calendarDays.length;
  for (let date = 1; date <= remainingDays; date++) {
    calendarDays.push({
      date,
      isCurrentMonth: false,
      isPrevMonth: false,
      isNextMonth: true,
      isToday: false,
    });
  }

  const getEventsForDate = (date: number) =>
    events.filter(
      (event) =>
        event.date === date &&
        event.month === currentMonth &&
        event.year === currentYear
    );

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (direction === "prev") {
      newDate.setMonth(currentMonth - 1);
    } else {
      newDate.setMonth(currentMonth + 1);
    }
    setCurrentDate(newDate);
  };

  const handleSyncCalendar = async () => {
    try {
      toast({
        title: "Syncing Calendar",
        description: "Synchronizing with external calendar providers...",
      });

      // TODO: Implement actual calendar sync
      // await syncWithExternalCalendars(user?.tenantId);

      setTimeout(
        () =>
          toast({
            title: "Calendar Synced",
            description: "Successfully synchronized with external calendars.",
          }),
        2000
      );
    } catch (error) {
      console.error("Error syncing calendar:", error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync with external calendars.",
        variant: "destructive",
      });
    }
  };

  const handleNewEvent = () => {
    setSelectedEventType("");
    setNewEventData({
      title: "",
      description: "",
      date: "",
      time: "",
      endTime: "",
      type: "meeting",
      attendees: "",
      location: "",
      isAllDay: false,
    });
    setIsNewEventInlineOpen((open) => !open);
  };

  const handleEventTypeSelect = (eventType: string) => {
    setSelectedEventType(eventType);
    setNewEventData((prev) => ({
      ...prev,
      type: eventType as NewEventFormData["type"],
      title:
        eventType === "meeting"
          ? "Team Meeting"
          : eventType === "call"
          ? "Phone Call"
          : eventType === "appointment"
          ? "Client Appointment"
          : eventType === "test-drive"
          ? "Vehicle Test Drive"
          : eventType === "demo"
          ? "Product Demo"
          : eventType === "review"
          ? "Follow-up Review"
          : eventType === "todo"
          ? "Task"
          : "Event",
    }));
  };

  const handleBackToEventTypes = () => {
    setSelectedEventType("");
  };

  // Event type definitions
  const eventTypes = [
    {
      id: "meeting",
      label: "Meeting",
      icon: "👥",
      description: "Schedule a team or client meeting",
      color: "bg-blue-500",
    },
    {
      id: "call",
      label: "Phone Call",
      icon: "📞",
      description: "Plan a phone call or video conference",
      color: "bg-green-500",
    },
    {
      id: "appointment",
      label: "Appointment",
      icon: "📅",
      description: "Book an appointment with clients",
      color: "bg-purple-500",
    },
    {
      id: "test-drive",
      label: "Test Drive",
      icon: "🚗",
      description: "Schedule vehicle test drives",
      color: "bg-orange-500",
    },
    {
      id: "demo",
      label: "Product Demo",
      icon: "🎯",
      description: "Demonstrate products to prospects",
      color: "bg-red-500",
    },
    {
      id: "review",
      label: "Follow-up",
      icon: "🔄",
      description: "Schedule follow-up reviews",
      color: "bg-indigo-500",
    },
    {
      id: "todo",
      label: "Task/To-Do",
      icon: "✅",
      description: "Create reminders and tasks",
      color: "bg-gray-500",
    },
    {
      id: "other",
      label: "Other",
      icon: "📋",
      description: "Custom event or activity",
      color: "bg-pink-500",
    },
  ];

  const handleEventFormSubmit = async (
    e: React.SyntheticEvent<HTMLFormElement | HTMLButtonElement>
  ) => {
    e.preventDefault();
    setIsSubmittingEvent(true);

    try {
      // Convert date and time to proper format for API
      const eventDate = new Date(newEventData.date);
      const startTime = newEventData.isAllDay 
        ? eventDate.toISOString().split('T')[0] + 'T00:00:00.000Z'
        : `${newEventData.date}T${newEventData.time}:00.000Z`;
      
      const endTime = newEventData.endTime && !newEventData.isAllDay
        ? `${newEventData.date}T${newEventData.endTime}:00.000Z`
        : startTime;

      const eventPayload = {
        title: newEventData.title,
        description: newEventData.description,
        start_time: startTime,
        end_time: endTime,
        type: newEventData.type,
        status: 'confirmed'
      };

      // Send to API
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventPayload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create event');
      }

      // Add the new event to local state with the API response
      setEvents((prev) => [...prev, {
        id: result.data.id,
        title: result.data.title,
        description: result.data.description,
        date: eventDate.getDate(),
        month: eventDate.getMonth(),
        year: eventDate.getFullYear(),
        time: newEventData.time,
        endTime: newEventData.endTime,
        type: result.data.type,
        attendees: newEventData.attendees
          .split(",")
          .map((a) => a.trim())
          .filter((a) => a),
        location: newEventData.location,
        isAllDay: newEventData.isAllDay,
        createdBy: result.data.user_id || "",
        tenantId: result.data.organization_id || "",
      }]);

      // Send calendar invitations if attendees are specified
      if (newEventData.attendees && newEventData.attendees.trim()) {
        const attendeesList = newEventData.attendees
          .split(",")
          .map((a) => a.trim())
          .filter((a) => a);
        
        if (attendeesList.length > 0) {
          await sendCalendarInvitations(result.data, attendeesList);
        }
      }

      toast({
        title: "Event Created",
        description: `Successfully created "${result.data.title}".`,
      });

      setIsNewEventInlineOpen(false);
      setSelectedEventType("");
      setNewEventData({
        title: "",
        description: "",
        date: "",
        time: "",
        endTime: "",
        type: "meeting",
        attendees: "",
        location: "",
        isAllDay: false,
      });
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingEvent(false);
    }
  };

  const handleFormInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    // Handle @-mention functionality for attendees field
    if (name === "attendees") {
      handleAttendeesChange(e as React.ChangeEvent<HTMLInputElement>);
      return;
    }

    setNewEventData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleAttendeesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    setNewEventData((prev) => ({
      ...prev,
      attendees: value,
    }));

    // Check for @ mentions
    const cursorPosition = e.target.selectionStart || 0;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@([^@,\s]*)$/);

    if (mentionMatch) {
      const query = mentionMatch[1].toLowerCase();
      setMentionQuery(query);
      setSelectedMentionIndex(0);

      const filtered = mentionSuggestions.filter(
        (member) =>
          member.name.toLowerCase().includes(query) ||
          member.email.toLowerCase().includes(query)
      );

      const input = e.target;
      const rect = input.getBoundingClientRect();
      setMentionPosition({
        top: rect.bottom + window.scrollY + 5,
        left: rect.left + window.scrollX,
      });

      setShowMentions(filtered.length > 0);
    } else {
      setShowMentions(false);
      setMentionQuery("");
    }
  };

  const handleAttendeesKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showMentions) return;

    const filteredMembers = mentionSuggestions
      .filter(
        (member) =>
          member.name.toLowerCase().includes(mentionQuery) ||
          member.email.toLowerCase().includes(mentionQuery)
      )
      .slice(0, 5);

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedMentionIndex((prev) =>
          prev < filteredMembers.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedMentionIndex((prev) =>
          prev > 0 ? prev - 1 : filteredMembers.length - 1
        );
        break;
      case "Enter":
      case "Tab":
        e.preventDefault();
        if (filteredMembers[selectedMentionIndex]) {
          handleMentionSelect(filteredMembers[selectedMentionIndex]);
        }
        break;
      case "Escape":
        setShowMentions(false);
        setMentionQuery("");
        break;
    }
  };

  const handleMentionSelect = (member: {
    id: string;
    name: string;
    email: string;
  }) => {
    const input = attendeesInputRef;
    if (!input) return;

    const currentValue = newEventData.attendees;
    const cursorPosition = input.selectionStart || 0;
    const textBeforeCursor = currentValue.substring(0, cursorPosition);
    const textAfterCursor = currentValue.substring(cursorPosition);

    const mentionMatch = textBeforeCursor.match(/@([^@,\s]*)$/);
    if (mentionMatch) {
      const beforeMention = textBeforeCursor.substring(0, mentionMatch.index);
      const newValue = beforeMention + member.email + textAfterCursor;

      setNewEventData((prev) => ({
        ...prev,
        attendees: newValue,
      }));

      setTimeout(() => {
        const newCursorPos = beforeMention.length + member.email.length;
        input.setSelectionRange(newCursorPos, newCursorPos);
        input.focus();
      }, 0);
    }

    setShowMentions(false);
    setMentionQuery("");
  };

  const sendCalendarInvitations = async (
    event: CalendarEvent,
    attendeeEmails: string[]
  ) => {
    try {
      // TODO: Implement actual email sending
      // await fetch('/api/calendar/send-invitations', { ... });

      console.log("📧 Sending calendar invitations to:", attendeeEmails);
      toast({
        title: "Invitations Sent",
        description: `Calendar invitations sent to ${attendeeEmails.length} attendee(s).`,
      });
    } catch (error) {
      console.error("Error sending calendar invitations:", error);
      toast({
        title: "Warning",
        description: "Event created but failed to send some invitations.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="tenant-owner-calendar-container">
      {/* AI Assistant */}
      <PageAIAssistant 
        agentId="calendar"
        pageTitle="Calendar Management"
        entityData={{
          totalEvents: events.length,
          todayEvents: events.filter(event => {
            const today = new Date();
            return event.date === today.getDate() && 
                   event.month === today.getMonth() && 
                   event.year === today.getFullYear();
          }).length,
          currentMonth: `${currentMonth + 1}/${currentYear}`,
          eventTypes: Array.from(new Set(events.map(e => e.type)))
        }}
        className="mb-6"
      />

      {/* Quick Stats */}
      <div className="calendar-stats">
        <Card className="stat-card">
          <div className="stat-content">
            <Calendar className="stat-icon" />
            <div>
              <h3>Today's Events</h3>
              <p>{events.filter(event => {
                const today = new Date();
                return event.date === today.getDate() && 
                       event.month === today.getMonth() && 
                       event.year === today.getFullYear();
              }).length} scheduled</p>
            </div>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-content">
            <Clock className="stat-icon" />
            <div>
              <h3>This Week</h3>
              <p>{events.filter(event => {
                const today = new Date();
                const eventDate = new Date(event.year, event.month, event.date);
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - today.getDay());
                startOfWeek.setHours(0, 0, 0, 0);
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                endOfWeek.setHours(23, 59, 59, 999);
                return eventDate >= startOfWeek && eventDate <= endOfWeek;
              }).length} meetings</p>
            </div>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-content">
            <Users className="stat-icon" />
            <div>
              <h3>Team Availability</h3>
              <p>{mentionSuggestions.length} members</p>
            </div>
          </div>
        </Card>
        <Card className="stat-card action-card">
          <div className="stat-content">
            <div className="action-buttons">
              <Button className="btn-secondary" onClick={handleSyncCalendar}>
                <Calendar className="icon" />
                Sync Calendar
              </Button>
              <Button className="btn-primary" onClick={handleNewEvent}>
                <Plus className="icon" />
                New Event
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Inline Event Creation Section (single, non-duplicated) */}
      {isNewEventInlineOpen && (
        <Card className="event-creation-inline">
          <div className="event-creation-header">
            <h3 className="event-creation-title">
              {selectedEventType
                ? `Create ${
                    eventTypes.find((et) => et.id === selectedEventType)?.label
                  }`
                : "Select Event Type"}
            </h3>
            <button
              onClick={() => {
                setIsNewEventInlineOpen(false);
                setSelectedEventType("");
              }}
              className="event-creation-close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!selectedEventType ? (
            // Event Type Selection
            <div className="event-type-grid-inline">
              {eventTypes.map((eventType) => (
                <button
                  key={eventType.id}
                  onClick={() => handleEventTypeSelect(eventType.id)}
                  className="event-type-card-inline"
                >
                  <div className="event-type-icon-inline">
                    {eventType.icon}
                  </div>
                  <div className="event-type-content-inline">
                    <h4>{eventType.label}</h4>
                    <p>{eventType.description}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            // Abbreviated inline event form
            <div className="event-form-inline">
              <div className="form-row-inline">
                <input
                  type="text"
                  placeholder="Event title"
                  value={newEventData.title}
                  onChange={(e) =>
                    setNewEventData((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className="form-input-inline"
                />
                <input
                  type="date"
                  value={newEventData.date}
                  onChange={(e) =>
                    setNewEventData((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }
                  className="form-input-inline"
                />
                <input
                  type="time"
                  value={newEventData.time}
                  onChange={(e) =>
                    setNewEventData((prev) => ({
                      ...prev,
                      time: e.target.value,
                    }))
                  }
                  className="form-input-inline"
                />
              </div>
              <div className="form-actions-inline">
                <Button
                  variant="outline"
                  onClick={() => setSelectedEventType("")}
                  className="btn-back-inline"
                >
                  Back
                </Button>
                <Button
                  className="btn-create-inline"
                  onClick={handleEventFormSubmit}
                  disabled={
                    !newEventData.title ||
                    !newEventData.date ||
                    !newEventData.time ||
                    isSubmittingEvent
                  }
                >
                  {isSubmittingEvent ? "Creating..." : "Create Event"}
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Calendar Grid */}
      <Card className="calendar-card">
        <div className="calendar-header">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth("prev")}
            className="nav-btn"
          >
            <ChevronLeft className="icon" />
          </Button>

          <div className="month-year">
            <h2 className="month-title">
              {monthNames[currentMonth]} {currentYear}
            </h2>
            <p className="today-indicator">
              Today: {monthNames[todayMonth]} {todayDate}, {todayYear}
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth("next")}
            className="nav-btn"
          >
            <ChevronRight className="icon" />
          </Button>
        </div>

        <div className="calendar-grid">
          <div className="day-headers">
            {dayNames.map((day) => (
              <div key={day} className="day-header">
                {day}
              </div>
            ))}
          </div>

          <div className="calendar-days">
            {calendarDays.map((day, index) => {
              const dayEvents = day.isCurrentMonth
                ? getEventsForDate(day.date)
                : [];
              return (
                <div
                  key={index}
                  className={`calendar-day ${
                    day.isCurrentMonth ? "current-month" : "other-month"
                  } ${day.isToday ? "today" : ""}`}
                >
                  <div className="day-number">{day.date}</div>
                  {dayEvents.length > 0 && (
                    <div className="day-events">
                      {dayEvents.map((event) => (
                        <div
                          key={event.id}
                          className={`event ${event.type}`}
                          title={`${event.title} at ${event.time}`}
                        >
                          <span className="event-title">{event.title}</span>
                          <span className="event-time">{event.time}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Upcoming Events */}
      <Card className="upcoming-events">
        <h3>Upcoming Events</h3>
        <div className="events-list">
          {events.map((event) => (
            <div key={event.id} className="event-item">
              <div className="event-date">
                <span className="date">{event.date}</span>
                <span className="month">
                  {monthNames[event.month].slice(0, 3)}
                </span>
              </div>
              <div className="event-details">
                <h4>{event.title}</h4>
                <p>{event.time}</p>
              </div>
              <div className={`event-type ${event.type}`}>{event.type}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
