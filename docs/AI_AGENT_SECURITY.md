# AI Agent System Security Documentation

## System Agent Protection Overview

The GhostCRM AI agent system implements a multi-layered security architecture to protect core system agents from tenant modification while allowing tenants to monitor their operations and manage custom agents.

## Protected System Agents

The following agents are classified as **system agents** and are protected from tenant modification:

- `leads-agent` - Lead management and qualification
- `deals-agent` - Deal pipeline optimization and forecasting  
- `inventory-agent` - Inventory optimization and pricing intelligence
- `calendar-agent` - Scheduling optimization and appointment intelligence
- `collaboration-agent` - Team collaboration and communication optimization
- `workflow-agent` - Workflow automation and process optimization

## Security Implementation

### 1. Frontend Protection (UI Layer)

**File: `/src/app/(core)/tenant-owner/ai-sales-agent/page.tsx`**

- **Visual Indicators**: System agents are marked with red styling and "Protected" badges
- **Disabled Controls**: Start/Stop/Configure buttons are disabled for system agents
- **Security Warnings**: Clear notifications explain protection levels
- **Bulk Action Prevention**: Bulk operations are blocked to prevent system agent modification

### 2. API Layer Protection

**File: `/src/pages/api/ai/agents.ts`**

- **Agent Classification**: Automatic detection of system vs tenant agents
- **Operation Validation**: All modification attempts are validated against agent type
- **Error Responses**: Clear 403 Forbidden responses for unauthorized operations
- **Security Metadata**: Agents include `isSystemAgent` and `readonly` flags

### 3. Scheduler Layer Protection

**File: `/src/lib/agents/scheduler.ts`**

- **Source Tracking**: Jobs track whether they originated from 'system' or 'tenant'
- **Operation Validation**: Built-in validation prevents tenant operations on system agents
- **Protected Methods**: Core scheduling functions validate agent permissions

### 4. Initialization Security

**File: `/src/lib/agents/initializer.ts`**

- **System-Only Startup**: System agents are initialized automatically without tenant involvement
- **Protected Configuration**: Agent configurations are locked during initialization

## Security Features

### Access Control Matrix

| Operation | System Agents | Custom Tenant Agents |
|-----------|---------------|----------------------|
| View Status | ✅ Read-Only | ✅ Full Access |
| Start/Stop | ❌ Blocked | ✅ Allowed |
| Configure | ❌ Blocked | ✅ Allowed |
| Schedule Jobs | ❌ Blocked | ✅ Allowed |
| View Metrics | ✅ Limited | ✅ Full Access |
| Remove Agent | ❌ Blocked | ✅ Allowed |

### Protection Mechanisms

1. **Multi-Layer Validation**
   - UI prevents unauthorized actions
   - API validates all requests
   - Scheduler enforces permissions

2. **Clear Error Messages**
   - 🔒 indicators show protected status
   - Detailed explanations of restrictions
   - Helpful guidance for allowed operations

3. **Audit Trail**
   - All operations are logged with source tracking
   - Security violations are specifically flagged
   - Protection events are recorded

## Tenant Capabilities

### What Tenants CAN Do

- **Monitor System Agents**
  - View status and health information
  - See limited performance metrics
  - Access page links to see agent outputs

- **Custom Agent Management** (future feature)
  - Create custom sales agents
  - Configure custom agent parameters
  - Start/stop custom agents
  - Schedule custom agent jobs

- **System Health Monitoring**
  - View overall system status
  - Access health check information
  - Monitor job completion rates

### What Tenants CANNOT Do

- **Modify System Agents**
  - Cannot start/stop system agents
  - Cannot change system agent configurations
  - Cannot schedule system agent jobs
  - Cannot remove system agents

- **Access Sensitive Data**
  - Cannot view detailed system agent logs
  - Cannot access internal job details
  - Cannot modify scheduler configuration

## Error Handling

### Security Error Types

1. **403 Forbidden - System Agent Modification**
   ```json
   {
     "success": false,
     "error": "🔒 System agents cannot be controlled by tenants. Agent 'leads-agent' is automatically managed by the system.",
     "data": {
       "agentId": "leads-agent",
       "protectionLevel": "system",
       "action": "stop"
     }
   }
   ```

2. **403 Forbidden - Bulk Operations**
   ```json
   {
     "success": false,
     "error": "🔒 Bulk actions are restricted to prevent modification of protected system agents.",
     "data": {
       "action": "start-all",
       "reason": "Bulk actions could affect system agents"
     }
   }
   ```

3. **403 Forbidden - Configuration Changes**
   ```json
   {
     "success": false,
     "error": "🔒 System agent configuration is protected. Agent 'deals-agent' configuration is automatically managed.",
     "data": {
       "agentId": "deals-agent",
       "protectionLevel": "system",
       "configurable": false
     }
   }
   ```

## Future Enhancements

### Planned Features

1. **Custom Tenant Agents**
   - Allow tenants to create their own agents
   - Sandboxed execution environment
   - Resource usage limits

2. **Role-Based Access Control**
   - Different permission levels for tenant users
   - Admin vs regular user access
   - Fine-grained operation permissions

3. **Enhanced Monitoring**
   - Detailed audit logs
   - Security event alerts
   - Performance monitoring dashboard

### Security Roadmap

1. **Phase 1: System Protection** ✅ Complete
   - Basic system agent protection
   - UI and API security layers
   - Clear error handling

2. **Phase 2: Custom Agents** 🔄 In Progress
   - Tenant agent creation framework
   - Sandboxed execution environment
   - Resource management

3. **Phase 3: Advanced Security** 📋 Planned
   - Role-based access control
   - Enhanced audit logging
   - Security monitoring dashboard

## Testing Security

### Security Test Cases

1. **UI Protection Tests**
   - Verify disabled buttons for system agents
   - Test security warning displays
   - Validate visual protection indicators

2. **API Protection Tests**
   - Test 403 responses for protected operations
   - Verify error message clarity
   - Validate security metadata

3. **Scheduler Protection Tests**
   - Test job scheduling restrictions
   - Verify source tracking
   - Validate operation permissions

### Security Validation

Run the following commands to verify security implementation:

```bash
# Test UI protection
npm run test -- --testNamePattern="security"

# Test API endpoints
curl -X POST /api/ai/agents -d '{"action":"stop","agentId":"leads-agent"}'

# Verify scheduler protection
curl -X POST /api/agents -d '{"action":"schedule","agentId":"deals-agent"}'
```

## Compliance & Governance

### Security Standards

- **Principle of Least Privilege**: Tenants only access what they need
- **Defense in Depth**: Multiple security layers protect system agents
- **Fail Secure**: Operations fail to a secure state when validation fails
- **Transparency**: Clear communication about restrictions and capabilities

### Monitoring & Compliance

- All security violations are logged
- Regular security audits of agent permissions
- Compliance reporting for tenant access patterns
- Continuous monitoring of protection mechanisms

---

**Last Updated**: December 10, 2025
**Security Level**: Enhanced Protection Active
**System Version**: 1.0.0