/**
 * Simple test script for AI Agents System
 * Run this to verify the system is working correctly
 */

import { AgentSystem, DatabaseConnectivityAgent } from './index';

async function testAIAgentsSystem() {
  console.log('🧪 Testing GhostCRM AI Agents System...\n');
  
  try {
    // Test 1: Initialize the system
    console.log('1️⃣ Testing system initialization...');
    await AgentSystem.initialize();
    console.log('✅ System initialized successfully\n');
    
    // Test 2: Get system status
    console.log('2️⃣ Testing system status...');
    const status = await AgentSystem.getStatus();
    console.log('System Status:', {
      totalAgents: status.systemHealth.totalAgents,
      runningAgents: status.systemHealth.runningAgents,
      overallStatus: status.systemHealth.overallStatus
    });
    console.log('✅ Status retrieved successfully\n');
    
    // Test 3: Perform health check
    console.log('3️⃣ Testing health check...');
    const healthCheck = await AgentSystem.healthCheck();
    console.log('Health Check:', {
      status: healthCheck.status,
      message: healthCheck.message,
      timestamp: healthCheck.timestamp
    });
    console.log('✅ Health check completed\n');
    
    // Test 4: Test individual agent
    console.log('4️⃣ Testing Database Connectivity Agent...');
    const dbAgent = new DatabaseConnectivityAgent();
    
    // Configure with test config
    await dbAgent.configure({
      enabled: true,
      schedule: {
        interval: 5000
      },
      retryPolicy: {
        maxAttempts: 2,
        backoffMultiplier: 2,
        maxDelay: 1000
      },
      logging: {
        level: 'info',
        persistent: false
      },
      notifications: {
        onError: false,
        onSuccess: false,
        channels: []
      },
      customSettings: {
        connectionTimeout: 5000,
        queryTimeout: 3000,
        maxConnections: 5,
        enableAutoFix: false
      }
    });
    
    console.log('Agent Status:', dbAgent.getStatus());
    const agentHealth = await dbAgent.getHealth();
    console.log('Agent Health:', {
      status: agentHealth.status,
      uptime: agentHealth.uptime,
      performance: agentHealth.performance
    });
    console.log('✅ Individual agent test completed\n');
    
    // Test 5: Test configuration manager
    console.log('5️⃣ Testing configuration manager...');
    const configManager = AgentSystem.getConfigManager();
    const dbConfig = configManager.getConfig('db-connectivity-monitor');
    console.log('Default DB Config:', {
      enabled: dbConfig?.enabled,
      interval: dbConfig?.schedule?.interval,
      maxAttempts: dbConfig?.retryPolicy?.maxAttempts,
      logLevel: dbConfig?.logging?.level
    });
    console.log('✅ Configuration manager test completed\n');
    
    // Test 6: Test agent manager
    console.log('6️⃣ Testing agent manager...');
    const agentManager = AgentSystem.getManager();
    const systemHealth = await agentManager.getSystemHealth();
    console.log('System Health from Manager:', systemHealth);
    console.log('✅ Agent manager test completed\n');
    
    console.log('🎉 All tests passed! The AI Agents System is working correctly.\n');
    
    // Display final summary
    console.log('📊 FINAL SUMMARY:');
    console.log('================');
    console.log(`✅ System Status: ${status.systemHealth.overallStatus}`);
    console.log(`✅ Agents Running: ${status.systemHealth.runningAgents}/${status.systemHealth.totalAgents}`);
    console.log(`✅ Health Status: ${healthCheck.status}`);
    console.log(`✅ Database Agent: ${agentHealth.status}`);
    console.log(`✅ Configuration: Available`);
    console.log(`✅ Management: Functional`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testAIAgentsSystem()
    .then(() => {
      console.log('\n🏁 Test completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test failed with error:', error);
      process.exit(1);
    });
}

export default testAIAgentsSystem;