    // --- AI Automation & Integration Management State ---
    const [aiTags, setAiTags] = useState<string[]>([]);
    const [aiTagLoading, setAiTagLoading] = useState(false);
    const [showWorkflowModal, setShowWorkflowModal] = useState(false);
    const [workflowTriggers, setWorkflowTriggers] = useState<{ name: string; type: string }[]>([]);
    const [newTriggerName, setNewTriggerName] = useState("");
    const [newTriggerType, setNewTriggerType] = useState("auto-assign");
    const addWorkflowTriggerLocal = () => {
      if (!newTriggerName) return;
      setWorkflowTriggers([...workflowTriggers, { name: newTriggerName, type: newTriggerType }]);
      setNewTriggerName("");
      setNewTriggerType("auto-assign");
    };
    const removeWorkflowTriggerLocal = (idx: number) => {
      setWorkflowTriggers(workflowTriggers.filter((_, i) => i !== idx));
    };
    const [showPromptModal, setShowPromptModal] = useState(false);
    const [prompts, setPrompts] = useState<{ name: string; model: string }[]>([]);
    const [newPromptName, setNewPromptName] = useState("");
    const [newPromptModel, setNewPromptModel] = useState("openai");
    const addPromptLocal = () => {
      if (!newPromptName) return;
      setPrompts([...prompts, { name: newPromptName, model: newPromptModel }]);
      setNewPromptName("");
      setNewPromptModel("openai");
    };
    const removePrompt = (idx: number) => {
      setPrompts(prompts.filter((_, i) => i !== idx));
    };
    // Integration Health/Status & Webhook Management
    const [showWebhookModal, setShowWebhookModal] = useState(false);
    const [webhooks, setWebhooks] = useState<{ url: string; type: string }[]>([]);
    const [newWebhookUrl, setNewWebhookUrl] = useState("");
    const [newWebhookType, setNewWebhookType] = useState("lead");
    const addWebhookLocal = () => {
      if (!newWebhookUrl) return;
      setWebhooks([...webhooks, { url: newWebhookUrl, type: newWebhookType }]);
      setNewWebhookUrl("");
      setNewWebhookType("lead");
    };
    const removeWebhookLocal = (idx: number) => {
      setWebhooks(webhooks.filter((_, i) => i !== idx));
    };
    const testIntegration = (id: string) => {
      // Placeholder: implement integration test logic
      alert(`Testing integration ${id}`);
    };
    // OAuth/Connect & Custom API Endpoints
    const [showOAuthModal, setShowOAuthModal] = useState(false);
    const [oauthConnections, setOAuthConnections] = useState<{ platform: string; status: string }[]>([]);
    const [newOAuthPlatform, setNewOAuthPlatform] = useState("google");
    const addOAuthConnectionLocal = () => {
      setOAuthConnections([...oauthConnections, { platform: newOAuthPlatform, status: "connected" }]);
      setNewOAuthPlatform("google");
    };
    const removeOAuthConnectionLocal = (idx: number) => {
      setOAuthConnections(oauthConnections.filter((_, i) => i !== idx));
    };
    const [showApiModal, setShowApiModal] = useState(false);
    const [apiEndpoints, setApiEndpoints] = useState<{ url: string; type: string }[]>([]);
    const [newApiUrl, setNewApiUrl] = useState("");
    const [newApiType, setNewApiType] = useState("custom");
    const addApiEndpointLocal = () => {
      if (!newApiUrl) return;
      setApiEndpoints([...apiEndpoints, { url: newApiUrl, type: newApiType }]);
      setNewApiUrl("");
      setNewApiType("custom");
    };
    const removeApiEndpointLocal = (idx: number) => {
      setApiEndpoints(apiEndpoints.filter((_, i) => i !== idx));
    };
    // --- Wire up backend for AI automation & integrations ---
    useEffect(() => {
      // Fetch workflow triggers from backend
      fetch('/api/ai/triggers?user_id=demo&dashboard_id=main')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data.triggers)) setWorkflowTriggers(data.triggers);
        });
      // Fetch prompts from backend
      fetch('/api/ai/prompts?user_id=demo&dashboard_id=main')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data.prompts)) setPrompts(data.prompts);
        });
      // Fetch webhooks from backend
      fetch('/api/integrations/webhooks?user_id=demo&dashboard_id=main')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data.webhooks)) setWebhooks(data.webhooks);
        });
      // Fetch OAuth connections from backend
      fetch('/api/integrations/oauth?user_id=demo&dashboard_id=main')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data.connections)) setOAuthConnections(data.connections);
        });
      // Fetch custom API endpoints from backend
      fetch('/api/integrations/api?user_id=demo&dashboard_id=main')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data.endpoints)) setApiEndpoints(data.endpoints);
        });
    }, []);

    // Save workflow triggers to backend
    const addWorkflowTrigger = async () => {
      if (!newTriggerName) return;
      const newTrigger = { name: newTriggerName, type: newTriggerType };
      setWorkflowTriggers([...workflowTriggers, newTrigger]);
      setNewTriggerName("");
      setNewTriggerType("auto-assign");
      await fetch('/api/ai/triggers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 'demo', dashboard_id: 'main', trigger: newTrigger }),
      });
    };
    const removeWorkflowTrigger = async (idx: number) => {
      const trigger = workflowTriggers[idx];
      setWorkflowTriggers(workflowTriggers.filter((_, i) => i !== idx));
      await fetch('/api/ai/triggers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 'demo', dashboard_id: 'main', trigger }),
      });
    };
    // Save prompts to backend
    const addPrompt = async () => {
      if (!newPromptName) return;
      const newPrompt = { name: newPromptName, model: newPromptModel };
      setPrompts([...prompts, newPrompt]);
      setNewPromptName("");
      setNewPromptModel("openai");
      await fetch('/api/ai/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 'demo', dashboard_id: 'main', prompt: newPrompt }),
      });
    };
    const removePromptAsync = async (idx: number) => {
      const prompt = prompts[idx];
      setPrompts(prompts.filter((_, i) => i !== idx));
      await fetch('/api/ai/prompts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 'demo', dashboard_id: 'main', prompt }),
      });
    };
    // Save webhooks to backend
    const addWebhook = async () => {
      if (!newWebhookUrl) return;
      const newWebhook = { url: newWebhookUrl, type: newWebhookType };
      setWebhooks([...webhooks, newWebhook]);
      setNewWebhookUrl("");
      setNewWebhookType("lead");
      await fetch('/api/integrations/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 'demo', dashboard_id: 'main', webhook: newWebhook }),
      });
    };
    const removeWebhook = async (idx: number) => {
      const webhook = webhooks[idx];
      setWebhooks(webhooks.filter((_, i) => i !== idx));
      await fetch('/api/integrations/webhooks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 'demo', dashboard_id: 'main', webhook }),
      });
    };
    // Save OAuth connections to backend
    const addOAuthConnection = async () => {
      const newConnection = { platform: newOAuthPlatform, status: "connected" };
      setOAuthConnections([...oauthConnections, newConnection]);
      setNewOAuthPlatform("google");
      await fetch('/api/integrations/oauth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 'demo', dashboard_id: 'main', connection: newConnection }),
      });
    };
    const removeOAuthConnection = async (idx: number) => {
      const connection = oauthConnections[idx];
      setOAuthConnections(oauthConnections.filter((_, i) => i !== idx));
      await fetch('/api/integrations/oauth', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 'demo', dashboard_id: 'main', connection }),
      });
    };
    // Save API endpoints to backend
    const addApiEndpoint = async () => {
      if (!newApiUrl) return;
      const newEndpoint = { url: newApiUrl, type: newApiType };
      setApiEndpoints([...apiEndpoints, newEndpoint]);
      setNewApiUrl("");
      setNewApiType("custom");
      await fetch('/api/integrations/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 'demo', dashboard_id: 'main', endpoint: newEndpoint }),
      });
    };
    const removeApiEndpoint = async (idx: number) => {
      const endpoint = apiEndpoints[idx];
      setApiEndpoints(apiEndpoints.filter((_, i) => i !== idx));
      await fetch('/api/integrations/api', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 'demo', dashboard_id: 'main', endpoint }),
      });
    };
  // ...existing code...
import { Sun, Moon, Bell, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useEffect, useState } from "react";
import { UserCircle2, MessageSquare, Mail } from "lucide-react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js";
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

// Example dashboard sections mapped to roles
const DASHBOARD_SECTIONS = [
  { key: "leadBoard", label: "Lead Board", roles: ["sales_rep", "manager", "owner"] },
  { key: "dealForecasting", label: "Deal Forecasting Dashboard", roles: ["manager", "owner"] },
  { key: "commissionTracking", label: "Commission Tracking Tools", roles: ["manager", "owner"] },
  { key: "teamLeaderboard", label: "Team Leaderboards", roles: ["manager", "owner"] },
  { key: "activityMonitoring", label: "Rep Performance & Activity Monitoring", roles: ["manager", "owner"] },
  { key: "leadAssignment", label: "Lead Assignment Rules Builder", roles: ["manager", "owner"] },
  { key: "communicationsLog", label: "Communications Log Viewer", roles: ["sales_rep", "manager", "owner"] },
  { key: "analytics", label: "Analytics & Insights", roles: ["manager", "owner"] },
  { key: "aiAssistant", label: "AI Assistant", roles: ["sales_rep", "manager", "owner"] },
  { key: "notifications", label: "Notifications Center", roles: ["sales_rep", "manager", "owner"] },
  { key: "recentLeadsDeals", label: "Recent Leads/Deals", roles: ["sales_rep", "manager", "owner"] },
  { key: "exportImport", label: "Export/Import Data", roles: ["sales_rep", "manager", "owner"] },
  { key: "settings", label: "Settings & Preferences", roles: ["sales_rep", "manager", "owner"] },
  { key: "helpSupport", label: "Help & Support", roles: ["sales_rep", "manager", "owner"] },
];

export default function DashboardPage() {
  const [leadStats, setLeadStats] = useState<any>({});
  const [integrations, setIntegrations] = useState([]);
  // ...existing code...
  // ...existing code...
  // Drag-and-drop visual feedback state
  const [draggedCard, setDraggedCard] = useState(null);
  const [dragOverCard, setDragOverCard] = useState(null);


  // Advanced Analytics Builder: chart types, multi-metric/group
  const chartTypes = ["bar", "line", "pie", "scatter", "funnel"];
  const metrics = ["message_count", "lead_count", "deal_value", "conversion_rate"];
  const groupBys = ["date", "rep", "status", "source"];

  // Threaded comments and @mentions
  function addReplyToComment(commentId, text) {
    // Post reply to backend
    fetch('/api/collab/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: 'demo', dashboard_id: 'main', view_id: '', text, reply_to: commentId }),
    });
  }

  // Declare leadStats before useEffect that depends on it
  // Removed duplicate declaration of leadStats

  // ...existing code...

  // ...existing code...
  // Declare leadStats and integrations first
  // Removed duplicate declaration of leadStats
  // Removed duplicate declaration of integrations

  // AI suggestions for next actions
  const [aiNextActions, setAiNextActions] = useState([]);
  useEffect(() => {
    if (!leadStats) return;
    fetch('/api/ai/nextactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: 'demo', dashboard_id: 'main', leads: leadStats.leads || [], deals: leadStats.deals || [] }),
    })
      .then(res => res.json())
      .then(data => setAiNextActions(data.actions || []));
  }, [leadStats]);

  // Integration health/status
  const [integrationStatus, setIntegrationStatus] = useState({});
  useEffect(() => {
    if (!integrations) return;
    fetch('/api/collab/integrationstatus?user_id=demo')
      .then(res => res.json())
      .then(data => setIntegrationStatus(data.status || {}));
  }, [integrations]);

  // Custom notification rules
  const [customNotifRules, setCustomNotifRules] = useState([]);
  function addCustomNotifRule(rule) {
    setCustomNotifRules(rules => [...rules, rule]);
    // Persist to backend
    fetch('/api/collab/notifrules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: 'demo', rule }),
    });
  }

  // Audit log filtering/export
  function exportAuditLog(format = "csv") {
    fetch(`/api/collab/export?user_id=demo&dashboard_id=main&format=${format}`)
      .then(res => res.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `audit_log.${format}`;
        a.click();
        URL.revokeObjectURL(url);
      });
  }

  // Role-based dashboard views
  function assignDashboardToRole(role, layout) {
    fetch('/api/dashboard/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, layout }),
    });
  }

  // Bulk actions
  function bulkAssignLeads(leadIds, repId) {
    fetch('/api/leads/bulkassign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadIds, repId }),
    });
  }
  function bulkMessageLeads(leadIds, message) {
    fetch('/api/leads/bulkmessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadIds, message }),
    });
  }

  // Mobile responsiveness scaffolding
  // (Tailwind classes already used, but add mobile-specific UI tweaks as needed)
  // Expanded integrations list
  const INTEGRATION_OPTIONS = [
    { value: "google_sheets", label: "Google Sheets" },
    { value: "excel", label: "Excel" },
    { value: "bi", label: "BI Platform" },
    { value: "salesforce", label: "Salesforce" },
    { value: "hubspot", label: "HubSpot" },
    { value: "zapier", label: "Zapier" },
    { value: "google_workspace", label: "Google Workspace" },
    { value: "microsoft_365", label: "Microsoft 365" },
    { value: "twilio", label: "Twilio" },
    { value: "sendgrid", label: "SendGrid" },
    { value: "airtable", label: "Airtable" },
    { value: "supabase", label: "Supabase" },
    { value: "stripe", label: "Stripe" },
    { value: "quickbooks", label: "QuickBooks" },
    { value: "custom_webhook", label: "Custom Webhook/API" },
    { value: "openai", label: "OpenAI" },
    { value: "azure_ai", label: "Azure AI" },
    { value: "vertex_ai", label: "Google Vertex AI" },
  ];
  // Smart Alerts state
  const [smartAlertsEnabled, setSmartAlertsEnabled] = useState(true);
  const [smartAlerts, setSmartAlerts] = useState([]);
  const [smartAlertType, setSmartAlertType] = useState("all");
  const [smartAlertSensitivity, setSmartAlertSensitivity] = useState("normal");
  useEffect(() => {
    if (smartAlertsEnabled) {
      fetch(`/api/ai/alerts?user_id=demo&type=${smartAlertType}&sensitivity=${smartAlertSensitivity}`)
        .then(res => res.json())
        .then(data => setSmartAlerts(data.alerts || []));
    }
  }, [smartAlertsEnabled, smartAlertType, smartAlertSensitivity]);
  // Integration settings state
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  // ...existing code...
  const [newIntegrationType, setNewIntegrationType] = useState("");
  const [newIntegrationConfig, setNewIntegrationConfig] = useState("");
  // Fetch integrations on modal open
  useEffect(() => {
    if (showIntegrationModal) {
      fetch('/api/collab/integrations?user_id=demo')
        .then(res => res.json())
        .then(data => setIntegrations(data.integrations || []));
    }
  }, [showIntegrationModal]);
  // Add integration
  const addIntegration = async () => {
    await fetch('/api/collab/integrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: 'demo', type: newIntegrationType, config: newIntegrationConfig }),
    });
    setNewIntegrationType("");
    setNewIntegrationConfig("");
    // Refetch integrations
    const res = await fetch('/api/collab/integrations?user_id=demo');
    const data = await res.json();
    setIntegrations(data.integrations || []);
  };
  // Remove integration
  const removeIntegration = async (id) => {
    await fetch(`/api/collab/integrations/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    // Refetch integrations
    const res = await fetch('/api/collab/integrations?user_id=demo');
    const data = await res.json();
    setIntegrations(data.integrations || []);
  };
  // Marketplace state
  const [showMarketplace, setShowMarketplace] = useState(false);
  const [marketplaceCards, setMarketplaceCards] = useState([
    { key: "activityMonitoring", label: "Audit Log & Activity Feed", description: "Track all dashboard activity and changes.", author: "System", roles: ["manager", "owner"], recommended: true, rating: 5 },
    { key: "templateLibrary", label: "Template Library", description: "Manage message/email templates.", author: "System", roles: ["sales_rep", "manager", "owner"], recommended: true, rating: 4 },
    { key: "advancedAnalytics", label: "Advanced Analytics & Insights", description: "Custom analytics and insights for leads and deals.", author: "System", roles: ["manager", "owner"], recommended: true, rating: 5 },
    { key: "exportImport", label: "Bulk Actions & Import/Export", description: "Import/export leads, deals, and messages.", author: "System", roles: ["sales_rep", "manager", "owner"], recommended: false, rating: 4 },
    { key: "helpSupport", label: "Help & Support", description: "Contact support and submit feedback.", author: "System", roles: ["sales_rep", "manager", "owner"], recommended: false, rating: 3 },
    { key: "notifications", label: "Notifications Center", description: "View all CRM notifications.", author: "System", roles: ["sales_rep", "manager", "owner"], recommended: true, rating: 4 },
  ]);
  // Card rating logic
  const rateCard = (key, rating) => {
    setMarketplaceCards(cards => cards.map(c => c.key === key ? { ...c, rating } : c));
    // Optionally send rating to backend
    fetch('/api/dashboard/rate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': 'demo' },
      body: JSON.stringify({ key, rating }),
    });
  };
  // State for custom analytics builder modal
  const [showAnalyticsBuilder, setShowAnalyticsBuilder] = useState(false);
  // State for threaded comments
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  // Advanced Analytics custom state
  const [analyticsChartType, setAnalyticsChartType] = useState("bar");
  const [analyticsGroupBy, setAnalyticsGroupBy] = useState("date");
  const [analyticsMetric, setAnalyticsMetric] = useState("message_count");
  const [analyticsSelectedReps, setAnalyticsSelectedReps] = useState([]);
  const [analyticsSelectedStatus, setAnalyticsSelectedStatus] = useState([]);
  const [customAnalyticsViews, setCustomAnalyticsViews] = useState([]);
  const [analyticsViewName, setAnalyticsViewName] = useState("");

  // Messages state
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Export CSV logic
  function getFilteredMessages() {
    // Example: return all messages, or apply custom filtering logic as needed
    return messages || [];
  }
  function exportAnalyticsCSV() {
    const filtered = getFilteredMessages();
    const headers = Object.keys(filtered[0] || {});
    const rows = filtered.map(m => headers.map(h => m[h]));
    let csv = headers.join(",") + "\n" + rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "analytics.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  // Export PDF logic
  async function exportAnalyticsPDF() {
    const filtered = getFilteredMessages();
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    doc.text("Advanced Analytics Export", 10, 10);
    let y = 20;
    filtered.forEach((m, idx) => {
      doc.text(JSON.stringify(m), 10, y);
      y += 10;
      if (y > 280) { doc.addPage(); y = 20; }
    });
    doc.save("analytics.pdf");
  }

  // Save custom analytics view
  function saveAnalyticsView() {
    setCustomAnalyticsViews([...customAnalyticsViews, {
      name: analyticsViewName,
      chartType: analyticsChartType,
      groupBy: analyticsGroupBy,
      metric: analyticsMetric,
      reps: analyticsSelectedReps,
      status: analyticsSelectedStatus,
      start: auditStart,
      end: auditEnd
    }]);
    setAnalyticsViewName("");
  }

  // Simulate user role (replace with real auth integration)
  const [role, setRole] = useState("sales_rep");
  // Helper: check if current role can edit a card
  function canEditCard(cardKey) {
    const card = DASHBOARD_SECTIONS.find(c => c.key === cardKey);
    if (!card) return false;
    // Owners and managers can edit all, reps can only view
    return card.roles.includes(role) && (role === "owner" || role === "manager");
  }
  // Example audit log data
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [templates, setTemplates] = useState([
    { id: 1, type: "email", name: "Welcome Lead", content: "Welcome to our dealership!" },
    { id: 2, type: "sms", name: "Appointment Reminder", content: "Reminder: Your appointment is tomorrow." },
    { id: 3, type: "email", name: "Deal Closed Notification", content: "Congrats on your new vehicle!" },
  ]);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [newTemplate, setNewTemplate] = useState({ type: "email", name: "", content: "" });
  const [auditType, setAuditType] = useState("all");
  const [auditSearch, setAuditSearch] = useState("");
  const [auditStart, setAuditStart] = useState("");
  const [auditEnd, setAuditEnd] = useState("");
  useEffect(() => {
    fetch("/api/auditlog")
      .then(res => res.json())
      .then(data => setAuditLog(data.records || []));
  }, []);

  // Drag-and-drop dashboard card order
  const visibleSections = DASHBOARD_SECTIONS.filter(section => section.roles.includes(role));
  const defaultOrder = DASHBOARD_SECTIONS.map(s => s.key).filter(key => visibleSections.some(s => s.key === key));
  const [cardOrder, setCardOrder] = useState(defaultOrder);

  // Drag-and-drop handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, idx: number) => {
    e.dataTransfer.setData("cardIdx", idx.toString());
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, idx: number) => {
    const fromIdx = Number(e.dataTransfer.getData("cardIdx"));
    if (isNaN(fromIdx)) return;
    const newOrder = [...cardOrder];
    const [moved] = newOrder.splice(fromIdx, 1);
    newOrder.splice(idx, 0, moved);
    setCardOrder(newOrder);
    saveCustomCards(newOrder.map(key => ({ key })));
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // AI dashboard card suggestions
  const [aiCardSuggestions, setAiCardSuggestions] = useState([]);
  const [aiCardLoading, setAiCardLoading] = useState(false);
  useEffect(() => {
    async function fetchAiCardSuggestions() {
      setAiCardLoading(true);
      try {
        const res = await fetch("/api/ai/leadscore", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role,
            activity: auditLog,
            dashboard: cardOrder,
            prompt: `Suggest new dashboard cards for a ${role} based on recent activity and current dashboard: ${JSON.stringify(cardOrder)}. Activity: ${JSON.stringify(auditLog)}. Return a JSON array of card names and descriptions.`
          }),
        });
        const data = await res.json();
        setAiCardSuggestions(Array.isArray(data) ? data : [{ error: "No AI suggestions", raw: data }]);
      } catch {
        setAiCardSuggestions([{ error: "AI card suggestion failed" }]);
      }
      setAiCardLoading(false);
    }
    fetchAiCardSuggestions();
  }, [role, auditLog, cardOrder]);
  // Drag-and-drop dashboard card order
  useEffect(() => {
    setCardOrder(defaultOrder);
  }, [role]);
  // Integration Health/Status & Webhook Management
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [webhooks, setWebhooks] = useState<{ url: string; type: string }[]>([]);
  const [newWebhookUrl, setNewWebhookUrl] = useState("");
  const [newWebhookType, setNewWebhookType] = useState("lead");
  const testIntegration = (id: string) => {
    // Placeholder: implement integration test logic
    alert(`Testing integration ${id}`);
  };
  // OAuth/Connect & Custom API Endpoints
  const [showOAuthModal, setShowOAuthModal] = useState(false);
  const [oauthConnections, setOAuthConnections] = useState<{ platform: string; status: string }[]>([]);
  const [newOAuthPlatform, setNewOAuthPlatform] = useState("google");
  const [showApiModal, setShowApiModal] = useState(false);
  const [apiEndpoints, setApiEndpoints] = useState<{ url: string; type: string }[]>([]);
  const [newApiUrl, setNewApiUrl] = useState("");
  const [newApiType, setNewApiType] = useState("custom");
  // ...existing code...
  useEffect(() => {
    fetch("/api/messages?limit=10")
      .then(res => res.json())
      .then(data => {
        setMessages(data.records || []);
        setLoading(false);
      });
    fetch("/api/leads/stats")
      .then(res => res.json())
      .then(data => setLeadStats(data));
  }, []);

  // Compute values for AI card
  function getMostActiveLead(messages: any[]) {
    if (!messages || messages.length === 0) return null;
    const leadCounts: Record<string, number> = {};
    messages.forEach(m => {
      if (m.lead_id) {
        leadCounts[m.lead_id] = (leadCounts[m.lead_id] || 0) + 1;
      }
    });
    const mostActiveId = Object.entries(leadCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    return messages.find(m => m.lead_id === mostActiveId)?.lead || null;
  }
  const mostActiveLead = getMostActiveLead(messages);

  // Example implementation for getSuggestedAction
  function getSuggestedAction(messages: any[]): string {
    if (!messages || messages.length === 0) return "No actions suggested.";
    // Example: Suggest follow-up if last message is inbound
    const lastMsg = messages[0];
    if (lastMsg && lastMsg.direction === "inbound") {
      return "Follow up with lead.";
    }
    return "Review recent activity.";
  }
  const suggestedAction = getSuggestedAction(messages);

  // Filter sections by role
  // (removed duplicate declaration of visibleSections)
  // Notification Settings state
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardType, setNewCardType] = useState("bar");
  const [newCardData, setNewCardData] = useState("");

  // Custom notification preferences state
  const [notificationPrefs, setNotificationPrefs] = useState({
    lead: true,
    deal: true,
    system: true,
    channel: "in-app",
    rules: []
  });

  // Custom cards state
  // Real-time collaboration state (moved below customCards)
  // Advanced collaboration state
  const [notificationChannel, setNotificationChannel] = useState("in-app");
  const [collabRoleRules, setCollabRoleRules] = useState({ manager: "edit", sales_rep: "view", owner: "edit" });
  const [scheduledShares, setScheduledShares] = useState([]);
  const [collabComments, setCollabComments] = useState([]);
  const [versionHistory, setVersionHistory] = useState([]);
  const [activityLogFilter, setActivityLogFilter] = useState("");
  const [externalIntegration, setExternalIntegration] = useState("");
  const [aiCollabSuggestions, setAiCollabSuggestions] = useState([]);
  const [sharedDashboards, setSharedDashboards] = useState([]);
  const [sharedViews, setSharedViews] = useState([]);
  const [shareTarget, setShareTarget] = useState("");
  const [collabStatus, setCollabStatus] = useState("");
  const [collabNotifications, setCollabNotifications] = useState([]);
  const [collabPermissions, setCollabPermissions] = useState({});
  const [collabActivity, setCollabActivity] = useState([]);

  // Fetch shared dashboards/views (simulate with Supabase subscription)
  useEffect(() => {
    // Real-time updates via Supabase subscription
    let supabase;
    import('@supabase/supabase-js').then(({ createClient }) => {
      supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      // Subscribe to activity log
      const activitySub = supabase
        .channel('collab_activity')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'collab_activity' }, payload => {
          setCollabActivity(a => [payload.new, ...a]);
        })
        .subscribe();
      // Subscribe to notifications
      const notifySub = supabase
        .channel('collab_notify')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'collab_notify' }, payload => {
          setCollabNotifications(n => [payload.new, ...n]);
        })
        .subscribe();
      // Subscribe to comments
      const commentSub = supabase
        .channel('collab_comments')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'collab_comments' }, payload => {
          setCollabComments(c => [payload.new, ...c]);
        })
        .subscribe();
      // Subscribe to permissions
      const permSub = supabase
        .channel('collab_permissions')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'collab_permissions' }, payload => {
          setCollabPermissions(p => ({ ...p, [payload.new.user_id]: payload.new.permission }));
        })
        .subscribe();
      // Subscribe to scheduled shares
      const scheduleSub = supabase
        .channel('collab_schedule')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'collab_schedule' }, payload => {
          setScheduledShares(s => [payload.new, ...s]);
        })
        .subscribe();
      // Subscribe to version history
      const versionSub = supabase
        .channel('collab_version')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'collab_version' }, payload => {
          setVersionHistory(v => [payload.new, ...v]);
        })
        .subscribe();
    });
    // Initial fetch for shared dashboards/views
    fetch("/api/dashboard/shared?user=demo")
      .then(res => res.json())
      .then(data => {
        setSharedDashboards(data.dashboards || []);
        setSharedViews(data.views || []);
        setCollabNotifications(data.notifications || []);
        setCollabActivity(data.activity || []);
      });
    // Cleanup subscriptions on unmount
    return () => {
      if (supabase) {
        supabase.removeAllChannels();
      }
    };
  }, []);

  // Share dashboard
  function shareDashboard() {
    fetch("/api/dashboard/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target: shareTarget, dashboard: customCards }),
    }).then(() => setCollabStatus("Dashboard shared!"));
  setCollabNotifications(n => [...n, { type: "share", message: `Dashboard shared with ${shareTarget}` }]);
  setCollabActivity(a => [...a, { action: "share_dashboard", target: shareTarget, time: new Date().toISOString() }]);
  }
  // Collaboration functions (moved below customAnalyticsViews)
  function shareAnalyticsView(view) {
    fetch("/api/dashboard/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target: shareTarget, view }),
    }).then(() => setCollabStatus("Analytics view shared!"));
  setCollabNotifications(n => [...n, { type: "share", message: `Analytics view shared with ${shareTarget}` }]);
  setCollabActivity(a => [...a, { action: "share_view", target: shareTarget, time: new Date().toISOString() }]);
  }

  // Accept/reject shared dashboard/view
  function acceptSharedDashboard(d) {
    setCustomCards(d.cards);
    setCollabStatus("Dashboard imported!");
  setCollabNotifications(n => [...n, { type: "import", message: `Dashboard imported from ${d.owner || "unknown"}` }]);
  setCollabActivity(a => [...a, { action: "import_dashboard", source: d.owner || "unknown", time: new Date().toISOString() }]);
  }
  function acceptSharedView(v) {
    setCustomAnalyticsViews([...customAnalyticsViews, v]);
    setCollabStatus("Analytics view imported!");
  setCollabNotifications(n => [...n, { type: "import", message: `Analytics view imported from ${v.owner || "unknown"}` }]);
  setCollabActivity(a => [...a, { action: "import_view", source: v.owner || "unknown", time: new Date().toISOString() }]);
  }
  function rejectSharedItem(id, type) {
    if (type === "dashboard") setSharedDashboards(sharedDashboards.filter(d => d.id !== id));
    if (type === "view") setSharedViews(sharedViews.filter(v => v.id !== id));
    setCollabStatus("Item rejected.");
  setCollabNotifications(n => [...n, { type: "reject", message: `Shared ${type} rejected.` }]);
  setCollabActivity(a => [...a, { action: "reject_item", itemType: type, itemId: id, time: new Date().toISOString() }]);
  }
  const [customCards, setCustomCards] = useState<any[]>([]);

  // Load custom cards from Supabase
  useEffect(() => {
    fetch("/api/dashboard/cards", { headers: { "x-user-id": "demo" } })
      .then(res => res.json())
      .then(data => setCustomCards(data.cards || []));
  }, []);

  // Persist custom cards to Supabase
  const saveCustomCards = (cards) => {
    setCustomCards(cards);
    fetch("/api/dashboard/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-id": "demo" },
      body: JSON.stringify({ cards }),
    });
  };

  const [notifications, setNotifications] = useState([
    { type: "lead", message: "New lead assigned: John Smith", time: "2 min ago" },
    { type: "deal", message: "Deal closed: Jane Doe - $25,000", time: "10 min ago" },
    { type: "system", message: "System update: CRM v2.1 deployed", time: "1 hr ago" },
  ]);

  // Simulate real-time notifications (replace with websocket or Supabase subscription for production)
  useEffect(() => {
    const interval = setInterval(() => {
      // Example: Add a random notification every 30s
      const types = ["lead", "deal", "system"];
      const type = types[Math.floor(Math.random() * types.length)];
      const msg = type === "lead"
        ? `New lead assigned: ${Math.random().toString(36).substring(7)}`
        : type === "deal"
        ? `Deal closed: ${Math.random().toString(36).substring(7)} - $${Math.floor(Math.random()*30000)}`
        : `System update: CRM v${Math.floor(Math.random()*3)+2}.${Math.floor(Math.random()*10)}`;
      setNotifications(n => [{ type, message: msg, time: "just now" }, ...n].slice(0, 10));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const [showType, setShowType] = useState("all");

  // Scoring function for leads
  function scoreLead(lead, messages) {
    // Simple scoring: +10 for each message, +20 if last message was inbound, +5 if status is 'Contacted'
    let score = 0;
    const leadMessages = messages.filter(m => m.lead_id === lead.id);
    score += leadMessages.length * 10;
    if (leadMessages.length && leadMessages[0].direction === "inbound") score += 20;
    if (lead.status === "Contacted") score += 5;
    return score;
  }

  const [aiScores, setAiScores] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  useEffect(() => {
    async function fetchAiScores() {
      setAiLoading(true);
      try {
        const res = await fetch("/api/ai/leadscore", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leads: leadStats.leads || [], messages }),
        });
        const data = await res.json();
        setAiScores(data);
      } catch {
        setAiScores([{ error: "AI scoring failed" }]);
      }
      setAiLoading(false);
    }
    if ((leadStats.leads || []).length && messages.length) {
      fetchAiScores();
    }
  }, [leadStats, messages]);

  const [aiSummary, setAiSummary] = useState("");
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  useEffect(() => {
    async function fetchAiSummary() {
      setAiSummaryLoading(true);
      try {
        const res = await fetch("/api/ai/leadscore", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leads: leadStats.leads || [], messages }),
        });
        const data = await res.json();
        // Use the first suggestion as summary for demo
        setAiSummary(data[0]?.suggestion || "No summary available.");
      } catch {
        setAiSummary("AI summary failed");
      }
      setAiSummaryLoading(false);
    }
    if ((leadStats.leads || []).length && messages.length) {
      fetchAiSummary();
    }
  }, [leadStats, messages]);

  const [aiInsights, setAiInsights] = useState({ risk: [], forecast: '', tags: [] });
  const [aiInsightsLoading, setAiInsightsLoading] = useState(false);
  useEffect(() => {
    async function fetchAiInsights() {
      setAiInsightsLoading(true);
      try {
        const res = await fetch("/api/ai/leadscore", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leads: leadStats.leads || [], messages }),
        });
        const data = await res.json();
        // For demo, use AI to generate risk, forecast, and tags from suggestions
        setAiInsights({
          risk: data.filter(d => d.suggestion?.toLowerCase().includes("risk")),
          forecast: data[0]?.suggestion || "No forecast available.",
          tags: data.map(d => d.suggestion?.match(/#\w+/g) || []).flat(),
        });
      } catch {
        setAiInsights({ risk: [], forecast: "AI insights failed", tags: [] });
      }
      setAiInsightsLoading(false);
    }
    if ((leadStats.leads || []).length && messages.length) {
      fetchAiInsights();
    }
  }, [leadStats, messages]);

  return (
  <>
    {/* Dashboard Card Marketplace Modal */}
    {showMarketplace && (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded shadow-lg w-full max-w-2xl">
          <h3 className="font-bold mb-2 text-xl">Dashboard Card Marketplace</h3>
          <div className="mb-4 text-sm text-gray-600">Browse, install, and rate dashboard cards. Cards can be added to your dashboard for enhanced analytics, collaboration, and workflow.</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {marketplaceCards.map(card => {
              const isActive = cardOrder.includes(card.key);
              return (
                <div key={card.key} className="border rounded p-3 bg-gray-50 flex flex-col">
                  <div className="font-bold text-lg mb-1">{card.label}</div>
                  <div className="text-xs text-gray-500 mb-1">{card.description}</div>
                  <div className="text-xs text-gray-400 mb-1">By: {card.author || "System"}</div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-green-700">{card.roles.join(", ")}</span>
                    {card.recommended && <span className="px-2 py-0.5 bg-green-100 rounded text-xs">Recommended</span>}
                  </div>
                  <div className="flex gap-2 mb-2">
                    <button className={`px-2 py-1 rounded text-xs ${isActive ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`} onClick={() => {
                      if (isActive) {
                        setCardOrder(cardOrder.filter(k => k !== card.key));
                        saveCustomCards(cardOrder.filter(k => k !== card.key).map(key => ({ key })));
                      } else {
                        setCardOrder([...cardOrder, card.key]);
                        saveCustomCards([...cardOrder, card.key].map(key => ({ key })));
                      }
                    }}>{isActive ? 'Remove' : 'Install'}</button>
                    <button className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs" onClick={() => rateCard(card.key, 5)}>Rate 5★</button>
                  </div>
                  <div className="text-xs text-gray-500">Rating: {card.rating || 0} / 5</div>
                </div>
              );
            })}
          </div>
          <button className="px-2 py-1 bg-gray-200 text-gray-700 rounded" onClick={() => setShowMarketplace(false)}>Close</button>
        </div>
      </div>
    )}
      {/* Notification Settings Card */}
      <div className="p-4 rounded bg-blue-50 border border-blue-200 mb-4 max-w-md">
        <div className="font-semibold text-blue-900 mb-2">Notification Settings</div>
        <div className="flex items-center gap-2 mb-2">
          <label className="text-sm text-blue-800">Lead Alerts</label>
          <input type="checkbox" checked={notificationPrefs.lead} onChange={e => setNotificationPrefs(p => ({ ...p, lead: e.target.checked }))} />
        </div>
        <div className="flex items-center gap-2 mb-2">
          <label className="text-sm text-blue-800">Deal Alerts</label>
          <input type="checkbox" checked={notificationPrefs.deal} onChange={e => setNotificationPrefs(p => ({ ...p, deal: e.target.checked }))} />
        </div>
        <div className="flex items-center gap-2 mb-2">
          <label className="text-sm text-blue-800">System Alerts</label>
          <input type="checkbox" checked={notificationPrefs.system} onChange={e => setNotificationPrefs(p => ({ ...p, system: e.target.checked }))} />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-blue-800">Channel</label>
          <select value={notificationPrefs.channel} onChange={e => setNotificationPrefs(p => ({ ...p, channel: e.target.value }))} className="border rounded px-2 py-1">
            <option value="in-app">In-App</option>
            <option value="slack">Slack</option>
            <option value="email">Email</option>
          </select>
        </div>
        <div className="mt-4">
          <div className="font-semibold mb-2">Advanced Notification Rules</div>
          <ul className="text-sm mb-2">
            {notificationPrefs.rules?.map((rule, idx) => (
              <li key={idx} className="mb-1 flex items-center">
                <span>{rule.trigger} → {rule.action} ({rule.channel})</span>
                <button className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs" onClick={() => {
                  setNotificationPrefs(p => ({ ...p, rules: p.rules.filter((_, i) => i !== idx) }));
                }}>Delete</button>
              </li>
            ))}
          </ul>
          <div className="flex gap-2 mb-2">
            <select id="notif-trigger" className="border rounded px-2 py-1">
              <option value="lead_status_change">Lead Status Change</option>
              <option value="deal_milestone">Deal Milestone</option>
              <option value="new_comment">New Comment</option>
              <option value="dashboard_shared">Dashboard Shared</option>
            </select>
            <select id="notif-action" className="border rounded px-2 py-1">
              <option value="notify">Notify</option>
              <option value="email">Send Email</option>
              <option value="slack">Send Slack Message</option>
            </select>
            <select id="notif-channel" className="border rounded px-2 py-1">
              <option value="in-app">In-App</option>
              <option value="email">Email</option>
              <option value="slack">Slack</option>
            </select>
            <button className="px-2 py-1 bg-green-500 text-white rounded" onClick={() => {
              const trigger = (document.getElementById('notif-trigger') as HTMLSelectElement).value;
              const action = (document.getElementById('notif-action') as HTMLSelectElement).value;
              const channel = (document.getElementById('notif-channel') as HTMLSelectElement).value;
              setNotificationPrefs(p => ({ ...p, rules: [...(p.rules || []), { trigger, action, channel }] }));
            }}>Add Rule</button>
          </div>
        </div>
      </div>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* AI-powered Smart Alerts Card */}
      <Card className="p-4 mb-2">
        <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan-500" /> AI Smart Alerts
        </h2>
        <div className="mb-2 flex gap-2 items-center">
          <label className="text-sm text-cyan-800">Enable Smart Alerts</label>
          <input type="checkbox" checked={smartAlertsEnabled} onChange={e => setSmartAlertsEnabled(e.target.checked)} />
          <select value={smartAlertType} onChange={e => setSmartAlertType(e.target.value)} className="border rounded px-2 py-1 ml-2">
            <option value="all">All</option>
            <option value="risk">Risk</option>
            <option value="opportunity">Opportunity</option>
            <option value="followup">Follow-Up</option>
          </select>
          <select value={smartAlertSensitivity} onChange={e => setSmartAlertSensitivity(e.target.value)} className="border rounded px-2 py-1 ml-2">
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="mb-2 text-xs text-gray-500">AI analyzes leads, deals, and activity to generate smart alerts for risks, opportunities, and follow-ups.</div>
        <ul className="text-sm mb-2">
          {smartAlertsEnabled && smartAlerts.length === 0 && <li className="text-gray-400">No smart alerts.</li>}
          {smartAlertsEnabled && smartAlerts.map((alert, idx) => (
            <li key={idx} className={`mb-1 ${alert.type === "risk" ? "text-red-700" : alert.type === "opportunity" ? "text-green-700" : "text-blue-700"}`}>
              <span className="font-bold">{alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}:</span> {alert.message}
              <span className="text-xs text-gray-400 ml-2">@ {alert.created_at}</span>
            </li>
          ))}
        </ul>
      </Card>
      {/* Marketplace Card */}
      <div className="mb-4">
        <button className="px-2 py-1 bg-purple-500 text-white rounded" onClick={() => setShowMarketplace(true)}>
          Open Dashboard Card Marketplace
        </button>
        <span className="text-xs text-gray-500 ml-2">Browse and install new dashboard cards.</span>
      </div>
      {cardOrder.includes("activityMonitoring") && (
        <div
          key="activityMonitoring"
          draggable={canEditCard("activityMonitoring")}
          onDragStart={canEditCard("activityMonitoring") ? e => handleDragStart(e, cardOrder.indexOf("activityMonitoring")) : undefined}
          onDrop={canEditCard("activityMonitoring") ? e => handleDrop(e, cardOrder.indexOf("activityMonitoring")) : undefined}
          onDragOver={canEditCard("activityMonitoring") ? handleDragOver : undefined}
          className={canEditCard("activityMonitoring") ? "cursor-move" : ""}
        >
          {/* Custom AI Automation & Integration Management Enhancements */}
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* AI Auto-Tagging & Summarization Card */}
            <Card className="p-4 mb-2">
              <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
                <Zap className="w-5 h-5 text-fuchsia-500" /> AI Auto-Tagging & Summarization
              </h2>
              <div className="mb-2 text-xs text-gray-500">Automatically tag leads, deals, and messages using AI. Summarize message threads and activity logs for quick review.</div>
              <button className="px-2 py-1 bg-fuchsia-500 text-white rounded mb-2" onClick={async () => {
                setAiTagLoading(true);
                const res = await fetch("/api/ai/tag", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ user_id: 'demo', dashboard_id: 'main', messages }),
                });
                const data = await res.json();
                setAiTags(data.tags || []);
                setAiTagLoading(false);
              }}>Run Auto-Tagging</button>
              <ul className="text-sm mb-2">
                {aiTagLoading ? <li className="text-fuchsia-500">Tagging...</li> : null}
                {aiTags.map((tag, idx) => (
                  <li key={idx} className="mb-1 text-fuchsia-700">{tag}</li>
                ))}
              </ul>
              <button className="px-2 py-1 bg-blue-500 text-white rounded mb-2" onClick={async () => {
                setAiSummaryLoading(true);
                const res = await fetch("/api/ai/summarize", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ user_id: 'demo', dashboard_id: 'main', messages }),
                });
                const data = await res.json();
                setAiSummary(data.summary || "");
                setAiSummaryLoading(false);
              }}>Summarize Messages</button>
              <div className="text-sm text-gray-700 mb-2">{aiSummaryLoading ? "Summarizing..." : aiSummary}</div>
            </Card>
            {/* AI Workflow Triggers & Prompt Management Card */}
            <Card className="p-4 mb-2">
              <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-500" /> AI Workflow Triggers & Prompts
              </h2>
              <div className="mb-2 text-xs text-gray-500">Configure AI-powered workflow triggers (auto-assign, notify, escalate) and manage custom prompts/models.</div>
              <button className="px-2 py-1 bg-emerald-500 text-white rounded mb-2" onClick={() => setShowWorkflowModal(true)}>Manage Triggers</button>
              <button className="px-2 py-1 bg-blue-500 text-white rounded mb-2" onClick={() => setShowPromptModal(true)}>Manage Prompts/Models</button>
              {/* Modal for Workflow Triggers */}
              {showWorkflowModal && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
                    <h3 className="font-bold mb-2">AI Workflow Triggers</h3>
                    <div className="mb-2 text-sm text-gray-600">Add, edit, or remove workflow triggers powered by AI predictions.</div>
                    <ul className="text-sm mb-2">
                      {workflowTriggers.map((t, idx) => (
                        <li key={idx} className="mb-1 flex items-center justify-between">
                          <span>{t.name} <span className="text-xs text-gray-500">({t.type})</span></span>
                          <button className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs" onClick={() => removeWorkflowTrigger(idx)}>Remove</button>
                        </li>
                      ))}
                    </ul>
                    <div className="mb-2 flex gap-2">
                      <input type="text" placeholder="Trigger Name" value={newTriggerName} onChange={e => setNewTriggerName(e.target.value)} className="border rounded px-2 py-1" />
                      <select value={newTriggerType} onChange={e => setNewTriggerType(e.target.value)} className="border rounded px-2 py-1">
                        <option value="auto-assign">Auto-Assign</option>
                        <option value="auto-notify">Auto-Notify</option>
                        <option value="auto-escalate">Auto-Escalate</option>
                      </select>
                      <button className="px-2 py-1 bg-green-500 text-white rounded" onClick={() => addWorkflowTriggerLocal()}>Add</button>
                    </div>
                    <button className="px-2 py-1 bg-gray-200 text-gray-700 rounded" onClick={() => setShowWorkflowModal(false)}>Close</button>
                  </div>
                </div>
              )}
              {/* Modal for Prompt/Model Management */}
              {showPromptModal && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
                    <h3 className="font-bold mb-2">Custom Prompts & Models</h3>
                    <div className="mb-2 text-sm text-gray-600">Manage custom prompts and select AI models for automation.</div>
                    <ul className="text-sm mb-2">
                      {prompts.map((p, idx) => (
                        <li key={idx} className="mb-1 flex items-center justify-between">
                          <span>{p.name} <span className="text-xs text-gray-500">({p.model})</span></span>
                          <button className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs" onClick={() => removePromptAsync(idx)}>Remove</button>
                        </li>
                      ))}
                    </ul>
                    <div className="mb-2 flex gap-2">
                      <input type="text" placeholder="Prompt Name" value={newPromptName} onChange={e => setNewPromptName(e.target.value)} className="border rounded px-2 py-1" />
                      <select value={newPromptModel} onChange={e => setNewPromptModel(e.target.value)} className="border rounded px-2 py-1">
                        <option value="openai">OpenAI</option>
                        <option value="azure_ai">Azure AI</option>
                        <option value="vertex_ai">Vertex AI</option>
                      </select>
                      <button className="px-2 py-1 bg-green-500 text-white rounded" onClick={() => addPromptLocal()}>Add</button>
                    </div>
                    <button className="px-2 py-1 bg-gray-200 text-gray-700 rounded" onClick={() => setShowPromptModal(false)}>Close</button>
                  </div>
                </div>
              )}
            </Card>
            {/* Integration Health/Status & Webhook Management Card */}
            <Card className="p-4 mb-2">
              <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
                <Zap className="w-5 h-5 text-teal-500" /> Integration Health & Webhooks
              </h2>
              <div className="mb-2 text-xs text-gray-500">Monitor integration health/status and manage webhooks for external platforms.</div>
              <ul className="text-sm mb-2">
                {integrations.map((intg, idx) => (
                  <li key={intg.id || idx} className="mb-1 flex items-center justify-between">
                    <span>{intg.type} <span className="text-xs text-gray-500">{intg.status ? `(${intg.status})` : "(unknown)"}</span></span>
                    <button className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs" onClick={() => testIntegration(intg.id)}>Test</button>
                  </li>
                ))}
              </ul>
              <button className="px-2 py-1 bg-teal-500 text-white rounded mb-2" onClick={() => setShowWebhookModal(true)}>Manage Webhooks</button>
              {/* Modal for Webhook Management */}
              {showWebhookModal && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
                    <h3 className="font-bold mb-2">Webhook Management</h3>
                    <div className="mb-2 text-sm text-gray-600">Add, edit, test, or remove webhooks for external platforms.</div>
                    <ul className="text-sm mb-2">
                      {webhooks.map((w, idx) => (
                        <li key={idx} className="mb-1 flex items-center justify-between">
                          <span>{w.url} <span className="text-xs text-gray-500">({w.type})</span></span>
                          <button className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs" onClick={() => removeWebhookLocal(idx)}>Remove</button>
                        </li>
                      ))}
                    </ul>
                    <div className="mb-2 flex gap-2">
                      <input type="text" placeholder="Webhook URL" value={newWebhookUrl} onChange={e => setNewWebhookUrl(e.target.value)} className="border rounded px-2 py-1" />
                      <select value={newWebhookType} onChange={e => setNewWebhookType(e.target.value)} className="border rounded px-2 py-1">
                        <option value="lead">Lead</option>
                        <option value="deal">Deal</option>
                        <option value="activity">Activity</option>
                      </select>
                      <button className="px-2 py-1 bg-green-500 text-white rounded" onClick={() => addWebhookLocal()}>Add</button>
                    </div>
                    <button className="px-2 py-1 bg-gray-200 text-gray-700 rounded" onClick={() => setShowWebhookModal(false)}>Close</button>
                  </div>
                </div>
              )}
            </Card>
            {/* OAuth/Connect & Custom API Endpoint Card */}
            <Card className="p-4 mb-2">
              <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
                <Zap className="w-5 h-5 text-cyan-500" /> OAuth/Connect & Custom API Endpoints
              </h2>
              <div className="mb-2 text-xs text-gray-500">Connect integrations via OAuth or register custom API endpoints for IT/admins.</div>
              <button className="px-2 py-1 bg-cyan-500 text-white rounded mb-2" onClick={() => setShowOAuthModal(true)}>Manage OAuth/Connect</button>
              <button className="px-2 py-1 bg-blue-500 text-white rounded mb-2" onClick={() => setShowApiModal(true)}>Register API Endpoint</button>
              {/* Modal for OAuth/Connect */}
              {showOAuthModal && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
                    <h3 className="font-bold mb-2">OAuth/Connect Integrations</h3>
                    <div className="mb-2 text-sm text-gray-600">Connect to supported platforms (Google, Microsoft, Slack, etc.).</div>
                    <ul className="text-sm mb-2">
                      {oauthConnections.map((c, idx) => (
                        <li key={idx} className="mb-1 flex items-center justify-between">
                          <span>{c.platform} <span className="text-xs text-gray-500">({c.status})</span></span>
                          <button className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs" onClick={() => removeOAuthConnectionLocal(idx)}>Remove</button>
                        </li>
                      ))}
                    </ul>
                    <div className="mb-2 flex gap-2">
                      <select value={newOAuthPlatform} onChange={e => setNewOAuthPlatform(e.target.value)} className="border rounded px-2 py-1">
                        <option value="google">Google</option>
                        <option value="microsoft">Microsoft</option>
                        <option value="slack">Slack</option>
                      </select>
                      <button className="px-2 py-1 bg-green-500 text-white rounded" onClick={() => addOAuthConnectionLocal()}>Connect</button>
                    </div>
                    <button className="px-2 py-1 bg-gray-200 text-gray-700 rounded" onClick={() => setShowOAuthModal(false)}>Close</button>
                  </div>
                </div>
              )}
              {/* Modal for Custom API Endpoint Registration */}
              {showApiModal && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
                    <h3 className="font-bold mb-2">Register Custom API Endpoint</h3>
                    <div className="mb-2 text-sm text-gray-600">Add new API endpoints for integrations or automation.</div>
                    <ul className="text-sm mb-2">
                      {apiEndpoints.map((ep, idx) => (
                        <li key={idx} className="mb-1 flex items-center justify-between">
                          <span>{ep.url} <span className="text-xs text-gray-500">({ep.type})</span></span>
                          <button className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs" onClick={() => removeApiEndpointLocal(idx)}>Remove</button>
                        </li>
                      ))}
                    </ul>
                    <div className="mb-2 flex gap-2">
                      <input type="text" placeholder="API Endpoint URL" value={newApiUrl} onChange={e => setNewApiUrl(e.target.value)} className="border rounded px-2 py-1" />
                      <select value={newApiType} onChange={e => setNewApiType(e.target.value)} className="border rounded px-2 py-1">
                        <option value="custom">Custom</option>
                        <option value="automation">Automation</option>
                        <option value="integration">Integration</option>
                      </select>
                      <button className="px-2 py-1 bg-green-500 text-white rounded" onClick={() => addApiEndpointLocal()}>Add</button>
                    </div>
                    <button className="px-2 py-1 bg-gray-200 text-gray-700 rounded" onClick={() => setShowApiModal(false)}>Close</button>
                  </div>
                </div>
              )}
            </Card>
          </div>
          <Card className="p-4 mb-2">
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-500" /> Audit Log & Activity Feed
              {!canEditCard("activityMonitoring") && <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-500 rounded text-xs">View Only</span>}
            </h2>
            {/* ...existing code... */}
          </Card>
        </div>
      )}
      {cardOrder.includes("templateLibrary") && (
        <div
          key="templateLibrary"
          draggable
          onDragStart={e => handleDragStart(e, cardOrder.indexOf("templateLibrary"))}
          onDrop={e => handleDrop(e, cardOrder.indexOf("templateLibrary"))}
          onDragOver={handleDragOver}
          className="cursor-move"
        >
          <Card className="p-4 mb-2">
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Mail className="w-5 h-5 text-pink-500" /> Template Library
            </h2>
            <div className="mb-2 flex gap-2">
              <button className="px-2 py-1 bg-pink-500 text-white rounded" onClick={() => setEditingTemplate({ id: null, ...newTemplate })}>New Template</button>
            </div>
            <ul className="text-sm text-gray-700 mb-2">
              {templates.map(t => (
                <li key={t.id} className="mb-1 flex flex-col">
                  <div className="flex items-center">
                    <span className="font-bold mr-2">{t.type.toUpperCase()}:</span>
                    <span>{t.name}</span>
                    <button className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs" onClick={() => setEditingTemplate(t)}>Edit</button>
                    <button className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs" onClick={() => setTemplates(templates.filter(temp => temp.id !== t.id))}>Delete</button>
                  </div>
                  <div className="text-xs text-gray-500 ml-6">{t.content}</div>
                </li>
              ))}
            </ul>
            {editingTemplate && (
              <div className="mb-4 p-2 border rounded bg-gray-50">
                <div className="mb-2 font-semibold">{editingTemplate.id ? "Edit Template" : "New Template"}</div>
                <div className="mb-2 flex gap-2">
                  <select value={editingTemplate.type} onChange={e => setEditingTemplate({ ...editingTemplate, type: e.target.value })} className="border rounded px-2 py-1">
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                  </select>
                  <input type="text" placeholder="Name" value={editingTemplate.name} onChange={e => setEditingTemplate({ ...editingTemplate, name: e.target.value })} className="border rounded px-2 py-1" />
                </div>
                <textarea placeholder="Content" value={editingTemplate.content} onChange={e => setEditingTemplate({ ...editingTemplate, content: e.target.value })} className="border rounded px-2 py-1 w-full mb-2" />
                <div className="flex gap-2">
                  <button className="px-2 py-1 bg-green-500 text-white rounded" onClick={() => {
                    if (editingTemplate.id) {
                      setTemplates(templates.map(t => t.id === editingTemplate.id ? editingTemplate : t));
                    } else {
                      setTemplates([...templates, { ...editingTemplate, id: Date.now() }]);
                    }
                    setEditingTemplate(null);
                  }}>{editingTemplate.id ? "Save" : "Create"}</button>
                  <button className="px-2 py-1 bg-gray-200 text-gray-700 rounded" onClick={() => setEditingTemplate(null)}>Cancel</button>
                </div>
              </div>
            )}
            <div className="mt-4">
              <div className="font-semibold mb-2">Available Dashboard Cards</div>
              <ul className="text-sm">
                {DASHBOARD_SECTIONS.map(card => {
                  const isActive = cardOrder.includes(card.key);
                  return (
                    <li key={card.key} className={`mb-1 flex items-center ${card.roles.includes(role) ? 'font-bold text-green-700' : 'text-gray-500'}`}>
                      <span>{card.label}</span>
                      {card.roles.includes(role) && <span className="ml-2 px-2 py-0.5 bg-green-100 rounded text-xs">Recommended</span>}
                      <button
                        className={`ml-2 px-2 py-0.5 rounded text-xs ${isActive ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}
                        onClick={() => {
                          if (isActive) {
                            setCardOrder(cardOrder.filter(k => k !== card.key));
                          } else {
                            setCardOrder([...cardOrder, card.key]);
                          }
                          saveCustomCards([...cardOrder.filter(k => k !== card.key), ...(isActive ? [] : [card.key])].map(key => ({ key })));
                        }}
                      >{isActive ? 'Remove' : 'Add'}</button>
                    </li>
                  );
                })}
              </ul>
              <div className="text-xs text-gray-500 mt-2">Cards recommended for your role are highlighted.</div>
            </div>
            <div className="mt-6">
              <div className="font-semibold mb-2">AI Recommended Cards (Not Yet Created)</div>
              {aiCardLoading ? (
                <div className="text-blue-500 text-sm">Loading AI suggestions...</div>
              ) : (
                <ul className="text-sm">
                  {aiCardSuggestions.map((card, idx) => (
                    <li key={idx} className="mb-1 text-blue-700">
                      {card.name ? <span>{card.name}</span> : null}
                      {card.description ? <span className="ml-2 text-xs text-gray-600">{card.description}</span> : null}
                      {card.error ? <span className="text-red-500">{card.error}</span> : null}
                      <span className="ml-2 px-2 py-0.5 bg-blue-100 rounded text-xs">AI Suggestion</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="text-xs text-gray-500 mt-2">AI can suggest new dashboard cards based on your role and activity.</div>
            </div>
            <div className="text-xs text-gray-500">Manage, create, and edit message/email templates.</div>
          </Card>

            {/* Advanced Analytics & Insights Card */}
      {/* Collaboration UI for analytics views */}
      {/* Notification Channel Selection */}
      <div className="mb-4 p-2 border rounded bg-gray-50">
        <div className="font-semibold mb-2">Notification Channel</div>
        <select value={notificationChannel} onChange={e => setNotificationChannel(e.target.value)} className="border rounded px-2 py-1">
          <option value="in-app">In-App</option>
          <option value="email">Email</option>
          <option value="slack">Slack</option>
          <option value="sms">SMS</option>
        </select>
        <span className="text-xs text-gray-500 ml-2">Choose how you receive collaboration notifications.</span>
      </div>
      {/* Role-based Collaboration Rules */}
      <div className="mb-4 p-2 border rounded bg-gray-50">
        <div className="font-semibold mb-2">Role-based Collaboration Rules</div>
        {Object.keys(collabRoleRules).map(role => (
          <div key={role} className="mb-1 flex items-center">
            <span className="font-bold mr-2">{role}</span>
            <select
              value={collabRoleRules[role]}
              onChange={async e => {
                const permission = e.target.value;
                setCollabRoleRules(r => ({ ...r, [role]: permission }));
                // Update backend
                await fetch('/api/collab/permissions', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ user_id: 'demo', role, permission, dashboard_id: 'main', view_id: '' }),
                });
                // Refetch permissions
                const res = await fetch('/api/collab/permissions?user_id=demo&dashboard_id=main');
                const data = await res.json();
                if (data.data) {
                  const rules: { manager: string; sales_rep: string; owner: string } = {
                    manager: "view",
                    sales_rep: "view",
                    owner: "view"
                  };
                  data.data.forEach(p => {
                    if (p.role === "manager" || p.role === "sales_rep" || p.role === "owner") {
                      rules[p.role] = p.permission;
                    }
                  });
                  setCollabRoleRules(rules);
                }
              }}
              className="border rounded px-2 py-1"
            >
              <option value="view">View</option>
              <option value="edit">Edit</option>
              <option value="clone">Clone</option>
            </select>
          </div>
        ))}
        <button
          className="px-2 py-1 bg-blue-500 text-white rounded mb-2"
          onClick={async () => {
            // Refetch permissions
            const res = await fetch('/api/collab/permissions?user_id=demo&dashboard_id=main');
            const data = await res.json();
            if (data.data) {
              const rules: { manager: string; sales_rep: string; owner: string } = {
                manager: "view",
                sales_rep: "view",
                owner: "view"
              };
              data.data.forEach(p => {
                if (p.role === "manager" || p.role === "sales_rep" || p.role === "owner") {
                  rules[p.role] = p.permission;
                }
              });
              setCollabRoleRules(rules);
            }
          }}
        >Refresh</button>
        <span className="text-xs text-gray-500">Set what each role can do with shared dashboards/views.</span>
      </div>
      {/* Scheduled Sharing */}
      <div className="mb-4 p-2 border rounded bg-gray-50">
        <div className="font-semibold mb-2">Scheduled Sharing</div>
        <input
          type="datetime-local"
          onChange={async e => {
            const time = e.target.value;
            await fetch('/api/collab/schedule', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ user_id: 'demo', target: shareTarget, dashboard_id: 'main', view_id: '', scheduled_time: time, status: 'pending' }),
            });
            // Refetch scheduled shares
            const res = await fetch('/api/collab/schedule?user_id=demo');
            const data = await res.json();
            setScheduledShares(data.shares || []);
          }}
          className="border rounded px-2 py-1 mr-2"
        />
        <button
          className="px-2 py-1 bg-blue-500 text-white rounded mb-2"
          onClick={async () => {
            // Refetch scheduled shares
            const res = await fetch('/api/collab/schedule?user_id=demo');
            const data = await res.json();
            setScheduledShares(data.shares || []);
          }}
        >Refresh</button>
        <span className="text-xs text-gray-500">Schedule automatic sharing of dashboards/views.</span>
        <ul className="text-xs mt-2">
          {scheduledShares.map((s, idx) => (
            <li key={idx}>{s.target} @ {s.scheduled_time} <span className="text-gray-400">[{s.status}]</span></li>
          ))}
        </ul>
      </div>
      {/* Commenting/Discussion Threads */}
      <div className="mb-4 p-2 border rounded bg-gray-50">
        <div className="font-semibold mb-2">Comments & Discussion</div>
        <textarea
          placeholder="Add a comment..."
          className="border rounded px-2 py-1 w-full mb-2"
          onBlur={async e => {
            const text = e.target.value;
            if (!text) return;
            await fetch('/api/collab/comments', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ user_id: 'demo', dashboard_id: 'main', view_id: '', text }),
            });
            e.target.value = '';
            // Refetch comments
            const res = await fetch('/api/collab/comments?dashboard_id=main');
            const data = await res.json();
            setCollabComments(data.comments || []);
          }}
        />
        <button
          className="px-2 py-1 bg-blue-500 text-white rounded mb-2"
          onClick={async () => {
            // Refetch comments
            const res = await fetch('/api/collab/comments?dashboard_id=main');
            const data = await res.json();
            setCollabComments(data.comments || []);
          }}
        >Refresh</button>
        <ul className="text-xs">
          {collabComments.map((c, idx) => (
            <li key={idx}><span className="font-bold">{c.user_id}:</span> {c.text} <span className="text-gray-400">@ {c.created_at}</span></li>
          ))}
        </ul>
      </div>
      {/* Version History & Rollback */}
      <div className="mb-4 p-2 border rounded bg-gray-50">
        <div className="font-semibold mb-2">Version History</div>
        <button
          className="px-2 py-1 bg-blue-100 text-blue-700 rounded mb-2"
          onClick={async () => {
            // Save version to backend
            await fetch('/api/collab/version', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ user_id: 'demo', dashboard_id: 'main', view_id: '', state: { customCards, customAnalyticsViews } }),
            });
            // Refetch version history
            const res = await fetch('/api/collab/version?user_id=demo&dashboard_id=main');
            const data = await res.json();
            setVersionHistory(data.versions || []);
          }}
        >Save Version</button>
        <button
          className="px-2 py-1 bg-red-500 text-white rounded mb-2"
          onClick={async () => {
            // Rollback to latest version
            const res = await fetch('/api/collab/version', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ user_id: 'demo', dashboard_id: 'main', view_id: '', rollback: true }),
            });
            const data = await res.json();
            if (data.rollback) {
              setCustomCards(data.rollback.customCards || []);
              setCustomAnalyticsViews(data.rollback.customAnalyticsViews || []);
            }
          }}
        >Rollback</button>
        <ul className="text-xs">
          {versionHistory.map((v, idx) => (
            <li key={idx} className="mb-1">{v.created_at} <span className="text-gray-400">[ID: {v.id}]</span></li>
          ))}
        </ul>
      </div>
      {/* Activity Log Filter & Export */}
      <div className="mb-4 p-2 border rounded bg-gray-50">
        <div className="font-semibold mb-2">Activity Log Filter & Export</div>
        <input type="text" placeholder="Filter by action/user..." value={activityLogFilter} onChange={e => setActivityLogFilter(e.target.value)} className="border rounded px-2 py-1 mr-2" />
        <button className="px-2 py-1 bg-green-500 text-white rounded mr-2" onClick={() => {
          fetch(`/api/collab/export?user_id=demo&dashboard_id=main&filter=${encodeURIComponent(activityLogFilter)}`)
            .then(res => res.blob())
            .then(blob => {
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "activity_log.csv";
              a.click();
              URL.revokeObjectURL(url);
            });
        }}>Export CSV</button>
        <label className="px-2 py-1 bg-blue-500 text-white rounded cursor-pointer">
          Import CSV
          <input type="file" accept=".csv" style={{ display: 'none' }} onChange={async e => {
            const file = e.target.files?.[0];
            if (!file) return;
            const formData = new FormData();
            formData.append('file', file);
            formData.append('user_id', 'demo');
            formData.append('dashboard_id', 'main');
            const res = await fetch('/api/collab/import', {
              method: 'POST',
              body: formData,
            });
            if (res.ok) {
              // Refetch activity log after import
              const data = await fetch(`/api/collab/activity?user_id=demo`).then(r => r.json());
              setCollabActivity(data.activity || []);
              alert('Activity log imported!');
            } else {
              alert('Import failed.');
            }
          }} />
        </label>
      </div>
      {/* External Tool Integration */}
      <div className="mb-4 p-2 border rounded bg-gray-50">
        <div className="font-semibold mb-2">External Tool Integration</div>
        <select value={externalIntegration} onChange={e => setExternalIntegration(e.target.value)} className="border rounded px-2 py-1">
          <option value="">None</option>
          {INTEGRATION_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <button
          className="px-2 py-1 bg-purple-500 text-white rounded ml-2"
          onClick={async () => {
            await fetch('/api/collab/integrate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ user_id: 'demo', dashboard_id: 'main', tool: externalIntegration }),
            });
            alert('Integration request sent!');
          }}
        >Integrate</button>
        <button className="px-2 py-1 bg-blue-500 text-white rounded ml-2" onClick={() => setShowIntegrationModal(true)}>Manage Integrations</button>
        <span className="text-xs text-gray-500 ml-2">Export or sync dashboards/views to external tools.</span>
        {/* Integration Settings Modal */}
        {showIntegrationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-xl">
              <h3 className="font-bold mb-2 text-xl">Integration Settings</h3>
              <div className="mb-4 text-sm text-gray-600">Manage your external integrations. Add, remove, or configure connections to Google Sheets, Excel, BI platforms, and more.</div>
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Current Integrations</h4>
                <ul className="text-sm mb-2">
                  {integrations.length === 0 && <li className="text-gray-400">No integrations.</li>}
                  {integrations.map(intg => (
                    <li key={intg.id} className="mb-1 flex items-center justify-between">
                      <span>{intg.type} {intg.config ? <span className="text-xs text-gray-500">({intg.config})</span> : null}</span>
                      <button className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs" onClick={() => removeIntegration(intg.id)}>Remove</button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Add Integration</h4>
                <select value={newIntegrationType} onChange={e => setNewIntegrationType(e.target.value)} className="border rounded px-2 py-1 mr-2">
                  <option value="">Select Type</option>
                  {INTEGRATION_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <input type="text" placeholder="Config/API Key (if needed)" value={newIntegrationConfig} onChange={e => setNewIntegrationConfig(e.target.value)} className="border rounded px-2 py-1 mr-2" />
                <button className="px-2 py-1 bg-green-500 text-white rounded" onClick={addIntegration} disabled={!newIntegrationType}>Add</button>
                <div className="text-xs text-gray-500 mt-2">OAuth/connect buttons will appear for supported platforms. Enter API key/config for custom or AI integrations.</div>
              </div>
      {/* AI Integrations Card */}
      <Card className="p-4 mb-2">
        <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
          <Zap className="w-5 h-5 text-indigo-500" /> AI Integrations
        </h2>
        <div className="mb-2 text-xs text-gray-500">Connect external AI services for advanced automation, enrichment, and analytics.</div>
        <ul className="text-sm mb-2">
          {integrations.filter(i => ["openai", "azure_ai", "vertex_ai"].includes(i.type)).length === 0 && <li className="text-gray-400">No AI integrations.</li>}
          {integrations.filter(i => ["openai", "azure_ai", "vertex_ai"].includes(i.type)).map((ai, idx) => (
            <li key={ai.id || idx} className="mb-1 flex items-center justify-between">
              <span>{INTEGRATION_OPTIONS.find(opt => opt.value === ai.type)?.label || ai.type} {ai.config ? <span className="text-xs text-gray-500">({ai.config})</span> : null}</span>
              <button className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs" onClick={() => removeIntegration(ai.id)}>Remove</button>
            </li>
          ))}
        </ul>
        <button className="px-2 py-1 bg-blue-500 text-white rounded" onClick={() => setShowIntegrationModal(true)}>Manage AI Integrations</button>
      </Card>
              <button className="px-2 py-1 bg-gray-200 text-gray-700 rounded" onClick={() => setShowIntegrationModal(false)}>Close</button>
            </div>
          </div>
        )}
      </div>
      {/* AI-powered Collaboration Suggestions */}
      <div className="mb-4 p-2 border rounded bg-gray-50">
        <div className="font-semibold mb-2">AI Collaboration Suggestions</div>
        <button className="px-2 py-1 bg-purple-500 text-white rounded mb-2" onClick={async () => {
          const res = await fetch("/api/collab/ai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: 'demo', dashboard_id: 'main', prompt: `Suggest users/roles to share dashboards/views with based on recent activity: ${JSON.stringify(collabActivity)} and comments: ${JSON.stringify(collabComments)}` }),
          });
          const data = await res.json();
          setAiCollabSuggestions(Array.isArray(data.suggestions) ? data.suggestions : [{ error: "No AI suggestions", raw: data }]);
        }}>Get AI Suggestions</button>
        <ul className="text-sm mt-2">
          {aiCollabSuggestions.map((s, idx) => (
            <li key={idx} className="mb-1 text-blue-700">{s.name ? <span>{s.name}</span> : null} {s.description ? <span className="ml-2 text-xs text-gray-600">{s.description}</span> : null} {s.error ? <span className="text-red-500">{s.error}</span> : null}</li>
          ))}
        </ul>
        <span className="text-xs text-gray-500">AI can recommend collaboration actions and recipients.</span>
      </div>
      {/* Collaboration Permissions UI */}
      <div className="mb-4 p-2 border rounded bg-gray-50">
        <div className="font-semibold mb-2">Set Permissions for Shared Views</div>
        <select value={collabPermissions[shareTarget] || "view"} onChange={e => setCollabPermissions(p => ({ ...p, [shareTarget]: e.target.value }))} className="border rounded px-2 py-1 mr-2">
          <option value="view">View Only</option>
          <option value="edit">Edit</option>
          <option value="clone">Clone</option>
        </select>
        <span className="text-xs text-gray-500">Permissions apply to next share/import for this user/role.</span>
      </div>
      {/* Collaboration Notifications UI */}
      <div className="mb-4">
        <div className="font-semibold mb-1">Collaboration Notifications</div>
        <button
          className="px-2 py-1 bg-blue-500 text-white rounded mb-2"
          onClick={async () => {
        {replyTo && (
          <div className="mt-2 p-2 border rounded bg-gray-100">
            <span className="text-xs">Replying to comment ID: {replyTo}</span>
            <button className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs" onClick={() => setReplyTo(null)}>Cancel</button>
          </div>
        )}
            // Refetch notifications
            const res = await fetch('/api/collab/notify?user_id=demo');
            const data = await res.json();
            setCollabNotifications(data.notifications || []);
          }}
        >Refresh</button>
        <button
          className="px-2 py-1 bg-green-500 text-white rounded mb-2"
          onClick={async () => {
            // Post a test notification
            await fetch('/api/collab/notify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ user_id: 'demo', channel: 'in-app', type: 'info', message: 'Test notification from dashboard' }),
            });
            // Refetch notifications
            const res = await fetch('/api/collab/notify?user_id=demo');
            const data = await res.json();
            setCollabNotifications(data.notifications || []);
          }}
        >Send Test Notification</button>
        <ul className="text-sm">
          {collabNotifications.map((n, idx) => (
            <li key={idx} className={`mb-1 ${n.type === "share" ? "text-blue-700" : n.type === "import" ? "text-green-700" : "text-red-700"}`}>{n.message} <span className="text-xs text-gray-400">@ {n.created_at}</span></li>
          ))}
        </ul>
      </div>
      {/* Collaboration Activity Log UI */}
      <div className="mb-4">
        <div className="font-semibold mb-1">Collaboration Activity Log</div>
        <button
          className="px-2 py-1 bg-blue-500 text-white rounded mb-2"
          onClick={async () => {
            // Refetch activity log
            const res = await fetch('/api/collab/activity?user_id=demo');
            const data = await res.json();
            setCollabActivity(data.activity || []);
          }}
        >Refresh</button>
        <input
          type="text"
          placeholder="Filter by action/user..."
          value={activityLogFilter}
          onChange={async e => {
            setActivityLogFilter(e.target.value);
            // Refetch filtered activity log
            const res = await fetch(`/api/collab/activity?user_id=demo&filter=${encodeURIComponent(e.target.value)}`);
            const data = await res.json();
            setCollabActivity(data.activity || []);
          }}
          className="border rounded px-2 py-1 mr-2"
        />
        <ul className="text-xs">
          {collabActivity.map((a, idx) => (
            <li key={idx} className="mb-1">{a.action} {a.target || a.source || a.item_type} {a.item_id ? `(${a.item_id})` : ""} @ {a.created_at}</li>
          ))}
        </ul>
      </div>
      <div className="mb-4 p-2 border rounded bg-gray-50">
        <div className="font-semibold mb-2">Share Analytics View</div>
        <input type="text" placeholder="Share with user/role..." value={shareTarget} onChange={e => setShareTarget(e.target.value)} className="border rounded px-2 py-1 mr-2" />
        <button className="px-2 py-1 bg-blue-500 text-white rounded" onClick={() => shareAnalyticsView({
          name: analyticsViewName || "Current View",
          chartType: analyticsChartType,
          groupBy: analyticsGroupBy,
          metric: analyticsMetric,
          reps: analyticsSelectedReps,
          status: analyticsSelectedStatus,
          start: auditStart,
          end: auditEnd
        })}>Share View</button>
        {collabStatus && <div className="text-xs text-green-600 mt-2">{collabStatus}</div>}
      </div>
      {/* List shared analytics views */}
      {sharedViews.length > 0 && (
        <div className="mb-4">
          <div className="font-semibold mb-1">Shared Analytics Views</div>
          <ul className="text-sm">
            {sharedViews.map((view, idx) => (
              <li key={view.id || idx} className="mb-1 flex items-center">
                <span className="font-bold mr-2">{view.name}</span>
                <span className="text-xs text-gray-500">{view.chartType}, {view.groupBy}, {view.metric}</span>
                <button className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs" onClick={() => acceptSharedView(view)}>Import</button>
                <button className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs" onClick={() => rejectSharedItem(view.id, "view")}>Reject</button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Collaboration UI for dashboards */}
      <div className="mb-4 p-2 border rounded bg-gray-50">
        <div className="font-semibold mb-2">Share Dashboard Layout</div>
        <input type="text" placeholder="Share with user/role..." value={shareTarget} onChange={e => setShareTarget(e.target.value)} className="border rounded px-2 py-1 mr-2" />
        <button className="px-2 py-1 bg-blue-500 text-white rounded" onClick={shareDashboard}>Share Dashboard</button>
        {collabStatus && <div className="text-xs text-green-600 mt-2">{collabStatus}</div>}
      </div>
      {/* List shared dashboards */}
      {sharedDashboards.length > 0 && (
        <div className="mb-4">
          <div className="font-semibold mb-1">Shared Dashboards</div>
          <ul className="text-sm">
            {sharedDashboards.map((d, idx) => (
              <li key={d.id || idx} className="mb-1 flex items-center">
                <span className="font-bold mr-2">{d.name || `Dashboard ${idx+1}`}</span>
                <button className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs" onClick={() => acceptSharedDashboard(d)}>Import</button>
                <button className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs" onClick={() => rejectSharedItem(d.id, "dashboard")}>Reject</button>
              </li>
            ))}
          </ul>
        </div>
      )}
            {cardOrder.includes("advancedAnalytics") && (
              <div
                key="advancedAnalytics"
                draggable={canEditCard("advancedAnalytics")}
                onDragStart={canEditCard("advancedAnalytics") ? e => handleDragStart(e, cardOrder.indexOf("advancedAnalytics")) : undefined}
                onDrop={canEditCard("advancedAnalytics") ? e => handleDrop(e, cardOrder.indexOf("advancedAnalytics")) : undefined}
                onDragOver={canEditCard("advancedAnalytics") ? handleDragOver : undefined}
                className={canEditCard("advancedAnalytics") ? "cursor-move" : ""}
              >
                {/* Custom Analytics Builder UI */}
                {!canEditCard("advancedAnalytics") && <div className="text-xs text-gray-500 mb-2">View Only: Managers/Owners can edit analytics.</div>}
                <Card className="p-4 mb-2">
                  <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-500" /> Advanced Analytics & Insights
                  </h2>
                  <div className="mb-2 flex gap-2 flex-wrap">
                    <button className="px-2 py-1 bg-blue-500 text-white rounded" onClick={() => setShowAnalyticsBuilder(true)} disabled={!canEditCard("advancedAnalytics")}>+ Add Analytics Card</button>
                  </div>
                  {/* Modal for Analytics Builder */}
                  {showAnalyticsBuilder && (
                    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                      <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
                        <h3 className="font-bold mb-2">Create Custom Analytics Card</h3>
                        <div className="mb-2 flex gap-2 flex-wrap">
                          <input type="text" placeholder="Card Title" value={newCardTitle} onChange={e => setNewCardTitle(e.target.value)} className="border rounded px-2 py-1" />
                          <select value={newCardType} onChange={e => setNewCardType(e.target.value)} className="border rounded px-2 py-1">
                            <option value="bar">Bar</option>
                            <option value="line">Line</option>
                            <option value="doughnut">Doughnut</option>
                            <option value="pie">Pie</option>
                          </select>
                          <textarea placeholder="Data Query (JS/SQL)" value={newCardData} onChange={e => setNewCardData(e.target.value)} className="border rounded px-2 py-1 w-full" />
                        </div>
                        <div className="flex gap-2 mt-2">
                          <button className="px-2 py-1 bg-green-500 text-white rounded" onClick={() => {
                            setCustomAnalyticsViews([...customAnalyticsViews, {
                              name: newCardTitle,
                              chartType: newCardType,
                              dataQuery: newCardData,
                            }]);
                            setShowAnalyticsBuilder(false);
                            setNewCardTitle("");
                            setNewCardType("bar");
                            setNewCardData("");
                          }}>Save</button>
                          <button className="px-2 py-1 bg-gray-200 text-gray-700 rounded" onClick={() => setShowAnalyticsBuilder(false)}>Cancel</button>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* ...existing analytics card rendering code... */}
                </Card>
              </div>
            )}
        </div>
      )}
        {visibleSections.some(s => s.key === "exportImport") && (
          <Card className="p-4 mb-2">
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" /> Bulk Actions & Import/Export
              {!canEditCard("exportImport") && <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-500 rounded text-xs">View Only</span>}
            </h2>
            <div className="mb-2">
              <button className="px-2 py-1 bg-blue-500 text-white rounded mr-2" disabled={!canEditCard("exportImport")}>Import CSV</button>
              <button className="px-2 py-1 bg-green-500 text-white rounded mr-2" disabled={!canEditCard("exportImport")}>Export CSV</button>
              <button className="px-2 py-1 bg-purple-500 text-white rounded" disabled={!canEditCard("exportImport")}>Bulk Message</button>
            </div>
            <div className="text-xs text-gray-500">Upload, export, or send bulk messages to leads/deals.</div>
          </Card>
        )}
        {visibleSections.some(s => s.key === "helpSupport") && (
          <Card className="p-4 mb-2">
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-500" /> Help & Support
            </h2>
            <div className="mb-2">
              <button className="px-2 py-1 bg-indigo-500 text-white rounded">Contact Support</button>
              <button className="px-2 py-1 bg-gray-200 text-indigo-700 rounded ml-2">Submit Feedback</button>
            </div>
            <div className="text-xs text-gray-500">Get help, chat with support, or send feedback.</div>
          </Card>
        )}
        {visibleSections.some(s => s.key === "notifications") && (
          <Card className="p-4 mb-2">
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-500" /> Notifications Center
            </h2>
            <div className="mb-2 flex gap-2">
              <button className={`px-2 py-1 rounded ${showType === "all" ? "bg-blue-200" : "bg-gray-100"}`} onClick={() => setShowType("all")}>All</button>
              <button className={`px-2 py-1 rounded ${showType === "lead" ? "bg-blue-200" : "bg-gray-100"}`} onClick={() => setShowType("lead")}>Leads</button>
              <button className={`px-2 py-1 rounded ${showType === "deal" ? "bg-blue-200" : "bg-gray-100"}`} onClick={() => setShowType("deal")}>Deals</button>
              <button className={`px-2 py-1 rounded ${showType === "system" ? "bg-blue-200" : "bg-gray-100"}`} onClick={() => setShowType("system")}>System</button>
            </div>
            <ul className="text-sm text-gray-700">
              {notifications.filter(n =>
                (notificationPrefs[n.type] || false) &&
                (showType === "all" || n.type === showType)
              ).map((n, idx) => (
                <li key={idx} className="mb-1 flex justify-between items-center">
                  <span>{n.message}</span>
                  <span className="text-xs text-gray-400 ml-2">{n.time}</span>
                </li>
              ))}
              {notifications.filter(n =>
                (notificationPrefs[n.type] || false) &&
                (showType === "all" || n.type === showType)
              ).map((n, idx) => (
                <li key={idx} className="mb-1 flex justify-between items-center">
                  <span>{n.message}</span>
                  <span className="text-xs text-gray-400 ml-2">{n.time}</span>
                </li>
              ))}
              {notifications.filter(n =>
                (notificationPrefs[n.type] || false) &&
                (showType === "all" || n.type === showType)
              ).length === 0 && (
                <li className="text-gray-400">No notifications.</li>
              )}
            </ul>
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div className="bg-cyan-50 p-2 rounded">
                <div className="text-xs text-gray-500">Total Messages</div>
                <div className="font-bold text-lg">{messages.length}</div>
              </div>
              <div className="bg-green-50 p-2 rounded">
                <div className="text-xs text-gray-500">Avg. Response Time</div>
                <div className="font-bold text-lg">{
                  (() => {
                    const times = messages.filter(m => m.response_time).map(m => m.response_time);
                    if (!times.length) return "N/A";
                    const avg = times.reduce((a, b) => a + b, 0) / times.length;
                    return `${Math.round(avg)} min`;
                  })()
                }</div>
              </div>
              <div className="bg-yellow-50 p-2 rounded col-span-2">
                <div className="text-xs text-gray-500">Top Rep</div>
                <div className="font-bold text-lg">{
                  (() => {
                    const reps = {};
                    messages.forEach(m => {
                      if (!m.rep_name) return;
                      reps[m.rep_name] = (reps[m.rep_name] || 0) + 1;
                    });
                    const sorted = Object.entries(reps).sort((a, b) => Number(b[1]) - Number(a[1]));
                    return sorted.length ? sorted[0][0] : "N/A";
                  })()
                }</div>
              </div>
            </div>
            {/* Bar Chart: Sent vs Received */}
            <div className="mb-4">
              <Bar
                data={{
                  labels: ["Sent", "Received"],
                  datasets: [
                    {
                      label: "Messages",
                      data: [
                        messages.filter(m => m.direction === "outbound").length,
                        messages.filter(m => m.direction === "inbound").length
                      ],
                      backgroundColor: ["#06b6d4", "#f59e42"],
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: true, position: "bottom" },
                    title: { display: true, text: "Messages Sent vs Received" },
                    tooltip: { enabled: true }
                  },
                }}
              />
            </div>
            {/* Doughnut Chart: Lead Status */}
            <div className="mb-2">
              <Doughnut
                data={{
                  labels: Object.keys(leadStats),
                  datasets: [
                    {
                      label: "Leads",
                      data: Object.values(leadStats),
                      backgroundColor: ["#22c55e", "#f59e42", "#ef4444", "#6366f1", "#eab308"],
                    },
                  ],
                }}
                options={{
                  plugins: {
                    legend: { display: true, position: "bottom" },
                    title: { display: true, text: "Lead Status Distribution" },
                    tooltip: { enabled: true }
                  }
                }}
              />
            </div>
          </Card>
        )}
      </div>
  </>
  )};
