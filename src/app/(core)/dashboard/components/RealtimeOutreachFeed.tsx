"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import DashboardCardSettingsModal from "./DashboardCardSettingsModal";

interface OutreachEvent {
  id: number;
  channel: string;
  status: string;
  step_index: number;
  provider_id: string;
  lead_name: string;
  campaign_name: string;
  created_at: string;
  error: string | null;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Demo data for outreach events
const demoEvents = [
  {
    id: 1,
    channel: "email",
    status: "delivered",
    step_index: 1,
    provider_id: "sendgrid",
    lead_name: "John Doe",
    campaign_name: "Q4 Product Launch",
    created_at: new Date().toISOString(),
    error: null
  },
  {
    id: 2,
    channel: "sms",
    status: "sent",
    step_index: 2,
    provider_id: "twilio",
    lead_name: "Jane Smith",
    campaign_name: "Follow-up Sequence",
    created_at: new Date(Date.now() - 5 * 60000).toISOString(),
    error: null
  },
  {
    id: 3,
    channel: "email",
    status: "failed",
    step_index: 1,
    provider_id: "sendgrid",
    lead_name: "Bob Wilson",
    campaign_name: "Welcome Series",
    created_at: new Date(Date.now() - 10 * 60000).toISOString(),
    error: "Invalid email address"
  },
  {
    id: 4,
    channel: "linkedin",
    status: "delivered",
    step_index: 3,
    provider_id: "linkedin_api",
    lead_name: "Sarah Johnson",
    campaign_name: "Professional Outreach",
    created_at: new Date(Date.now() - 15 * 60000).toISOString(),
    error: null
  },
  {
    id: 5,
    channel: "phone",
    status: "completed",
    step_index: 1,
    provider_id: "telnyx",
    lead_name: "Mike Davis",
    campaign_name: "Personal Touch",
    created_at: new Date(Date.now() - 20 * 60000).toISOString(),
    error: null
  }
];

export default function RealtimeOutreachFeed() {
  const [events, setEvents] = useState<any[]>(demoEvents.slice(0, 3));
  const [mounted, setMounted] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'connecting'>('connecting');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false);
  const [dataRefreshing, setDataRefreshing] = useState(false);
  const [feedSettings, setFeedSettings] = useState({
    maxEvents: 3,
    showChannelIcons: true,
    showTimestamps: true,
    showErrors: true,
    showNewIndicator: true,
    colorCodeByPerson: true,
    compactView: false,
    autoRefresh: true,
    refreshInterval: 15, // seconds for connection checks
    filterByChannel: 'all', // 'all', 'email', 'sms', 'linkedin', 'phone'
    filterByStatus: 'all', // 'all', 'delivered', 'sent', 'failed', etc.
    searchQuery: '', // search filter for events
    filteredChannels: [] as string[], // array of selected channels for advanced filtering
    filteredStatuses: [] as string[], // array of selected statuses for advanced filtering
    // New theme and visibility settings
    theme: 'purple', // 'orange', 'blue', 'green', 'purple', 'pink', 'gray'
    borderStyle: 'solid', // 'solid', 'dashed', 'dotted', 'gradient'
    showLiveStatus: true,
    showCardTitle: true,
    dataSource: 'demo' // 'demo' or 'live'
  });

  // Separate state for pending changes that require apply button
  const [pendingSettings, setPendingSettings] = useState({
    dataSource: 'demo'
  });

  const handleSettingsChange = (setting: string, value: any) => {
    if (setting === 'dataSource') {
      // For data source, update pending state only
      setPendingSettings(prev => ({
        ...prev,
        [setting]: value
      }));
    } else {
      // For other settings, apply immediately
      setFeedSettings(prev => ({
        ...prev,
        [setting]: value
      }));
    }
  };

  const applyDataSourceChanges = () => {
    setDataRefreshing(true);
    setConnectionStatus('connecting');
    
    // Simulate data source change delay
    setTimeout(() => {
      setFeedSettings(prev => ({
        ...prev,
        dataSource: pendingSettings.dataSource
      }));
      setLastUpdate(new Date());
      setDataRefreshing(false);
      setConnectionStatus('online');
    }, 1500); // 1.5 second delay to show loading state
  };

  // Effect to auto-refresh data when data source changes
  useEffect(() => {
    if (feedSettings.dataSource !== pendingSettings.dataSource) {
      // Auto-apply changes when data source is modified
      const timer = setTimeout(() => {
        applyDataSourceChanges();
      }, 500); // Small delay to show user the change
      
      return () => clearTimeout(timer);
    }
  }, [pendingSettings.dataSource]);

  // Auto-refresh effect for live data
  useEffect(() => {
    if (feedSettings.dataSource === 'live' && feedSettings.autoRefresh && !showSettings) {
      const interval = setInterval(() => {
        setLastUpdate(new Date());
      }, feedSettings.refreshInterval * 1000);
      
      return () => clearInterval(interval);
    }
  }, [feedSettings.dataSource, feedSettings.autoRefresh, feedSettings.refreshInterval, showSettings]);

  // Theme helper functions
  const getThemeColors = (theme: string) => {
    const themes = {
      orange: {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        topBorder: 'border-t-orange-500',
        headerBg: 'from-orange-100 to-orange-200',
        accent: 'bg-orange-500',
        accentHover: 'hover:bg-orange-600',
        text: 'text-orange-600',
        buttonBg: 'bg-orange-500',
        buttonHover: 'hover:bg-orange-600'
      },
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        topBorder: 'border-t-blue-500',
        headerBg: 'from-blue-100 to-blue-200',
        accent: 'bg-blue-500',
        accentHover: 'hover:bg-blue-600',
        text: 'text-blue-600',
        buttonBg: 'bg-blue-500',
        buttonHover: 'hover:bg-blue-600'
      },
      green: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        topBorder: 'border-t-green-500',
        headerBg: 'from-green-100 to-green-200',
        accent: 'bg-green-500',
        accentHover: 'hover:bg-green-600',
        text: 'text-green-600',
        buttonBg: 'bg-green-500',
        buttonHover: 'hover:bg-green-600'
      },
      purple: {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        topBorder: 'border-t-purple-500',
        headerBg: 'from-purple-100 to-purple-200',
        accent: 'bg-purple-500',
        accentHover: 'hover:bg-purple-600',
        text: 'text-purple-600',
        buttonBg: 'bg-purple-500',
        buttonHover: 'hover:bg-purple-600'
      },
      pink: {
        bg: 'bg-pink-50',
        border: 'border-pink-200',
        topBorder: 'border-t-pink-500',
        headerBg: 'from-pink-100 to-pink-200',
        accent: 'bg-pink-500',
        accentHover: 'hover:bg-pink-600',
        text: 'text-pink-600',
        buttonBg: 'bg-pink-500',
        buttonHover: 'hover:bg-pink-600'
      },
      gray: {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        topBorder: 'border-t-gray-500',
        headerBg: 'from-gray-100 to-gray-200',
        accent: 'bg-gray-500',
        accentHover: 'hover:bg-gray-600',
        text: 'text-gray-600',
        buttonBg: 'bg-gray-500',
        buttonHover: 'hover:bg-gray-600'
      }
    };
    return themes[theme as keyof typeof themes] || themes.purple;
  };

  const getBorderStyle = (style: string) => {
    switch (style) {
      case 'dashed': return 'border-dashed';
      case 'dotted': return 'border-dotted';
      case 'gradient': return 'border-2 bg-gradient-to-br';
      default: return 'border';
    }
  };

  // Generate events based on data source
  const generateEvents = (dataSource: string) => {
    if (dataSource === 'demo') {
      return demoEvents.slice(0, feedSettings.maxEvents);
    } else {
      // Generate live-looking data with more variation
      const liveEvents: OutreachEvent[] = [];
      const channels = ["email", "sms", "linkedin", "phone"];
      const statuses = ["sent", "delivered", "opened", "clicked", "replied", "failed", "completed"];
      const providers = ["sendgrid", "twilio", "linkedin_api", "telnyx"];
      const names = ["Alex Rodriguez", "Emma Chen", "Marcus Johnson", "Sofia Patel", "James Wilson", "Maya Thompson"];
      const campaigns = ["Live Campaign Alpha", "Real-time Outreach", "Active Engagement", "Dynamic Follow-up"];
      
      for (let i = 0; i < feedSettings.maxEvents; i++) {
        liveEvents.push({
          id: Date.now() + i,
          channel: channels[Math.floor(Math.random() * channels.length)],
          status: statuses[Math.floor(Math.random() * statuses.length)],
          step_index: Math.floor(Math.random() * 5) + 1,
          provider_id: providers[Math.floor(Math.random() * providers.length)],
          lead_name: names[Math.floor(Math.random() * names.length)],
          campaign_name: campaigns[Math.floor(Math.random() * campaigns.length)],
          created_at: new Date(Date.now() - Math.random() * 3600000).toISOString(), // Random time within last hour
          error: Math.random() > 0.85 ? "Connection timeout" : null
        });
      }
      return liveEvents;
    }
  };

  // Function to filter and process events based on settings
  const getFilteredEvents = () => {
    let filteredEvents = feedSettings.dataSource === 'demo' ? 
      [...events] : 
      generateEvents(feedSettings.dataSource);

    // Filter by channel
    if (feedSettings.filterByChannel !== 'all') {
      filteredEvents = filteredEvents.filter(event => event.channel === feedSettings.filterByChannel);
    }

    // Filter by status
    if (feedSettings.filterByStatus !== 'all') {
      filteredEvents = filteredEvents.filter(event => event.status === feedSettings.filterByStatus);
    }

    // Filter out errors if disabled
    if (!feedSettings.showErrors) {
      filteredEvents = filteredEvents.filter(event => !event.error);
    }

    // Limit number of events
    return filteredEvents.slice(0, feedSettings.maxEvents);
  };

  useEffect(() => {
    setMounted(true);
    
    // Set initial connection status
    setConnectionStatus('online');
    setLastUpdate(new Date());
    
    // Subscribe to outreach_events table
    const sub = supabase
      .channel("outreach_events_feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "outreach_events" },
        (payload) => {
          setConnectionStatus('online');
          setLastUpdate(new Date());
          setEvents((prev) => [payload.new, ...prev].slice(0, 3));
        }
      )
      .subscribe();
    
    // Simulate new events every 1 hour for demo
    const interval = setInterval(() => {
      setConnectionStatus('online');
      setLastUpdate(new Date());
      
      const newEvent = {
        id: Date.now(),
        channel: ["email", "sms", "linkedin", "phone"][Math.floor(Math.random() * 4)],
        status: ["sent", "delivered", "opened", "clicked", "replied"][Math.floor(Math.random() * 5)],
        step_index: Math.floor(Math.random() * 5) + 1,
        provider_id: ["sendgrid", "twilio", "linkedin_api", "telnyx"][Math.floor(Math.random() * 4)],
        lead_name: ["Alex Chen", "Maria Garcia", "David Brown", "Lisa Wang"][Math.floor(Math.random() * 4)],
        campaign_name: ["Demo Campaign", "Follow-up", "New Product Launch"][Math.floor(Math.random() * 3)],
        created_at: new Date().toISOString(),
        error: Math.random() > 0.8 ? "Network timeout" : null
      };
      setEvents((prev) => [newEvent, ...prev].slice(0, feedSettings.maxEvents));
    }, 3600000); // 1 hour = 3,600,000 milliseconds

    // Simulate occasional connection issues
    const connectionCheckInterval = setInterval(() => {
      if (Math.random() < 0.05) { // 5% chance of connection issue
        setConnectionStatus('offline');
        setTimeout(() => {
          setConnectionStatus('online');
          setLastUpdate(new Date());
        }, 2000);
      }
    }, 15000); // Check every 15 seconds
    
    return () => {
      supabase.removeChannel(sub);
      clearInterval(interval);
      clearInterval(connectionCheckInterval);
    };
  }, []);

  if (!mounted) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-700 bg-green-100 border-green-200';
      case 'sent': return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'opened': return 'text-purple-700 bg-purple-100 border-purple-200';
      case 'clicked': return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'replied': return 'text-emerald-700 bg-emerald-100 border-emerald-200';
      case 'failed': return 'text-red-700 bg-red-100 border-red-200';
      case 'completed': return 'text-green-800 bg-green-200 border-green-300';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return '✅';
      case 'sent': return '📤';
      case 'opened': return '👀';
      case 'clicked': return '🖱️';
      case 'replied': return '💬';
      case 'failed': return '❌';
      case 'completed': return '🎯';
      default: return '📊';
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return '📧';
      case 'sms': return '💬';
      case 'linkedin': return '💼';
      case 'phone': return '📞';
      default: return '📡';
    }
  };

  const isRecentEvent = (dateString: string) => {
    return Date.now() - new Date(dateString).getTime() < 2 * 600000; // 2 minutes
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getPersonColorScheme = (leadName: string) => {
    // Create consistent color schemes based on name hash
    const colors = [
      { 
        border: 'border-l-4 border-l-blue-400', 
        bg: 'bg-blue-50', 
        name: 'text-blue-800',
        accent: 'bg-blue-100'
      },
      { 
        border: 'border-l-4 border-l-emerald-400', 
        bg: 'bg-emerald-50', 
        name: 'text-emerald-800',
        accent: 'bg-emerald-100'
      },
      { 
        border: 'border-l-4 border-l-orange-400', 
        bg: 'bg-orange-50', 
        name: 'text-orange-800',
        accent: 'bg-orange-100'
      },
      { 
        border: 'border-l-4 border-l-purple-400', 
        bg: 'bg-purple-50', 
        name: 'text-purple-800',
        accent: 'bg-purple-100'
      },
      { 
        border: 'border-l-4 border-l-pink-400', 
        bg: 'bg-pink-50', 
        name: 'text-pink-800',
        accent: 'bg-pink-100'
      },
      { 
        border: 'border-l-4 border-l-indigo-400', 
        bg: 'bg-indigo-50', 
        name: 'text-indigo-800',
        accent: 'bg-indigo-100'
      },
      { 
        border: 'border-l-4 border-l-teal-400', 
        bg: 'bg-teal-50', 
        name: 'text-teal-800',
        accent: 'bg-teal-100'
      },
      { 
        border: 'border-l-4 border-l-cyan-400', 
        bg: 'bg-cyan-50', 
        name: 'text-cyan-800',
        accent: 'bg-cyan-100'
      }
    ];
    
    // Simple hash function to assign consistent colors
    let hash = 0;
    for (let i = 0; i < leadName.length; i++) {
      hash = ((hash << 5) - hash + leadName.charCodeAt(i)) & 0xffffffff;
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const themeColors = getThemeColors(feedSettings.theme);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 h-full relative hover:shadow-md transition-shadow duration-200">
      {/* Settings Gear Icon - positioned absolutely */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="absolute top-4 right-4 p-2 rounded-full transition-colors hover:bg-gray-100"
        title="Outreach Feed Settings"
      >
        <span className="text-lg">⚙️</span>
      </button>

      {/* Outreach Feed Settings Modal */}
      <DashboardCardSettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        title="📡 Outreach Feed Settings"
        cardSettings={feedSettings}
        onSettingsChange={handleSettingsChange}
        themeColors={themeColors}
        cardType="outreach"
      />
      
      <div className={`space-y-${feedSettings.compactView ? '2' : '16'} relative`}>
        {/* Loading overlay when data is refreshing */}
        {dataRefreshing && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <div className="text-sm font-medium text-gray-600">
                {connectionStatus === 'connecting' ? 'Switching data source...' : 'Refreshing feed...'}
              </div>
            </div>
          </div>
        )}
        
        {getFilteredEvents().length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📡</div>
            <div>No outreach events found</div>
            <div className="text-sm">
              {feedSettings.filterByChannel !== 'all' || feedSettings.filterByStatus !== 'all' 
                ? 'Try adjusting your filters in settings' 
                : 'Events will appear here in real-time'}
            </div>
          </div>
        ) : (
          getFilteredEvents().map((ev, i) => {
            const colorScheme = feedSettings.colorCodeByPerson ? getPersonColorScheme(ev.lead_name || 'Unknown') : {
              border: 'border-l-4 border-l-gray-400', 
              bg: 'bg-gray-50', 
              name: 'text-gray-800',
              accent: 'bg-gray-100'
            };
            const isRecent = isRecentEvent(ev.created_at);
            const isNewest = i === 0; // Only the first (newest) event gets the NEW indicator
            return (
              <div 
                key={ev.id || i} 
                className={`border border-gray-100 rounded-md ${feedSettings.compactView ? 'p-2' : 'p-3'} hover:shadow-sm transition-shadow duration-200 ${feedSettings.compactView ? 'mb-2' : 'mb-4'} bg-gray-50 ${isRecent && isNewest ? 'ring-1 ring-blue-400 bg-blue-50' : ''}`}
              >
                <div className={`flex items-center justify-between ${feedSettings.compactView ? 'mb-2' : 'mb-4'}`}>
                  <div className="flex items-center space-x-4 w-full">
                    {feedSettings.showChannelIcons && (
                      <div className={`${feedSettings.compactView ? 'p-1' : 'p-1.5'} rounded-full ${colorScheme.accent} relative flex-shrink-0`}>
                        <span className={feedSettings.compactView ? 'text-sm' : 'text-base'}>{getChannelIcon(ev.channel)}</span>
                      </div>
                    )}
                    <div className={`${feedSettings.compactView ? 'w-24' : 'w-32'} flex-shrink-0`}>
                      <div className={`font-bold ${feedSettings.compactView ? 'text-xs' : 'text-sm'} ${colorScheme.name} flex items-center gap-2`}>
                        {ev.lead_name || 'Unknown Lead'}
                        {feedSettings.showNewIndicator && isRecent && isNewest && (
                          <span className={`text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded-full animate-ping font-medium ${feedSettings.compactView ? 'text-xs' : ''}`}>NEW</span>
                        )}
                      </div>
                    </div>
                    <div className={`${feedSettings.compactView ? 'w-20' : 'w-28'} text-xs text-gray-600 font-medium flex-shrink-0`}>
                      {feedSettings.compactView ? (ev.campaign_name || 'Campaign').substring(0, 15) + '...' : ev.campaign_name || 'Campaign'}
                    </div>
                    {feedSettings.showTimestamps && (
                      <div className={`${feedSettings.compactView ? 'w-12' : 'w-16'} text-xs text-gray-500 font-medium flex-shrink-0`}>
                        {formatTime(ev.created_at)}
                      </div>
                    )}
                  </div>
                  <div className="text-center flex flex-col items-center gap-1 flex-shrink-0">
                    <span className={`px-2 py-1 rounded-full ${feedSettings.compactView ? 'text-xs' : 'text-xs'} font-semibold border flex items-center gap-1 ${getStatusColor(ev.status)}`}>
                      <span>{getStatusIcon(ev.status)}</span>
                      {ev.status}
                    </span>                    
                  </div>
                </div>
                
                {!feedSettings.compactView && (
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className={`px-2 py-1.5 rounded-md ${colorScheme.accent} text-center`}>
                      <div className="text-gray-600 font-medium">Channel</div>
                      <div className="font-bold capitalize text-gray-800">{ev.channel}</div>
                    </div>
                    <div className={`px-2 py-1.5 rounded-md ${colorScheme.accent} text-center`}>
                      <div className="text-gray-600 font-medium">Step</div>
                      <div className="font-bold text-gray-800">{ev.step_index}</div>
                    </div>
                    <div className={`px-2 py-1.5 rounded-md ${colorScheme.accent} text-center`}>
                      <div className="text-gray-600 font-medium">Provider</div>
                      <div className="font-bold text-gray-800 text-xs">{ev.provider_id}</div>
                    </div>
                  </div>
                )}
                
                {feedSettings.showErrors && ev.error && (
                  <div className={`${feedSettings.compactView ? 'mt-1 p-1' : 'mt-2 p-2'} bg-red-50 border border-red-200 rounded-md`}>
                    <span className={`text-red-600 font-semibold ${feedSettings.compactView ? 'text-xs' : 'text-xs'}`}>⚠️ Error:</span>
                    <span className={`ml-2 text-red-700 font-medium ${feedSettings.compactView ? 'text-xs' : 'text-xs'}`}>{ev.error}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
