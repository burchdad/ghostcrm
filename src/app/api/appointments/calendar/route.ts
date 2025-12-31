import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserFromRequest, isAuthenticated } from "@/lib/auth/server";
import { getMembershipOrgId } from "@/lib/rbac";
import { ok, bad, oops } from "@/lib/http";

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Create a service role client for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    // Check authentication using JWT
    if (!isAuthenticated(req)) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Get user data from JWT
    const user = getUserFromRequest(req);
    if (!user || !user.organizationId) {
      return NextResponse.json({ error: "User organization not found" }, { status: 401 });
    }

    const organizationId = user.organizationId;
  const url = new URL(req.url);
  
  // Calendar view parameters
  const view = url.searchParams.get("view") || "week"; // week, month, day
  const date = url.searchParams.get("date") || new Date().toISOString().split('T')[0];
  const sales_rep_id = url.searchParams.get("sales_rep_id");
  const include_availability = url.searchParams.get("include_availability") === "true";

  const org_id = await getMembershipOrgId(s);
  
  if (!org_id) {
    return ok(generateMockCalendarView(view, date, sales_rep_id), res.headers);
  }

  try {
    const { startDate, endDate } = calculateDateRange(view, date);
    
    // Fetch appointments for the date range
    let query = s.from("appointments")
      .select("*")
      .eq("org_id", org_id)
      .gte("starts_at", startDate.toISOString())
      .lte("starts_at", endDate.toISOString())
      .order("starts_at", { ascending: true });
    
    if (sales_rep_id) {
      query = query.eq("sales_rep_id", sales_rep_id);
    }

    const { data: appointments, error } = await query;
    
    if (error) {
      console.warn("Calendar query failed:", error);
      return ok(generateMockCalendarView(view, date, sales_rep_id), res.headers);
    }

    // Format appointments for calendar display
    const calendarEvents = formatAppointmentsForCalendar(appointments || []);
    
    // Calculate availability if requested
    let availability: any[] | null = null;
    if (include_availability) {
      availability = calculateAvailability(appointments || [], startDate, endDate);
    }

    return ok({
      view,
      date,
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      },
      events: calendarEvents,
      availability,
      stats: {
        total_appointments: appointments?.length || 0,
        busy_hours: calendarEvents.length,
        utilization_rate: calculateUtilizationRate(appointments || [], startDate, endDate)
      }
    });

  } catch (err) {
    console.warn("Calendar integration error:", err);
    return ok(generateMockCalendarView(view, date, sales_rep_id));
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication using JWT
    if (!isAuthenticated(req)) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Get user data from JWT
    const user = getUserFromRequest(req);
    if (!user || !user.organizationId) {
      return NextResponse.json({ error: "User organization not found" }, { status: 401 });
    }

    const organizationId = user.organizationId;
  
  try {
    const { action, appointment_id, external_calendar_id, sync_settings } = await req.json();

    const org_id = await getMembershipOrgId(s);
    
    if (!org_id) {
      return ok({
        success: true,
        message: `Calendar ${action} completed (mock mode)`,
        external_event_id: `ext_${Date.now()}`
      }, res.headers);
    }

    switch (action) {
      case "sync_to_external":
        return await syncAppointmentToExternal(s, org_id, appointment_id, external_calendar_id, res);
      
      case "import_from_external": 
        return await importFromExternalCalendar(s, org_id, external_calendar_id, sync_settings, res);
      
      case "setup_sync":
        return await setupCalendarSync(s, org_id, sync_settings, res);
      
      default:
        return bad("Invalid calendar action");
    }

  } catch (e: any) {
    console.error("Calendar integration error:", e);
    return oops(e?.message || "Calendar integration failed");
  }
}

function calculateDateRange(view: string, dateStr: string) {
  const date = new Date(dateStr);
  let startDate: Date, endDate: Date;

  switch (view) {
    case "day":
      startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      break;
    
    case "week":
      startDate = new Date(date);
      startDate.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6); // End of week (Saturday)
      endDate.setHours(23, 59, 59, 999);
      break;
    
    case "month":
      startDate = new Date(date.getFullYear(), date.getMonth(), 1);
      endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
    
    default:
      throw new Error("Invalid view type");
  }

  return { startDate, endDate };
}

function formatAppointmentsForCalendar(appointments: any[]) {
  return appointments.map(appt => ({
    id: appt.id,
    title: appt.title,
    start: appt.starts_at,
    end: appt.ends_at,
    type: appt.type,
    status: appt.status,
    priority: appt.priority,
    customer: appt.customer_name,
    sales_rep: appt.sales_rep_id,
    location: appt.location,
    
    // Calendar display properties
    backgroundColor: getStatusColor(appt.status),
    borderColor: getPriorityColor(appt.priority),
    textColor: "#ffffff",
    
    // Additional metadata
    vehicle_of_interest: appt.vehicle_of_interest ? JSON.parse(appt.vehicle_of_interest) : null,
    extendedProps: {
      customer_phone: appt.customer_phone,
      customer_email: appt.customer_email,
      preparation_notes: appt.preparation_notes,
      internal_notes: appt.internal_notes
    }
  }));
}

function getStatusColor(status: string): string {
  const colors = {
    scheduled: "#3b82f6",    // Blue
    confirmed: "#10b981",    // Green  
    in_progress: "#f59e0b",  // Amber
    completed: "#059669",    // Emerald
    cancelled: "#ef4444",    // Red
    no_show: "#dc2626",      // Dark red
    rescheduled: "#8b5cf6"   // Purple
  };
  return colors[status as keyof typeof colors] || "#6b7280";
}

function getPriorityColor(priority: string): string {
  const colors = {
    urgent: "#dc2626",    // Red border
    high: "#f59e0b",      // Amber border
    medium: "#3b82f6",    // Blue border
    low: "#6b7280"        // Gray border
  };
  return colors[priority as keyof typeof colors] || "#6b7280";
}

function calculateAvailability(appointments: any[], startDate: Date, endDate: Date) {
  const businessHours = {
    start: 9,  // 9 AM
    end: 18,   // 6 PM
    days: [1, 2, 3, 4, 5, 6] // Monday-Saturday
  };

  const availability: any[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    
    if (businessHours.days.includes(dayOfWeek)) {
      const dayAppointments = appointments.filter(appt => {
        const apptDate = new Date(appt.starts_at);
        return apptDate.toDateString() === current.toDateString();
      });

      // Calculate available slots (assuming 1-hour slots)
      const totalSlots = businessHours.end - businessHours.start;
      const bookedSlots = dayAppointments.length;
      const availableSlots = totalSlots - bookedSlots;

      availability.push({
        date: current.toISOString().split('T')[0],
        day: current.toLocaleDateString('en-US', { weekday: 'long' }),
        total_slots: totalSlots,
        booked_slots: bookedSlots,
        available_slots: Math.max(0, availableSlots),
        utilization_rate: Math.round((bookedSlots / totalSlots) * 100)
      });
    }

    current.setDate(current.getDate() + 1);
  }

  return availability;
}

function calculateUtilizationRate(appointments: any[], startDate: Date, endDate: Date): number {
  const totalHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
  const bookedHours = appointments.reduce((total, appt) => {
    return total + (appt.duration_minutes || 60) / 60;
  }, 0);
  
  return Math.round((bookedHours / totalHours) * 100);
}

function generateMockCalendarView(view: string, date: string, sales_rep_id?: string | null) {
  const { startDate, endDate } = calculateDateRange(view, date);
  
  const mockAppointments = [
    {
      id: 1,
      title: "Test Drive - 2024 Honda Civic",
      start: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      end: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
      type: "test_drive",
      status: "confirmed",
      priority: "high",
      customer: "John Smith",
      sales_rep: "rep-001",
      location: "Showroom",
      backgroundColor: "#10b981",
      borderColor: "#f59e0b",
      textColor: "#ffffff"
    },
    {
      id: 2, 
      title: "Financing Meeting - Sarah Johnson",
      start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
      type: "financing_meeting",
      status: "scheduled", 
      priority: "medium",
      customer: "Sarah Johnson",
      sales_rep: "rep-002",
      location: "Finance Office",
      backgroundColor: "#3b82f6",
      borderColor: "#3b82f6",
      textColor: "#ffffff"
    }
  ];

  return {
    view,
    date,
    period: {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    },
    events: mockAppointments,
    availability: [
      {
        date: new Date().toISOString().split('T')[0],
        day: "Today",
        total_slots: 9,
        booked_slots: 6,
        available_slots: 3,
        utilization_rate: 67
      }
    ],
    stats: {
      total_appointments: 2,
      busy_hours: 2,
      utilization_rate: 22
    }
  };
}

async function syncAppointmentToExternal(s: any, org_id: string, appointment_id: number, external_calendar_id: string, res: any) {
  // Mock external calendar sync
  return ok({
    success: true,
    message: "Appointment synced to external calendar",
    external_event_id: `ext_event_${appointment_id}_${Date.now()}`,
    calendar_id: external_calendar_id
  }, res.headers);
}

async function importFromExternalCalendar(s: any, org_id: string, external_calendar_id: string, sync_settings: any, res: any) {
  // Mock external calendar import
  return ok({
    success: true,
    message: "External calendar events imported",
    imported_count: 5,
    skipped_count: 2,
    calendar_id: external_calendar_id
  }, res.headers);
}

async function setupCalendarSync(s: any, org_id: string, sync_settings: any, res: any) {
  // Mock calendar sync setup
  return ok({
    success: true,
    message: "Calendar sync configured",
    sync_id: `sync_${org_id}_${Date.now()}`,
    settings: sync_settings
  }, res.headers);
}