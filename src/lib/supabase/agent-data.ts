import { supabaseAdmin } from '../supabaseAdmin';

interface LeadActivity {
  id: string;
  type: string;
  description: string;
  created_at: string;
  lead_id: string;
}

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  score: number;
  source: string;
  created_at: string;
  last_contacted?: string;
  notes?: string;
  assigned_to?: string;
  conversion_probability?: number;
  estimated_value?: number;
  stage?: string;
  activities?: LeadActivity[];
}

interface LeadsDataResult {
  leads: Lead[];
  analytics: {
    total: number;
    qualified: number;
    active: number;
    avgScore: number;
    leadsBySource: Record<string, number>;
    conversionFunnel: {
      new: number;
      contacted: number;
      qualified: number;
      converted: number;
    };
    conversionRate: number;
  };
}

export interface AgentDataConnector {
  getLeadsData(): Promise<LeadsDataResult>;
  getDealsData(): Promise<any>;
  getInventoryData(): Promise<any>;
  getCalendarData(): Promise<any>;
  getTeamData(): Promise<any>;
  getWorkflowData(): Promise<any>;
}

export class SupabaseAgentDataConnector implements AgentDataConnector {
  
  async getLeadsData(): Promise<LeadsDataResult> {
    try {
      const { data: leads, error } = await supabaseAdmin
        .from('leads')
        .select(`
          id,
          name,
          email,
          phone,
          status,
          score,
          source,
          created_at,
          last_contacted,
          notes,
          assigned_to,
          conversion_probability,
          estimated_value,
          stage,
        `)
        .order('created_at', { ascending: false });

      // Get activities separately to avoid relationship issues
      const { data: activitiesData } = await supabaseAdmin
        .from('activities')
        .select('id, type, description, created_at, lead_id')
        .not('lead_id', 'is', null);

      // Combine leads with their activities  
      const leadsArray = (leads || []) as unknown as Lead[];
      const leadsWithActivities: Lead[] = leadsArray.map(lead => {
        const leadActivities = activitiesData?.filter(activity => activity.lead_id === lead.id) || [];
        return Object.assign({}, lead, { activities: leadActivities });
      });

      if (error) throw error;

      // Calculate analytics using the original leads data
      const leadsForAnalytics = (leads || []) as unknown as Lead[];
      const totalLeads = leadsForAnalytics.length;
      const qualifiedLeads = leadsForAnalytics.filter(l => l.score >= 70).length;
      const activeLeads = leadsForAnalytics.filter(l => l.status === 'active').length;
      const avgScore = leadsForAnalytics.reduce((sum, l) => sum + (l.score || 0), 0) / totalLeads || 0;

      const leadsBySource = leadsForAnalytics.reduce((acc, lead) => {
        acc[lead.source] = (acc[lead.source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const conversionFunnel = {
        new: leadsForAnalytics.filter(l => l.stage === 'new').length,
        contacted: leadsForAnalytics.filter(l => l.stage === 'contacted').length,
        qualified: leadsForAnalytics.filter(l => l.stage === 'qualified').length,
        converted: leadsForAnalytics.filter(l => l.stage === 'converted').length,
      };

      return {
        leads: leadsWithActivities,
        analytics: {
          total: totalLeads,
          qualified: qualifiedLeads,
          active: activeLeads,
          avgScore,
          leadsBySource,
          conversionFunnel,
          conversionRate: totalLeads > 0 ? (conversionFunnel.converted / totalLeads) * 100 : 0
        }
      };
    } catch (error) {
      console.error('Error fetching leads data:', error);
      throw error;
    }
  }

  async getDealsData() {
    try {
      const { data: deals, error } = await supabaseAdmin
        .from('deals')
        .select(`
          id,
          name,
          value,
          stage,
          probability,
          expected_close_date,
          created_at,
          updated_at,
          assigned_to,
          contact_id,
          organization_id,
          notes,
          activities:deal_activities(
            id,
            type,
            description,
            created_at
          ),
          products:deal_products(
            id,
            product_name,
            quantity,
            price
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate pipeline analytics
      const totalValue = deals?.reduce((sum, deal) => sum + (deal.value || 0), 0) || 0;
      const weightedValue = deals?.reduce((sum, deal) => 
        sum + ((deal.value || 0) * (deal.probability || 0) / 100), 0) || 0;

      const dealsByStage = deals?.reduce((acc, deal) => {
        acc[deal.stage] = (acc[deal.stage] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const wonDeals = deals?.filter(d => d.stage === 'won').length || 0;
      const lostDeals = deals?.filter(d => d.stage === 'lost').length || 0;
      const winRate = (wonDeals + lostDeals) > 0 ? (wonDeals / (wonDeals + lostDeals)) * 100 : 0;

      const avgDealSize = deals && deals.length > 0 ? totalValue / deals.length : 0;

      return {
        deals: deals || [],
        analytics: {
          totalValue,
          weightedValue,
          totalDeals: deals?.length || 0,
          dealsByStage,
          winRate,
          avgDealSize,
          forecast: {
            thisMonth: weightedValue * 0.3, // Rough estimate
            nextMonth: weightedValue * 0.5,
            quarter: weightedValue
          }
        }
      };
    } catch (error) {
      console.error('Error fetching deals data:', error);
      throw error;
    }
  }

  async getInventoryData() {
    try {
      const { data: inventory, error } = await supabaseAdmin
        .from('inventory')
        .select(`
          id,
          vin,
          year,
          make,
          model,
          trim,
          price,
          cost,
          mileage,
          condition,
          status,
          days_on_lot,
          created_at,
          updated_at,
          location,
          images,
          features
        `)
        .order('days_on_lot', { ascending: false });

      if (error) throw error;

      // Calculate inventory analytics
      const totalValue = inventory?.reduce((sum, item) => sum + (item.price || 0), 0) || 0;
      const totalCost = inventory?.reduce((sum, item) => sum + (item.cost || 0), 0) || 0;
      const avgDaysOnLot = inventory && inventory.length > 0 
        ? inventory.reduce((sum, item) => sum + (item.days_on_lot || 0), 0) / inventory.length 
        : 0;

      const slowMovers = inventory?.filter(item => (item.days_on_lot || 0) > 60).length || 0;
      const fastMovers = inventory?.filter(item => (item.days_on_lot || 0) < 30).length || 0;

      const inventoryByMake = inventory?.reduce((acc, item) => {
        acc[item.make] = (acc[item.make] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const profitMargin = totalValue > 0 ? ((totalValue - totalCost) / totalValue) * 100 : 0;

      return {
        inventory: inventory || [],
        analytics: {
          total: inventory?.length || 0,
          totalValue,
          totalCost,
          avgDaysOnLot,
          slowMovers,
          fastMovers,
          inventoryByMake,
          profitMargin,
          turnoverRate: 365 / avgDaysOnLot // Annual turnover estimate
        }
      };
    } catch (error) {
      console.error('Error fetching inventory data:', error);
      throw error;
    }
  }

  async getCalendarData() {
    try {
      const { data: appointments, error } = await supabaseAdmin
        .from('appointments')
        .select(`
          id,
          title,
          description,
          start_date,
          end_date,
          type,
          status,
          attendees,
          location,
          created_at,
          updated_at,
          lead_id,
          deal_id,
          notes
        `)
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true });

      if (error) throw error;

      // Calculate calendar analytics
      const today = new Date();
      const todayAppointments = appointments?.filter(apt => {
        const aptDate = new Date(apt.start_date);
        return aptDate.toDateString() === today.toDateString();
      }).length || 0;

      const thisWeek = new Date();
      thisWeek.setDate(thisWeek.getDate() + 7);
      const weeklyAppointments = appointments?.filter(apt => {
        const aptDate = new Date(apt.start_date);
        return aptDate <= thisWeek;
      }).length || 0;

      const appointmentsByType = appointments?.reduce((acc, apt) => {
        acc[apt.type] = (acc[apt.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const upcomingAppointments = appointments?.filter(apt => 
        new Date(apt.start_date) > new Date()
      ) || [];

      return {
        appointments: appointments || [],
        analytics: {
          total: appointments?.length || 0,
          today: todayAppointments,
          thisWeek: weeklyAppointments,
          appointmentsByType,
          upcoming: upcomingAppointments.length,
          completed: appointments?.filter(apt => apt.status === 'completed').length || 0,
          cancelled: appointments?.filter(apt => apt.status === 'cancelled').length || 0
        }
      };
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      throw error;
    }
  }

  async getTeamData() {
    try {
      const [membersResult, activityResult] = await Promise.all([
        supabaseAdmin
          .from('team_members')
          .select(`
            id,
            name,
            email,
            role,
            status,
            last_active,
            created_at,
            performance_metrics,
            assigned_leads,
            assigned_deals
          `),
        supabaseAdmin
          .from('team_activities')
          .select(`
            id,
            user_id,
            type,
            description,
            created_at,
            metadata
          `)
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      ]);

      const { data: members, error: membersError } = membersResult;
      const { data: activities, error: activitiesError } = activityResult;

      if (membersError) throw membersError;
      if (activitiesError) throw activitiesError;

      // Calculate team analytics
      const activeMembers = members?.filter(m => m.status === 'active').length || 0;
      const totalMembers = members?.length || 0;

      const membersByRole = members?.reduce((acc, member) => {
        acc[member.role] = (acc[member.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const weeklyActivity = activities?.length || 0;
      const avgActivitiesPerMember = totalMembers > 0 ? weeklyActivity / totalMembers : 0;

      return {
        members: members || [],
        activities: activities || [],
        analytics: {
          totalMembers,
          activeMembers,
          membersByRole,
          weeklyActivity,
          avgActivitiesPerMember,
          productivity: avgActivitiesPerMember > 10 ? 'high' : avgActivitiesPerMember > 5 ? 'medium' : 'low'
        }
      };
    } catch (error) {
      console.error('Error fetching team data:', error);
      throw error;
    }
  }

  async getWorkflowData() {
    try {
      const { data: workflows, error } = await supabaseAdmin
        .from('workflows')
        .select(`
          id,
          name,
          description,
          status,
          trigger_type,
          actions,
          created_at,
          updated_at,
          execution_count,
          success_rate,
          last_executed,
          execution_logs:workflow_executions(
            id,
            status,
            started_at,
            completed_at,
            error_message
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate workflow analytics
      const activeWorkflows = workflows?.filter(w => w.status === 'active').length || 0;
      const totalExecutions = workflows?.reduce((sum, w) => sum + (w.execution_count || 0), 0) || 0;
      const avgSuccessRate = workflows && workflows.length > 0 
        ? workflows.reduce((sum, w) => sum + (w.success_rate || 0), 0) / workflows.length 
        : 0;

      const workflowsByType = workflows?.reduce((acc, workflow) => {
        acc[workflow.trigger_type] = (acc[workflow.trigger_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      return {
        workflows: workflows || [],
        analytics: {
          total: workflows?.length || 0,
          active: activeWorkflows,
          totalExecutions,
          avgSuccessRate,
          workflowsByType,
          avgExecutionTime: 2500, // ms - would need to calculate from execution logs
          automationSavings: totalExecutions * 5 // Rough estimate of minutes saved
        }
      };
    } catch (error) {
      console.error('Error fetching workflow data:', error);
      throw error;
    }
  }
}

// Singleton instance
export const agentDataConnector = new SupabaseAgentDataConnector();