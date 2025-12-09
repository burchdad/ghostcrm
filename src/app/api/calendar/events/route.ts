import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/utils/supabase/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  date: number;
  month: number;
  year: number;
  time: string;
  endTime?: string;
  type: string;
  attendees: string[];
  location?: string;
  isAllDay: boolean;
  createdBy: string;
  tenantId: string;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month') || '0');
    const year = parseInt(searchParams.get('year') || '0');
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: 'Tenant ID required' },
        { status: 400 }
      );
    }

    // Get user for organization check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's organization
    const { data: userOrg, error: orgError } = await supabase
      .from('user_organizations')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (orgError || !userOrg) {
      return NextResponse.json(
        { success: false, error: 'Organization access required' },
        { status: 403 }
      );
    }

    // Build date filters for the specific month/year if provided
    let query = supabase
      .from('calendar_events')
      .select('*')
      .eq('organization_id', userOrg.organization_id)
      .order('start_time', { ascending: true });

    // Filter by month/year if provided
    if (month && year) {
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0, 23, 59, 59);
      
      query = query
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString());
    }

    const { data: events, error } = await query;

    if (error) {
      console.error('Error fetching calendar events:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch calendar events' },
        { status: 500 }
      );
    }

    // Transform database events to frontend format
    const transformedEvents: CalendarEvent[] = (events || []).map(event => {
      const startDate = new Date(event.start_time);
      const endDate = event.end_time ? new Date(event.end_time) : null;
      
      return {
        id: event.id,
        title: event.title,
        description: event.description,
        date: startDate.getDate(),
        month: startDate.getMonth(),
        year: startDate.getFullYear(),
        time: startDate.toTimeString().slice(0, 5), // HH:MM format
        endTime: endDate ? endDate.toTimeString().slice(0, 5) : undefined,
        type: event.type || 'meeting',
        attendees: [], // TODO: Implement attendees relationship
        location: null, // TODO: Add location field to schema
        isAllDay: false, // TODO: Calculate from start/end times
        createdBy: event.user_id || '',
        tenantId: userOrg.organization_id
      };
    });

    // Calculate today's events for statistics
    const today = new Date();
    const todayEvents = transformedEvents.filter(event => 
      event.date === today.getDate() && 
      event.month === today.getMonth() && 
      event.year === today.getFullYear()
    );

    // Calculate this week's events
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const thisWeekEvents = transformedEvents.filter(event => {
      const eventDate = new Date(event.year, event.month, event.date);
      return eventDate >= startOfWeek && eventDate <= endOfWeek;
    });

    return NextResponse.json({
      success: true,
      data: {
        events: transformedEvents,
        count: transformedEvents.length,
        todayCount: todayEvents.length,
        weekCount: thisWeekEvents.length
      }
    });

  } catch (error) {
    console.error('Calendar events API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    const eventData = await request.json();

    // Get user for organization check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's organization
    const { data: userOrg, error: orgError } = await supabase
      .from('user_organizations')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (orgError || !userOrg) {
      return NextResponse.json(
        { success: false, error: 'Organization access required' },
        { status: 403 }
      );
    }

    // Convert frontend event data to database format
    const startDateTime = new Date(`${eventData.date}T${eventData.time}`);
    const endDateTime = eventData.endTime ? 
      new Date(`${eventData.date}T${eventData.endTime}`) : 
      new Date(startDateTime.getTime() + 60 * 60 * 1000); // Default 1 hour

    const dbEvent = {
      organization_id: userOrg.organization_id,
      user_id: user.id,
      title: eventData.title,
      description: eventData.description || null,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      type: eventData.type || 'meeting',
      customer_name: null, // TODO: Extract from attendees or add field
      status: 'scheduled'
    };

    const { data: newEvent, error } = await supabase
      .from('calendar_events')
      .insert(dbEvent)
      .select()
      .single();

    if (error) {
      console.error('Error creating calendar event:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create calendar event' },
        { status: 500 }
      );
    }

    // Transform back to frontend format
    const startDate = new Date(newEvent.start_time);
    const endDate = new Date(newEvent.end_time);
    
    const transformedEvent: CalendarEvent = {
      id: newEvent.id,
      title: newEvent.title,
      description: newEvent.description,
      date: startDate.getDate(),
      month: startDate.getMonth(),
      year: startDate.getFullYear(),
      time: startDate.toTimeString().slice(0, 5),
      endTime: endDate.toTimeString().slice(0, 5),
      type: newEvent.type || 'meeting',
      attendees: [],
      location: null,
      isAllDay: false,
      createdBy: newEvent.user_id || '',
      tenantId: userOrg.organization_id
    };

    return NextResponse.json({
      success: true,
      data: transformedEvent
    });

  } catch (error) {
    console.error('Calendar event creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    const { eventId, ...eventData } = await request.json();

    // Get user for organization check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's organization
    const { data: userOrg, error: orgError } = await supabase
      .from('user_organizations')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (orgError || !userOrg) {
      return NextResponse.json(
        { success: false, error: 'Organization access required' },
        { status: 403 }
      );
    }

    // Convert frontend event data to database format
    const updateData: any = {};
    
    if (eventData.title) updateData.title = eventData.title;
    if (eventData.description !== undefined) updateData.description = eventData.description;
    if (eventData.type) updateData.type = eventData.type;
    if (eventData.date && eventData.time) {
      updateData.start_time = new Date(`${eventData.date}T${eventData.time}`).toISOString();
    }
    if (eventData.endTime && eventData.date) {
      updateData.end_time = new Date(`${eventData.date}T${eventData.endTime}`).toISOString();
    }

    const { data: updatedEvent, error } = await supabase
      .from('calendar_events')
      .update(updateData)
      .eq('id', eventId)
      .eq('organization_id', userOrg.organization_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating calendar event:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update calendar event' },
        { status: 500 }
      );
    }

    // Transform back to frontend format
    const startDate = new Date(updatedEvent.start_time);
    const endDate = new Date(updatedEvent.end_time);
    
    const transformedEvent: CalendarEvent = {
      id: updatedEvent.id,
      title: updatedEvent.title,
      description: updatedEvent.description,
      date: startDate.getDate(),
      month: startDate.getMonth(),
      year: startDate.getFullYear(),
      time: startDate.toTimeString().slice(0, 5),
      endTime: endDate.toTimeString().slice(0, 5),
      type: updatedEvent.type || 'meeting',
      attendees: [],
      location: null,
      isAllDay: false,
      createdBy: updatedEvent.user_id || '',
      tenantId: userOrg.organization_id
    };

    return NextResponse.json({
      success: true,
      data: transformedEvent
    });

  } catch (error) {
    console.error('Calendar event update error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('id');

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: 'Event ID required' },
        { status: 400 }
      );
    }

    // Get user for organization check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's organization
    const { data: userOrg, error: orgError } = await supabase
      .from('user_organizations')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (orgError || !userOrg) {
      return NextResponse.json(
        { success: false, error: 'Organization access required' },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', eventId)
      .eq('organization_id', userOrg.organization_id);

    if (error) {
      console.error('Error deleting calendar event:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete calendar event' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully'
    });

  } catch (error) {
    console.error('Calendar event deletion error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}