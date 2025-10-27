/**
 * 🔒 SECURITY TEST RUNNER
 * 
 * Comprehensive security test suite that attempts to break your system
 * and identify vulnerabilities before they reach production.
 * 
 * USAGE:
 * 1. Start your development server: npm run dev
 * 2. Run this test: node tests/security/security-test-runner.js
 * 
 * WARNING: Only run against development environments!
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const COLORS = {
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  MAGENTA: '\x1b[35m',
  CYAN: '\x1b[36m',
  RESET: '\x1b[0m',
  BOLD: '\x1b[1m'
};

console.log(`${COLORS.RED}${COLORS.BOLD}`);
console.log('███████╗███████╗ ██████╗██╗   ██╗██████╗ ██╗████████╗██╗   ██╗');
console.log('██╔════╝██╔════╝██╔════╝██║   ██║██╔══██╗██║╚══██╔══╝╚██╗ ██╔╝');
console.log('███████╗█████╗  ██║     ██║   ██║██████╔╝██║   ██║    ╚████╔╝ ');
console.log('╚════██║██╔══╝  ██║     ██║   ██║██╔══██╗██║   ██║     ╚██╔╝  ');
console.log('███████║███████╗╚██████╗╚██████╔╝██║  ██║██║   ██║      ██║   ');
console.log('╚══════╝╚══════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝   ╚═╝      ╚═╝   ');
console.log('                                                              ');
console.log('████████╗███████╗███████╗████████╗    ███████╗██╗   ██╗██╗████████╗███████╗');
console.log('╚══██╔══╝██╔════╝██╔════╝╚══██╔══╝    ██╔════╝██║   ██║██║╚══██╔══╝██╔════╝');
console.log('   ██║   █████╗  ███████╗   ██║       ███████╗██║   ██║██║   ██║   █████╗  ');
console.log('   ██║   ██╔══╝  ╚════██║   ██║       ╚════██║██║   ██║██║   ██║   ██╔══╝  ');
console.log('   ██║   ███████╗███████║   ██║       ███████║╚██████╔╝██║   ██║   ███████╗');
console.log('   ╚═╝   ╚══════╝╚══════╝   ╚═╝       ╚══════╝ ╚═════╝ ╚═╝   ╚═╝   ╚══════╝');
console.log(`${COLORS.RESET}`);

console.log(`${COLORS.YELLOW}${COLORS.BOLD}🔥 COMPREHENSIVE SECURITY PENETRATION TEST SUITE 🔥${COLORS.RESET}\n`);

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
console.log(`${COLORS.CYAN}Target: ${BASE_URL}${COLORS.RESET}`);
console.log(`${COLORS.CYAN}Timestamp: ${new Date().toISOString()}${COLORS.RESET}\n`);

// Test configuration
const testConfig = {
  maxConcurrency: 50,
  timeoutMs: 30000,
  retries: 3
};

// Results tracking
let overallResults = {
  totalTests: 0,
  passed: 0,
  failed: 0,
  critical: 0,
  warnings: 0,
  vulnerabilities: [],
  recommendations: []
};

function log(message, color = COLORS.RESET) {
  console.log(`${color}${message}${COLORS.RESET}`);
}

// Check if server is running
async function checkServerHealth() {
  log(`${COLORS.BLUE}🏥 Checking server health...${COLORS.RESET}`);
  
  try {
    const response = await fetch(`${BASE_URL}/api/health/auth`);
    if (response.ok) {
      log(`${COLORS.GREEN}✅ Server is running and responding${COLORS.RESET}`);
      return true;
    } else {
      log(`${COLORS.RED}❌ Server returned status: ${response.status}${COLORS.RESET}`);
      return false;
    }
  } catch (error) {
    log(`${COLORS.RED}❌ Cannot connect to server: ${error.message}${COLORS.RESET}`);
    log(`${COLORS.YELLOW}💡 Make sure your dev server is running: npm run dev${COLORS.RESET}`);
    return false;
  }
}

// Run a Node.js test file
async function runTestFile(testFile, testName) {
  return new Promise((resolve) => {
    log(`\n${COLORS.BLUE}${COLORS.BOLD}🔍 Running ${testName}...${COLORS.RESET}`);
    
    const child = spawn('node', [testFile], {
      stdio: 'pipe',
      env: { ...process.env, TEST_BASE_URL: BASE_URL }
    });
    
    let output = '';
    let errorOutput = '';
    
    child.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      process.stdout.write(text);
    });
    
    child.stderr.on('data', (data) => {
      const text = data.toString();
      errorOutput += text;
      process.stderr.write(text);
    });
    
    const timeout = setTimeout(() => {
      child.kill('SIGKILL');
      resolve({
        success: false,
        timeout: true,
        output,
        error: 'Test timed out'
      });
    }, testConfig.timeoutMs);
    
    child.on('close', (code) => {
      clearTimeout(timeout);
      resolve({
        success: code === 0,
        code,
        output,
        error: errorOutput
      });
    });
  });
}

// Parse test results from output
function parseTestResults(output) {
  const results = {
    passed: 0,
    failed: 0,
    critical: 0,
    vulnerabilities: []
  };
  
  // Count passed tests
  const passedMatches = output.match(/✅/g);
  if (passedMatches) results.passed = passedMatches.length;
  
  // Count failed tests
  const failedMatches = output.match(/❌/g);
  if (failedMatches) results.failed = failedMatches.length;
  
  // Count critical issues
  const criticalMatches = output.match(/CRITICAL:/g);
  if (criticalMatches) results.critical = criticalMatches.length;
  
  // Extract vulnerabilities
  const vulnRegex = /CRITICAL: (.+)/g;
  let match;
  while ((match = vulnRegex.exec(output)) !== null) {
    results.vulnerabilities.push(match[1]);
  }
  
  return results;
}

// Main test execution
async function runSecurityTests() {
  const startTime = Date.now();
  
  // Check server health first
  const serverHealthy = await checkServerHealth();
  if (!serverHealthy) {
    log(`${COLORS.RED}${COLORS.BOLD}❌ Cannot proceed with tests - server not accessible${COLORS.RESET}`);
    process.exit(1);
  }
  
  log(`${COLORS.GREEN}${COLORS.BOLD}🚀 Starting comprehensive security test suite...${COLORS.RESET}\n`);
  
  // Define test suite
  const testSuite = [
    {
      name: 'Penetration Tests',
      file: path.join(__dirname, 'penetration-test.js'),
      description: 'Comprehensive penetration testing suite'
    },
    {
      name: 'Targeted Vulnerability Tests',
      file: path.join(__dirname, 'targeted-vulnerabilities.js'),
      description: 'Tests for specific known vulnerability patterns'
    },
    {
      name: 'Concurrency & Race Condition Tests',
      file: path.join(__dirname, 'concurrency-tests.js'),
      description: 'Tests for race conditions and concurrent access issues'
    }
  ];
  
  // Execute each test suite
  for (const test of testSuite) {
    if (!fs.existsSync(test.file)) {
      log(`${COLORS.YELLOW}⚠️  Test file not found: ${test.file}${COLORS.RESET}`);
      continue;
    }
    
    const result = await runTestFile(test.file, test.name);
    const parsedResults = parseTestResults(result.output);
    
    // Update overall results
    overallResults.totalTests++;
    overallResults.passed += parsedResults.passed;
    overallResults.failed += parsedResults.failed;
    overallResults.critical += parsedResults.critical;
    overallResults.vulnerabilities.push(...parsedResults.vulnerabilities);
    
    if (!result.success) {
      log(`${COLORS.RED}❌ ${test.name} failed or timed out${COLORS.RESET}`);
      if (result.timeout) {
        log(`${COLORS.YELLOW}⏱️  Test timed out after ${testConfig.timeoutMs}ms${COLORS.RESET}`);
      }
      if (result.error) {
        log(`${COLORS.RED}Error: ${result.error}${COLORS.RESET}`);
      }
    } else {
      log(`${COLORS.GREEN}✅ ${test.name} completed${COLORS.RESET}`);
    }
    
    log(`${COLORS.CYAN}📊 ${test.name} Results: ${parsedResults.passed} passed, ${parsedResults.failed} failed, ${parsedResults.critical} critical${COLORS.RESET}\n`);
  }
  
  // Generate comprehensive report
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  generateSecurityReport(duration);
}

// Generate comprehensive security report
function generateSecurityReport(duration) {
  log(`${COLORS.BOLD}${COLORS.BLUE}═══════════════════════════════════════════════════════════════════${COLORS.RESET}`);
  log(`${COLORS.BOLD}${COLORS.BLUE}                    🔒 FINAL SECURITY REPORT 🔒                     ${COLORS.RESET}`);
  log(`${COLORS.BOLD}${COLORS.BLUE}═══════════════════════════════════════════════════════════════════${COLORS.RESET}`);
  
  log(`\n${COLORS.CYAN}📋 TEST EXECUTION SUMMARY:${COLORS.RESET}`);
  log(`⏱️  Total Duration: ${duration} seconds`);
  log(`🧪 Test Suites Run: ${overallResults.totalTests}`);
  log(`✅ Total Tests Passed: ${overallResults.passed}`);
  log(`❌ Total Tests Failed: ${overallResults.failed}`);
  log(`🚨 Critical Issues Found: ${overallResults.critical}`);
  
  // Security score calculation
  const totalTestsRun = overallResults.passed + overallResults.failed;
  const successRate = totalTestsRun > 0 ? (overallResults.passed / totalTestsRun * 100).toFixed(1) : 0;
  const securityScore = Math.max(0, 100 - (overallResults.critical * 20) - (overallResults.failed * 2));
  
  log(`\n${COLORS.CYAN}📊 SECURITY METRICS:${COLORS.RESET}`);
  log(`🎯 Test Success Rate: ${successRate}%`);
  log(`🛡️  Security Score: ${securityScore}/100`);
  
  let scoreColor = COLORS.GREEN;
  if (securityScore < 70) scoreColor = COLORS.RED;
  else if (securityScore < 85) scoreColor = COLORS.YELLOW;
  
  log(`${scoreColor}🏆 Security Rating: ${getSecurityRating(securityScore)}${COLORS.RESET}`);
  
  // Critical vulnerabilities
  if (overallResults.vulnerabilities.length > 0) {
    log(`\n${COLORS.RED}${COLORS.BOLD}🚨 CRITICAL VULNERABILITIES DETECTED:${COLORS.RESET}`);
    overallResults.vulnerabilities.forEach((vuln, index) => {
      log(`${COLORS.RED}${index + 1}. ${vuln}${COLORS.RESET}`);
    });
    
    log(`\n${COLORS.RED}${COLORS.BOLD}⚠️  IMMEDIATE ACTION REQUIRED! ⚠️${COLORS.RESET}`);
    log(`${COLORS.RED}These vulnerabilities must be fixed before production deployment!${COLORS.RESET}`);
  }
  
  // Recommendations
  log(`\n${COLORS.CYAN}${COLORS.BOLD}💡 SECURITY RECOMMENDATIONS:${COLORS.RESET}`);
  
  const recommendations = [
    '🔐 Implement comprehensive input validation and sanitization',
    '🚦 Add rate limiting to all API endpoints',
    '🛡️  Implement Web Application Firewall (WAF)',
    '📊 Add comprehensive security monitoring and alerting',
    '🔒 Use secure session management and JWT handling',
    '🗄️  Implement proper database security and access controls',
    '🌐 Add CORS and CSP headers',
    '📝 Implement comprehensive audit logging',
    '🔄 Regular security audits and penetration testing',
    '🚀 Use HTTPS everywhere and secure deployment practices'
  ];
  
  recommendations.forEach(rec => log(`${COLORS.CYAN}${rec}${COLORS.RESET}`));
  
  // Next steps
  log(`\n${COLORS.BLUE}${COLORS.BOLD}📋 NEXT STEPS:${COLORS.RESET}`);
  
  if (overallResults.critical > 0) {
    log(`${COLORS.RED}1. 🚨 FIX CRITICAL VULNERABILITIES IMMEDIATELY${COLORS.RESET}`);
    log(`${COLORS.YELLOW}2. 🔍 Re-run security tests after fixes${COLORS.RESET}`);
    log(`${COLORS.YELLOW}3. 📋 Implement additional security measures${COLORS.RESET}`);
    log(`${COLORS.YELLOW}4. 🔄 Schedule regular security testing${COLORS.RESET}`);
  } else {
    log(`${COLORS.GREEN}1. ✅ No critical vulnerabilities found!${COLORS.RESET}`);
    log(`${COLORS.CYAN}2. 🔍 Review and address any failed tests${COLORS.RESET}`);
    log(`${COLORS.CYAN}3. 📋 Implement recommended security measures${COLORS.RESET}`);
    log(`${COLORS.CYAN}4. 🔄 Schedule regular security testing${COLORS.RESET}`);
  }
  
  // Production readiness
  log(`\n${COLORS.BOLD}${COLORS.BLUE}🚀 PRODUCTION READINESS ASSESSMENT:${COLORS.RESET}`);
  
  if (overallResults.critical === 0 && securityScore >= 85) {
    log(`${COLORS.GREEN}${COLORS.BOLD}✅ READY FOR PRODUCTION${COLORS.RESET}`);
    log(`${COLORS.GREEN}Your application has passed security testing with minimal issues.${COLORS.RESET}`);
  } else if (overallResults.critical === 0 && securityScore >= 70) {
    log(`${COLORS.YELLOW}${COLORS.BOLD}⚠️  READY WITH CAUTION${COLORS.RESET}`);
    log(`${COLORS.YELLOW}Address remaining issues before production deployment.${COLORS.RESET}`);
  } else {
    log(`${COLORS.RED}${COLORS.BOLD}❌ NOT READY FOR PRODUCTION${COLORS.RESET}`);
    log(`${COLORS.RED}Critical security issues must be resolved before deployment.${COLORS.RESET}`);
  }
  
  log(`\n${COLORS.BOLD}${COLORS.BLUE}═══════════════════════════════════════════════════════════════════${COLORS.RESET}`);
  log(`${COLORS.BOLD}${COLORS.BLUE}                     🔒 END OF SECURITY REPORT 🔒                    ${COLORS.RESET}`);
  log(`${COLORS.BOLD}${COLORS.BLUE}═══════════════════════════════════════════════════════════════════${COLORS.RESET}\n`);
  
  // Save detailed report to file
  saveReportToFile(duration, securityScore);
}

function getSecurityRating(score) {
  if (score >= 95) return 'EXCELLENT';
  if (score >= 85) return 'GOOD';
  if (score >= 70) return 'FAIR';
  if (score >= 50) return 'POOR';
  return 'CRITICAL';
}

function saveReportToFile(duration, securityScore) {
  const report = {
    timestamp: new Date().toISOString(),
    target: BASE_URL,
    duration,
    securityScore,
    summary: {
      totalTests: overallResults.totalTests,
      passed: overallResults.passed,
      failed: overallResults.failed,
      critical: overallResults.critical
    },
    vulnerabilities: overallResults.vulnerabilities,
    rating: getSecurityRating(securityScore)
  };
  
  const reportDir = path.join(__dirname, '../../test-results');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const reportFile = path.join(reportDir, `security-report-${Date.now()}.json`);
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  
  log(`${COLORS.CYAN}📄 Detailed report saved to: ${reportFile}${COLORS.RESET}`);
}

// Handle process signals
process.on('SIGINT', () => {
  log(`\n${COLORS.YELLOW}🛑 Security tests interrupted by user${COLORS.RESET}`);
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  log(`${COLORS.RED}💥 Uncaught exception: ${error.message}${COLORS.RESET}`);
  process.exit(1);
});

// Main execution
if (require.main === module) {
  runSecurityTests().catch(error => {
    log(`${COLORS.RED}💥 Fatal error: ${error.message}${COLORS.RESET}`);
    process.exit(1);
  });
}

module.exports = {
  runSecurityTests,
  checkServerHealth
};