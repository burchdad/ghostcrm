// =============================================================================
// WEBSOCKET API ENDPOINT FOR REAL-TIME DASHBOARD
// Handles live metrics, activities, and notifications
// =============================================================================

import { NextRequest } from 'next/server';
import { cacheManager } from '@/lib/cache/redis-manager';

// WebSocket types
interface WSConnection {
  readyState: number;
  send(data: string): void;
  close(code?: number, reason?: string): void;
  ping(): void;
  on(event: string, handler: Function): void;
}

interface WSServer {
  on(event: string, handler: Function): void;
}

// Database interface (implement when database is available)
interface DatabaseManager {
  getInstance(): {
    query(text: string, params: any[]): Promise<any[]>;
    batchQuery(queries: Array<{ text: string, params: any[] }>): Promise<any[][]>;
  };
}

// Declare DatabaseManager as potentially undefined
declare const DatabaseManager: DatabaseManager | undefined;

// Store active WebSocket connections
const dashboardConnections = new Map<string, Set<WSConnection>>();
const userConnections = new Map<WSConnection, { tenantId: string; userId: string }>();

// =============================================================================
// WEBSOCKET SERVER SETUP
// =============================================================================

let wss: WSServer | null = null;

function initializeWebSocketServer(server: any) {
  if (wss) return wss;

  // Note: In production, use actual WebSocket server implementation
  // This is a placeholder for the WebSocket server initialization
  console.log('📡 WebSocket server would be initialized for dashboard');
  return null;
}

// =============================================================================
// CONNECTION HANDLING
// =============================================================================

async function handleWebSocketConnection(ws: WSConnection, request: any) {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const tenantId = url.searchParams.get('tenant');
  const userId = url.searchParams.get('user');

  if (!tenantId) {
    ws.close(1008, 'Missing tenant ID');
    return;
  }

  console.log(`📡 Dashboard WebSocket connected for tenant: ${tenantId}`);

  // Store connection
  if (!dashboardConnections.has(tenantId)) {
    dashboardConnections.set(tenantId, new Set());
  }
  dashboardConnections.get(tenantId)!.add(ws);
  userConnections.set(ws, { tenantId, userId: userId || 'anonymous' });

  // Send initial data
  await sendInitialDashboardData(ws, tenantId);

  // Handle messages
  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());
      await handleWebSocketMessage(ws, message, tenantId);
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });

  // Handle disconnection
  ws.on('close', () => {
    console.log(`📡 Dashboard WebSocket disconnected for tenant: ${tenantId}`);
    dashboardConnections.get(tenantId)?.delete(ws);
    userConnections.delete(ws);
    
    // Clean up empty tenant sets
    if (dashboardConnections.get(tenantId)?.size === 0) {
      dashboardConnections.delete(tenantId);
    }
  });

  // Handle errors
  ws.on('error', (error) => {
    console.error('Dashboard WebSocket error:', error);
  });

  // Set up heartbeat
  setupHeartbeat(ws);
}

// =============================================================================
// MESSAGE HANDLING
// =============================================================================

async function handleWebSocketMessage(ws: WSConnection, message: any, tenantId: string) {
  switch (message.type) {
    case 'subscribe':
      // Client is subscribing to specific events
      console.log(`📡 Client subscribed to events:`, message.events);
      break;
      
    case 'request_metrics':
      await sendMetricsUpdate(ws, tenantId);
      break;
      
    case 'request_activities':
      await sendActivitiesUpdate(ws, tenantId);
      break;
      
    case 'ping':
      ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
      break;
      
    default:
      console.log('Unknown WebSocket message type:', message.type);
  }
}

// =============================================================================
// DATA BROADCASTING
// =============================================================================

async function sendInitialDashboardData(ws: WSConnection, tenantId: string) {
  try {
    const [metrics, activities, notifications] = await Promise.all([
      getDashboardMetrics(tenantId),
      getRecentActivities(tenantId),
      getNotifications(tenantId)
    ]);

    ws.send(JSON.stringify({
      type: 'initial_data',
      payload: {
        metrics,
        activities,
        notifications
      }
    }));
  } catch (error) {
    console.error('Error sending initial dashboard data:', error);
  }
}

async function broadcastMetricsUpdate(tenantId: string) {
  const connections = dashboardConnections.get(tenantId);
  if (!connections || connections.size === 0) return;

  try {
    const metrics = await getDashboardMetrics(tenantId);
    
    const message = JSON.stringify({
      type: 'metrics_update',
      payload: metrics
    });

    connections.forEach(ws => {
      if (ws.readyState === 1) { // WebSocket.OPEN
        ws.send(message);
      }
    });
  } catch (error) {
    console.error('Error broadcasting metrics update:', error);
  }
}

async function broadcastActivityUpdate(tenantId: string, activity: any) {
  const connections = dashboardConnections.get(tenantId);
  if (!connections || connections.size === 0) return;

  const message = JSON.stringify({
    type: 'activity_update',
    payload: activity
  });

  connections.forEach(ws => {
    if (ws.readyState === 1) { // WebSocket.OPEN
      ws.send(message);
    }
  });
}

async function broadcastNotification(tenantId: string, notification: any) {
  const connections = dashboardConnections.get(tenantId);
  if (!connections || connections.size === 0) return;

  const message = JSON.stringify({
    type: 'notification',
    payload: notification
  });

  connections.forEach(ws => {
    if (ws.readyState === 1) { // WebSocket.OPEN
      ws.send(message);
    }
  });
}

// =============================================================================
// DATA FETCHING FUNCTIONS
// =============================================================================

async function getDashboardMetrics(tenantId: string) {
  // Try cache first
  const cached = await cacheManager.getDashboardMetrics(tenantId);
  if (cached) {
    return cached;
  }

  try {
    // Check if database manager is available
    if (typeof DatabaseManager === 'undefined') {
      console.warn('DatabaseManager not available, returning default metrics');
      return getDefaultMetrics();
    }

    const db = DatabaseManager.getInstance();
    
    // Fetch current metrics
    const [leadsResult, dealsResult, activitiesResult] = await db.batchQuery([
      {
        text: `
          SELECT 
            COUNT(*) as total_leads,
            COUNT(CASE WHEN status = 'new' THEN 1 END) as new_leads,
            COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as leads_24h,
            COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as leads_7d
          FROM leads 
          WHERE tenant_id = $1
        `,
        params: [tenantId]
      },
      {
        text: `
          SELECT 
            COUNT(*) as total_deals,
            COUNT(CASE WHEN stage NOT IN ('closed_won', 'closed_lost') THEN 1 END) as active_deals,
            SUM(CASE WHEN stage = 'closed_won' THEN amount ELSE 0 END) as revenue,
            SUM(CASE WHEN stage NOT IN ('closed_won', 'closed_lost') THEN amount ELSE 0 END) as pipeline_value
          FROM deals 
          WHERE tenant_id = $1
        `,
        params: [tenantId]
      },
      {
        text: `
          SELECT 
            COUNT(*) as total_activities,
            COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as activities_24h
          FROM activities 
          WHERE tenant_id = $1
        `,
        params: [tenantId]
      }
    ]);

    // Calculate metrics from database results
    const metrics = {
      activeDeals: parseInt(dealsResult[0]?.active_deals || '0'),
      dealGrowth: 0, // Calculate from historical data when available
      dealTrend: [], // Populate from historical data
      
      newLeads: parseInt(leadsResult[0]?.leads_24h || '0'),
      leadGrowth: 0,
      leadTrend: [],
      
      revenue: parseFloat(dealsResult[0]?.revenue || '0'),
      revenueGrowth: 0,
      revenueTrend: [],
      
      activitiesCount: parseInt(activitiesResult[0]?.activities_24h || '0'),
      activityGrowth: 0,
      activityTrend: [],
      
      salesChart: await getSalesChartData(tenantId),
      pipelineChart: await getPipelineChartData(tenantId)
    };

    // Cache for 5 minutes
    await cacheManager.setTenantData(tenantId, 'dashboard_metrics', metrics, 300);
    
    return metrics;
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    return getDefaultMetrics();
  }
}

async function getSalesChartData(tenantId: string) {
  try {
    if (typeof DatabaseManager === 'undefined') {
      return [];
    }

    const db = DatabaseManager.getInstance();
    
    const result = await db.query(`
      SELECT 
        DATE_TRUNC('day', created_at) as date,
        SUM(amount) as daily_sales
      FROM deals 
      WHERE tenant_id = $1 
        AND stage = 'closed_won'
        AND created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY date
    `, [tenantId]);

    return result.map(row => ({
      label: new Date(row.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: parseFloat(row.daily_sales),
      projected: parseFloat(row.daily_sales) * 1.1 // 10% projection
    }));
  } catch (error) {
    console.error('Error fetching sales chart data:', error);
    return [];
  }
}

async function getPipelineChartData(tenantId: string) {
  try {
    if (typeof DatabaseManager === 'undefined') {
      return [];
    }

    const db = DatabaseManager.getInstance();
    
    const result = await db.query(`
      SELECT 
        stage,
        SUM(amount) as stage_value
      FROM deals 
      WHERE tenant_id = $1 
        AND stage NOT IN ('closed_won', 'closed_lost')
      GROUP BY stage
      ORDER BY stage_value DESC
    `, [tenantId]);

    return result.map(row => ({
      name: row.stage.replace('_', ' ').toUpperCase(),
      value: parseFloat(row.stage_value)
    }));
  } catch (error) {
    console.error('Error fetching pipeline chart data:', error);
    return [];
  }
}

async function getRecentActivities(tenantId: string, limit: number = 20) {
  try {
    if (typeof DatabaseManager === 'undefined') {
      return [];
    }

    const db = DatabaseManager.getInstance();
    
    const result = await db.query(`
      SELECT 
        a.id,
        a.activity_type as type,
        a.description,
        u.first_name || ' ' || u.last_name as user,
        a.created_at
      FROM activities a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.tenant_id = $1
      ORDER BY a.created_at DESC
      LIMIT $2
    `, [tenantId, limit]);

    return result.map(row => ({
      id: row.id,
      type: row.type,
      description: row.description,
      user: row.user || 'Unknown User',
      timestamp: new Date(row.created_at).toLocaleString()
    }));
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return [];
  }
}

async function getNotifications(tenantId: string, limit: number = 10) {
  // In production, fetch from notifications table
  // For now, return empty array since we removed mock data
  return [];
}

function getDefaultMetrics() {
  return {
    activeDeals: 0,
    dealGrowth: 0,
    dealTrend: [],
    newLeads: 0,
    leadGrowth: 0,
    leadTrend: [],
    revenue: 0,
    revenueGrowth: 0,
    revenueTrend: [],
    activitiesCount: 0,
    activityGrowth: 0,
    activityTrend: [],
    salesChart: [],
    pipelineChart: []
  };
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

async function sendMetricsUpdate(ws: WSConnection, tenantId: string) {
  try {
    const metrics = await getDashboardMetrics(tenantId);
    ws.send(JSON.stringify({
      type: 'metrics_update',
      payload: metrics
    }));
  } catch (error) {
    console.error('Error sending metrics update:', error);
  }
}

async function sendActivitiesUpdate(ws: WSConnection, tenantId: string) {
  try {
    const activities = await getRecentActivities(tenantId);
    ws.send(JSON.stringify({
      type: 'activities_update',
      payload: activities
    }));
  } catch (error) {
    console.error('Error sending activities update:', error);
  }
}

function setupHeartbeat(ws: WSConnection) {
  const interval = setInterval(() => {
    if (ws.readyState === 1) { // WebSocket.OPEN
      ws.ping();
    } else {
      clearInterval(interval);
    }
  }, 30000); // 30 seconds

  ws.on('pong', () => {
    // Connection is alive
  });

  ws.on('close', () => {
    clearInterval(interval);
  });
}

// =============================================================================
// PERIODIC DATA UPDATES
// =============================================================================

// Update all dashboard metrics every 30 seconds
setInterval(async () => {
  for (const tenantId of dashboardConnections.keys()) {
    await broadcastMetricsUpdate(tenantId);
  }
}, 30000);

// =============================================================================
// NEXT.JS API ROUTE HANDLERS
// =============================================================================

export async function GET(request: NextRequest) {
  // For WebSocket upgrade requests, we need to handle them differently in production
  // In development, we'll simulate WebSocket connections
  
  const url = new URL(request.url);
  const tenantId = url.searchParams.get('tenant');
  
  if (!tenantId) {
    return Response.json({ error: 'Missing tenant ID' }, { status: 400 });
  }

  // In a real implementation, you would handle WebSocket upgrade here
  // For now, return connection info
  return Response.json({
    message: 'WebSocket endpoint ready',
    tenant: tenantId,
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: NextRequest) {
  // Handle WebSocket-like messages via HTTP POST for testing
  try {
    const body = await request.json();
    const tenantId = body.tenantId;
    const messageType = body.type;

    if (!tenantId) {
      return Response.json({ error: 'Missing tenant ID' }, { status: 400 });
    }

    let responseData;
    
    switch (messageType) {
      case 'get_metrics':
        responseData = await getDashboardMetrics(tenantId);
        break;
      case 'get_activities':
        responseData = await getRecentActivities(tenantId);
        break;
      case 'get_notifications':
        responseData = await getNotifications(tenantId);
        break;
      default:
        return Response.json({ error: 'Unknown message type' }, { status: 400 });
    }

    return Response.json({
      type: messageType,
      payload: responseData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('API error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}