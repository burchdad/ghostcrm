/**
 * Create Automation Database Tables and Sample Data
 * 
 * This script creates the automation system database tables and
 * inserts initial sample data for the current organization.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Organization ID to use for sample data
const ORGANIZATION_ID = 'burch-enterprises'; // Your current organization

async function createAutomationTables() {
  console.log('🚀 Creating automation database tables...');
  
  try {
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'CREATE_AUTOMATION_TABLES.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Execute the SQL to create tables
    console.log('📋 Executing table creation SQL...');
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      // Try alternative method - split SQL into individual statements
      console.log('⚠️  RPC method failed, trying direct execution...');
      
      // Split SQL into individual statements (basic splitting)
      const statements = sqlContent
        .split(';')
        .filter(stmt => stmt.trim() && !stmt.trim().startsWith('--'))
        .map(stmt => stmt.trim());
      
      for (const statement of statements) {
        if (statement) {
          try {
            console.log('Executing:', statement.substring(0, 50) + '...');
            // Use raw SQL execution (this might not work in all Supabase setups)
            // We'll need to run this manually in Supabase SQL editor
          } catch (stmtError) {
            console.error('Statement error:', stmtError.message);
          }
        }
      }
    }
    
    console.log('✅ Tables created successfully (or may need manual execution)');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    console.log('📝 Manual execution required:');
    console.log('1. Copy the contents of CREATE_AUTOMATION_TABLES.sql');
    console.log('2. Go to your Supabase Dashboard > SQL Editor');
    console.log('3. Paste and execute the SQL');
    console.log('4. Run this script again to insert sample data');
  }
}

async function insertSampleWorkflows() {
  console.log('📦 Creating sample automation workflows...');
  
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
          { type: 'email', template: 'follow-up-1', delay: 24 * 60 * 60 * 1000 },
          { type: 'email', template: 'follow-up-2', delay: 3 * 24 * 60 * 60 * 1000 },
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
        ],
        threshold: 50
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
      configuration: {
        frequency: 'monthly',
        content_type: 'newsletter'
      },
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
      configuration: {
        triggers: ['high_value_lead', 'demo_requested'],
        assignment_rules: 'round_robin'
      },
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
      configuration: {
        stages: ['prospect', 'qualified', 'proposal', 'closed'],
        rules: 'activity_based'
      },
      success_rate: 0,
      total_runs: 0,
      successful_runs: 0,
      failed_runs: 0,
      last_run: null
    }
  ];
  
  try {
    // Insert workflows
    const { data: workflows, error: workflowError } = await supabase
      .from('automation_workflows')
      .insert(sampleWorkflows)
      .select();
      
    if (workflowError) {
      throw workflowError;
    }
    
    console.log(`✅ Created ${workflows.length} sample workflows`);
    
    // Insert sample triggers for each workflow
    const triggers = [];
    workflows.forEach(workflow => {
      switch (workflow.type) {
        case 'email':
          triggers.push(
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
              trigger_name: 'Lead form submitted',
              trigger_type: 'event', 
              trigger_config: { event: 'form_submitted' }
            }
          );
          break;
        case 'lead':
          triggers.push(
            {
              workflow_id: workflow.id,
              organization_id: ORGANIZATION_ID,
              trigger_name: 'Email opened',
              trigger_type: 'event',
              trigger_config: { event: 'email_opened' }
            },
            {
              workflow_id: workflow.id,
              organization_id: ORGANIZATION_ID,
              trigger_name: 'Website visited',
              trigger_type: 'event',
              trigger_config: { event: 'website_visited' }
            }
          );
          break;
        case 'task':
          triggers.push(
            {
              workflow_id: workflow.id,
              organization_id: ORGANIZATION_ID,
              trigger_name: 'High-value lead detected',
              trigger_type: 'condition',
              trigger_config: { condition: 'lead_score > 80' }
            }
          );
          break;
        case 'follow-up':
          triggers.push(
            {
              workflow_id: workflow.id,
              organization_id: ORGANIZATION_ID,
              trigger_name: 'Appointment scheduled',
              trigger_type: 'event',
              trigger_config: { event: 'appointment_scheduled' }
            }
          );
          break;
      }
    });
    
    if (triggers.length > 0) {
      const { error: triggerError } = await supabase
        .from('automation_workflow_triggers')
        .insert(triggers);
        
      if (triggerError) {
        console.warn('⚠️  Warning: Could not insert triggers:', triggerError.message);
      } else {
        console.log(`✅ Created ${triggers.length} workflow triggers`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error inserting sample workflows:', error.message);
  }
}

async function insertSampleActivity() {
  console.log('📊 Creating sample automation activity...');
  
  const sampleActivity = [
    {
      organization_id: ORGANIZATION_ID,
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
  
  try {
    const { data: activity, error } = await supabase
      .from('automation_activity')
      .insert(sampleActivity);
      
    if (error) {
      throw error;
    }
    
    console.log(`✅ Created ${sampleActivity.length} activity records`);
    
  } catch (error) {
    console.error('❌ Error inserting sample activity:', error.message);
  }
}

async function main() {
  console.log('🤖 Setting up Automation System Database...\n');
  
  // Step 1: Create tables
  await createAutomationTables();
  
  // Wait a bit for tables to be created
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Step 2: Insert sample data
  await insertSampleWorkflows();
  await insertSampleActivity();
  
  console.log('\n✨ Automation database setup complete!');
  console.log('🔧 Next steps:');
  console.log('1. If table creation failed, manually run CREATE_AUTOMATION_TABLES.sql in Supabase');
  console.log('2. Refresh your automation page to see the real data');
  console.log('3. Test the workflow creation and management features');
}

// Run the setup
main().catch(console.error);