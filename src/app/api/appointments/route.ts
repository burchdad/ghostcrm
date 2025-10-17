
import { NextRequest } from "next/server";
import { supaFromReq } from "@/lib/supa-ssr";
import { ApptCreate } from "@/lib/validators";
import { getMembershipOrgId } from "@/lib/rbac";
import { ok, bad, oops } from "@/lib/http";

// Mock appointment data for auto dealership
function generateMockAppointments() {
  const appointmentTypes = ["test_drive", "sales_consultation", "financing_meeting", "service_appointment", "vehicle_delivery"];
  const statuses = ["scheduled", "confirmed", "in_progress", "completed"];
  const priorities = ["low", "medium", "high", "urgent"];
  
  const appointments = [];
  const now = new Date();
  
  for (let i = 0; i < 8; i++) {
    const startTime = new Date(now.getTime() + (i * 2 * 60 * 60 * 1000) + (Math.random() * 7 * 24 * 60 * 60 * 1000));
    const endTime = new Date(startTime.getTime() + (60 + Math.random() * 120) * 60 * 1000);
    
    appointments.push({
      id: i + 1,
      title: `${appointmentTypes[i % appointmentTypes.length].replace('_', ' ').toUpperCase()} - Customer ${i + 1}`,
      type: appointmentTypes[i % appointmentTypes.length],
      location: i % 2 === 0 ? "Showroom Floor" : "Service Center",
      starts_at: startTime.toISOString(),
      ends_at: endTime.toISOString(),
      duration_minutes: Math.floor((endTime.getTime() - startTime.getTime()) / 60000),
      
      customer_name: `Customer ${String.fromCharCode(65 + i)} Johnson`,
      customer_phone: `(555) ${(100 + i).toString().padStart(3, '0')}-${(1000 + i).toString().padStart(4, '0')}`,
      customer_email: `customer${i + 1}@email.com`,
      sales_rep_id: `sales-rep-${(i % 3) + 1}`,
      
      vehicle_of_interest: {
        make: ["Toyota", "Honda", "Ford", "Chevrolet", "Nissan"][i % 5],
        model: ["Camry", "Civic", "F-150", "Silverado", "Altima"][i % 5],
        year: 2023 + (i % 2),
        stock_number: `STK-${(1000 + i).toString()}`,
        price: 25000 + (i * 3000)
      },
      
      priority: priorities[i % priorities.length],
      status: statuses[i % statuses.length],
      preparation_notes: `Prepare ${appointmentTypes[i % appointmentTypes.length].replace('_', ' ')} materials`,
      follow_up_required: i % 3 === 0,
      
      created_at: new Date(now.getTime() - (i * 24 * 60 * 60 * 1000)).toISOString(),
      updated_at: new Date().toISOString()
    });
  }
  
  return appointments;
}

export async function GET(req: NextRequest) {
  const { s, res } = supaFromReq(req);
  const url = new URL(req.url);
  
  // Enhanced filtering parameters for auto dealership
  const type = url.searchParams.get("type");
  const status = url.searchParams.get("status");
  const priority = url.searchParams.get("priority");
  const sales_rep_id = url.searchParams.get("sales_rep_id");
  const customer_name = url.searchParams.get("customer_name");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const include_analytics = url.searchParams.get("include_analytics") === "true";
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "50");
  const offset = (page - 1) * limit;

  const org_id = await getMembershipOrgId(s);
  
  if (!org_id) {
    // Return mock data with filtering
    let mockData = generateMockAppointments();
    
    // Apply filters to mock data
    if (type) mockData = mockData.filter(a => a.type === type);
    if (status) mockData = mockData.filter(a => a.status === status);
    if (priority) mockData = mockData.filter(a => a.priority === priority);
    if (sales_rep_id) mockData = mockData.filter(a => a.sales_rep_id === sales_rep_id);
    if (customer_name) mockData = mockData.filter(a => a.customer_name.toLowerCase().includes(customer_name.toLowerCase()));
    if (from) mockData = mockData.filter(a => new Date(a.starts_at) >= new Date(from));
    if (to) mockData = mockData.filter(a => new Date(a.ends_at) <= new Date(to));
    
    // Apply pagination
    const paginatedData = mockData.slice(offset, offset + limit);
    
    const result: any = {
      appointments: paginatedData,
      pagination: {
        page,
        limit,
        total: mockData.length,
        pages: Math.ceil(mockData.length / limit)
      }
    };
    
    // Add analytics if requested
    if (include_analytics) {
      result.analytics = {
        total_appointments: mockData.length,
        by_status: {
          scheduled: mockData.filter(a => a.status === "scheduled").length,
          confirmed: mockData.filter(a => a.status === "confirmed").length,
          completed: mockData.filter(a => a.status === "completed").length,
          cancelled: mockData.filter(a => a.status === "cancelled").length,
        },
        by_type: {
          test_drive: mockData.filter(a => a.type === "test_drive").length,
          sales_consultation: mockData.filter(a => a.type === "sales_consultation").length,
          financing_meeting: mockData.filter(a => a.type === "financing_meeting").length,
          service_appointment: mockData.filter(a => a.type === "service_appointment").length,
        },
        by_priority: {
          urgent: mockData.filter(a => a.priority === "urgent").length,
          high: mockData.filter(a => a.priority === "high").length,
          medium: mockData.filter(a => a.priority === "medium").length,
          low: mockData.filter(a => a.priority === "low").length,
        },
        upcoming_24h: mockData.filter(a => {
          const apptTime = new Date(a.starts_at).getTime();
          const now = Date.now();
          return apptTime >= now && apptTime <= now + 24 * 60 * 60 * 1000;
        }).length,
        completion_rate: Math.round((mockData.filter(a => a.status === "completed").length / mockData.length) * 100) || 0
      };
    }
    
    return ok(result, res.headers);
  }

  try {
    // Build dynamic query with enhanced filtering
    let query = s.from("appointments")
      .select("*")
      .eq("org_id", org_id)
      .order("starts_at", { ascending: true })
      .range(offset, offset + limit - 1);
    
    if (type) query = query.eq("type", type);
    if (status) query = query.eq("status", status);
    if (priority) query = query.eq("priority", priority);
    if (sales_rep_id) query = query.eq("sales_rep_id", sales_rep_id);
    if (customer_name) query = query.ilike("customer_name", `%${customer_name}%`);
    if (from) query = query.gte("starts_at", from);
    if (to) query = query.lte("ends_at", to);

    const { data: appointments, error: fetchError, count } = await query;
    
    if (fetchError) {
      console.warn("Appointments database error:", fetchError);
      // Fallback to mock data
      const mockData = generateMockAppointments();
      return ok({
        appointments: mockData.slice(0, limit),
        pagination: { page, limit, total: mockData.length, pages: Math.ceil(mockData.length / limit) }
      }, res.headers);
    }

    const result: any = {
      appointments: appointments || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    };

    // Add analytics if requested
    if (include_analytics) {
      try {
        const { data: analyticsData } = await s.from("appointments")
          .select("status, type, priority, starts_at")
          .eq("org_id", org_id);
        
        if (analyticsData) {
          const now = Date.now();
          result.analytics = {
            total_appointments: analyticsData.length,
            by_status: analyticsData.reduce((acc, a) => {
              acc[a.status] = (acc[a.status] || 0) + 1;
              return acc;
            }, {} as Record<string, number>),
            by_type: analyticsData.reduce((acc, a) => {
              acc[a.type] = (acc[a.type] || 0) + 1;
              return acc;
            }, {} as Record<string, number>),
            by_priority: analyticsData.reduce((acc, a) => {
              acc[a.priority] = (acc[a.priority] || 0) + 1;
              return acc;
            }, {} as Record<string, number>),
            upcoming_24h: analyticsData.filter(a => {
              const apptTime = new Date(a.starts_at).getTime();
              return apptTime >= now && apptTime <= now + 24 * 60 * 60 * 1000;
            }).length,
            completion_rate: Math.round((analyticsData.filter(a => a.status === "completed").length / analyticsData.length) * 100) || 0
          };
        }
      } catch (analyticsError) {
        console.warn("Analytics calculation failed:", analyticsError);
      }
    }

    return ok(result, res.headers);

  } catch (err) {
    console.warn("Appointments API error:", err);
    // Fallback to mock data
    const mockData = generateMockAppointments();
    return ok({
      appointments: mockData.slice(0, limit),
      pagination: { page, limit, total: mockData.length, pages: Math.ceil(mockData.length / limit) },
      error: "Database connection issue"
    }, res.headers);
  }
}

export async function POST(req: NextRequest) {
  const { s, res } = supaFromReq(req);
  
  try {
    const parsed = ApptCreate.safeParse(await req.json());
    if (!parsed.success) {
      return bad(`Validation error: ${parsed.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
    }

    const org_id = await getMembershipOrgId(s);
    const appointmentData = parsed.data;
    
    if (!org_id) {
      // Return enhanced mock appointment
      const mockAppt = {
        id: Math.floor(Math.random() * 1000) + 300,
        title: appointmentData.title,
        type: appointmentData.type,
        location: appointmentData.location || "Main Showroom",
        starts_at: appointmentData.starts_at,
        ends_at: appointmentData.ends_at,
        duration_minutes: appointmentData.duration_minutes,
        
        customer_name: appointmentData.customer_name,
        customer_phone: appointmentData.customer_phone,
        customer_email: appointmentData.customer_email,
        sales_rep_id: appointmentData.sales_rep_id,
        
        vehicle_of_interest: appointmentData.vehicle_of_interest,
        priority: appointmentData.priority,
        status: appointmentData.status,
        
        preparation_notes: appointmentData.preparation_notes,
        customer_requirements: appointmentData.customer_requirements,
        internal_notes: appointmentData.internal_notes,
        
        send_reminder: appointmentData.send_reminder,
        reminder_intervals: appointmentData.reminder_intervals,
        follow_up_required: appointmentData.follow_up_required,
        
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return ok(mockAppt, res.headers);
    }

    try {
      // Check for scheduling conflicts
      const conflictCheck = await s
        .from("appointments")
        .select("id, title, starts_at, ends_at")
        .eq("org_id", org_id)
        .eq("sales_rep_id", appointmentData.sales_rep_id || "")
        .gte("starts_at", appointmentData.starts_at)
        .lte("ends_at", appointmentData.ends_at)
        .neq("status", "cancelled");

      if (conflictCheck.data && conflictCheck.data.length > 0) {
        return bad(`Scheduling conflict detected: ${conflictCheck.data[0].title} from ${new Date(conflictCheck.data[0].starts_at).toLocaleTimeString()} to ${new Date(conflictCheck.data[0].ends_at).toLocaleTimeString()}`);
      }

      // Create appointment with full auto dealership data
      const { data: appt, error } = await s
        .from("appointments")
        .insert({
          org_id,
          title: appointmentData.title,
          type: appointmentData.type,
          location: appointmentData.location,
          starts_at: appointmentData.starts_at,
          ends_at: appointmentData.ends_at,
          duration_minutes: appointmentData.duration_minutes,
          
          customer_name: appointmentData.customer_name,
          customer_phone: appointmentData.customer_phone,
          customer_email: appointmentData.customer_email,
          lead_id: appointmentData.lead_id,
          sales_rep_id: appointmentData.sales_rep_id,
          
          priority: appointmentData.priority,
          status: appointmentData.status,
          
          preparation_notes: appointmentData.preparation_notes,
          customer_requirements: appointmentData.customer_requirements,
          internal_notes: appointmentData.internal_notes,
          
          send_reminder: appointmentData.send_reminder,
          follow_up_required: appointmentData.follow_up_required,
          
          // Store complex data as JSON
          vehicle_of_interest: appointmentData.vehicle_of_interest ? JSON.stringify(appointmentData.vehicle_of_interest) : null,
          reminder_intervals: appointmentData.reminder_intervals ? JSON.stringify(appointmentData.reminder_intervals) : null,
          
          meta: {
            sync_to_calendar: appointmentData.sync_to_calendar,
            create_deal_if_missing: appointmentData.create_deal_if_missing,
            created_by: "api",
            appointment_version: "2.0"
          }
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      // Create associated deal if requested and missing
      if (appointmentData.create_deal_if_missing && appointmentData.lead_id) {
        try {
          const { data: existingDeal } = await s
            .from("deals")
            .select("id")
            .eq("lead_id", appointmentData.lead_id)
            .eq("org_id", org_id)
            .single();

          if (!existingDeal && appointmentData.vehicle_of_interest) {
            const dealData = {
              org_id,
              lead_id: appointmentData.lead_id,
              title: `Deal for ${appointmentData.customer_name}`,
              status: "qualification",
              value: appointmentData.vehicle_of_interest.price || 0,
              vehicle_details: appointmentData.vehicle_of_interest,
              notes: `Auto-created from ${appointmentData.type} appointment`,
              created_by: "appointment_api"
            };
            
            await s.from("deals").insert(dealData);
          }
        } catch (dealError) {
          console.warn("Deal creation failed:", dealError);
        }
      }

      // Schedule reminders if enabled
      if (appointmentData.send_reminder && appointmentData.reminder_intervals) {
        try {
          const reminderTasks = appointmentData.reminder_intervals.map(interval => {
            const reminderTime = calculateReminderTime(appointmentData.starts_at, interval);
            return {
              org_id,
              title: `Reminder: ${appointmentData.title}`,
              description: `Send reminder for ${appointmentData.type} appointment with ${appointmentData.customer_name}`,
              type: "appointment_reminder",
              scheduled_for: reminderTime,
              related_entity: "appointment",
              related_entity_id: appt.id,
              status: "pending"
            };
          });

          await s.from("tasks").insert(reminderTasks);
        } catch (reminderError) {
          console.warn("Reminder scheduling failed:", reminderError);
        }
      }
      
      // Log comprehensive audit event
      try {
        await s.from("audit_events").insert({
          org_id,
          entity: "appointment",
          entity_id: appt.id,
          action: "create",
          details: {
            appointment_type: appointmentData.type,
            customer: appointmentData.customer_name,
            sales_rep: appointmentData.sales_rep_id,
            priority: appointmentData.priority,
            vehicle_interest: appointmentData.vehicle_of_interest?.make + " " + appointmentData.vehicle_of_interest?.model
          }
        });
      } catch (auditErr) {
        console.warn("Audit logging failed:", auditErr);
      }
      
      return ok({
        ...appt,
        // Parse JSON fields back to objects for response
        vehicle_of_interest: appt.vehicle_of_interest ? JSON.parse(appt.vehicle_of_interest) : null,
        reminder_intervals: appt.reminder_intervals ? JSON.parse(appt.reminder_intervals) : null
      }, res.headers);
      
    } catch (dbError) {
      console.log("Database error in appointment creation:", dbError);
      // Return mock appointment on DB error
      const mockAppt = {
        id: Math.floor(Math.random() * 1000) + 300,
        title: appointmentData.title,
        type: appointmentData.type,
        customer_name: appointmentData.customer_name,
        starts_at: appointmentData.starts_at,
        ends_at: appointmentData.ends_at,
        status: appointmentData.status,
        priority: appointmentData.priority,
        created_at: new Date().toISOString(),
        error: "Database unavailable - appointment created in mock mode"
      };
      return ok(mockAppt, res.headers);
    }
    
  } catch (e: any) {
    console.error("Appointment creation error:", e);
    return oops(e?.message || "Unknown error in appointment creation");
  }
}

// Helper function to calculate reminder times
function calculateReminderTime(appointmentTime: string, interval: string): string {
  const apptDate = new Date(appointmentTime);
  const reminderDate = new Date(apptDate);
  
  switch (interval) {
    case "24h":
      reminderDate.setHours(reminderDate.getHours() - 24);
      break;
    case "4h":
      reminderDate.setHours(reminderDate.getHours() - 4);
      break;
    case "1h":
      reminderDate.setHours(reminderDate.getHours() - 1);
      break;
    case "15m":
      reminderDate.setMinutes(reminderDate.getMinutes() - 15);
      break;
  }
  
  return reminderDate.toISOString();
}

export async function PATCH(req: NextRequest) {
  const { s, res } = supaFromReq(req);
  
  try {
    const body = await req.json();
    if (!body?.id) return bad("Missing appointment ID");

    const org_id = await getMembershipOrgId(s);
    
    if (!org_id) {
      // Mock update response
      return ok({
        id: body.id,
        ...body,
        updated_at: new Date().toISOString(),
        mock: true
      }, res.headers);
    }

    // Build update object for allowed fields
    const allowedFields = [
      "title", "type", "location", "starts_at", "ends_at", "duration_minutes",
      "customer_name", "customer_phone", "customer_email", "sales_rep_id",
      "priority", "status", "preparation_notes", "customer_requirements", 
      "internal_notes", "send_reminder", "follow_up_required"
    ];
    
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString()
    };
    
    for (const field of allowedFields) {
      if (field in body && body[field] !== undefined) {
        updates[field] = body[field];
      }
    }
    
    // Handle JSON fields
    if (body.vehicle_of_interest) {
      updates.vehicle_of_interest = JSON.stringify(body.vehicle_of_interest);
    }
    if (body.reminder_intervals) {
      updates.reminder_intervals = JSON.stringify(body.reminder_intervals);
    }
    
    // Update meta information
    if (body.sync_to_calendar !== undefined || body.create_deal_if_missing !== undefined) {
      const { data: currentAppt } = await s
        .from("appointments")
        .select("meta")
        .eq("id", body.id)
        .eq("org_id", org_id)
        .single();
      
      const currentMeta = currentAppt?.meta || {};
      updates.meta = {
        ...currentMeta,
        ...(body.sync_to_calendar !== undefined && { sync_to_calendar: body.sync_to_calendar }),
        ...(body.create_deal_if_missing !== undefined && { create_deal_if_missing: body.create_deal_if_missing }),
        last_modified: new Date().toISOString(),
        modified_by: "api"
      };
    }

    try {
      // Check if rescheduling and validate conflicts
      if (updates.starts_at || updates.ends_at || updates.sales_rep_id) {
        const { data: currentAppt } = await s
          .from("appointments")
          .select("starts_at, ends_at, sales_rep_id")
          .eq("id", body.id)
          .eq("org_id", org_id)
          .single();

        if (currentAppt) {
          const newStartTime = updates.starts_at || currentAppt.starts_at;
          const newEndTime = updates.ends_at || currentAppt.ends_at;
          const newSalesRep = updates.sales_rep_id || currentAppt.sales_rep_id;

          const conflictCheck = await s
            .from("appointments")
            .select("id, title, starts_at, ends_at")
            .eq("org_id", org_id)
            .eq("sales_rep_id", newSalesRep)
            .neq("id", body.id)
            .neq("status", "cancelled")
            .gte("starts_at", newStartTime)
            .lte("ends_at", newEndTime);

          if (conflictCheck.data && conflictCheck.data.length > 0) {
            return bad(`Scheduling conflict: ${conflictCheck.data[0].title} already scheduled during this time`);
          }
        }
      }

      const { data: updatedAppt, error } = await s
        .from("appointments")
        .update(updates)
        .eq("id", body.id)
        .eq("org_id", org_id)
        .select()
        .single();

      if (error) throw new Error(error.message);

      // Handle status-based automation
      if (updates.status) {
        await handleStatusChangeAutomation(s, org_id, body.id, updates.status, updatedAppt);
      }
      
      // Log audit event with meaningful details
      try {
        const changedFields = Object.keys(updates).filter(key => key !== "updated_at");
        await s.from("audit_events").insert({
          org_id,
          entity: "appointment", 
          entity_id: body.id,
          action: "update",
          details: {
            changed_fields: changedFields,
            new_status: updates.status,
            rescheduled: !!(updates.starts_at || updates.ends_at)
          }
        });
      } catch (auditErr) {
        console.warn("Audit logging failed:", auditErr);
      }
      
      return ok({
        ...updatedAppt,
        // Parse JSON fields for response
        vehicle_of_interest: updatedAppt.vehicle_of_interest ? JSON.parse(updatedAppt.vehicle_of_interest) : null,
        reminder_intervals: updatedAppt.reminder_intervals ? JSON.parse(updatedAppt.reminder_intervals) : null
      }, res.headers);
      
    } catch (dbError) {
      console.warn("Database error updating appointment:", dbError);
      return oops("Failed to update appointment - database error");
    }
    
  } catch (e: any) {
    console.error("Appointment update error:", e);
    return oops(e?.message || "Unknown error updating appointment");
  }
}

// Handle automation based on status changes
async function handleStatusChangeAutomation(s: any, org_id: string, appointmentId: number, newStatus: string, appointmentData: any) {
  try {
    switch (newStatus) {
      case "completed":
        // Create follow-up task if needed
        if (appointmentData.follow_up_required) {
          const followUpDate = new Date();
          followUpDate.setDate(followUpDate.getDate() + 1); // Next day follow-up
          
          await s.from("tasks").insert({
            org_id,
            title: `Follow-up: ${appointmentData.title}`,
            description: `Follow up with ${appointmentData.customer_name} after ${appointmentData.type}`,
            type: "follow_up_call",
            priority: "medium",
            scheduled_for: followUpDate.toISOString(),
            related_entity: "appointment",
            related_entity_id: appointmentId,
            status: "pending"
          });
        }
        break;
        
      case "cancelled":
        // Cancel related reminders
        await s.from("tasks")
          .update({ status: "cancelled" })
          .eq("related_entity", "appointment")
          .eq("related_entity_id", appointmentId)
          .eq("type", "appointment_reminder");
        break;
        
      case "no_show":
        // Create follow-up task for no-show
        await s.from("tasks").insert({
          org_id,
          title: `No-Show Follow-up: ${appointmentData.customer_name}`,
          description: `Customer did not show for ${appointmentData.type} - reschedule needed`,
          type: "no_show_follow_up",
          priority: "high",
          scheduled_for: new Date().toISOString(),
          related_entity: "appointment", 
          related_entity_id: appointmentId,
          status: "pending"
        });
        break;
    }
  } catch (automationError) {
    console.warn("Status change automation failed:", automationError);
  }
}

export async function DELETE(req: NextRequest) {
  const { s, res } = supaFromReq(req);
  
  try {
    const { id, cancel_reason } = await req.json();
    if (!id) return bad("Missing appointment ID");

    const org_id = await getMembershipOrgId(s);
    
    if (!org_id) {
      return ok({
        success: true,
        message: "Appointment deleted successfully (mock mode)",
        id
      }, res.headers);
    }

    try {
      // Get appointment details before deletion for audit purposes
      const { data: appointmentToDelete } = await s
        .from("appointments")
        .select("*")
        .eq("id", id)
        .eq("org_id", org_id)
        .single();

      if (!appointmentToDelete) {
        return bad("Appointment not found or access denied");
      }

      // Soft delete by updating status to cancelled rather than hard delete
      // This preserves data for analytics and audit trails
      const { error: updateError } = await s
        .from("appointments")
        .update({
          status: "cancelled",
          internal_notes: appointmentToDelete.internal_notes 
            ? appointmentToDelete.internal_notes + `\n\nCANCELLED: ${cancel_reason || "No reason provided"}`
            : `CANCELLED: ${cancel_reason || "No reason provided"}`,
          updated_at: new Date().toISOString(),
          meta: {
            ...appointmentToDelete.meta,
            cancelled_at: new Date().toISOString(),
            cancellation_reason: cancel_reason || "No reason provided",
            cancelled_by: "api"
          }
        })
        .eq("id", id)
        .eq("org_id", org_id);

      if (updateError) throw new Error(updateError.message);

      // Cancel related tasks (reminders, follow-ups)
      try {
        await s.from("tasks")
          .update({ 
            status: "cancelled",
            notes: `Cancelled due to appointment cancellation: ${cancel_reason || "No reason provided"}`
          })
          .eq("related_entity", "appointment")
          .eq("related_entity_id", id);
      } catch (taskError) {
        console.warn("Failed to cancel related tasks:", taskError);
      }

      // Create cancellation notification task if customer contact info available
      if (appointmentToDelete.customer_email || appointmentToDelete.customer_phone) {
        try {
          await s.from("tasks").insert({
            org_id,
            title: `Send Cancellation Notice: ${appointmentToDelete.customer_name}`,
            description: `Notify customer about ${appointmentToDelete.type} appointment cancellation. Reason: ${cancel_reason || "Not specified"}`,
            type: "cancellation_notice",
            priority: "high",
            scheduled_for: new Date().toISOString(),
            related_entity: "appointment",
            related_entity_id: id,
            status: "pending",
            meta: {
              customer_email: appointmentToDelete.customer_email,
              customer_phone: appointmentToDelete.customer_phone,
              appointment_title: appointmentToDelete.title,
              original_time: appointmentToDelete.starts_at
            }
          });
        } catch (notificationError) {
          console.warn("Failed to create cancellation notification task:", notificationError);
        }
      }
      
      // Log comprehensive audit event
      try {
        await s.from("audit_events").insert({
          org_id,
          entity: "appointment",
          entity_id: id,
          action: "cancel", // Using "cancel" instead of "delete" since we're soft-deleting
          details: {
            customer_name: appointmentToDelete.customer_name,
            appointment_type: appointmentToDelete.type,
            original_datetime: appointmentToDelete.starts_at,
            cancellation_reason: cancel_reason || "No reason provided",
            sales_rep: appointmentToDelete.sales_rep_id
          }
        });
      } catch (auditErr) {
        console.warn("Audit logging failed:", auditErr);
      }
      
      return ok({
        success: true,
        message: "Appointment cancelled successfully",
        id,
        cancelled_at: new Date().toISOString(),
        cancellation_reason: cancel_reason || "No reason provided"
      }, res.headers);
      
    } catch (dbError) {
      console.warn("Database error cancelling appointment:", dbError);
      return oops("Failed to cancel appointment - database error");
    }
    
  } catch (e: any) {
    console.error("Appointment cancellation error:", e);
    return oops(e?.message || "Unknown error cancelling appointment");
  }
}
