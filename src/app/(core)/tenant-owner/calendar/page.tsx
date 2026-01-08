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
  Settings,
  Palette,
  Eye,
  Save,
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

  // Calendar view mode state
  const [viewMode, setViewMode] = useState<'monthly' | 'bi-weekly' | 'weekly' | 'daily'>('monthly');
  
  // View-specific date tracking
  const [viewDate, setViewDate] = useState(new Date()); // For non-monthly views
  
  // Calendar settings modal state
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [calendarSettings, setCalendarSettings] = useState({
    colors: {
      primary: '#3b82f6',
      secondary: '#10b981',
      accent: '#f59e0b',
      background: '#f8fafc',
      text: '#1f2937',
      border: '#e5e7eb',
      todayHighlight: '#ef4444',
      eventColors: {
        meeting: '#3b82f6',
        call: '#10b981',
        appointment: '#f59e0b',
        'test-drive': '#8b5cf6',
        demo: '#06b6d4',
        review: '#f97316',
        todo: '#6b7280',
        other: '#ec4899'
      }
    },
    preferences: {
      showWeekNumbers: false,
      startWeek: 'sunday' as 'sunday' | 'monday',
      timeFormat: '12h' as '12h' | '24h',
      showAllDayEvents: true,
      compactView: false,
      showEventIcons: true
    }
  });

  // Applied settings state (what's currently active in the UI)
  const [appliedSettings, setAppliedSettings] = useState(calendarSettings);
  const [hasUnappliedChanges, setHasUnappliedChanges] = useState(false);

  // Apply CSS variables to document root
  const applyCSSVariables = (settings: typeof calendarSettings) => {
    const root = document.documentElement;
    
    // Apply color variables
    root.style.setProperty('--calendar-primary', settings.colors.primary);
    root.style.setProperty('--calendar-secondary', settings.colors.secondary);
    root.style.setProperty('--calendar-accent', settings.colors.accent);
    root.style.setProperty('--calendar-background', settings.colors.background);
    root.style.setProperty('--calendar-text', settings.colors.text);
    root.style.setProperty('--calendar-border', settings.colors.border);
    root.style.setProperty('--calendar-today', settings.colors.todayHighlight);
    
    // Apply event color variables
    Object.entries(settings.colors.eventColors).forEach(([eventType, color]) => {
      root.style.setProperty(`--calendar-event-${eventType}`, color);
    });
    
    // Apply preference-based classes to calendar container
    const calendarContainer = document.querySelector('.calendar-card');
    if (calendarContainer) {
      calendarContainer.classList.toggle('compact-view', settings.preferences.compactView);
      calendarContainer.classList.toggle('hide-event-icons', !settings.preferences.showEventIcons);
      calendarContainer.classList.toggle('hide-all-day-events', !settings.preferences.showAllDayEvents);
      calendarContainer.classList.toggle('show-week-numbers', settings.preferences.showWeekNumbers);
    }
  };

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('calendar-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setCalendarSettings(parsed);
        setAppliedSettings(parsed);
        applyCSSVariables(parsed);
      } catch (error) {
        console.error('Error loading calendar settings:', error);
      }
    } else {
      // Apply default settings on first load
      applyCSSVariables(calendarSettings);
      setAppliedSettings(calendarSettings);
    }
  }, []);

  // Watch for changes in calendar settings vs applied settings
  useEffect(() => {
    const hasChanges = JSON.stringify(calendarSettings) !== JSON.stringify(appliedSettings);
    setHasUnappliedChanges(hasChanges);
  }, [calendarSettings, appliedSettings]);

  // Apply settings to UI (preview changes)
  const applySettings = () => {
    setAppliedSettings(calendarSettings);
    applyCSSVariables(calendarSettings);
    setHasUnappliedChanges(false);
    toast({
      title: "Settings Applied",
      description: "Calendar settings have been applied. Click 'Save Settings' to make them permanent."
    });
  };

  // Save settings to localStorage
  const saveSettings = () => {
    try {
      localStorage.setItem('calendar-settings', JSON.stringify(appliedSettings));
      toast({
        title: "Settings Saved",
        description: "Calendar settings have been saved successfully."
      });
      setIsSettingsModalOpen(false);
    } catch (error) {
      console.error('Error saving calendar settings:', error);
      toast({
        title: "Error",
        description: "Failed to save calendar settings. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Reset settings to applied state (cancel changes)
  const cancelSettings = () => {
    setCalendarSettings(appliedSettings);
    setHasUnappliedChanges(false);
    setIsSettingsModalOpen(false);
  };

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
    if (!user?.organizationId) {
      console.log("No organization ID available for loading events");
      return;
    }
    
    try {
      // Load calendar events from database using organizationId
      const response = await fetch(`/api/calendar/events?month=${currentMonth}&year=${currentYear}&organizationId=${user.organizationId}`);
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

  // Helper function to get events for a specific date
  const getEventsForDate = (date: number, month?: number, year?: number) => {
    const targetMonth = month !== undefined ? month : currentMonth;
    const targetYear = year !== undefined ? year : currentYear;
    
    return events.filter(
      (event) =>
        event.date === date &&
        event.month === targetMonth &&
        event.year === targetYear
    );
  };

  // Helper function to get week dates
  const getWeekDates = (startDate: Date): Date[] => {
    const week: Date[] = [];
    const start = new Date(startDate);
    // Get to Sunday of the week
    start.setDate(start.getDate() - start.getDay());
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      week.push(date);
    }
    return week;
  };

  // Helper function to get bi-weekly dates (14 days)
  const getBiWeeklyDates = (startDate: Date): Date[] => {
    const biWeek: Date[] = [];
    const start = new Date(startDate);
    // Get to Sunday of the current week
    start.setDate(start.getDate() - start.getDay());
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      biWeek.push(date);
    }
    return biWeek;
  };

  // Helper function to get hours for daily view
  const getDayHours = () => {
    const hours: Array<{hour24: number; hour12: string; display: string}> = [];
    for (let i = 0; i < 24; i++) {
      const hour12 = i === 0 ? 12 : i > 12 ? i - 12 : i;
      const ampm = i < 12 ? 'AM' : 'PM';
      hours.push({
        hour24: i,
        hour12: `${hour12}:00 ${ampm}`,
        display: appliedSettings.preferences.timeFormat === '24h' ? `${i.toString().padStart(2, '0')}:00` : `${hour12}:00 ${ampm}`
      });
    }
    return hours;
  };

  // Get events for a specific date and hour
  const getEventsForDateTime = (date: Date, hour?: number) => {
    return events.filter((event) => {
      const eventMatches = event.date === date.getDate() &&
                          event.month === date.getMonth() &&
                          event.year === date.getFullYear();
      
      if (!eventMatches) return false;
      
      if (hour !== undefined && !event.isAllDay) {
        const eventHour = parseInt(event.time.split(':')[0]);
        const eventAmPm = event.time.toLowerCase().includes('pm');
        const event24Hour = eventAmPm && eventHour !== 12 ? eventHour + 12 : 
                           !eventAmPm && eventHour === 12 ? 0 : eventHour;
        return event24Hour === hour;
      }
      
      return eventMatches;
    });
  };

  // Navigation functions
  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === "next" ? 1 : -1));
    setCurrentDate(newDate);
  };

  const navigateView = (direction: "prev" | "next") => {
    const newDate = new Date(viewDate);
    
    switch (viewMode) {
      case 'monthly':
        newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
        setCurrentDate(newDate);
        break;
      case 'bi-weekly':
        newDate.setDate(newDate.getDate() + (direction === "next" ? 14 : -14));
        break;
      case 'weekly':
        newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
        break;
      case 'daily':
        newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
        break;
    }
    
    setViewDate(newDate);
    
    // Update currentDate for monthly view
    if (viewMode === 'monthly') {
      setCurrentDate(newDate);
    }
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
      // Validate required fields
      if (!newEventData.title.trim() || !newEventData.date || !newEventData.time) {
        throw new Error('Please fill in all required fields');
      }

      // Convert date and time to proper ISO format for API
      const eventDate = new Date(newEventData.date);
      const [hours, minutes] = newEventData.time.split(':');
      const startDateTime = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), parseInt(hours), parseInt(minutes));
      
      let endDateTime = startDateTime;
      if (newEventData.endTime) {
        const [endHours, endMinutes] = newEventData.endTime.split(':');
        endDateTime = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), parseInt(endHours), parseInt(endMinutes));
      } else {
        // Default to 1 hour if no end time specified
        endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);
      }

      const eventPayload = {
        title: newEventData.title,
        description: newEventData.description,
        date: newEventData.date,
        time: newEventData.time,
        endTime: newEventData.endTime || undefined,
        type: newEventData.type,
        attendees: newEventData.attendees,
        location: newEventData.location,
        isAllDay: newEventData.isAllDay
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

      // Refresh events to get the latest data
      await loadEvents();

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
    <div className="tenant-owner-calendar-page">
      {/* Analytics Cards Grid with AI Assistant */}
      <div className="tenant-owner-calendar-header">
        <div className="tenant-owner-calendar-header-content">
          {/* Metrics in 4-Column Header Layout */}
          <div className="tenant-owner-calendar-analytics-grid-header">
            <div className="tenant-owner-calendar-analytics-card today">
              <div className="tenant-owner-calendar-card-header">
                <div className="tenant-owner-calendar-card-title-row">
                  <span className="tenant-owner-calendar-card-label">TODAY'S EVENTS</span>
                  <span className="tenant-owner-calendar-card-value">{events.filter(event => {
                    const today = new Date();
                    return event.date === today.getDate() && 
                           event.month === today.getMonth() && 
                           event.year === today.getFullYear();
                  }).length}</span>
                </div>
                <div className="tenant-owner-calendar-card-icon today">
                  <Calendar />
                </div>
              </div>
              <div className="tenant-owner-calendar-card-trend">
                <Clock />
                scheduled
              </div>
            </div>

            <div className="tenant-owner-calendar-analytics-card week">
              <div className="tenant-owner-calendar-card-header">
                <div className="tenant-owner-calendar-card-title-row">
                  <span className="tenant-owner-calendar-card-label">THIS WEEK</span>
                  <span className="tenant-owner-calendar-card-value">{events.filter(event => {
                    const today = new Date();
                    const eventDate = new Date(event.year, event.month, event.date);
                    const startOfWeek = new Date(today);
                    startOfWeek.setDate(today.getDate() - today.getDay());
                    startOfWeek.setHours(0, 0, 0, 0);
                    const endOfWeek = new Date(startOfWeek);
                    endOfWeek.setDate(startOfWeek.getDate() + 6);
                    endOfWeek.setHours(23, 59, 59, 999);
                    return eventDate >= startOfWeek && eventDate <= endOfWeek;
                  }).length}</span>
                </div>
                <div className="tenant-owner-calendar-card-icon week">
                  <Clock />
                </div>
              </div>
              <div className="tenant-owner-calendar-card-trend">
                <Calendar />
                meetings
              </div>
            </div>

            <div className="tenant-owner-calendar-analytics-card availability">
              <div className="tenant-owner-calendar-card-header">
                <div className="tenant-owner-calendar-card-title-row">
                  <span className="tenant-owner-calendar-card-label">TEAM AVAILABILITY</span>
                  <span className="tenant-owner-calendar-card-value">{mentionSuggestions.length}</span>
                </div>
                <div className="tenant-owner-calendar-card-icon availability">
                  <Users />
                </div>
              </div>
              <div className="tenant-owner-calendar-card-trend">
                <Users />
                members
              </div>
            </div>

            <div className="tenant-owner-calendar-analytics-card actions">
              <div className="tenant-owner-calendar-card-header">
                <div className="tenant-owner-calendar-card-actions">
                  <Button 
                    className="calendar-action-btn primary"
                    onClick={handleNewEvent}
                  >
                    <Plus className="w-4 h-4" />
                    New Event
                  </Button>
                  <Button 
                    className="calendar-action-btn secondary"
                    onClick={handleSyncCalendar}
                  >
                    <Calendar className="w-4 h-4" />
                    Sync Calendar
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* AI Assistant Section */}
          <div className="tenant-owner-calendar-ai-insights-section">
            <PageAIAssistant 
              agentId="calendar" 
              pageTitle="Calendar Management"
              className="tenant-owner-calendar-ai-assistant"
            />
          </div>
        </div>
      </div>

      {/* Scrollable Content Container */}
      <div className="tenant-owner-calendar-content-wrapper">
        <div className="tenant-owner-calendar-content">

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
              <div className="calendar-navigation">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateView("prev")}
                  className="nav-btn"
                >
                  <ChevronLeft className="icon" />
                </Button>

                <div className="month-year">
                  <h2 className="month-title">
                    {viewMode === 'monthly' && `${monthNames[currentMonth]} ${currentYear}`}
                    {viewMode === 'bi-weekly' && `${monthNames[viewDate.getMonth()]} ${viewDate.getDate()}, ${viewDate.getFullYear()}`}
                    {viewMode === 'weekly' && `Week of ${monthNames[viewDate.getMonth()]} ${viewDate.getDate()}, ${viewDate.getFullYear()}`}
                    {viewMode === 'daily' && `${monthNames[viewDate.getMonth()]} ${viewDate.getDate()}, ${viewDate.getFullYear()}`}
                  </h2>
                  <p className="today-indicator">
                    Today: {monthNames[todayMonth]} {todayDate}, {todayYear}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateView("next")}
                  className="nav-btn"
                >
                  <ChevronRight className="icon" />
                </Button>
              </div>

              <div className="view-mode-buttons">
                <Button
                  variant={viewMode === 'monthly' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('monthly')}
                  className="view-btn"
                >
                  Monthly
                </Button>
                <Button
                  variant={viewMode === 'bi-weekly' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('bi-weekly')}
                  className="view-btn"
                >
                  Bi-Weekly
                </Button>
                <Button
                  variant={viewMode === 'weekly' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('weekly')}
                  className="view-btn"
                >
                  Weekly
                </Button>
                <Button
                  variant={viewMode === 'daily' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('daily')}
                  className="view-btn"
                >
                  Daily
                </Button>
                
                <div className="settings-divider"></div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSettingsModalOpen(true)}
                  className="settings-btn"
                  title="Calendar Settings"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className={`calendar-grid view-${viewMode}`}>
              {/* Monthly View */}
              {viewMode === 'monthly' && (
                <>
                  <div 
                    id="calendar-day-headers-grid"
                    className="day-headers"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(7, 1fr)',
                      gap: '0.5rem',
                      width: '100%',
                      marginBottom: '1rem',
                      minWidth: '100%',
                      maxWidth: 'none',
                      overflow: 'visible'
                    }}
                  >
                    {dayNames.map((day) => (
                      <div key={day} className="day-header">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div 
                    id="calendar-days-grid"
                    className="calendar-days"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(7, 1fr)',
                      gap: '0.5rem',
                      width: '100%',
                      minWidth: '100%',
                      maxWidth: 'none',
                      overflow: 'visible'
                    }}
                  >
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
                                  className={`event event-${event.type}`}
                                  title={`${event.title} at ${event.time}`}
                                >
                                  {appliedSettings.preferences.showEventIcons && (
                                    <span className="event-icon">
                                      {event.type === 'meeting' && '👥'}
                                      {event.type === 'call' && '📞'}
                                      {event.type === 'appointment' && '📅'}
                                      {event.type === 'test-drive' && '🚗'}
                                      {event.type === 'demo' && '🎯'}
                                      {event.type === 'review' && '⭐'}
                                      {event.type === 'todo' && '✅'}
                                      {event.type === 'other' && '📋'}
                                    </span>
                                  )}
                                  {event.title}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Bi-Weekly View */}
              {viewMode === 'bi-weekly' && (
                <>
                  <div className="biweekly-headers">
                    {dayNames.map((day) => (
                      <div key={day} className="day-header">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="biweekly-grid">
                    {getBiWeeklyDates(viewDate).map((date, index) => {
                      const dayEvents = getEventsForDateTime(date);
                      const isToday = date.toDateString() === today.toDateString();
                      return (
                        <div
                          key={index}
                          className={`calendar-day biweekly-day ${isToday ? "today" : ""}`}
                        >
                          <div className="day-number">
                            {date.getDate()}
                            <span className="month-indicator">
                              {date.getMonth() !== viewDate.getMonth() && monthNames[date.getMonth()].slice(0, 3)}
                            </span>
                          </div>
                          {dayEvents.length > 0 && (
                            <div className="day-events">
                              {dayEvents.map((event) => (
                                <div
                                  key={event.id}
                                  className={`event event-${event.type}`}
                                  title={`${event.title} at ${event.time}`}
                                >
                                  {appliedSettings.preferences.showEventIcons && (
                                    <span className="event-icon">
                                      {event.type === 'meeting' && '👥'}
                                      {event.type === 'call' && '📞'}
                                      {event.type === 'appointment' && '📅'}
                                      {event.type === 'test-drive' && '🚗'}
                                      {event.type === 'demo' && '🎯'}
                                      {event.type === 'review' && '⭐'}
                                      {event.type === 'todo' && '✅'}
                                      {event.type === 'other' && '📋'}
                                    </span>
                                  )}
                                  {event.title}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Weekly View */}
              {viewMode === 'weekly' && (
                <>
                  <div className="weekly-headers">
                    {dayNames.map((day) => (
                      <div key={day} className="day-header">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="weekly-grid">
                    {getWeekDates(viewDate).map((date, index) => {
                      const dayEvents = getEventsForDateTime(date);
                      const isToday = date.toDateString() === today.toDateString();
                      return (
                        <div
                          key={index}
                          className={`calendar-day weekly-day ${isToday ? "today" : ""}`}
                        >
                          <div className="day-number">
                            {date.getDate()}
                            <span className="month-indicator">
                              {date.getMonth() !== viewDate.getMonth() && monthNames[date.getMonth()].slice(0, 3)}
                            </span>
                          </div>
                          {dayEvents.length > 0 && (
                            <div className="day-events">
                              {dayEvents.map((event) => (
                                <div
                                  key={event.id}
                                  className={`event event-${event.type}`}
                                  title={`${event.title} at ${event.time}`}
                                >
                                  {appliedSettings.preferences.showEventIcons && (
                                    <span className="event-icon">
                                      {event.type === 'meeting' && '👥'}
                                      {event.type === 'call' && '📞'}
                                      {event.type === 'appointment' && '📅'}
                                      {event.type === 'test-drive' && '🚗'}
                                      {event.type === 'demo' && '🎯'}
                                      {event.type === 'review' && '⭐'}
                                      {event.type === 'todo' && '✅'}
                                      {event.type === 'other' && '📋'}
                                    </span>
                                  )}
                                  {event.title}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Daily View */}
              {viewMode === 'daily' && (
                <div className="daily-view">
                  <div className="daily-header">
                    <h3>{dayNames[viewDate.getDay()]}, {monthNames[viewDate.getMonth()]} {viewDate.getDate()}</h3>
                  </div>
                  <div className="daily-hours">
                    {getDayHours().map((hour) => {
                      const hourEvents = getEventsForDateTime(viewDate, hour.hour24);
                      return (
                        <div key={hour.hour24} className="hour-slot">
                          <div className="hour-label">{hour.display}</div>
                          <div className="hour-events">
                            {hourEvents.map((event) => (
                              <div
                                key={event.id}
                                className={`event event-${event.type} daily-event`}
                                title={`${event.title} - ${event.description || 'No description'}`}
                              >
                                {appliedSettings.preferences.showEventIcons && (
                                  <span className="event-icon">
                                    {event.type === 'meeting' && '👥'}
                                    {event.type === 'call' && '📞'}
                                    {event.type === 'appointment' && '📅'}
                                    {event.type === 'test-drive' && '🚗'}
                                    {event.type === 'demo' && '🎯'}
                                    {event.type === 'review' && '⭐'}
                                    {event.type === 'todo' && '✅'}
                                    {event.type === 'other' && '📋'}
                                  </span>
                                )}
                                <div className="event-content">
                                  <div className="event-title">{event.title}</div>
                                  <div className="event-time">{event.time}{event.endTime && ` - ${event.endTime}`}</div>
                                  {event.location && <div className="event-location">📍 {event.location}</div>}
                                </div>
                              </div>
                            ))}
                            {hourEvents.length === 0 && (
                              <div className="empty-hour"></div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
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
      </div>

      {/* Calendar Settings Modal */}
      {isSettingsModalOpen && (
        <div className="settings-modal-overlay" onClick={() => setIsSettingsModalOpen(false)}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="settings-modal-header">
              <h3 className="settings-modal-title">
                <Settings className="w-5 h-5" />
                Calendar Settings
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSettingsModalOpen(false)}
                className="close-btn"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="settings-modal-content">
              {/* Color Customization Section */}
              <div className="settings-section">
                <h4 className="settings-section-title">
                  <Palette className="w-4 h-4" />
                  Color Scheme
                </h4>
                
                <div className="color-grid">
                  <div className="color-item">
                    <label>Primary Color</label>
                    <div className="color-input-wrapper">
                      <div className="color-picker-container">
                        <input
                          type="color"
                          value={calendarSettings.colors.primary}
                          onChange={(e) => setCalendarSettings(prev => ({
                            ...prev,
                            colors: { ...prev.colors, primary: e.target.value }
                          }))}
                          className="color-input"
                          id="primary-color"
                        />
                        <div 
                          className="color-preview"
                          style={{ backgroundColor: calendarSettings.colors.primary }}
                          onClick={() => document.getElementById('primary-color')?.click()}
                        ></div>
                      </div>
                      <span className="color-value">{calendarSettings.colors.primary}</span>
                    </div>
                  </div>
                  
                  <div className="color-item">
                    <label>Success Color</label>
                    <div className="color-input-wrapper">
                      <div className="color-picker-container">
                        <input
                          type="color"
                          value={calendarSettings.colors.secondary}
                          onChange={(e) => setCalendarSettings(prev => ({
                            ...prev,
                            colors: { ...prev.colors, secondary: e.target.value }
                          }))}
                          className="color-input"
                          id="secondary-color"
                        />
                        <div 
                          className="color-preview"
                          style={{ backgroundColor: calendarSettings.colors.secondary }}
                          onClick={() => document.getElementById('secondary-color')?.click()}
                        ></div>
                      </div>
                      <span className="color-value">{calendarSettings.colors.secondary}</span>
                    </div>
                  </div>
                  
                  <div className="color-item">
                    <label>Warning Color</label>
                    <div className="color-input-wrapper">
                      <div className="color-picker-container">
                        <input
                          type="color"
                          value={calendarSettings.colors.accent}
                          onChange={(e) => setCalendarSettings(prev => ({
                            ...prev,
                            colors: { ...prev.colors, accent: e.target.value }
                          }))}
                          className="color-input"
                          id="accent-color"
                        />
                        <div 
                          className="color-preview"
                          style={{ backgroundColor: calendarSettings.colors.accent }}
                          onClick={() => document.getElementById('accent-color')?.click()}
                        ></div>
                      </div>
                      <span className="color-value">{calendarSettings.colors.accent}</span>
                    </div>
                  </div>
                  
                  <div className="color-item">
                    <label>Today Highlight</label>
                    <div className="color-input-wrapper">
                      <div className="color-picker-container">
                        <input
                          type="color"
                          value={calendarSettings.colors.todayHighlight}
                          onChange={(e) => setCalendarSettings(prev => ({
                            ...prev,
                            colors: { ...prev.colors, todayHighlight: e.target.value }
                          }))}
                          className="color-input"
                          id="today-color"
                        />
                        <div 
                          className="color-preview"
                          style={{ backgroundColor: calendarSettings.colors.todayHighlight }}
                          onClick={() => document.getElementById('today-color')?.click()}
                        ></div>
                      </div>
                      <span className="color-value">{calendarSettings.colors.todayHighlight}</span>
                    </div>
                  </div>
                </div>

                <h5 className="event-colors-title">Event Type Colors</h5>
                <div className="event-colors-grid">
                  {Object.entries(calendarSettings.colors.eventColors).map(([eventType, color]) => (
                    <div key={eventType} className="color-item">
                      <label>{eventType.charAt(0).toUpperCase() + eventType.slice(1)}</label>
                      <div className="color-input-wrapper">
                        <div className="color-picker-container">
                          <input
                            type="color"
                            value={color}
                            onChange={(e) => setCalendarSettings(prev => ({
                              ...prev,
                              colors: {
                                ...prev.colors,
                                eventColors: {
                                  ...prev.colors.eventColors,
                                  [eventType]: e.target.value
                                }
                              }
                            }))}
                            className="color-input"
                            id={`${eventType}-color`}
                          />
                          <div 
                            className="color-preview"
                            style={{ backgroundColor: color }}
                            onClick={() => document.getElementById(`${eventType}-color`)?.click()}
                          ></div>
                        </div>
                        <span className="color-value">{color}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Display Preferences Section */}
              <div className="settings-section">
                <h4 className="settings-section-title">
                  <Eye className="w-4 h-4" />
                  Display Preferences
                </h4>
                
                <div className="preferences-grid">
                  <div className="preference-item">
                    <label className="preference-label">
                      <input
                        type="checkbox"
                        checked={calendarSettings.preferences.showWeekNumbers}
                        onChange={(e) => setCalendarSettings(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, showWeekNumbers: e.target.checked }
                        }))}
                        className="preference-checkbox"
                      />
                      Show Week Numbers
                    </label>
                  </div>
                  
                  <div className="preference-item">
                    <label className="preference-label">
                      <input
                        type="checkbox"
                        checked={calendarSettings.preferences.showAllDayEvents}
                        onChange={(e) => setCalendarSettings(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, showAllDayEvents: e.target.checked }
                        }))}
                        className="preference-checkbox"
                      />
                      Show All-Day Events
                    </label>
                  </div>
                  
                  <div className="preference-item">
                    <label className="preference-label">
                      <input
                        type="checkbox"
                        checked={calendarSettings.preferences.compactView}
                        onChange={(e) => setCalendarSettings(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, compactView: e.target.checked }
                        }))}
                        className="preference-checkbox"
                      />
                      Compact View
                    </label>
                  </div>
                  
                  <div className="preference-item">
                    <label className="preference-label">
                      <input
                        type="checkbox"
                        checked={calendarSettings.preferences.showEventIcons}
                        onChange={(e) => setCalendarSettings(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, showEventIcons: e.target.checked }
                        }))}
                        className="preference-checkbox"
                      />
                      Show Event Icons
                    </label>
                  </div>
                  
                  <div className="preference-item">
                    <label>Week Starts On</label>
                    <select
                      value={calendarSettings.preferences.startWeek}
                      onChange={(e) => setCalendarSettings(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, startWeek: e.target.value as 'sunday' | 'monday' }
                      }))}
                      className="preference-select"
                    >
                      <option value="sunday">Sunday</option>
                      <option value="monday">Monday</option>
                    </select>
                  </div>
                  
                  <div className="preference-item">
                    <label>Time Format</label>
                    <select
                      value={calendarSettings.preferences.timeFormat}
                      onChange={(e) => setCalendarSettings(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, timeFormat: e.target.value as '12h' | '24h' }
                      }))}
                      className="preference-select"
                    >
                      <option value="12h">12 Hour (AM/PM)</option>
                      <option value="24h">24 Hour</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="settings-modal-footer">
              <div className="footer-left">
                {hasUnappliedChanges && (
                  <Button
                    onClick={applySettings}
                    className="apply-btn"
                    variant="outline"
                  >
                    Apply Preview
                  </Button>
                )}
              </div>
              
              <div className="footer-right">
                <Button
                  variant="outline"
                  onClick={cancelSettings}
                  className="cancel-btn"
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveSettings}
                  className="save-btn"
                  disabled={hasUnappliedChanges}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
