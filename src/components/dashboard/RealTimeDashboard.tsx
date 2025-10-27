// =============================================================================
// REAL-TIME DASHBOARD SYSTEM
// Live metrics, WebSocket connections, and advanced visualizations
// =============================================================================

'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { 
  TrendingUpIcon, 
  TrendingDownIcon, 
  DollarSignIcon,
  UsersIcon,
  ActivityIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

// =============================================================================
// WEBSOCKET REAL-TIME DATA HOOK
// =============================================================================

export const useRealTimeData = (tenantId: string) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [tenantId]);

  const connectWebSocket = () => {
    try {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//${window.location.host}/api/websocket/dashboard?tenant=${tenantId}`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('📡 Dashboard WebSocket connected');
        setIsConnected(true);
        setIsLoading(false);
        
        // Request initial data
        wsRef.current?.send(JSON.stringify({
          type: 'subscribe',
          events: ['metrics', 'activities', 'notifications']
        }));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('WebSocket message parse error:', error);
        }
      };

      wsRef.current.onclose = () => {
        console.log('📡 Dashboard WebSocket disconnected');
        setIsConnected(false);
        
        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 3000);
      };

      wsRef.current.onerror = (error) => {
        console.error('📡 Dashboard WebSocket error:', error);
        setIsConnected(false);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setIsLoading(false);
    }
  };

  const handleWebSocketMessage = (data: WebSocketMessage) => {
    switch (data.type) {
      case 'metrics_update':
        setMetrics(data.payload);
        break;
      case 'activity_update':
        setActivities(prev => [data.payload, ...prev.slice(0, 49)]); // Keep last 50
        break;
      case 'notification':
        setNotifications(prev => [data.payload, ...prev.slice(0, 9)]); // Keep last 10
        break;
      case 'initial_data':
        setMetrics(data.payload.metrics);
        setActivities(data.payload.activities);
        setNotifications(data.payload.notifications);
        break;
    }
  };

  return {
    metrics,
    activities,
    notifications,
    isConnected,
    isLoading
  };
};

// =============================================================================
// MAIN DASHBOARD COMPONENT
// =============================================================================

export const RealTimeDashboard = ({ tenantId }: { tenantId: string }) => {
  const { metrics, activities, notifications, isConnected, isLoading } = useRealTimeData(tenantId);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('24h');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <ConnectionStatus isConnected={isConnected} />
      
      {/* Time Range Selector */}
      <TimeRangeSelector 
        selected={selectedTimeRange} 
        onChange={setSelectedTimeRange} 
      />

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Active Deals"
          value={metrics?.activeDeals || 0}
          change={metrics?.dealGrowth || 0}
          icon={<DollarSignIcon className="w-6 h-6" />}
          color="blue"
          trend={metrics?.dealTrend || []}
        />
        
        <MetricCard
          title="New Leads"
          value={metrics?.newLeads || 0}
          change={metrics?.leadGrowth || 0}
          icon={<UsersIcon className="w-6 h-6" />}
          color="green"
          trend={metrics?.leadTrend || []}
        />
        
        <MetricCard
          title="Revenue"
          value={`$${(metrics?.revenue || 0).toLocaleString()}`}
          change={metrics?.revenueGrowth || 0}
          icon={<TrendingUpIcon className="w-6 h-6" />}
          color="purple"
          trend={metrics?.revenueTrend || []}
        />
        
        <MetricCard
          title="Activities"
          value={metrics?.activitiesCount || 0}
          change={metrics?.activityGrowth || 0}
          icon={<ActivityIcon className="w-6 h-6" />}
          color="orange"
          trend={metrics?.activityTrend || []}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart data={metrics?.salesChart || []} timeRange={selectedTimeRange} />
        <PipelineChart data={metrics?.pipelineChart || []} />
      </div>

      {/* Activity Feed and Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RealTimeActivityFeed activities={activities} />
        </div>
        <div>
          <NotificationPanel notifications={notifications} />
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// METRIC CARD COMPONENT
// =============================================================================

const MetricCard = ({ title, value, change, icon, color, trend }: MetricCardProps) => {
  const isPositive = change >= 0;
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    purple: 'text-purple-600 bg-purple-50',
    orange: 'text-orange-600 bg-orange-50'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-gray-400">Live</span>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="mt-2 flex items-baseline space-x-2">
          <div className="text-3xl font-bold text-gray-900">
            <CountUp value={typeof value === 'number' ? value : 0} />
          </div>
          {typeof value === 'string' && (
            <div className="text-3xl font-bold text-gray-900">{value}</div>
          )}
        </div>
        
        <div className="mt-2 flex items-center space-x-2">
          <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? (
              <TrendingUpIcon className="w-4 h-4" />
            ) : (
              <TrendingDownIcon className="w-4 h-4" />
            )}
            <span className="text-sm font-medium ml-1">
              {Math.abs(change)}%
            </span>
          </div>
          <span className="text-sm text-gray-500">vs last period</span>
        </div>

        {/* Mini trend chart */}
        {trend.length > 0 && (
          <div className="mt-3">
            <MiniTrendChart data={trend} color={color} />
          </div>
        )}
      </div>
    </motion.div>
  );
};

// =============================================================================
// SALES CHART COMPONENT
// =============================================================================

const SalesChart = ({ data, timeRange }: { data: ChartDataPoint[], timeRange: TimeRange }) => {
  const chartData = {
    labels: data.map(d => d.label),
    datasets: [
      {
        label: 'Sales',
        data: data.map(d => d.value),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: 'Projected',
        data: data.map(d => d.projected || 0),
        borderColor: 'rgb(156, 163, 175)',
        backgroundColor: 'rgba(156, 163, 175, 0.05)',
        borderDash: [5, 5],
        tension: 0.4,
        fill: false,
        pointRadius: 0
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Sales Performance - ${timeRange}`,
        font: {
          size: 16,
          weight: 'bold' as const
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(context.parsed.y);
            return `${label}: ${value}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false
        }
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          callback: (value: any) => {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              notation: 'compact'
            }).format(value);
          }
        }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart' as const
    }
  } as const;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

// =============================================================================
// PIPELINE CHART COMPONENT
// =============================================================================

const PipelineChart = ({ data }: { data: PipelineStage[] }) => {
  const chartData = {
    labels: data.map(stage => stage.name),
    datasets: [
      {
        data: data.map(stage => stage.value),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',   // Blue
          'rgba(16, 185, 129, 0.8)',   // Green
          'rgba(245, 158, 11, 0.8)',   // Yellow
          'rgba(239, 68, 68, 0.8)',    // Red
          'rgba(139, 92, 246, 0.8)',   // Purple
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
          'rgb(139, 92, 246)',
        ],
        borderWidth: 2,
        hoverBackgroundColor: [
          'rgba(59, 130, 246, 0.9)',
          'rgba(16, 185, 129, 0.9)',
          'rgba(245, 158, 11, 0.9)',
          'rgba(239, 68, 68, 0.9)',
          'rgba(139, 92, 246, 0.9)',
        ]
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true
        }
      },
      title: {
        display: true,
        text: 'Sales Pipeline',
        font: {
          size: 16,
          weight: 'bold' as const
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        callbacks: {
          label: (context: any) => {
            const value = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(context.parsed);
            return `${context.label}: ${value}`;
          }
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000
    }
  } as const;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="h-80">
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
};

// =============================================================================
// ACTIVITY FEED COMPONENT
// =============================================================================

const RealTimeActivityFeed = ({ activities }: { activities: Activity[] }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-gray-500">Live</span>
          </div>
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        <AnimatePresence>
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="px-6 py-4 border-b border-gray-100 last:border-b-0"
            >
              <ActivityItem activity={activity} />
            </motion.div>
          ))}
        </AnimatePresence>
        
        {activities.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-500">
            No recent activity
          </div>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// UTILITY COMPONENTS
// =============================================================================

const ConnectionStatus = ({ isConnected }: { isConnected: boolean }) => (
  <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
    isConnected ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
  }`}>
    <div className={`w-2 h-2 rounded-full ${
      isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
    }`} />
    <span className="text-sm font-medium">
      {isConnected ? 'Connected to live data' : 'Disconnected - attempting to reconnect...'}
    </span>
  </div>
);

const TimeRangeSelector = ({ selected, onChange }: TimeRangeSelectorProps) => {
  const options: { value: TimeRange; label: string }[] = [
    { value: '1h', label: 'Last Hour' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' }
  ];

  return (
    <div className="flex space-x-2">
      {options.map(option => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            selected === option.value
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

const CountUp = ({ value }: { value: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{count.toLocaleString()}</span>;
};

const MiniTrendChart = ({ data, color }: { data: number[], color: string }) => {
  const width = 80;
  const height = 20;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  const colorMap = {
    blue: '#3B82F6',
    green: '#10B981',
    purple: '#8B5CF6',
    orange: '#F59E0B'
  };

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={colorMap[color]}
        strokeWidth="2"
        className="drop-shadow-sm"
      />
    </svg>
  );
};

const ActivityItem = ({ activity }: { activity: Activity }) => (
  <div className="flex items-start space-x-3">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
      activity.type === 'deal_won' ? 'bg-green-100 text-green-600' :
      activity.type === 'lead_created' ? 'bg-blue-100 text-blue-600' :
      activity.type === 'email_sent' ? 'bg-purple-100 text-purple-600' :
      'bg-gray-100 text-gray-600'
    }`}>
      {activity.type === 'deal_won' && <CheckCircleIcon className="w-4 h-4" />}
      {activity.type === 'lead_created' && <UsersIcon className="w-4 h-4" />}
      {activity.type === 'email_sent' && <ActivityIcon className="w-4 h-4" />}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-gray-900">{activity.description}</p>
      <div className="flex items-center space-x-2 mt-1">
        <span className="text-xs text-gray-500">{activity.user}</span>
        <span className="text-xs text-gray-400">•</span>
        <span className="text-xs text-gray-500">{activity.timestamp}</span>
      </div>
    </div>
  </div>
);

const NotificationPanel = ({ notifications }: { notifications: Notification[] }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200">
    <div className="px-6 py-4 border-b border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
    </div>
    <div className="max-h-96 overflow-y-auto">
      {notifications.map(notification => (
        <div key={notification.id} className="px-6 py-4 border-b border-gray-100 last:border-b-0">
          <div className={`flex items-start space-x-3 ${
            notification.priority === 'high' ? 'text-red-700' : 'text-gray-700'
          }`}>
            {notification.priority === 'high' && <AlertTriangleIcon className="w-5 h-5 text-red-500 mt-0.5" />}
            <div className="flex-1">
              <p className="text-sm">{notification.message}</p>
              <p className="text-xs text-gray-500 mt-1">{notification.timestamp}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

interface DashboardMetrics {
  activeDeals: number;
  dealGrowth: number;
  dealTrend: number[];
  newLeads: number;
  leadGrowth: number;
  leadTrend: number[];
  revenue: number;
  revenueGrowth: number;
  revenueTrend: number[];
  activitiesCount: number;
  activityGrowth: number;
  activityTrend: number[];
  salesChart: ChartDataPoint[];
  pipelineChart: PipelineStage[];
}

interface Activity {
  id: string;
  type: 'deal_won' | 'lead_created' | 'email_sent' | 'call_completed';
  description: string;
  user: string;
  timestamp: string;
}

interface Notification {
  id: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: string;
}

interface WebSocketMessage {
  type: 'metrics_update' | 'activity_update' | 'notification' | 'initial_data';
  payload: any;
}

interface MetricCardProps {
  title: string;
  value: number | string;
  change: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange';
  trend: number[];
}

interface ChartDataPoint {
  label: string;
  value: number;
  projected?: number;
}

interface PipelineStage {
  name: string;
  value: number;
}

type TimeRange = '1h' | '24h' | '7d' | '30d';

interface TimeRangeSelectorProps {
  selected: TimeRange;
  onChange: (range: TimeRange) => void;
}

export default RealTimeDashboard;