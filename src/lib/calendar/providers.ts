// Calendar Provider Configuration System
// Supports multiple calendar APIs that clients can choose from

export interface CalendarProvider {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon: string;
  authType: 'oauth2' | 'api_key' | 'basic_auth';
  isPopular: boolean;
  capabilities: {
    read: boolean;
    write: boolean;
    webhooks: boolean;
    recurring: boolean;
  };
}

export const CALENDAR_PROVIDERS: CalendarProvider[] = [
  {
    id: 'google_calendar',
    name: 'Google Calendar',
    displayName: 'Google Calendar',
    description: 'Integrate with Google Calendar for seamless scheduling',
    icon: '📅',
    authType: 'oauth2',
    isPopular: true,
    capabilities: {
      read: true,
      write: true,
      webhooks: true,
      recurring: true,
    }
  },
  {
    id: 'outlook_calendar',
    name: 'Microsoft Outlook',
    displayName: 'Outlook Calendar',
    description: 'Connect with Microsoft Outlook and Office 365 calendars',
    icon: '📆',
    authType: 'oauth2',
    isPopular: true,
    capabilities: {
      read: true,
      write: true,
      webhooks: true,
      recurring: true,
    }
  },
  {
    id: 'apple_calendar',
    name: 'Apple Calendar',
    displayName: 'Apple Calendar (iCloud)',
    description: 'Sync with Apple Calendar via iCloud',
    icon: '🍎',
    authType: 'basic_auth',
    isPopular: true,
    capabilities: {
      read: true,
      write: true,
      webhooks: false,
      recurring: true,
    }
  },
  {
    id: 'calendly',
    name: 'Calendly',
    displayName: 'Calendly',
    description: 'Import appointments and availability from Calendly',
    icon: '🗓️',
    authType: 'api_key',
    isPopular: true,
    capabilities: {
      read: true,
      write: false,
      webhooks: true,
      recurring: false,
    }
  },
  {
    id: 'zoom_calendar',
    name: 'Zoom',
    displayName: 'Zoom Meetings',
    description: 'Schedule and manage Zoom meetings',
    icon: '💻',
    authType: 'oauth2',
    isPopular: false,
    capabilities: {
      read: true,
      write: true,
      webhooks: true,
      recurring: true,
    }
  },
  {
    id: 'teams_calendar',
    name: 'Microsoft Teams',
    displayName: 'Microsoft Teams',
    description: 'Schedule Teams meetings and sync with Teams calendar',
    icon: '🎯',
    authType: 'oauth2',
    isPopular: false,
    capabilities: {
      read: true,
      write: true,
      webhooks: true,
      recurring: true,
    }
  },
  {
    id: 'caldav',
    name: 'CalDAV',
    displayName: 'CalDAV (Generic)',
    description: 'Connect to any CalDAV-compatible calendar service',
    icon: '🔗',
    authType: 'basic_auth',
    isPopular: false,
    capabilities: {
      read: true,
      write: true,
      webhooks: false,
      recurring: true,
    }
  }
];

export interface CalendarConfig {
  providerId: string;
  credentials: {
    [key: string]: string;
  };
  settings: {
    syncDirection: 'read_only' | 'write_only' | 'bidirectional';
    defaultDuration: number; // minutes
    autoCreateMeetings: boolean;
    timezone: string;
    businessHours: {
      start: string; // "09:00"
      end: string;   // "17:00"
      days: number[]; // [1,2,3,4,5] for Mon-Fri
    };
  };
  isActive: boolean;
  lastSync?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: string; // ISO date string
  end: string;   // ISO date string
  attendees?: {
    email: string;
    name?: string;
    status: 'pending' | 'accepted' | 'declined';
  }[];
  location?: string;
  meetingUrl?: string;
  isAllDay: boolean;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: string;
  };
  source: {
    providerId: string;
    externalId: string;
  };
  crmData?: {
    leadId?: string;
    dealId?: string;
    contactId?: string;
    type: 'appointment' | 'follow_up' | 'demo' | 'meeting' | 'call';
  };
}

// Utility functions for calendar management
export class CalendarManager {
  static getProvider(providerId: string): CalendarProvider | undefined {
    return CALENDAR_PROVIDERS.find(p => p.id === providerId);
  }

  static getPopularProviders(): CalendarProvider[] {
    return CALENDAR_PROVIDERS.filter(p => p.isPopular);
  }

  static async syncCalendar(config: CalendarConfig): Promise<CalendarEvent[]> {
    // This would implement the actual sync logic for each provider
    // For now, return mock data
    return [];
  }

  static async createEvent(config: CalendarConfig, event: Partial<CalendarEvent>): Promise<CalendarEvent | null> {
    // This would implement event creation for each provider
    return null;
  }

  static async updateEvent(config: CalendarConfig, eventId: string, updates: Partial<CalendarEvent>): Promise<boolean> {
    // This would implement event updates for each provider
    return false;
  }

  static async deleteEvent(config: CalendarConfig, eventId: string): Promise<boolean> {
    // This would implement event deletion for each provider
    return false;
  }
}