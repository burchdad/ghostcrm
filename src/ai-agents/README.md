# GhostCRM AI Agents System

The GhostCRM AI Agents System is an intelligent monitoring and maintenance framework that automatically manages various aspects of the CRM system. These agents work continuously in the background to ensure optimal performance, reliability, and security.

## 🚀 Quick Start

```typescript
import { AgentSystem } from '@/ai-agents';

// Initialize the entire agent system
await AgentSystem.initialize();

// Get system status
const status = await AgentSystem.getStatus();
console.log('Agent System Status:', status);

// Perform health check
const healthCheck = await AgentSystem.healthCheck();
console.log('System Health:', healthCheck);
```

## 🤖 Available Agents

### Database Connectivity Agent
Monitors database connections and automatically resolves connectivity issues.

**Features:**
- Real-time database health monitoring
- Automatic connection recovery
- Connection pool optimization
- Error detection and auto-fixing
- Performance metrics tracking

**Configuration:**
```typescript
{
  checkInterval: 30000, // 30 seconds
  retryAttempts: 3,
  autoRestart: true,
  healthThreshold: 90,
  enableAutoFix: true
}
```

## 📁 System Architecture

```
src/ai-agents/
├── core/                    # Core agent framework
│   ├── types.ts            # TypeScript interfaces
│   ├── BaseAgent.ts        # Abstract base class
│   ├── AgentManager.ts     # Central agent coordinator
│   └── AgentConfigManager.ts # Configuration management
├── database/               # Database monitoring agents
│   └── DatabaseConnectivityAgent.ts
├── monitoring/             # System monitoring agents
├── integrations/          # Third-party integration agents
├── utils/                 # Utility functions
│   └── AgentSystem.ts     # System initialization
└── index.ts              # Main exports
```

## 🔧 Core Components

### BaseAgent
Abstract base class that provides:
- Lifecycle management (start, stop, restart)
- Health monitoring
- Metrics collection
- Error handling and retry logic
- Event system
- Logging capabilities

### AgentManager
Central coordinator that manages:
- Agent registration and lifecycle
- System health aggregation
- Metrics consolidation
- Configuration management
- Graceful shutdown handling

### AgentConfigManager
Configuration system that provides:
- Configuration validation
- Default configuration templates
- Persistent configuration storage
- Dynamic configuration updates
- Configuration backup and restore

## 📊 Health Monitoring

The system provides comprehensive health monitoring:

```typescript
// Get detailed system health
const health = await AgentSystem.getStatus();

// Structure:
{
  systemHealth: {
    overallStatus: 'healthy' | 'warning' | 'critical',
    totalAgents: number,
    runningAgents: number,
    errorAgents: number,
    uptime: number
  },
  systemMetrics: {
    memoryUsage: number,
    cpuUsage: number,
    activeConnections: number,
    totalRequests: number
  },
  agentStatuses: Array<{
    id: string,
    name: string,
    status: 'stopped' | 'starting' | 'running' | 'error',
    health: number,
    uptime: number,
    lastError?: string
  }>
}
```

## 🔄 Lifecycle Management

### Initialization
```typescript
// Initialize with default configuration
await AgentSystem.initialize();

// Initialize with custom configuration
const manager = AgentSystem.getManager();
const dbAgent = new DatabaseConnectivityAgent();
await dbAgent.configure(customConfig);
manager.registerAgent(dbAgent);
await manager.startAll();
```

### Runtime Management
```typescript
// Start all agents
await AgentSystem.getManager().startAll();

// Stop all agents
await AgentSystem.getManager().stopAll();

// Restart specific agent
const agent = AgentSystem.getManager().getAgent('db-connectivity-monitor');
await agent.restart();

// Restart entire system
await AgentSystem.restart();
```

## 📝 Configuration

### Default Configuration
The system comes with sensible defaults for all agents:

```typescript
// Database Connectivity Agent defaults
{
  id: 'db-connectivity-monitor',
  name: 'Database Connectivity Monitor',
  description: 'Monitors database connections and fixes issues automatically',
  enabled: true,
  checkInterval: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  autoRestart: true,
  healthThreshold: 90,
  enableNotifications: true,
  enableAutoFix: true,
  connectionTimeout: 10000,
  queryTimeout: 5000,
  maxConnections: 10
}
```

### Custom Configuration
```typescript
const configManager = AgentSystem.getConfigManager();

// Update agent configuration
await configManager.updateConfig('db-connectivity-monitor', {
  checkInterval: 15000, // Check every 15 seconds
  enableAutoFix: false  // Disable auto-fix
});

// Get agent configuration
const config = configManager.getConfig('db-connectivity-monitor');
```

## 🚨 Error Handling

The system includes comprehensive error handling:

- **Automatic Retry Logic**: Exponential backoff for transient failures
- **Circuit Breaker Pattern**: Prevents cascading failures
- **Graceful Degradation**: System continues operating with reduced functionality
- **Error Notifications**: Configurable notification channels
- **Self-Healing**: Automatic issue resolution where possible

## 📈 Metrics and Monitoring

### Built-in Metrics
- System performance metrics
- Agent health scores
- Database connection statistics
- Error rates and patterns
- Resource utilization

### Custom Metrics
```typescript
// Add custom metrics to any agent
class CustomAgent extends BaseAgent {
  protected async collectMetrics(): Promise<AgentMetrics> {
    return {
      ...await super.collectMetrics(),
      customMetric: await this.getCustomValue(),
      businessKPI: await this.calculateKPI()
    };
  }
}
```

## 🔐 Security Considerations

- All database connections use secure credentials
- Configuration data is encrypted at rest
- Agent communications are logged and audited
- Access controls prevent unauthorized agent operations
- Sensitive information is redacted from logs

## 🛠️ Development

### Creating New Agents

1. Extend the BaseAgent class:
```typescript
import { BaseAgent } from '@/ai-agents/core/BaseAgent';

export class MyCustomAgent extends BaseAgent {
  constructor() {
    super('my-custom-agent', 'My Custom Agent');
  }

  protected async doStart(): Promise<void> {
    // Implementation
  }

  protected async doStop(): Promise<void> {
    // Implementation
  }

  protected async checkHealth(): Promise<AgentHealth> {
    // Implementation
  }
}
```

2. Register with the system:
```typescript
const manager = AgentSystem.getManager();
manager.registerAgent(new MyCustomAgent());
```

### Testing
```typescript
// Unit test individual agents
const agent = new DatabaseConnectivityAgent();
await agent.configure(testConfig);
await agent.start();
expect(agent.getStatus()).toBe('running');

// Integration test the system
await AgentSystem.initialize();
const health = await AgentSystem.healthCheck();
expect(health.status).toBe('healthy');
```

## 📚 API Reference

### AgentSystem
- `initialize()`: Initialize the entire agent system
- `getStatus()`: Get comprehensive system status
- `healthCheck()`: Perform system health check
- `restart()`: Restart the entire system
- `getManager()`: Get the agent manager instance
- `getLogs(agentId?, limit?)`: Get agent logs

### AgentManager
- `registerAgent(agent)`: Register a new agent
- `startAll()`: Start all registered agents
- `stopAll()`: Stop all agents
- `getAgent(id)`: Get specific agent by ID
- `getSystemHealth()`: Get aggregated health status
- `getSystemMetrics()`: Get system-wide metrics

### BaseAgent
- `start()`: Start the agent
- `stop()`: Stop the agent
- `restart()`: Restart the agent
- `getStatus()`: Get current status
- `getHealth()`: Get health information
- `getMetrics()`: Get performance metrics
- `configure(config)`: Update configuration

## 🤝 Contributing

When adding new agents:

1. Follow the established patterns in `BaseAgent`
2. Implement proper error handling and retry logic
3. Add comprehensive health checks
4. Include detailed logging
5. Write unit and integration tests
6. Update this documentation

## 📄 License

This AI Agents system is part of GhostCRM and follows the same licensing terms.