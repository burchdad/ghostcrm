import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the authenticated user
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's tenant from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id, role')
      .eq('id', session.user.id)
      .single();

    if (!profile?.tenant_id) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Fetch recent activities from various sources
    const [dealsResult, leadsResult, teamResult, inventoryResult] = await Promise.all([
      // Recent deals/sales
      supabase
        .from('deals')
        .select(`
          id,
          title,
          amount,
          status,
          created_at,
          updated_at,
          customer:customers(name)
        `)
        .eq('tenant_id', profile.tenant_id)
        .order('updated_at', { ascending: false })
        .limit(5),
      
      // Recent leads
      supabase
        .from('leads')
        .select(`
          id,
          name,
          email,
          source,
          status,
          created_at
        `)
        .eq('tenant_id', profile.tenant_id)
        .order('created_at', { ascending: false })
        .limit(5),
      
      // Recent team activities (new team members, role changes)
      supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          role,
          created_at
        `)
        .eq('tenant_id', profile.tenant_id)
        .order('created_at', { ascending: false })
        .limit(3),
      
      // Recent inventory updates
      supabase
        .from('inventory')
        .select(`
          id,
          make,
          model,
          year,
          price,
          status,
          created_at,
          updated_at
        `)
        .eq('tenant_id', profile.tenant_id)
        .order('updated_at', { ascending: false })
        .limit(5)
    ]);

    // Process and combine activities
    const activities = [];

    // Add completed deals
    if (dealsResult.data) {
      dealsResult.data
        .filter(deal => deal.status === 'closed_won')
        .forEach(deal => {
          activities.push({
            id: `deal_${deal.id}`,
            type: 'sale_completed',
            title: 'New sale completed',
            description: `${deal.title} - $${deal.amount?.toLocaleString() || 'Amount not specified'}`,
            timestamp: deal.updated_at,
            status: 'success',
            drilldown: {
              url: `/tenant-owner/deals/${deal.id}`,
              action: 'View Deal Details'
            }
          });
        });
    }

    // Add new team members
    if (teamResult.data) {
      teamResult.data
        .filter(member => {
          const createdAt = new Date(member.created_at);
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          return createdAt > sevenDaysAgo;
        })
        .forEach(member => {
          activities.push({
            id: `team_${member.id}`,
            type: 'team_member_added',
            title: 'Team member added',
            description: `${member.full_name || 'New team member'} joined as ${member.role}`,
            timestamp: member.created_at,
            status: 'info',
            drilldown: {
              url: `/tenant-owner/team/${member.id}`,
              action: 'View Team Member'
            }
          });
        });
    }

    // Add new inventory
    if (inventoryResult.data) {
      const recentInventory = inventoryResult.data
        .filter(item => {
          const createdAt = new Date(item.created_at);
          const threeDaysAgo = new Date();
          threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
          return createdAt > threeDaysAgo;
        });
      
      if (recentInventory.length > 0) {
        activities.push({
          id: `inventory_${Date.now()}`,
          type: 'inventory_update',
          title: 'Inventory update',
          description: `${recentInventory.length} new vehicles added`,
          timestamp: recentInventory[0].created_at,
          status: 'warning',
          drilldown: {
            url: '/tenant-owner/inventory',
            action: 'View Inventory'
          }
        });
      }
    }

    // Add new leads
    if (leadsResult.data) {
      leadsResult.data
        .filter(lead => {
          const createdAt = new Date(lead.created_at);
          const oneDayAgo = new Date();
          oneDayAgo.setDate(oneDayAgo.getDate() - 1);
          return createdAt > oneDayAgo;
        })
        .slice(0, 2) // Limit to 2 recent leads
        .forEach(lead => {
          activities.push({
            id: `lead_${lead.id}`,
            type: 'new_lead',
            title: 'New lead generated',
            description: `${lead.name} via ${lead.source || 'website'}`,
            timestamp: lead.created_at,
            status: 'info',
            drilldown: {
              url: `/tenant-owner/leads/${lead.id}`,
              action: 'View Lead Details'
            }
          });
        });
    }

    // Sort by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Limit to 6 most recent activities
    const recentActivities = activities.slice(0, 6);

    return NextResponse.json({
      activities: recentActivities,
      total: activities.length
    });

  } catch (error) {
    console.error('Error fetching activity data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}