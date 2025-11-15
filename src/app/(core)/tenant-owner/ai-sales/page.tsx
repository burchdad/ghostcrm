"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useRibbonPage } from "@/components/ribbon";
import { I18nProvider } from "@/components/utils/I18nProvider";
import { ToastProvider } from "@/components/utils/ToastProvider";
import "./ai-sales.css";
import {
  Bot,
  Mic,
  MessageSquare,
  Settings,
  VolumeX,
  Volume2,
  Users,
  BarChart3,
  Mail,
  Save,
  Edit3,
  TestTube,
  Zap,
  Brain,
  Heart,
  Star,
  Calendar,
  FileText,
  RefreshCw,
  Download,
  Upload,
} from "lucide-react";

type AgentType = "voice" | "chat" | "email";
type AgentStatus = "active" | "training" | "inactive";
type AgentTab = "overview" | "personality" | "voice" | "knowledge" | "schedule";

interface AIAgent {
  id: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  personality: {
    tone: string;
    style: string;
    energy: number;
    formality: number;
    empathy: number;
    assertiveness: number;
  };
  voice: {
    provider: string;
    voiceId: string;
    speed: number;
    pitch: number;
    accent: string;
  };
  knowledge: {
    products: string[];
    services: string[];
    policies: string[];
    scripts: string[];
  };
  performance: {
    conversationsHandled: number;
    averageRating: number;
    conversionRate: number;
    responseTime: number;
  };
  schedule: {
    availability: string;
    timezone: string;
    maxConcurrent: number;
  };
}

const INITIAL_AGENTS: AIAgent[] = [
  {
    id: "1",
    name: "Sarah",
    type: "voice",
    status: "active",
    personality: {
      tone: "Friendly & Professional",
      style: "Consultative",
      energy: 75,
      formality: 60,
      empathy: 85,
      assertiveness: 70,
    },
    voice: {
      provider: "ElevenLabs",
      voiceId: "sarah-professional",
      speed: 1.0,
      pitch: 0.8,
      accent: "American",
    },
    knowledge: {
      products: ["Product Catalog 2024", "Pricing Guidelines"],
      services: ["Sales Objection Handling", "Customer Success Stories"],
      policies: ["Privacy Policy", "Terms of Service"],
      scripts: ["Cold Call Script", "Follow-up Templates"],
    },
    performance: {
      conversationsHandled: 1247,
      averageRating: 4.6,
      conversionRate: 23.8,
      responseTime: 0.8,
    },
    schedule: {
      availability: "24/7",
      timezone: "America/Los_Angeles",
      maxConcurrent: 5,
    },
  },
  {
    id: "2",
    name: "Alex",
    type: "chat",
    status: "active",
    personality: {
      tone: "Casual & Helpful",
      style: "Problem-Solving",
      energy: 65,
      formality: 40,
      empathy: 70,
      assertiveness: 60,
    },
    voice: {
      provider: "N/A",
      voiceId: "N/A",
      speed: 0,
      pitch: 0,
      accent: "N/A",
    },
    knowledge: {
      products: ["FAQ Database", "Technical Support"],
      services: ["Feature Documentation", "Troubleshooting Guides"],
      policies: ["Support Policy", "SLA Guidelines"],
      scripts: ["Chat Templates", "Help Responses"],
    },
    performance: {
      conversationsHandled: 3456,
      averageRating: 4.4,
      conversionRate: 18.2,
      responseTime: 0.3,
    },
    schedule: {
      availability: "24/7",
      timezone: "America/Los_Angeles",
      maxConcurrent: 10,
    },
  },
];

function TenantAISalesAgentsPage() {
  const { user } = useAuth() as {
    user: { role?: string } | null;
    tenant?: any;
  };
  const router = useRouter();

  const [agents, setAgents] = useState<AIAgent[]>(INITIAL_AGENTS);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const [activeTab, setActiveTab] = useState<AgentTab>("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [testingVoice, setTestingVoice] = useState(false);

  useRibbonPage({
    context: "ai-agents",
    enable: ["export", "profile", "notifications", "theme", "language", "automation"],
    disable: [],
  });
  const setPage = undefined;

  // Removed redundant useEffect for setPage (setPage is undefined)

  // Redirect non-tenant owners
  useEffect(() => {
    if (!user) return;

    const hostname =
      typeof window !== "undefined" ? window.location.hostname : "";
    const isLocalHost =
      hostname === "localhost" || hostname === "127.0.0.1";
    const isSubdomain =
      !isLocalHost && hostname.split(".").length > 2;
    const isTenantOwner = user.role === "owner" && isSubdomain;

    if (!isTenantOwner) {
      router.push("/dashboard");
    }
  }, [user, router]);

  // Load agents data (mocked)
  useEffect(() => {
    async function loadAgents() {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setSelectedAgent(INITIAL_AGENTS[0]);
      } catch (error) {
        console.error("Error loading agents:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAgents();
  }, []);

  const handleSaveAgent = async () => {
    if (!selectedAgent) return;

    try {
      // TODO: API call to save selectedAgent
      setAgents((prev) =>
        prev.map((agent) =>
          agent.id === selectedAgent.id ? selectedAgent : agent
        )
      );
      setIsEditing(false);
      // TODO: Success toast
    } catch (error) {
      console.error("Error saving agent:", error);
      // TODO: Error toast
    }
  };

  const updateNestedAgent = (
    section: keyof AIAgent,
    field: string,
    value: any
  ) => {
    if (!selectedAgent) return;

    setSelectedAgent((prev) => {
      if (!prev) return null;
      const currentSection = prev[section] as Record<string, any>;
      return {
        ...prev,
        [section]: {
          ...currentSection,
          [field]: value,
        },
      };
    });
  };

  const testVoice = async () => {
    setTestingVoice(true);
    // TODO: Implement voice testing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setTestingVoice(false);
  };

  const getStatusColor = (status: AgentStatus) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "training":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: AgentType) => {
    switch (type) {
      case "voice":
        return <Mic className="h-5 w-5" />;
      case "chat":
        return <MessageSquare className="h-5 w-5" />;
      case "email":
        return <Mail className="h-5 w-5" />;
      default:
        return <Bot className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <I18nProvider>
        <ToastProvider>
          <div className="ai-sales-page">
            <div className="ai-sales-container">
              <div className="loading-container">
                <div className="loading-spinner" />
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
        <div className="ai-sales-page">
          <div className="ai-sales-container">
            {/* Header */}
            <div className="header-glass">
              <div className="header-content">
                <div className="header-left">
                  <div className="ai-icon-container">
                    <Bot className="h-8 w-8" />
                  </div>
                  <div>
                    <h1 className="header-title">AI Sales Agents</h1>
                    <p className="header-subtitle">
                      Configure and manage your AI-powered sales representatives
                    </p>
                  </div>
                </div>
                <div className="header-actions">
                  <button className="btn-secondary">
                    <Download className="h-4 w-4" />
                    Export Config
                  </button>
                  <button className="btn-primary">
                    <Bot className="h-4 w-4" />
                    New Agent
                  </button>
                </div>
              </div>
            </div>

            <div className="agents-grid">
              {/* Agents List */}
              <div className="agents-list-panel">
                <div className="agents-list-header">
                  <h3 className="agents-list-title">Your AI Agents</h3>
                </div>
                <div className="agents-list-content">
                  {agents.map((agent) => (
                    <div
                      key={agent.id}
                      onClick={() => setSelectedAgent(agent)}
                      className={`agent-card ${
                        selectedAgent?.id === agent.id ? "selected" : ""
                      }`}
                    >
                      <div className="agent-card-header">
                        <div className="agent-card-title-row">
                          <div className="agent-icon">
                            {getTypeIcon(agent.type)}
                          </div>
                          <h4 className="agent-name">{agent.name}</h4>
                        </div>
                        <span
                          className={`agent-status-badge ${getStatusColor(
                            agent.status
                          )}`}
                        >
                          {agent.status}
                        </span>
                      </div>
                      <div className="agent-type">
                        {agent.type === "voice"
                          ? "Voice Agent"
                          : agent.type === "chat"
                          ? "Chat Agent"
                          : "Email Agent"}
                      </div>
                      <div className="agent-stats">
                        <span className="agent-conversations">
                          {agent.performance.conversationsHandled} conversations
                        </span>
                        <div className="agent-rating">
                          <Star className="h-3 w-3 fill-current" />
                          {agent.performance.averageRating}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Agent Configuration */}
              <div className="agent-config-panel">
                {selectedAgent ? (
                  <>
                    {/* Agent Header */}
                    <div className="agent-config-header">
                      <div className="agent-config-title-row">
                        <div className="agent-config-title-left">
                          <div className="agent-config-icon">
                            {getTypeIcon(selectedAgent.type)}
                          </div>
                          <div>
                            <h3 className="agent-config-title">
                              {selectedAgent.name}
                            </h3>
                            <p className="agent-config-subtitle">
                              {selectedAgent.type === "voice"
                                ? "Voice Sales Agent"
                                : selectedAgent.type === "chat"
                                ? "Chat Sales Agent"
                                : "Email Sales Agent"}
                            </p>
                          </div>
                        </div>
                        <div className="agent-config-actions">
                          <button
                            onClick={() => setIsEditing((prev) => !prev)}
                            className="btn-secondary"
                          >
                            <Edit3 className="h-4 w-4" />
                            {isEditing ? "Cancel" : "Edit"}
                          </button>
                          {isEditing && (
                            <button
                              onClick={handleSaveAgent}
                              className="btn-primary"
                            >
                              <Save className="h-4 w-4" />
                              Save
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="tab-navigation">
                      {[
                        { id: "overview", label: "Overview", icon: BarChart3 },
                        { id: "personality", label: "Personality", icon: Heart },
                        { id: "voice", label: "Voice & Speech", icon: Mic },
                        {
                          id: "knowledge",
                          label: "Knowledge Base",
                          icon: Brain,
                        },
                        { id: "schedule", label: "Schedule", icon: Calendar },
                      ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                          <button
                            key={tab.id}
                            onClick={() =>
                              setActiveTab(tab.id as AgentTab)
                            }
                            className={`tab-button ${
                              activeTab === tab.id ? "active" : ""
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Tab Content */}
                    <div className="tab-content">
                      {/* Overview Tab */}
                      {activeTab === "overview" && (
                        <div className="content-section">
                          <h2 className="section-title">
                            Performance Overview
                          </h2>
                          <div className="performance-stats-grid">
                            <div className="performance-stat-card conversations">
                              <p className="performance-stat-value">
                                {
                                  selectedAgent.performance
                                    .conversationsHandled
                                }
                              </p>
                              <p className="performance-stat-label">
                                Conversations
                              </p>
                            </div>
                            <div className="performance-stat-card rating">
                              <p className="performance-stat-value">
                                {selectedAgent.performance.averageRating}
                              </p>
                              <p className="performance-stat-label">
                                Avg Rating
                              </p>
                            </div>
                            <div className="performance-stat-card conversion">
                              <p className="performance-stat-value">
                                {selectedAgent.performance.conversionRate}%
                              </p>
                              <p className="performance-stat-label">
                                Conversion
                              </p>
                            </div>
                            <div className="performance-stat-card response">
                              <p className="performance-stat-value">
                                {selectedAgent.performance.responseTime}s
                              </p>
                              <p className="performance-stat-label">
                                Response Time
                              </p>
                            </div>
                          </div>

                          <h2 className="section-title">Current Status</h2>
                          <div className="status-grid">
                            <div className="status-item">
                              <span className="status-label">Status:</span>
                              <span
                                className={`agent-status-badge ${getStatusColor(
                                  selectedAgent.status
                                )}`}
                              >
                                {selectedAgent.status}
                              </span>
                            </div>
                            <div className="status-item">
                              <span className="status-label">Type:</span>
                              <span className="status-value">
                                {selectedAgent.type}
                              </span>
                            </div>
                            <div className="status-item">
                              <span className="status-label">
                                Availability:
                              </span>
                              <span className="status-value">
                                {selectedAgent.schedule.availability}
                              </span>
                            </div>
                            <div className="status-item">
                              <span className="status-label">
                                Max Concurrent:
                              </span>
                              <span className="status-value">
                                {selectedAgent.schedule.maxConcurrent}
                              </span>
                            </div>
                            <div className="status-item">
                              <span className="status-label">Timezone:</span>
                              <span className="status-value">
                                {selectedAgent.schedule.timezone}
                              </span>
                            </div>
                          </div>

                          <h2 className="section-title">Quick Actions</h2>
                          <div className="form-grid">
                            <button className="btn-secondary">
                              <TestTube className="h-4 w-4" />
                              Test Agent
                            </button>
                            <button className="btn-secondary">
                              <RefreshCw className="h-4 w-4" />
                              Retrain Model
                            </button>
                            <button className="btn-secondary">
                              <FileText className="h-4 w-4" />
                              View Logs
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Personality Tab */}
                      {activeTab === "personality" && (
                        <div className="content-section">
                          <h2 className="section-title">
                            Basic Configuration
                          </h2>
                          <div className="form-grid">
                            <div className="form-group">
                              <label className="form-label">
                                Communication Tone
                              </label>
                              <select
                                value={selectedAgent.personality.tone}
                                onChange={(e) =>
                                  updateNestedAgent(
                                    "personality",
                                    "tone",
                                    e.target.value
                                  )
                                }
                                disabled={!isEditing}
                                className="form-select"
                              >
                                <option>Friendly &amp; Professional</option>
                                <option>Casual &amp; Approachable</option>
                                <option>Formal &amp; Business-like</option>
                                <option>Enthusiastic &amp; Energetic</option>
                              </select>
                            </div>
                            <div className="form-group">
                              <label className="form-label">Sales Style</label>
                              <select
                                value={selectedAgent.personality.style}
                                onChange={(e) =>
                                  updateNestedAgent(
                                    "personality",
                                    "style",
                                    e.target.value
                                  )
                                }
                                disabled={!isEditing}
                                className="form-select"
                              >
                                <option>Consultative</option>
                                <option>Problem-Solving</option>
                                <option>Relationship-Building</option>
                                <option>Direct &amp; Results-Focused</option>
                              </select>
                            </div>
                          </div>

                          <h2 className="section-title">Personality Traits</h2>
                          <div className="personality-traits">
                            {[
                              {
                                key: "energy",
                                label: "Energy Level",
                                description:
                                  "How energetic and dynamic the agent sounds",
                              },
                              {
                                key: "formality",
                                label: "Formality",
                                description:
                                  "Level of formal language and structure",
                              },
                              {
                                key: "empathy",
                                label: "Empathy",
                                description:
                                  "Ability to understand and relate to customers",
                              },
                              {
                                key: "assertiveness",
                                label: "Assertiveness",
                                description:
                                  "Confidence in pushing for decisions",
                              },
                            ].map((trait) => (
                              <div key={trait.key} className="trait-item">
                                <div className="trait-header">
                                  <div className="trait-info">
                                    <h4>{trait.label}</h4>
                                    <p className="trait-description">
                                      {trait.description}
                                    </p>
                                  </div>
                                  <span className="trait-value">
                                    {
                                      selectedAgent.personality[
                                        trait.key as keyof typeof selectedAgent.personality
                                      ]
                                    }
                                    %
                                  </span>
                                </div>
                                <input
                                  type="range"
                                  min={0}
                                  max={100}
                                  value={
                                    selectedAgent.personality[
                                      trait.key as keyof typeof selectedAgent.personality
                                    ]
                                  }
                                  onChange={(e) =>
                                    updateNestedAgent(
                                      "personality",
                                      trait.key,
                                      parseInt(e.target.value, 10)
                                    )
                                  }
                                  disabled={!isEditing}
                                  className="trait-slider"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Voice Tab */}
                      {activeTab === "voice" &&
                        selectedAgent.type === "voice" && (
                          <div className="content-section">
                            <h2 className="section-title">
                              Voice Configuration
                            </h2>
                            <div className="form-grid">
                              <div className="form-group">
                                <label className="form-label">
                                  Voice Provider
                                </label>
                                <select
                                  value={selectedAgent.voice.provider}
                                  onChange={(e) =>
                                    updateNestedAgent(
                                      "voice",
                                      "provider",
                                      e.target.value
                                    )
                                  }
                                  disabled={!isEditing}
                                  className="form-select"
                                >
                                  <option>ElevenLabs</option>
                                  <option>Azure Speech</option>
                                  <option>Google Cloud Text-to-Speech</option>
                                  <option>Amazon Polly</option>
                                </select>
                              </div>
                              <div className="form-group">
                                <label className="form-label">
                                  Voice Model
                                </label>
                                <select
                                  value={selectedAgent.voice.voiceId}
                                  onChange={(e) =>
                                    updateNestedAgent(
                                      "voice",
                                      "voiceId",
                                      e.target.value
                                    )
                                  }
                                  disabled={!isEditing}
                                  className="form-select"
                                >
                                  <option>sarah-professional</option>
                                  <option>mike-friendly</option>
                                  <option>anna-energetic</option>
                                  <option>david-authoritative</option>
                                </select>
                              </div>
                            </div>

                            <h2 className="section-title">Voice Settings</h2>
                            <div className="personality-traits">
                              <div className="trait-item">
                                <div className="trait-header">
                                  <div className="trait-info">
                                    <h4>Speaking Speed</h4>
                                    <p className="trait-description">
                                      How fast the agent speaks
                                    </p>
                                  </div>
                                  <span className="trait-value">
                                    {selectedAgent.voice.speed}x
                                  </span>
                                </div>
                                <input
                                  type="range"
                                  min={0.5}
                                  max={2.0}
                                  step={0.1}
                                  value={selectedAgent.voice.speed}
                                  onChange={(e) =>
                                    updateNestedAgent(
                                      "voice",
                                      "speed",
                                      parseFloat(e.target.value)
                                    )
                                  }
                                  disabled={!isEditing}
                                  className="trait-slider"
                                />
                              </div>

                              <div className="trait-item">
                                <div className="trait-header">
                                  <div className="trait-info">
                                    <h4>Voice Pitch</h4>
                                    <p className="trait-description">
                                      The tone and pitch of the agent's voice
                                    </p>
                                  </div>
                                  <span className="trait-value">
                                    {selectedAgent.voice.pitch}
                                  </span>
                                </div>
                                <input
                                  type="range"
                                  min={-1}
                                  max={1}
                                  step={0.1}
                                  value={selectedAgent.voice.pitch}
                                  onChange={(e) =>
                                    updateNestedAgent(
                                      "voice",
                                      "pitch",
                                      parseFloat(e.target.value)
                                    )
                                  }
                                  disabled={!isEditing}
                                  className="trait-slider"
                                />
                              </div>
                            </div>

                            <div className="voice-test-section">
                              <div className="voice-test-header">
                                <h3 className="voice-test-title">
                                  Voice Testing
                                </h3>
                                <div className="voice-test-controls">
                                  <button
                                    onClick={testVoice}
                                    disabled={testingVoice}
                                    className="btn-test"
                                  >
                                    {testingVoice ? (
                                      <VolumeX className="h-4 w-4" />
                                    ) : (
                                      <Volume2 className="h-4 w-4" />
                                    )}
                                    {testingVoice
                                      ? "Testing..."
                                      : "Test Voice"}
                                  </button>
                                  <button className="btn-secondary">
                                    <Upload className="h-4 w-4" />
                                    Upload Custom Voice
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                      {/* Knowledge Base Tab */}
                      {activeTab === "knowledge" && (
                        <div className="content-section">
                          <h2 className="section-title">Trained Knowledge</h2>
                          <div className="form-grid">
                            <div>
                              <h3 className="section-title">
                                Current Training Data
                              </h3>
                              <div className="personality-traits">
                                {(
                                  Object.entries(
                                    selectedAgent.knowledge
                                  ) as [string, string[]][]
                                ).map(([category, items]) => (
                                  <div key={category}>
                                    <h4 className="form-label capitalize">
                                      {category}
                                    </h4>
                                    <div className="trait-item">
                                      {items.map((item, index) => (
                                        <div
                                          key={index}
                                          className="trait-header"
                                        >
                                          <div className="trait-info">
                                            <FileText className="h-4 w-4" />
                                            <span>{item}</span>
                                          </div>
                                          <span className="agent-status-badge active">
                                            Trained
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h3 className="section-title">
                                Available Sources
                              </h3>
                              <div className="personality-traits">
                                {[
                                  "Customer Testimonials",
                                  "Competitor Analysis",
                                  "Market Research",
                                  "Industry Trends",
                                ].map((item, index) => (
                                  <div key={index} className="trait-item">
                                    <div className="trait-header">
                                      <div className="trait-info">
                                        <FileText className="h-4 w-4" />
                                        <span>{item}</span>
                                      </div>
                                      <button className="btn-test">
                                        Add to Training
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <h2 className="section-title">Training Actions</h2>
                          <div className="form-grid">
                            <button className="btn-primary">
                              <Upload className="h-4 w-4" />
                              Upload Documents
                            </button>
                            <button className="btn-secondary">
                              <RefreshCw className="h-4 w-4" />
                              Retrain Model
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Schedule Tab */}
                      {activeTab === "schedule" && (
                        <div className="content-section">
                          <h2 className="section-title">
                            Availability Settings
                          </h2>
                          <div className="form-grid">
                            <div className="form-group">
                              <label className="form-label">
                                Availability
                              </label>
                              <select
                                value={selectedAgent.schedule.availability}
                                onChange={(e) =>
                                  updateNestedAgent(
                                    "schedule",
                                    "availability",
                                    e.target.value
                                  )
                                }
                                disabled={!isEditing}
                                className="form-select"
                              >
                                <option>24/7</option>
                                <option>Business Hours</option>
                                <option>Custom Schedule</option>
                              </select>
                            </div>
                            <div className="form-group">
                              <label className="form-label">Timezone</label>
                              <select
                                value={selectedAgent.schedule.timezone}
                                onChange={(e) =>
                                  updateNestedAgent(
                                    "schedule",
                                    "timezone",
                                    e.target.value
                                  )
                                }
                                disabled={!isEditing}
                                className="form-select"
                              >
                                <option value="America/Los_Angeles">
                                  Pacific Time
                                </option>
                                <option value="America/Denver">
                                  Mountain Time
                                </option>
                                <option value="America/Chicago">
                                  Central Time
                                </option>
                                <option value="America/New_York">
                                  Eastern Time
                                </option>
                              </select>
                            </div>
                          </div>

                          <h2 className="section-title">
                            Capacity Settings
                          </h2>
                          <div className="personality-traits">
                            <div className="trait-item">
                              <div className="trait-header">
                                <div className="trait-info">
                                  <h4>Maximum Concurrent Conversations</h4>
                                  <p className="trait-description">
                                    Number of simultaneous conversations this
                                    agent can handle
                                  </p>
                                </div>
                                <span className="trait-value">
                                  {selectedAgent.schedule.maxConcurrent}
                                </span>
                              </div>
                              <input
                                type="range"
                                min={1}
                                max={20}
                                value={selectedAgent.schedule.maxConcurrent}
                                onChange={(e) =>
                                  updateNestedAgent(
                                    "schedule",
                                    "maxConcurrent",
                                    parseInt(e.target.value, 10)
                                  )
                                }
                                disabled={!isEditing}
                                className="trait-slider"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="empty-state">
                    <Bot className="empty-state-icon h-12 w-12" />
                    <h3 className="empty-state-title">Select an Agent</h3>
                    <p className="empty-state-description">
                      Choose an AI agent from the list to view and configure its
                      settings.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </ToastProvider>
    </I18nProvider>
  );
}

export default function TenantAISalesAgents() {
  return <TenantAISalesAgentsPage />;
}
