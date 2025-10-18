import { NextRequest, NextResponse } from 'next/server';
import { CalendarEvent } from '@/lib/calendar/providers';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// Mock calendar events - replace with actual calendar API calls
const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Demo with Acme Corp',
    description: 'Product demonstration for potential customer',
    start: '2024-10-18T10:00:00.000Z',
    end: '2024-10-18T11:00:00.000Z',
    attendees: [
      { email: 'john@acmecorp.com', name: 'John Smith', status: 'accepted' },
      { email: 'sales@ghostcrm.com', name: 'Sales Rep', status: 'accepted' }
    ],
    location: 'Virtual Meeting',
    meetingUrl: 'https://meet.google.com/abc-defg-hij',
    isAllDay: false,
    source: {
      providerId: 'google_calendar',
      externalId: 'google_event_123'
    },
    crmData: {
      leadId: 'lead_456',
      type: 'demo'
    }
  },
  {
    id: '2',
    title: 'Follow-up Call - TechStart Inc',
    description: 'Weekly check-in call',
    start: '2024-10-18T14:00:00.000Z',
    end: '2024-10-18T14:30:00.000Z',
    attendees: [
      { email: 'sarah@techstart.com', name: 'Sarah Johnson', status: 'pending' }
    ],
    isAllDay: false,
    recurring: {
      frequency: 'weekly',
      interval: 1,
      endDate: '2024-12-18T14:30:00.000Z'
    },
    source: {
      providerId: 'outlook_calendar',
      externalId: 'outlook_event_789'
    },
    crmData: {
      dealId: 'deal_123',
      type: 'follow_up'
    }
  },
  {
    id: '3',
    title: 'Inventory Review',
    description: 'Monthly inventory audit and planning',
    start: '2024-10-19T09:00:00.000Z',
    end: '2024-10-19T10:30:00.000Z',
    isAllDay: false,
    source: {
      providerId: 'google_calendar',
      externalId: 'google_event_456'
    },
    crmData: {
      type: 'meeting'
    }
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');
    const type = searchParams.get('type');
    const leadId = searchParams.get('leadId');
    const dealId = searchParams.get('dealId');

    let filteredEvents = [...mockEvents];

    // Filter by date range
    if (startDate) {
      filteredEvents = filteredEvents.filter(event => 
        new Date(event.start) >= new Date(startDate)
      );
    }
    if (endDate) {
      filteredEvents = filteredEvents.filter(event => 
        new Date(event.end) <= new Date(endDate)
      );
    }

    // Filter by type
    if (type) {
      filteredEvents = filteredEvents.filter(event => 
        event.crmData?.type === type
      );
    }

    // Filter by lead or deal
    if (leadId) {
      filteredEvents = filteredEvents.filter(event => 
        event.crmData?.leadId === leadId
      );
    }
    if (dealId) {
      filteredEvents = filteredEvents.filter(event => 
        event.crmData?.dealId === dealId
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        events: filteredEvents,
        count: filteredEvents.length,
        upcomingToday: filteredEvents.filter(event => {
          const eventDate = new Date(event.start);
          const today = new Date();
          return eventDate.toDateString() === today.toDateString() && 
                 eventDate > today;
        }).length
      }
    });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, event } = body;

    switch (action) {
      case 'create':
        const newEvent: CalendarEvent = {
          id: `event_${Date.now()}`,
          title: event.title || 'Untitled Event',
          description: event.description || '',
          start: event.start,
          end: event.end,
          attendees: event.attendees || [],
          location: event.location,
          meetingUrl: event.meetingUrl,
          isAllDay: event.isAllDay || false,
          recurring: event.recurring,
          source: {
            providerId: event.providerId || 'google_calendar',
            externalId: `external_${Date.now()}`
          },
          crmData: event.crmData
        };

        mockEvents.push(newEvent);

        return NextResponse.json({
          success: true,
          message: 'Event created successfully',
          data: newEvent
        });

      case 'update':
        const eventIndex = mockEvents.findIndex(e => e.id === event.id);
        if (eventIndex === -1) {
          return NextResponse.json(
            { success: false, error: 'Event not found' },
            { status: 404 }
          );
        }

        mockEvents[eventIndex] = { ...mockEvents[eventIndex], ...event };

        return NextResponse.json({
          success: true,
          message: 'Event updated successfully',
          data: mockEvents[eventIndex]
        });

      case 'delete':
        const deleteIndex = mockEvents.findIndex(e => e.id === event.id);
        if (deleteIndex === -1) {
          return NextResponse.json(
            { success: false, error: 'Event not found' },
            { status: 404 }
          );
        }

        const deletedEvent = mockEvents.splice(deleteIndex, 1)[0];

        return NextResponse.json({
          success: true,
          message: 'Event deleted successfully',
          data: deletedEvent
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in calendar events API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}