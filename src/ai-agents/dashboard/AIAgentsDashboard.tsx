/**
 * AI Agents Dashboard Component
 * 
 * Comprehensive dashboard for monitoring all AI agents and providing
 * conversational business intelligence interface
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Progress } from '@/components/ui/progress'; // Commented out until UI component is available
import { 
  Activity, 
  MessageSquare, 
  BarChart3, 
  Database, 
  Zap, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  TrendingUp,
  Send,
  Bot,
  Shield,
  Link,
  DollarSign,
  Building,
  Code
} from 'lucide-react';

// Simple Progress component replacement
const Progress = ({ value, className }: { value: number; className?: string }) => (
  <div className={`bg-gray-200 rounded-full h-2 ${className || ''}`}>
    <div 
      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

interface AgentStatus {
  id: string;
  name: string;
  status: 'stopped' | 'starting' | 'running' | 'error';
  health: number;
  uptime: number;
  lastError?: string;
  description: string;
  category: string;
}

interface SystemHealth {
  overallStatus: 'healthy' | 'warning' | 'critical';
  totalAgents: number;
  runningAgents: number;
  errorAgents: number;
  uptime: number;
}

interface BusinessMetric {
  id: string;
  name: string;
  value: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  category: string;
}

interface ConversationMessage {
  id: string;
  content: string;
  type: 'user' | 'agent' | 'system';
  timestamp: Date;
}

export const AIAgentsDashboard: React.FC = () => {
  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetric[]>([]);
  const [conversationMessages, setConversationMessages] = useState<ConversationMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAgentStatus();
    fetchBusinessMetrics();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(() => {
      fetchAgentStatus();
      fetchBusinessMetrics();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [conversationMessages]);

  const fetchAgentStatus = async () => {
    try {
      // In real implementation, this would call the agent status API
      const mockData = {
        systemHealth: {
          overallStatus: 'healthy' as const,
          totalAgents: 9, // Updated to include Code Intelligence Agent
          runningAgents: 9,
          errorAgents: 0,
          uptime: 86400000 // 24 hours
        },
        agentStatuses: [
          {
            id: 'db-connectivity-monitor',
            name: 'Database Connectivity Monitor',
            status: 'running' as const,
            health: 98,
            uptime: 86400000,
            description: 'Monitors database connections and auto-fixes issues',
            category: 'database'
          },
          {
            id: 'api-performance-monitor',
            name: 'API Performance Monitor',
            status: 'running' as const,
            health: 95,
            uptime: 86400000,
            description: 'Tracks API endpoint performance and optimization',
            category: 'api'
          },
          {
            id: 'business-intelligence-agent',
            name: 'Business Intelligence Agent',
            status: 'running' as const,
            health: 92,
            uptime: 86400000,
            description: 'Provides business insights and data analysis',
            category: 'business'
          },
          {
            id: 'conversational-agent-manager',
            name: 'Conversational Agent Manager',
            status: 'running' as const,
            health: 96,
            uptime: 86400000,
            description: 'Main conversational interface for business assistance',
            category: 'conversation'
          },
          {
            id: 'security-compliance-agent',
            name: 'Security & Compliance Agent',
            status: 'running' as const,
            health: 97,
            uptime: 86400000,
            description: 'Monitors security events, compliance, and threat detection',
            category: 'security'
          },
          {
            id: 'integration-health-agent',
            name: 'Integration Health Agent',
            status: 'running' as const,
            health: 94,
            uptime: 86400000,
            description: 'Monitors webhook deliveries, API sync status, and integration health',
            category: 'integration'
          },
          {
            id: 'billing-intelligence-agent',
            name: 'Billing Intelligence Agent',
            status: 'running' as const,
            health: 93,
            uptime: 86400000,
            description: 'Predicts churn, analyzes payment patterns, and optimizes revenue',
            category: 'billing'
          },
          {
            id: 'tenant-management-agent',
            name: 'Tenant Management Agent',
            status: 'running' as const,
            health: 91,
            uptime: 86400000,
            description: 'Monitors multi-tenant resources, scaling, and performance optimization',
            category: 'tenant'
          },
          {
            id: 'code-intelligence-agent',
            name: 'Code Intelligence Agent',
            status: 'running' as const,
            health: 95,
            uptime: 86400000,
            description: 'Analyzes codebase, assists with development, and provides improvement recommendations',
            category: 'development'
          }
        ]
      };
      
      setSystemHealth(mockData.systemHealth);
      setAgentStatuses(mockData.agentStatuses);
    } catch (error) {
      console.error('Failed to fetch agent status:', error);
    }
  };

  const fetchBusinessMetrics = async () => {
    try {
      // In real implementation, this would call the business metrics API
      const mockMetrics = [
        {
          id: 'monthly_revenue',
          name: 'Monthly Revenue',
          value: 45000,
          changePercent: 18.4,
          trend: 'up' as const,
          category: 'revenue'
        },
        {
          id: 'new_leads',
          name: 'New Leads',
          value: 127,
          changePercent: 29.6,
          trend: 'up' as const,
          category: 'leads'
        },
        {
          id: 'conversion_rate',
          name: 'Conversion Rate',
          value: 23.5,
          changePercent: 22.4,
          trend: 'up' as const,
          category: 'performance'
        },
        {
          id: 'active_customers',
          name: 'Active Customers',
          value: 342,
          changePercent: 7.5,
          trend: 'up' as const,
          category: 'customers'
        }
      ];
      
      setBusinessMetrics(mockMetrics);
    } catch (error) {
      console.error('Failed to fetch business metrics:', error);
    }
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage: ConversationMessage = {
      id: `msg_${Date.now()}`,
      content: currentMessage,
      type: 'user',
      timestamp: new Date()
    };

    setConversationMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      // In real implementation, this would call the conversational agent API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      const agentResponse: ConversationMessage = {
        id: `msg_${Date.now() + 1}`,
        content: generateMockResponse(currentMessage),
        type: 'agent',
        timestamp: new Date()
      };

      setConversationMessages(prev => [...prev, agentResponse]);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('sales') || lowerMessage.includes('revenue')) {
      return "Your sales are performing excellently this month! Revenue is up 18.4% to $45,000, with strong performance across all product lines. The average deal size has increased, and your conversion rate is at an all-time high of 23.5%. Would you like me to analyze what's driving this growth?";
    } else if (lowerMessage.includes('system') || lowerMessage.includes('agent')) {
      return "All AI agents are running smoothly! The system health is excellent with 4/4 agents operational. Database connectivity is stable, API performance is optimal, and business intelligence is providing real-time insights. Is there a specific agent you'd like more details about?";
    } else if (lowerMessage.includes('lead')) {
      return "Lead generation is strong with 127 new leads this month, up 29.6% from last month. The lead quality has improved significantly, and our conversion rate shows we're not just getting more leads but converting them more effectively. The top sources are performing well.";
    } else {
      return "Hello! I'm your AI assistant monitoring your CRM system. I can help you with business insights, system status, and answer questions about your data. Feel free to ask about sales performance, system health, or any business metrics you'd like to understand better.";
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getStatusColor = (status: string, health?: number) => {
    if (status === 'running' && (health || 0) > 90) return 'text-green-600';
    if (status === 'running') return 'text-yellow-600';
    if (status === 'error') return 'text-red-600';
    return 'text-gray-600';
  };

  const getStatusIcon = (status: string, health?: number) => {
    if (status === 'running' && (health || 0) > 90) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (status === 'running') return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    if (status === 'error') return <AlertTriangle className="h-5 w-5 text-red-600" />;
    return <Clock className="h-5 w-5 text-gray-600" />;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'database': return <Database className="h-5 w-5" />;
      case 'api': return <Zap className="h-5 w-5" />;
      case 'business': return <BarChart3 className="h-5 w-5" />;
      case 'conversation': return <MessageSquare className="h-5 w-5" />;
      case 'security': return <Shield className="h-5 w-5" />;
      case 'integration': return <Link className="h-5 w-5" />;
      case 'billing': return <DollarSign className="h-5 w-5" />;
      case 'tenant': return <Building className="h-5 w-5" />;
      case 'development': return <Code className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Agents Dashboard</h1>
          <p className="text-gray-600">Monitor and interact with your CRM's intelligent agents</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={systemHealth?.overallStatus === 'healthy' ? 'default' : 'destructive'}>
            {systemHealth?.overallStatus || 'Unknown'}
          </Badge>
        </div>
      </div>

      {/* System Health Overview */}
      {systemHealth && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>System Health Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{systemHealth.runningAgents}</div>
                <div className="text-sm text-gray-600">Running Agents</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{systemHealth.totalAgents}</div>
                <div className="text-sm text-gray-600">Total Agents</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{systemHealth.errorAgents}</div>
                <div className="text-sm text-gray-600">Error Agents</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(systemHealth.uptime / (1000 * 60 * 60))}h
                </div>
                <div className="text-sm text-gray-600">System Uptime</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="chat">AI Assistant</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Agent Status */}
            <Card>
              <CardHeader>
                <CardTitle>Agent Status Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {agentStatuses.map((agent) => (
                    <div key={agent.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getCategoryIcon(agent.category)}
                        <span className="font-medium">{agent.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={agent.health} className="w-16" />
                        <span className="text-sm text-gray-600">{agent.health}%</span>
                        {getStatusIcon(agent.status, agent.health)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Business Metrics Quick View */}
            <Card>
              <CardHeader>
                <CardTitle>Key Business Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {businessMetrics.slice(0, 4).map((metric) => (
                    <div key={metric.id} className="flex items-center justify-between">
                      <span className="font-medium">{metric.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold">
                          {metric.category === 'revenue' ? '$' : ''}
                          {metric.value.toLocaleString()}
                          {metric.category === 'performance' ? '%' : ''}
                        </span>
                        <div className={`flex items-center space-x-1 ${
                          metric.trend === 'up' ? 'text-green-600' : 
                          metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          <TrendingUp className="h-4 w-4" />
                          <span className="text-sm">{metric.changePercent.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Agents Tab */}
        <TabsContent value="agents" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {agentStatuses.map((agent) => (
              <Card key={agent.id}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {getCategoryIcon(agent.category)}
                    <span>{agent.name}</span>
                    {getStatusIcon(agent.status, agent.health)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-gray-600">{agent.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Health Score</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={agent.health} className="w-24" />
                        <span className="font-bold">{agent.health}%</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Uptime</span>
                      <span className="font-medium">
                        {Math.round(agent.uptime / (1000 * 60 * 60))}h {Math.round((agent.uptime % (1000 * 60 * 60)) / (1000 * 60))}m
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <Badge variant={agent.status === 'running' ? 'default' : 'destructive'}>
                        {agent.status}
                      </Badge>
                    </div>
                    
                    {agent.lastError && (
                      <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        {agent.lastError}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Business Tab */}
        <TabsContent value="business" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {businessMetrics.map((metric) => (
              <Card key={metric.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{metric.name}</p>
                      <p className="text-2xl font-bold">
                        {metric.category === 'revenue' ? '$' : ''}
                        {metric.value.toLocaleString()}
                        {metric.category === 'performance' ? '%' : ''}
                      </p>
                    </div>
                    <div className={`text-right ${
                      metric.trend === 'up' ? 'text-green-600' : 
                      metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      <TrendingUp className="h-6 w-6 mb-1" />
                      <p className="text-sm font-medium">
                        {metric.changePercent > 0 ? '+' : ''}{metric.changePercent.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Chat Tab */}
        <TabsContent value="chat" className="space-y-4">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bot className="h-5 w-5" />
                <span>AI Business Assistant</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {conversationMessages.length === 0 && (
                  <div className="text-center text-gray-500 mt-8">
                    <Bot className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Hello! I'm your AI assistant. Ask me about your business performance, system status, or any insights you need!</p>
                  </div>
                )}
                
                {conversationMessages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p>{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="flex space-x-2">
                <Input
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  placeholder="Ask about sales, system status, or any business insights..."
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  disabled={isLoading}
                />
                <Button onClick={sendMessage} disabled={isLoading || !currentMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIAgentsDashboard;