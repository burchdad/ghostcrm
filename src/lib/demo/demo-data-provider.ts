// =============================================================================
// COMPREHENSIVE DEMO DATA PROVIDER
// Automatically populates the entire software with realistic demo data
// =============================================================================

import { supaFromReq } from "@/lib/supa-ssr";

// Demo user credentials (these should match your login form)
export const DEMO_CREDENTIALS = {
  email: 'demo@ghostcrm.com',
  password: 'demo123',
  organizationName: 'Premier Auto Sales',
  subdomain: 'demo'
};

// Demo data interfaces
interface DemoLead {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  source: string;
  status: string;
  interest_level: string;
  vehicle_interest: string;
  budget_range: string;
  notes: string;
  created_at: string;
  last_contact: string;
}

interface DemoDeal {
  title: string;
  value: number;
  stage: string;
  probability: number;
  customer_name: string;
  vehicle: string;
  sales_rep: string;
  expected_close: string;
  notes: string;
  created_at: string;
}

interface DemoInventory {
  year: number;
  make: string;
  model: string;
  trim: string;
  vin: string;
  price: number;
  mileage: number;
  color: string;
  status: string;
  location: string;
  description: string;
  features: string[];
}

interface DemoActivity {
  type: string;
  description: string;
  customer_name: string;
  user_name: string;
  timestamp: string;
  metadata: any;
}

// =============================================================================
// DEMO DATA SETS
// =============================================================================

const DEMO_LEADS: DemoLead[] = [
  {
    first_name: 'John',
    last_name: 'Mitchell',
    email: 'john.mitchell@email.com',
    phone: '(555) 123-4567',
    source: 'Website Contact Form',
    status: 'Hot Lead',
    interest_level: 'High',
    vehicle_interest: '2024 Honda Accord',
    budget_range: '$25,000 - $30,000',
    notes: 'Looking for reliable sedan for daily commute. Interested in financing options.',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    last_contact: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    first_name: 'Sarah',
    last_name: 'Johnson',
    email: 'sarah.johnson@email.com',
    phone: '(555) 234-5678',
    source: 'Facebook Ad',
    status: 'Warm Lead',
    interest_level: 'Medium',
    vehicle_interest: '2023 Toyota RAV4',
    budget_range: '$30,000 - $35,000',
    notes: 'Family looking for SUV. Has trade-in vehicle.',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    last_contact: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    first_name: 'Michael',
    last_name: 'Chen',
    email: 'michael.chen@email.com',
    phone: '(555) 345-6789',
    source: 'Referral',
    status: 'New Lead',
    interest_level: 'High',
    vehicle_interest: '2024 BMW X3',
    budget_range: '$45,000 - $50,000',
    notes: 'Referred by existing customer. Looking for luxury SUV.',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    last_contact: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    first_name: 'Emily',
    last_name: 'Rodriguez',
    email: 'emily.rodriguez@email.com',
    phone: '(555) 456-7890',
    source: 'Google Search',
    status: 'Cold Lead',
    interest_level: 'Low',
    vehicle_interest: '2022 Ford F-150',
    budget_range: '$35,000 - $40,000',
    notes: 'Looking for work truck. Price sensitive.',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    last_contact: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    first_name: 'David',
    last_name: 'Thompson',
    email: 'david.thompson@email.com',
    phone: '(555) 567-8901',
    source: 'Walk-in',
    status: 'Hot Lead',
    interest_level: 'High',
    vehicle_interest: '2024 Tesla Model Y',
    budget_range: '$50,000+',
    notes: 'Interested in electric vehicles. Ready to buy within 2 weeks.',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    last_contact: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    first_name: 'Lisa',
    last_name: 'Williams',
    email: 'lisa.williams@email.com',
    phone: '(555) 678-9012',
    source: 'Email Campaign',
    status: 'Warm Lead',
    interest_level: 'Medium',
    vehicle_interest: '2023 Jeep Wrangler',
    budget_range: '$40,000 - $45,000',
    notes: 'Adventure enthusiast looking for off-road capable vehicle.',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    last_contact: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const DEMO_DEALS: DemoDeal[] = [
  {
    title: 'Honda Accord - John Mitchell',
    value: 28500,
    stage: 'Negotiation',
    probability: 75,
    customer_name: 'John Mitchell',
    vehicle: '2024 Honda Accord EX',
    sales_rep: 'Alex Thompson',
    expected_close: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Customer wants extended warranty included. Negotiating final price.',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    title: 'BMW X3 - Michael Chen',
    value: 47000,
    stage: 'Proposal',
    probability: 60,
    customer_name: 'Michael Chen',
    vehicle: '2024 BMW X3 xDrive30i',
    sales_rep: 'Maria Garcia',
    expected_close: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Proposal sent with financing options. Waiting for customer response.',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    title: 'Tesla Model Y - David Thompson',
    value: 52000,
    stage: 'Closing',
    probability: 90,
    customer_name: 'David Thompson',
    vehicle: '2024 Tesla Model Y Long Range',
    sales_rep: 'Alex Thompson',
    expected_close: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Paperwork in progress. Customer approved for financing.',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    title: 'Toyota RAV4 - Sarah Johnson',
    value: 32000,
    stage: 'Qualification',
    probability: 40,
    customer_name: 'Sarah Johnson',
    vehicle: '2023 Toyota RAV4 XLE',
    sales_rep: 'Mike Rodriguez',
    expected_close: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Still evaluating trade-in value. Needs to discuss with spouse.',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const DEMO_INVENTORY: DemoInventory[] = [
  {
    year: 2024,
    make: 'Honda',
    model: 'Accord',
    trim: 'EX',
    vin: '1HGCV1F30PA000001',
    price: 28500,
    mileage: 12,
    color: 'Crystal Black Pearl',
    status: 'Available',
    location: 'Lot A-12',
    description: 'Reliable midsize sedan with excellent fuel economy',
    features: ['Honda Sensing', 'Apple CarPlay', 'Heated Seats', 'Sunroof']
  },
  {
    year: 2024,
    make: 'BMW',
    model: 'X3',
    trim: 'xDrive30i',
    vin: '5UX43DP00P9000001',
    price: 47000,
    mileage: 8,
    color: 'Alpine White',
    status: 'Reserved',
    location: 'Showroom',
    description: 'Luxury compact SUV with all-wheel drive',
    features: ['iDrive 7.0', 'Panoramic Sunroof', 'Leather Seats', 'Harman Kardon Audio']
  },
  {
    year: 2024,
    make: 'Tesla',
    model: 'Model Y',
    trim: 'Long Range',
    vin: '5YJYGDEE5PF000001',
    price: 52000,
    mileage: 5,
    color: 'Pearl White Multi-Coat',
    status: 'Sold',
    location: 'Delivery Bay',
    description: 'All-electric luxury SUV with autopilot capability',
    features: ['Autopilot', '15-inch Touchscreen', 'Premium Audio', 'Glass Roof']
  },
  {
    year: 2023,
    make: 'Toyota',
    model: 'RAV4',
    trim: 'XLE',
    vin: 'JTMB1RFV5PD000001',
    price: 32000,
    mileage: 15000,
    color: 'Magnetic Gray Metallic',
    status: 'Available',
    location: 'Lot B-05',
    description: 'Compact SUV perfect for families',
    features: ['Toyota Safety Sense 2.0', 'All-Wheel Drive', 'Wireless Charging', 'Power Liftgate']
  },
  {
    year: 2023,
    make: 'Jeep',
    model: 'Wrangler',
    trim: 'Sahara',
    vin: '1C4HJXDG5PW000001',
    price: 42000,
    mileage: 8500,
    color: 'Firecracker Red',
    status: 'Available',
    location: 'Lot C-08',
    description: 'Iconic off-road vehicle with removable doors and roof',
    features: ['4x4 Capability', 'Uconnect 4C', 'LED Lighting', 'Rock-Trac 4WD']
  },
  {
    year: 2022,
    make: 'Ford',
    model: 'F-150',
    trim: 'XLT',
    vin: '1FTFW1E50NFA00001',
    price: 38000,
    mileage: 22000,
    color: 'Agate Black',
    status: 'Available',
    location: 'Lot D-15',
    description: 'America\'s best-selling truck with excellent towing capacity',
    features: ['SYNC 4', 'Pro Trailer Backup Assist', 'FordPass Connect', 'LED Box Lighting']
  }
];

const DEMO_ACTIVITIES: DemoActivity[] = [
  {
    type: 'call',
    description: 'Follow-up call with customer about financing options',
    customer_name: 'John Mitchell',
    user_name: 'Alex Thompson',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    metadata: { duration: '15 minutes', outcome: 'positive' }
  },
  {
    type: 'email',
    description: 'Sent detailed vehicle specifications and pricing',
    customer_name: 'Michael Chen',
    user_name: 'Maria Garcia',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    metadata: { subject: 'BMW X3 Information Package' }
  },
  {
    type: 'meeting',
    description: 'Test drive scheduled for Tesla Model Y',
    customer_name: 'David Thompson',
    user_name: 'Alex Thompson',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    metadata: { scheduled_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() }
  },
  {
    type: 'note',
    description: 'Customer prefers manual transmission vehicles',
    customer_name: 'Emily Rodriguez',
    user_name: 'Mike Rodriguez',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    metadata: { priority: 'high' }
  },
  {
    type: 'task',
    description: 'Prepare trade-in appraisal for customer vehicle',
    customer_name: 'Sarah Johnson',
    user_name: 'Mike Rodriguez',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    metadata: { due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() }
  }
];

// =============================================================================
// DEMO DATA POPULATION FUNCTIONS
// =============================================================================

export class DemoDataProvider {
  private supabase: any;
  private organizationId: string;
  private userId: string;

  constructor(supabase: any, organizationId: string, userId: string) {
    this.supabase = supabase;
    this.organizationId = organizationId;
    this.userId = userId;
  }

  /**
   * Main method to populate all demo data
   */
  async populateAllDemoData(): Promise<void> {
    console.log('🎬 [DEMO] Starting comprehensive demo data population...');
    
    try {
      // Clear existing demo data first
      await this.clearExistingDemoData();
      
      // Populate all data types
      await this.populateLeads();
      await this.populateDeals();
      await this.populateInventory();
      await this.populateActivities();
      await this.populateTeamMembers();
      await this.populateSettings();
      await this.populateMetrics();
      await this.populateNotifications();
      await this.populateCalendarEvents();
      await this.populateCampaigns();
      
      console.log('✅ [DEMO] All demo data populated successfully!');
    } catch (error) {
      console.error('❌ [DEMO] Error populating demo data:', error);
      throw error;
    }
  }

  /**
   * Clear existing demo data
   */
  private async clearExistingDemoData(): Promise<void> {
    console.log('🧹 [DEMO] Clearing existing demo data...');
    
    const tables = [
      'leads', 'deals', 'inventory', 'activities', 
      'team_members', 'notifications', 'calendar_events', 'campaigns'
    ];
    
    for (const table of tables) {
      try {
        await this.supabase
          .from(table)
          .delete()
          .eq('organization_id', this.organizationId);
      } catch (error) {
        // Table might not exist, continue
        console.warn(`⚠️ [DEMO] Could not clear table ${table}:`, error);
      }
    }
  }

  /**
   * Populate demo leads
   */
  private async populateLeads(): Promise<void> {
    console.log('👥 [DEMO] Populating leads...');
    
    const leadsData = DEMO_LEADS.map(lead => ({
      ...lead,
      organization_id: this.organizationId,
      assigned_to: this.userId,
      id: `demo_lead_${Math.random().toString(36).substr(2, 9)}`
    }));

    const { error } = await this.supabase
      .from('leads')
      .insert(leadsData);

    if (error) {
      console.error('❌ [DEMO] Error inserting leads:', error);
    } else {
      console.log(`✅ [DEMO] Inserted ${leadsData.length} leads`);
    }
  }

  /**
   * Populate demo deals
   */
  private async populateDeals(): Promise<void> {
    console.log('💰 [DEMO] Populating deals...');
    
    const dealsData = DEMO_DEALS.map(deal => ({
      ...deal,
      organization_id: this.organizationId,
      assigned_to: this.userId,
      id: `demo_deal_${Math.random().toString(36).substr(2, 9)}`
    }));

    const { error } = await this.supabase
      .from('deals')
      .insert(dealsData);

    if (error) {
      console.error('❌ [DEMO] Error inserting deals:', error);
    } else {
      console.log(`✅ [DEMO] Inserted ${dealsData.length} deals`);
    }
  }

  /**
   * Populate demo inventory
   */
  private async populateInventory(): Promise<void> {
    console.log('🚗 [DEMO] Populating inventory...');
    
    const inventoryData = DEMO_INVENTORY.map(item => ({
      ...item,
      organization_id: this.organizationId,
      id: `demo_inv_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    const { error } = await this.supabase
      .from('inventory')
      .insert(inventoryData);

    if (error) {
      console.error('❌ [DEMO] Error inserting inventory:', error);
    } else {
      console.log(`✅ [DEMO] Inserted ${inventoryData.length} inventory items`);
    }
  }

  /**
   * Populate demo activities
   */
  private async populateActivities(): Promise<void> {
    console.log('📋 [DEMO] Populating activities...');
    
    const activitiesData = DEMO_ACTIVITIES.map(activity => ({
      ...activity,
      organization_id: this.organizationId,
      user_id: this.userId,
      id: `demo_act_${Math.random().toString(36).substr(2, 9)}`
    }));

    const { error } = await this.supabase
      .from('activities')
      .insert(activitiesData);

    if (error) {
      console.error('❌ [DEMO] Error inserting activities:', error);
    } else {
      console.log(`✅ [DEMO] Inserted ${activitiesData.length} activities`);
    }
  }

  /**
   * Populate demo team members
   */
  private async populateTeamMembers(): Promise<void> {
    console.log('👥 [DEMO] Populating team members...');
    
    const teamMembers = [
      {
        name: 'Alex Thompson',
        email: 'alex.thompson@premierautosales.com',
        role: 'Senior Sales Representative',
        phone: '(555) 111-2222',
        hire_date: '2022-03-15',
        status: 'active',
        performance_metrics: {
          monthly_sales: 12,
          conversion_rate: 0.68,
          customer_satisfaction: 4.8
        }
      },
      {
        name: 'Maria Garcia',
        email: 'maria.garcia@premierautosales.com',
        role: 'Sales Representative',
        phone: '(555) 333-4444',
        hire_date: '2023-01-10',
        status: 'active',
        performance_metrics: {
          monthly_sales: 9,
          conversion_rate: 0.62,
          customer_satisfaction: 4.6
        }
      },
      {
        name: 'Mike Rodriguez',
        email: 'mike.rodriguez@premierautosales.com',
        role: 'Sales Representative',
        phone: '(555) 555-6666',
        hire_date: '2023-06-01',
        status: 'active',
        performance_metrics: {
          monthly_sales: 7,
          conversion_rate: 0.58,
          customer_satisfaction: 4.5
        }
      }
    ];

    const teamData = teamMembers.map(member => ({
      ...member,
      organization_id: this.organizationId,
      id: `demo_team_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString()
    }));

    const { error } = await this.supabase
      .from('team_members')
      .insert(teamData);

    if (error) {
      console.error('❌ [DEMO] Error inserting team members:', error);
    } else {
      console.log(`✅ [DEMO] Inserted ${teamData.length} team members`);
    }
  }

  /**
   * Populate demo settings
   */
  private async populateSettings(): Promise<void> {
    console.log('⚙️ [DEMO] Populating organization settings...');
    
    const settings = {
      business_hours: {
        monday: { start: '08:00', end: '18:00', enabled: true },
        tuesday: { start: '08:00', end: '18:00', enabled: true },
        wednesday: { start: '08:00', end: '18:00', enabled: true },
        thursday: { start: '08:00', end: '18:00', enabled: true },
        friday: { start: '08:00', end: '18:00', enabled: true },
        saturday: { start: '09:00', end: '17:00', enabled: true },
        sunday: { start: '12:00', end: '17:00', enabled: false }
      },
      notifications: {
        email_enabled: true,
        sms_enabled: true,
        lead_notifications: true,
        deal_notifications: true,
        inventory_alerts: true
      },
      integrations: {
        email_provider: 'gmail',
        calendar_sync: true,
        phone_system: 'ringcentral',
        accounting_software: 'quickbooks'
      },
      sales_process: {
        lead_stages: ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Closed'],
        deal_stages: ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closing', 'Won', 'Lost'],
        follow_up_reminders: true,
        automatic_assignments: true
      }
    };

    const { error } = await this.supabase
      .from('organization_settings')
      .upsert({
        organization_id: this.organizationId,
        settings: settings,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('❌ [DEMO] Error inserting settings:', error);
    } else {
      console.log('✅ [DEMO] Organization settings updated');
    }
  }

  /**
   * Populate demo metrics and analytics
   */
  private async populateMetrics(): Promise<void> {
    console.log('📊 [DEMO] Populating metrics...');
    
    const metrics = {
      current_month: {
        leads_generated: 45,
        deals_closed: 12,
        revenue: 485000,
        conversion_rate: 0.62,
        average_deal_size: 40416,
        customer_satisfaction: 4.6
      },
      last_month: {
        leads_generated: 38,
        deals_closed: 10,
        revenue: 420000,
        conversion_rate: 0.58,
        average_deal_size: 42000,
        customer_satisfaction: 4.5
      },
      trends: {
        leads: [32, 35, 38, 42, 45],
        deals: [8, 9, 10, 11, 12],
        revenue: [320000, 350000, 420000, 460000, 485000]
      }
    };

    const { error } = await this.supabase
      .from('analytics_metrics')
      .upsert({
        organization_id: this.organizationId,
        metrics: metrics,
        period: 'current',
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('❌ [DEMO] Error inserting metrics:', error);
    } else {
      console.log('✅ [DEMO] Analytics metrics updated');
    }
  }

  /**
   * Populate demo notifications
   */
  private async populateNotifications(): Promise<void> {
    console.log('🔔 [DEMO] Populating notifications...');
    
    const notifications = [
      {
        type: 'lead',
        title: 'New Hot Lead',
        message: 'John Mitchell submitted a contact form for Honda Accord',
        priority: 'high',
        read: false,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        type: 'deal',
        title: 'Deal Update',
        message: 'Tesla Model Y deal moved to closing stage',
        priority: 'medium',
        read: false,
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        type: 'task',
        title: 'Follow-up Required',
        message: 'Schedule follow-up call with Sarah Johnson',
        priority: 'medium',
        read: true,
        created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
      },
      {
        type: 'system',
        title: 'Integration Sync',
        message: 'Email integration successfully synced 15 new contacts',
        priority: 'low',
        read: true,
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    const notificationData = notifications.map(notification => ({
      ...notification,
      organization_id: this.organizationId,
      user_id: this.userId,
      id: `demo_notif_${Math.random().toString(36).substr(2, 9)}`
    }));

    const { error } = await this.supabase
      .from('notifications')
      .insert(notificationData);

    if (error) {
      console.error('❌ [DEMO] Error inserting notifications:', error);
    } else {
      console.log(`✅ [DEMO] Inserted ${notificationData.length} notifications`);
    }
  }

  /**
   * Populate demo calendar events
   */
  private async populateCalendarEvents(): Promise<void> {
    console.log('📅 [DEMO] Populating calendar events...');
    
    const events = [
      {
        title: 'Test Drive - David Thompson',
        description: 'Tesla Model Y test drive appointment',
        start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
        type: 'appointment',
        customer_name: 'David Thompson',
        status: 'scheduled'
      },
      {
        title: 'Follow-up Call - John Mitchell',
        description: 'Discuss financing options for Honda Accord',
        start_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
        type: 'call',
        customer_name: 'John Mitchell',
        status: 'scheduled'
      },
      {
        title: 'Sales Team Meeting',
        description: 'Weekly sales team meeting to review performance',
        start_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
        type: 'meeting',
        status: 'scheduled'
      }
    ];

    const eventData = events.map(event => ({
      ...event,
      organization_id: this.organizationId,
      user_id: this.userId,
      id: `demo_event_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString()
    }));

    const { error } = await this.supabase
      .from('calendar_events')
      .insert(eventData);

    if (error) {
      console.error('❌ [DEMO] Error inserting calendar events:', error);
    } else {
      console.log(`✅ [DEMO] Inserted ${eventData.length} calendar events`);
    }
  }

  /**
   * Populate demo campaigns
   */
  private async populateCampaigns(): Promise<void> {
    console.log('📧 [DEMO] Populating marketing campaigns...');
    
    const campaigns = [
      {
        name: 'Spring Sales Event',
        type: 'email',
        status: 'active',
        start_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        metrics: {
          sent: 2500,
          opened: 875,
          clicked: 230,
          converted: 45,
          revenue: 180000
        }
      },
      {
        name: 'Holiday Promotion',
        type: 'social',
        status: 'completed',
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        metrics: {
          impressions: 50000,
          clicks: 1200,
          leads: 85,
          converted: 12,
          revenue: 156000
        }
      }
    ];

    const campaignData = campaigns.map(campaign => ({
      ...campaign,
      organization_id: this.organizationId,
      created_by: this.userId,
      id: `demo_camp_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString()
    }));

    const { error } = await this.supabase
      .from('campaigns')
      .insert(campaignData);

    if (error) {
      console.error('❌ [DEMO] Error inserting campaigns:', error);
    } else {
      console.log(`✅ [DEMO] Inserted ${campaignData.length} campaigns`);
    }
  }
}

// =============================================================================
// DEMO AUTHENTICATION HELPER
// =============================================================================

/**
 * Check if the current login is a demo login
 */
export function isDemoLogin(email: string, password?: string): boolean {
  return email === DEMO_CREDENTIALS.email;
}

/**
 * Initialize demo data for a demo user session
 */
export async function initializeDemoData(supabase: any, organizationId: string, userId: string): Promise<void> {
  const demoProvider = new DemoDataProvider(supabase, organizationId, userId);
  await demoProvider.populateAllDemoData();
}

// =============================================================================
// API ROUTE INTEGRATION
// =============================================================================

/**
 * Demo data API endpoint helper
 * Call this from your login API route when demo credentials are detected
 */
export async function handleDemoLogin(request: any, supabase: any): Promise<any> {
  try {
    console.log('🎬 [DEMO] Demo login detected, initializing demo data...');
    
    // Get or create demo organization
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('subdomain', DEMO_CREDENTIALS.subdomain)
      .single();

    let organization = orgData;
    
    if (orgError || !organization) {
      // Create demo organization
      const { data: newOrg, error: createError } = await supabase
        .from('organizations')
        .insert({
          name: DEMO_CREDENTIALS.organizationName,
          subdomain: DEMO_CREDENTIALS.subdomain,
          plan: 'demo',
          status: 'active',
          settings: {
            timezone: 'UTC',
            currency: 'USD',
            demo_mode: true
          }
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }
      
      organization = newOrg;
    }

    // Get or create demo user
    const { data: userData, error: userError } = await supabase.auth.signInWithPassword({
      email: DEMO_CREDENTIALS.email,
      password: DEMO_CREDENTIALS.password
    });

    if (userError) {
      throw userError;
    }

    // Initialize demo data
    await initializeDemoData(supabase, organization.id, userData.user.id);
    
    console.log('✅ [DEMO] Demo environment fully initialized');
    
    return {
      user: userData.user,
      organization: organization,
      demo_mode: true
    };
    
  } catch (error) {
    console.error('❌ [DEMO] Error initializing demo:', error);
    throw error;
  }
}

export default DemoDataProvider;