import { NextRequest, NextResponse } from "next/server";

// Use Node.js runtime to avoid Edge Runtime issues with Supabase
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    // Get all workflows
    const workflows = await getWorkflows();
    
    return NextResponse.json({ success: true, workflows });
  } catch (error) {
    console.error("Failed to fetch workflows:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch workflows" }, 
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const workflowData = await req.json();
    
    // Create new workflow
    const workflow = await createWorkflow(workflowData);
    
    return NextResponse.json({ success: true, workflow });
  } catch (error) {
    console.error("Failed to create workflow:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create workflow" }, 
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, ...updateData } = await req.json();
    
    // Update existing workflow
    const workflow = await updateWorkflow(id, updateData);
    
    return NextResponse.json({ success: true, workflow });
  } catch (error) {
    console.error("Failed to update workflow:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update workflow" }, 
      { status: 500 }
    );
  }
}

async function getWorkflows() {
  // In a real implementation, this would fetch from database
  // For now, return mock data that matches the UI
  
  return [
    {
      id: '1',
      name: 'New Lead Nurturing',
      description: 'Automated follow-up sequence for new leads',
      status: 'active',
      triggerType: 'new_lead',
      totalRuns: 127,
      successRate: 0.89,
      lastRun: '2024-01-15T14:30:00Z',
      nodes: [
        {
          id: 'trigger-1',
          type: 'trigger',
          title: 'New Lead',
          description: 'When a new lead is created',
          position: { x: 100, y: 100 },
          config: {
            source: 'all',
            conditions: []
          },
          connections: ['action-1']
        },
        {
          id: 'action-1', 
          type: 'action',
          title: 'Send Welcome Email',
          description: 'Send automated welcome email',
          position: { x: 300, y: 100 },
          config: {
            templateId: 'welcome-email-001',
            delay: 0
          },
          connections: ['delay-1']
        },
        {
          id: 'delay-1',
          type: 'delay', 
          title: 'Wait 2 Days',
          description: 'Wait for 2 days',
          position: { x: 500, y: 100 },
          config: {
            duration: 2,
            unit: 'days'
          },
          connections: ['action-2']
        },
        {
          id: 'action-2',
          type: 'action',
          title: 'Follow-up Email',
          description: 'Send follow-up email',
          position: { x: 700, y: 100 },
          config: {
            templateId: 'followup-email-001',
            delay: 0
          },
          connections: []
        }
      ],
      createdAt: '2024-01-10T10:00:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      name: 'Lead Scoring Update',
      description: 'Automatically update lead scores based on engagement',
      status: 'active',
      triggerType: 'email_engagement',
      totalRuns: 89,
      successRate: 0.94,
      lastRun: '2024-01-15T16:15:00Z',
      nodes: [
        {
          id: 'trigger-2',
          type: 'trigger',
          title: 'Email Opened',
          description: 'When an email is opened',
          position: { x: 100, y: 100 },
          config: {
            campaigns: ['all'],
            minOpens: 1
          },
          connections: ['condition-1']
        },
        {
          id: 'condition-1',
          type: 'condition',
          title: 'Check Lead Score',
          description: 'If lead score < 50',
          position: { x: 300, y: 100 },
          config: {
            field: 'lead_score',
            operator: 'less_than',
            value: 50
          },
          connections: ['action-3']
        },
        {
          id: 'action-3',
          type: 'action',
          title: 'Increase Score',
          description: 'Add 10 points to lead score',
          position: { x: 500, y: 100 },
          config: {
            action: 'increment',
            field: 'lead_score',
            value: 10
          },
          connections: []
        }
      ],
      createdAt: '2024-01-12T14:00:00Z',
      updatedAt: '2024-01-15T09:15:00Z'
    },
    {
      id: '3',
      name: 'Demo No-Show Follow-up',
      description: 'Follow up with prospects who missed demo appointments',
      status: 'inactive',
      triggerType: 'appointment_missed',
      totalRuns: 23,
      successRate: 0.78,
      lastRun: '2024-01-14T11:00:00Z',
      nodes: [
        {
          id: 'trigger-3',
          type: 'trigger',
          title: 'Missed Appointment',
          description: 'When a demo appointment is missed',
          position: { x: 100, y: 100 },
          config: {
            appointmentTypes: ['demo', 'consultation'],
            gracePeriod: 15
          },
          connections: ['delay-2']
        },
        {
          id: 'delay-2',
          type: 'delay',
          title: 'Wait 2 Hours',
          description: 'Wait for 2 hours',
          position: { x: 300, y: 100 },
          config: {
            duration: 2,
            unit: 'hours'
          },
          connections: ['action-4']
        },
        {
          id: 'action-4',
          type: 'action',
          title: 'Send Follow-up SMS',
          description: 'Send SMS to reschedule',
          position: { x: 500, y: 100 },
          config: {
            templateId: 'reschedule-sms-001',
            includeBookingLink: true
          },
          connections: ['action-5']
        },
        {
          id: 'action-5',
          type: 'action',
          title: 'Create Follow-up Task',
          description: 'Create task for sales rep',
          position: { x: 700, y: 100 },
          config: {
            assignTo: 'lead_owner',
            priority: 'high',
            dueDate: '+1 day'
          },
          connections: []
        }
      ],
      createdAt: '2024-01-08T16:00:00Z',
      updatedAt: '2024-01-14T11:00:00Z'
    }
  ];
}

async function createWorkflow(workflowData: any) {
  // In a real implementation, this would:
  // 1. Validate workflow data
  // 2. Save to database
  // 3. Initialize workflow engine
  
  console.log("Creating new workflow:", workflowData);
  
  const newWorkflow = {
    id: Date.now().toString(),
    ...workflowData,
    status: 'draft',
    totalRuns: 0,
    successRate: 0,
    lastRun: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  return newWorkflow;
}

async function updateWorkflow(id: string, updateData: any) {
  // In a real implementation, this would:
  // 1. Validate update data
  // 2. Update database record
  // 3. Refresh workflow engine if needed
  
  console.log(`Updating workflow ${id}:`, updateData);
  
  return {
    id,
    ...updateData,
    updatedAt: new Date().toISOString()
  };
}