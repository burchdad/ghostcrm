"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useRibbonPage } from "@/components/ribbon";
import { I18nProvider } from "@/components/utils/I18nProvider";
import { ToastProvider } from "@/components/utils/ToastProvider";
import { 
  Bot, 
  Brain, 
  Zap, 
  Settings,
  Play,
  Pause,
  BarChart3,
  Users,
  MessageSquare,
  Phone,
  Mail,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Clock,
  Plus,
  DollarSign,
  Edit,
  Trash2,
  Eye,
  Volume2,
  Mic
} from "lucide-react";

interface AIAgent {
  id: string;
  name: string;
  type: 'voice' | 'text' | 'hybrid';
  status: 'active' | 'inactive' | 'training';
  personality: string;
  language: string;
  industry: string;
  conversationsToday: number;
  successRate: number;
  averageCallDuration: number;
  totalConversations: number;
  lastActive: string;
  configuration: {
    voiceModel: string;
    responseDelay: number;
    aggressiveness: number;
    empathy: number;
    technicalKnowledge: number;
  };
}

interface AgentMetrics {
  totalAgents: number;
  activeAgents: number;
  dailyConversations: number;
  averageSuccessRate: number;
  totalLeadsGenerated: number;
  costSavings: number;
  uptime: number;
  agentPerformance: Array<{
    agentId: string;
    name: string;
    conversations: number;
    successRate: number;
    revenue: number;
  }>;
}

function AISalesAgentsPage() {
  const { user, tenant } = useAuth();
  const router = useRouter();
  const [agents, setAgents] = useState<AIAgent[]>([
    {
      id: 'agent-001',
      name: 'Alex Professional',
      type: 'voice',
      status: 'active',
      personality: 'Professional & Persuasive',
      language: 'English (US)',
      industry: 'Automotive',
      conversationsToday: 47,
      successRate: 78.5,
      averageCallDuration: 8.2,
      totalConversations: 1247,
      lastActive: '2025-11-05T10:30:00Z',
      configuration: {
        voiceModel: 'Natural Voice Pro',
        responseDelay: 0.8,
        aggressiveness: 7,
        empathy: 8,
        technicalKnowledge: 9
      }
    },
    {
      id: 'agent-002',
      name: 'Sarah Friendly',
      type: 'hybrid',
      status: 'active',
      personality: 'Warm & Conversational',
      language: 'English (US)',
      industry: 'General Sales',
      conversationsToday: 32,
      successRate: 82.1,
      averageCallDuration: 6.5,
      totalConversations: 892,
      lastActive: '2025-11-05T11:15:00Z',
      configuration: {
        voiceModel: 'Friendly Voice',
        responseDelay: 1.2,
        aggressiveness: 4,
        empathy: 9,
        technicalKnowledge: 7
      }
    },
    {
      id: 'agent-003',
      name: 'Marcus Direct',
      type: 'text',
      status: 'training',
      personality: 'Direct & Results-Oriented',
      language: 'English (US)',
      industry: 'B2B Sales',
      conversationsToday: 0,
      successRate: 0,
      averageCallDuration: 0,
      totalConversations: 0,
      lastActive: '',
      configuration: {
        voiceModel: 'N/A',
        responseDelay: 0.5,
        aggressiveness: 9,
        empathy: 5,
        technicalKnowledge: 8
      }
    }
  ]);
  
  const [metrics, setMetrics] = useState<AgentMetrics>({
    totalAgents: 3,
    activeAgents: 2,
    dailyConversations: 79,
    averageSuccessRate: 80.3,
    totalLeadsGenerated: 342,
    costSavings: 48500,
    uptime: 99.7,
    agentPerformance: [
      { agentId: 'agent-001', name: 'Alex Professional', conversations: 47, successRate: 78.5, revenue: 12400 },
      { agentId: 'agent-002', name: 'Sarah Friendly', conversations: 32, successRate: 82.1, revenue: 9800 }
    ]
  });
  
  const [loading, setLoading] = useState(true);
  const [showCreateAgent, setShowCreateAgent] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);

  useRibbonPage({
    context: "ai-sales",
    enable: [
      "quickActions",
      "bulkOps",
      "export",
      "profile",
      "notifications",
      "theme",
      "language",
      "automation"
    ],
    disable: []
  });

  // Redirect non-software owners
  useEffect(() => {
    if (!loading && user) {
      const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
      const isSubdomain = hostname !== 'localhost' && hostname !== '127.0.0.1' && hostname.includes('.localhost');
      const isSoftwareOwner = user.role === 'owner' && !isSubdomain;
      
      if (!isSoftwareOwner) {
        router.push('/dashboard');
      }
    }
  }, [user, loading, router]);

  // Fetch AI agents data
  useEffect(() => {
    async function fetchAgentsData() {
      try {
        setLoading(true);
        // TODO: Replace with actual API calls
        // const response = await fetch('/api/owner/ai-agents');
        // const data = await response.json();
        // setAgents(data.agents);
        // setMetrics(data.metrics);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Error fetching AI agents data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAgentsData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'inactive': return 'text-gray-600 bg-gray-50';
      case 'training': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'voice': return <Volume2 className="h-4 w-4" />;
      case 'text': return <MessageSquare className="h-4 w-4" />;
      case 'hybrid': return <Mic className="h-4 w-4" />;
      default: return <Bot className="h-4 w-4" />;
    }
  };

  const toggleAgentStatus = (agentId: string) => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId 
        ? { ...agent, status: agent.status === 'active' ? 'inactive' : 'active' }
        : agent
    ));
  };

  if (loading) {
    return (
      <I18nProvider>
        <ToastProvider>
          <div className="p-6">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </ToastProvider>
      </I18nProvider>
    );
  }

  return (
    <I18nProvider>
      <ToastProvider>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3">
                <Bot className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">AI Sales Agents</h1>
                  <p className="text-gray-600 mt-1">Manage and configure AI-powered sales agents</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </button>
              <button
                onClick={() => setShowCreateAgent(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Agent
              </button>
            </div>
          </div>

          {/* Platform Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Agents</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.totalAgents}</p>
                  <p className="text-sm text-green-600 mt-1">{metrics.activeAgents} active</p>
                </div>
                <Bot className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Daily Conversations</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.dailyConversations}</p>
                  <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +23% vs yesterday
                  </p>
                </div>
                <MessageSquare className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.averageSuccessRate}%</p>
                  <p className="text-sm text-gray-500 mt-1">{metrics.totalLeadsGenerated} leads generated</p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cost Savings</p>
                  <p className="text-2xl font-bold text-gray-900">${metrics.costSavings.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-1">vs human agents</p>
                </div>
                <DollarSign className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* AI Agents List */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Active Agents</h3>
              <button
                onClick={() => setShowCreateAgent(true)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Agent
              </button>
            </div>
            <div className="space-y-4">
              {agents.map((agent) => (
                <div key={agent.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${getStatusColor(agent.status)}`}>
                        {getTypeIcon(agent.type)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 flex items-center gap-2">
                          {agent.name}
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(agent.status)}`}>
                            {agent.status}
                          </span>
                        </h4>
                        <p className="text-sm text-gray-600">{agent.personality} • {agent.industry}</p>
                        <p className="text-xs text-gray-500">{agent.type} agent • {agent.language}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">{agent.conversationsToday}</p>
                        <p className="text-xs text-gray-500">Today</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-green-600">{agent.successRate}%</p>
                        <p className="text-xs text-gray-500">Success</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-blue-600">{agent.averageCallDuration}m</p>
                        <p className="text-xs text-gray-500">Avg Call</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleAgentStatus(agent.id)}
                          className={`p-2 rounded transition-colors ${
                            agent.status === 'active' 
                              ? 'text-red-600 hover:bg-red-50' 
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                        >
                          {agent.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => setSelectedAgent(agent)}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                        >
                          <Settings className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Agent Configuration Preview */}
                  <div className="mt-4 pt-4 border-t grid grid-cols-5 gap-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Aggressiveness</p>
                      <p className="font-medium">{agent.configuration.aggressiveness}/10</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Empathy</p>
                      <p className="font-medium">{agent.configuration.empathy}/10</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Technical</p>
                      <p className="font-medium">{agent.configuration.technicalKnowledge}/10</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Response Delay</p>
                      <p className="font-medium">{agent.configuration.responseDelay}s</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Total Calls</p>
                      <p className="font-medium">{agent.totalConversations.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Agent Performance */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Comparison</h3>
            <div className="space-y-3">
              {metrics.agentPerformance.map((performance) => (
                <div key={performance.agentId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{performance.name}</p>
                    <p className="text-sm text-gray-500">{performance.conversations} conversations today</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="font-bold text-green-600">{performance.successRate}%</p>
                      <p className="text-xs text-gray-500">Success Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-blue-600">${performance.revenue.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Revenue Generated</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="font-medium text-gray-900">Uptime</p>
                <p className="text-2xl font-bold text-green-600">{metrics.uptime}%</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Brain className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="font-medium text-gray-900">AI Models</p>
                <p className="text-2xl font-bold text-blue-600">4</p>
                <p className="text-sm text-gray-500">Available</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Zap className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <p className="font-medium text-gray-900">Processing Speed</p>
                <p className="text-2xl font-bold text-yellow-600">0.8s</p>
                <p className="text-sm text-gray-500">Avg Response</p>
              </div>
            </div>
          </div>
        </div>
      </ToastProvider>
    </I18nProvider>
  );
}

export default function AISalesAgents() {
  return <AISalesAgentsPage />;
}