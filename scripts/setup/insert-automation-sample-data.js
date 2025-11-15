/**
 * Insert Sample Data for Automation System
 * 
 * Run this script AFTER manually creating the automation tables in Supabase.
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Organization ID
const ORGANIZATION_ID = 'burch-enterprises';

async function insertSampleData() {
  console.log('🚀 Inserting sample automation data for:', ORGANIZATION_ID);
  
  try {
    // 1. Insert sample workflows
    const sampleWorkflows = [
      {
        organization_id: ORGANIZATION_ID,
        name: 'New Lead Welcome Sequence',
        description: 'Automated email sequence for new leads with 5 follow-up emails over 2 weeks',
        status: 'active',
        type: 'email',
        configuration: {
          steps: [
            { type: 'email', template: 'welcome', delay: 0 },
            { type: 'email', template: 'follow-up-1', delay: 86400000 },
            { type: 'email', template: 'follow-up-2', delay: 259200000 },
          ]
        },
        success_rate: 84,
        total_runs: 156,
        successful_runs: 131,
        failed_runs: 25,
        last_run: new Date(Date.now() - 2 * 60 * 1000).toISOString()
      },
      {
        organization_id: ORGANIZATION_ID,
        name: 'Lead Scoring Automation',
        description: 'Automatically scores leads based on engagement and assigns to sales reps',
        status: 'active',
        type: 'lead',
        configuration: {
          rules: [
            { condition: 'email_opened', score: 10 },
            { condition: 'website_visited', score: 15 },
            { condition: 'form_completed', score: 25 }
          ]
        },
        success_rate: 92,
        total_runs: 243,
        successful_runs: 224,
        failed_runs: 19,
        last_run: new Date(Date.now() - 15 * 60 * 1000).toISOString()
      },
      {
        organization_id: ORGANIZATION_ID,
        name: 'Appointment Reminders',
        description: 'Sends SMS and email reminders 24h and 1h before appointments',
        status: 'active',
        type: 'follow-up',
        configuration: {
          reminders: [
            { type: 'email', timing: '24h' },
            { type: 'sms', timing: '1h' }
          ]
        },
        success_rate: 96,
        total_runs: 89,
        successful_runs: 85,
        failed_runs: 4,
        last_run: new Date(Date.now() - 60 * 60 * 1000).toISOString()
      },
      {
        organization_id: ORGANIZATION_ID,
        name: 'Cold Lead Nurturing',
        description: 'Monthly newsletter and promotional content for cold leads',
        status: 'paused',
        type: 'email',
        configuration: { frequency: 'monthly' },
        success_rate: 67,
        total_runs: 45,
        successful_runs: 30,
        failed_runs: 15,
        last_run: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        organization_id: ORGANIZATION_ID,
        name: 'Task Auto Assignment',
        description: 'Automatically creates and assigns follow-up tasks based on lead activity',
        status: 'active',
        type: 'task',
        configuration: { assignment: 'round_robin' },
        success_rate: 88,
        total_runs: 178,
        successful_runs: 157,
        failed_runs: 21,
        last_run: new Date(Date.now() - 5 * 60 * 1000).toISOString()
      },
      {
        organization_id: ORGANIZATION_ID,
        name: 'Deal Pipeline Automation',
        description: 'Moves deals through pipeline stages based on activity and time',
        status: 'draft',
        type: 'lead',
        configuration: { stages: ['prospect', 'qualified', 'proposal', 'closed'] },
        success_rate: 0,
        total_runs: 0,
        successful_runs: 0,
        failed_runs: 0,
        last_run: null
      }
    ];

    const { data: workflows, error: workflowError } = await supabase
      .from('automation_workflows')
      .insert(sampleWorkflows)
      .select();

    if (workflowError) {
      throw workflowError;
    }

    console.log(`✅ Created ${workflows.length} workflows`);

    // 2. Insert triggers for workflows
    const triggers = [];
    workflows.forEach(workflow => {
      const workflowTriggers = [
        {
          workflow_id: workflow.id,
          organization_id: ORGANIZATION_ID,
          trigger_name: 'New lead created',
          trigger_type: 'event',
          trigger_config: { event: 'lead_created' }
        },
        {
          workflow_id: workflow.id,
          organization_id: ORGANIZATION_ID,
          trigger_name: 'Email opened',
          trigger_type: 'event',
          trigger_config: { event: 'email_opened' }
        }
      ];
      triggers.push(...workflowTriggers);
    });

    const { error: triggerError } = await supabase
      .from('automation_workflow_triggers')
      .insert(triggers);

    if (triggerError) {
      console.warn('⚠️  Could not insert triggers:', triggerError.message);
    } else {
      console.log(`✅ Created ${triggers.length} triggers`);
    }

    // 3. Insert sample activity
    const sampleActivity = [
      {
        organization_id: ORGANIZATION_ID,
        workflow_id: workflows[0]?.id,
        activity_type: 'workflow',
        activity_name: 'New Lead Welcome Sequence',
        action: 'executed successfully',
        status: 'success',
        execution_duration: 1250,
        started_at: new Date(Date.now() - 2 * 60 * 1000),
        completed_at: new Date(Date.now() - 2 * 60 * 1000 + 1250)
      },
      {
        organization_id: ORGANIZATION_ID,
        workflow_id: workflows[1]?.id,
        activity_type: 'workflow',
        activity_name: 'Lead Scoring Automation',
        action: 'scored 15 new leads',
        status: 'success',
        execution_duration: 890,
        started_at: new Date(Date.now() - 15 * 60 * 1000),
        completed_at: new Date(Date.now() - 15 * 60 * 1000 + 890)
      },
      {
        organization_id: ORGANIZATION_ID,
        activity_type: 'trigger',
        activity_name: 'Email Open Trigger',
        action: 'triggered lead scoring',
        status: 'success',
        execution_duration: 340,
        started_at: new Date(Date.now() - 30 * 60 * 1000),
        completed_at: new Date(Date.now() - 30 * 60 * 1000 + 340)
      },
      {
        organization_id: ORGANIZATION_ID,
        workflow_id: workflows[4]?.id,
        activity_type: 'workflow',
        activity_name: 'Task Auto Assignment',
        action: 'assigned 3 new tasks',
        status: 'success',
        execution_duration: 675,
        started_at: new Date(Date.now() - 5 * 60 * 1000),
        completed_at: new Date(Date.now() - 5 * 60 * 1000 + 675)
      },
      {
        organization_id: ORGANIZATION_ID,
        activity_type: 'campaign',
        activity_name: 'Monthly Newsletter',
        action: 'failed to send',
        status: 'failed',
        error_message: 'SMTP configuration error',
        execution_duration: 2100,
        started_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
        completed_at: new Date(Date.now() - 2 * 60 * 60 * 1000 + 2100)
      }
    ];

    const { error: activityError } = await supabase
      .from('automation_activity')
      .insert(sampleActivity);

    if (activityError) {
      console.warn('⚠️  Could not insert activity:', activityError.message);
    } else {
      console.log(`✅ Created ${sampleActivity.length} activity records`);
    }

    console.log('\n🎉 Sample data creation complete!');
    console.log('🔄 Refresh your automation page to see the real data');

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('table') && error.message.includes('does not exist')) {
      console.log('\n📋 Please create the tables first:');
      console.log('1. Go to Supabase Dashboard > SQL Editor');
      console.log('2. Copy and paste the contents of CREATE_AUTOMATION_TABLES.sql');
      console.log('3. Execute the SQL');
      console.log('4. Run this script again');
    }
  }
}

insertSampleData();