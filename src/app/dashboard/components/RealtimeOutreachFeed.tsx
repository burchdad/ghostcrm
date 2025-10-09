"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

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
      setEvents((prev) => [newEvent, ...prev].slice(0, 3));
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

  return (
    <div className="bg-blue-50 rounded-xl shadow-lg border border-gray-100 border-t-4 border-t-purple-500 p-6 hover:shadow-xl transition-all duration-300 h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-black">          
            Realtime Outreach Events
          </h2>
          
          {/* Connection Status Indicator */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'online' ? 'bg-green-500' :
              connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
              'bg-red-500'
            }`} />
            <span className={`text-xs ${
              connectionStatus === 'online' ? 'text-green-600' :
              connectionStatus === 'connecting' ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {connectionStatus === 'online' ? 'Live' :
               connectionStatus === 'connecting' ? 'Connecting...' :
               'Offline'}
            </span>
            <span className="text-xs text-gray-400">
              {lastUpdate.toLocaleTimeString()}
            </span>
          </div>
        </div>        
      </div>
      
      <div className="space-y-16">
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📡</div>
            <div>No outreach events yet</div>
            <div className="text-sm">Events will appear here in real-time</div>
          </div>
        ) : (
          events.map((ev, i) => {
            const colorScheme = getPersonColorScheme(ev.lead_name || 'Unknown');
            const isRecent = isRecentEvent(ev.created_at);
            const isNewest = i === 0; // Only the first (newest) event gets the NEW indicator
            return (
              <div 
                key={ev.id || i} 
                className={`border border-gray-200 rounded-lg p-3 hover:shadow-lg transition-all duration-300 mb-6 ${colorScheme.border} ${colorScheme.bg} ${isRecent && isNewest ? 'ring-2 ring-red-500' : ''}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 w-full">
                    <div className={`p-1.5 rounded-full ${colorScheme.accent} relative flex-shrink-0`}>
                      <span className="text-base">{getChannelIcon(ev.channel)}</span>
                      
                    </div>
                    <div className="w-32 flex-shrink-0">
                      <div className={`font-bold text-sm ${colorScheme.name} flex items-center gap-2`}>
                        {ev.lead_name || 'Unknown Lead'}
                        {isRecent && isNewest && <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded-full animate-ping font-medium">NEW</span>}
                      </div>
                    </div>
                    <div className="w-28 text-xs text-gray-600 font-medium flex-shrink-0">
                      {ev.campaign_name || 'Campaign'}
                    </div>
                    <div className="w-16 text-xs text-gray-500 font-medium flex-shrink-0">
                      {formatTime(ev.created_at)}
                    </div>
                  </div>
                  <div className="text-center flex flex-col items-center gap-1 flex-shrink-0">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${getStatusColor(ev.status)}`}>
                      <span>{getStatusIcon(ev.status)}</span>
                      {ev.status}
                    </span>                    
                </div>
                </div>
                
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
                
                {ev.error && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                    <span className="text-red-600 font-semibold text-xs">⚠️ Error:</span>
                    <span className="ml-2 text-red-700 font-medium text-xs">{ev.error}</span>
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
