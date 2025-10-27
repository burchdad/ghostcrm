/**
 * Tenant AI Agent Dashboard
 * 
 * Simplified dashboard interface for dealership owners to manage their
 * AI sales agents with easy-to-use controls and performance metrics
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// Temporary inline components until UI library is available
const Progress = ({ value, className }: { value: number; className?: string }) => (
  <div className={`bg-gray-200 rounded-full overflow-hidden ${className || ''}`}>
    <div 
      className="bg-blue-600 h-full transition-all duration-300" 
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

const Switch = ({ 
  checked, 
  onCheckedChange 
}: { 
  checked: boolean; 
  onCheckedChange: (checked: boolean) => void;
}) => (
  <button
    onClick={() => onCheckedChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
      checked ? 'bg-blue-600' : 'bg-gray-200'
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);
import { 
  MessageSquare, 
  Users, 
  TrendingUp,
  Phone,
  Mail,
  Calendar,
  Settings,
  Play,
  Pause,
  BarChart3,
  Target,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Bot,
  Zap,
  PhoneCall
} from 'lucide-react';

interface TenantAgent {
  id: string;
  name: string;
  type: 'inbound-lead' | 'outbound-campaign' | 'conversational-sales';
  status: 'running' | 'paused' | 'stopped' | 'error';
  isActive: boolean;
  performance: AgentPerformance;
  configuration: Record<string, any>;
  lastActivity: Date;
}

interface AgentPerformance {
  leadsProcessed: number;
  conversionsGenerated: number;
  conversionRate: number;
  averageResponseTime: number;
  customerSatisfaction: number;
  totalRevenue: number;
}

interface DashboardMetrics {
  totalLeads: number;
  qualifiedLeads: number;
  appointmentsScheduled: number;
  dealsInProgress: number;
  monthlyRevenue: number;
  leadConversionRate: number;
}

interface TenantAgentDashboardProps {
  tenantId: string;
  dealershipName: string;
}

export const TenantAgentDashboard: React.FC<TenantAgentDashboardProps> = ({
  tenantId,
  dealershipName
}) => {
  const [agents, setAgents] = useState<TenantAgent[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalLeads: 0,
    qualifiedLeads: 0,
    appointmentsScheduled: 0,
    dealsInProgress: 0,
    monthlyRevenue: 0,
    leadConversionRate: 0
  });
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [tenantId]);

  const loadDashboardData = async () => {
    try {
      const [agentsResponse, metricsResponse] = await Promise.all([
        fetch(`/api/tenant-agents/${tenantId}`),
        fetch(`/api/tenant-agents/${tenantId}/metrics`)
      ]);

      const agentsData = await agentsResponse.json();
      const metricsData = await metricsResponse.json();

      setAgents(agentsData.agents || []);
      setMetrics(metricsData.metrics || {});
      setLoading(false);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setLoading(false);
    }
  };

  const toggleAgent = async (agentId: string, isActive: boolean) => {
    try {
      await fetch(`/api/tenant-agents/${tenantId}/${agentId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      });

      setAgents(prev => prev.map(agent => 
        agent.id === agentId 
          ? { ...agent, isActive, status: isActive ? 'running' : 'paused' }
          : agent
      ));
    } catch (error) {
      console.error('Failed to toggle agent:', error);
    }
  };

  const getAgentIcon = (type: TenantAgent['type']) => {
    switch (type) {
      case 'inbound-lead': return <Users className="h-5 w-5" />;
      case 'outbound-campaign': return <Mail className="h-5 w-5" />;
      case 'conversational-sales': return <MessageSquare className="h-5 w-5" />;
      default: return <Bot className="h-5 w-5" />;
    }
  };

  const getAgentTitle = (type: TenantAgent['type']) => {
    switch (type) {
      case 'inbound-lead': return 'Lead Capture';
      case 'outbound-campaign': return 'Campaign Manager';
      case 'conversational-sales': return 'Sales Assistant';
      default: return 'AI Agent';
    }
  };

  const getStatusColor = (status: TenantAgent['status']) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'stopped': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your AI agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{dealershipName} AI Agents</h1>
          <p className="text-gray-600">Manage your intelligent sales automation</p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalLeads}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Qualified Leads</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.qualifiedLeads}</div>
            <p className="text-xs text-muted-foreground">Ready to convert</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.appointmentsScheduled}</div>
            <p className="text-xs text-muted-foreground">Scheduled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.dealsInProgress}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.leadConversionRate}%</div>
            <p className="text-xs text-muted-foreground">Lead to sale</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="agents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="agents">AI Agents</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="setup">Quick Setup</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <Card key={agent.id} className="relative">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center space-x-2">
                    {getAgentIcon(agent.type)}
                    <div>
                      <CardTitle className="text-lg">{getAgentTitle(agent.type)}</CardTitle>
                      <p className="text-sm text-muted-foreground">{agent.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)}`}></div>
                    <Switch
                      checked={agent.isActive}
                      onCheckedChange={(checked) => toggleAgent(agent.id, checked)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Performance</span>
                      <span className="font-medium">{agent.performance.conversionRate}%</span>
                    </div>
                    <Progress value={agent.performance.conversionRate} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Leads Processed</p>
                      <p className="font-bold">{agent.performance.leadsProcessed}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Conversions</p>
                      <p className="font-bold">{agent.performance.conversionsGenerated}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Avg Response</p>
                      <p className="font-bold">{agent.performance.averageResponseTime}s</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Satisfaction</p>
                      <p className="font-bold">{agent.performance.customerSatisfaction}/5</p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setSelectedAgent(agent.id)}
                    >
                      Configure
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      View Logs
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Lead Generation Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Website Forms</span>
                    <span className="font-bold">45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span>Phone Calls</span>
                    <span className="font-bold">30%</span>
                  </div>
                  <Progress value={30} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span>Chat Interactions</span>
                    <span className="font-bold">25%</span>
                  </div>
                  <Progress value={25} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Time Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Under 1 minute</span>
                    <span className="font-bold text-green-600">78%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>1-5 minutes</span>
                    <span className="font-bold text-yellow-600">18%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Over 5 minutes</span>
                    <span className="font-bold text-red-600">4%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="setup" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Agent Setup</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Get started with pre-configured AI agents in minutes
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium">Lead Capture Agent</p>
                        <p className="text-sm text-muted-foreground">Capture website leads automatically</p>
                      </div>
                    </div>
                    <Button size="sm">Setup</Button>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium">Email Campaign Agent</p>
                        <p className="text-sm text-muted-foreground">Automate follow-up emails</p>
                      </div>
                    </div>
                    <Button size="sm">Setup</Button>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <MessageSquare className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="font-medium">Chat Assistant</p>
                        <p className="text-sm text-muted-foreground">Real-time customer support</p>
                      </div>
                    </div>
                    <Button size="sm">Setup</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Integration Checklist</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Connect your existing tools for maximum effectiveness
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Website contact forms connected</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                    <span>CRM system integration pending</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Email service provider linked</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                    <span>Phone system integration pending</span>
                  </div>
                </div>

                <Button className="w-full mt-4">
                  Complete Setup Guide
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};