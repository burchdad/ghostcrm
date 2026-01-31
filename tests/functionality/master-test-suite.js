/**
 * MASTER FUNCTIONALITY TEST SUITE
 * Comprehensive testing of every button, form, and interactive element
 */

const { UIComponentTester } = require('./ui-component-tests');
const { PageFunctionalityTester } = require('./page-functionality-tests');
const { APIEndpointTester } = require('./api-endpoint-tests');
const { AuthenticationTester } = require('./authentication-tests');
const { DatabaseIntegrationTester } = require('./database-integration-tests');
const { CrossPlatformAccessibilityTester } = require('./cross-platform-accessibility-tests');
const fs = require('fs').promises;
const path = require('path');

class MasterFunctionalityTestSuite {
  constructor() {
    this.baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';
    this.testResults = {
      startTime: null,
      endTime: null,
      totalDuration: 0,
      overallSummary: {
        total: 0,
        passed: 0,
        failed: 0,
        passRate: 0
      },
      testSuites: {},
      criticalFailures: [],
      recommendations: []
    };

    this.testSuites = [
      {
        name: 'UI Components',
        tester: UIComponentTester,
        priority: 'critical',
        description: 'Tests all UI components, buttons, forms, modals, and interactive elements'
      },
      {
        name: 'Page Functionality',
        tester: PageFunctionalityTester,
        priority: 'critical',
        description: 'Tests all application pages, routes, navigation, and content loading'
      },
      {
        name: 'API Endpoints',
        tester: APIEndpointTester,
        priority: 'critical',
        description: 'Tests all API endpoints, authentication, CRUD operations, and security'
      },
      {
        name: 'Authentication & Authorization',
        tester: AuthenticationTester,
        priority: 'critical',
        description: 'Tests authentication flows, user roles, sessions, and security boundaries'
      },
      {
        name: 'Database Integration',
        tester: DatabaseIntegrationTester,
        priority: 'high',
        description: 'Tests database operations, data validation, relationships, and transactions'
      },
      {
        name: 'Cross-Platform & Accessibility',
        tester: CrossPlatformAccessibilityTester,
        priority: 'medium',
        description: 'Tests responsive design, browser compatibility, mobile, and accessibility'
      }
    ];
  }

  async runCompleteTestSuite() {
    console.log('🚀 STARTING MASTER FUNCTIONALITY TEST SUITE');
    console.log('=' .repeat(80));
    console.log('🎯 OBJECTIVE: Test every button, form, and interactive element');
    console.log('📊 SCOPE: Complete application functionality validation');
    console.log('⏰ ESTIMATED TIME: 15-30 minutes');
    console.log('=' .repeat(80));

    this.testResults.startTime = new Date();

    // Run test suites in order of priority
    const criticalSuites = this.testSuites.filter(s => s.priority === 'critical');
    const highSuites = this.testSuites.filter(s => s.priority === 'high');
    const mediumSuites = this.testSuites.filter(s => s.priority === 'medium');

    console.log('\n🔴 RUNNING CRITICAL TESTS...');
    for (const suite of criticalSuites) {
      await this.runTestSuite(suite);
    }

    console.log('\n🟡 RUNNING HIGH PRIORITY TESTS...');
    for (const suite of highSuites) {
      await this.runTestSuite(suite);
    }

    console.log('\n🟢 RUNNING MEDIUM PRIORITY TESTS...');
    for (const suite of mediumSuites) {
      await this.runTestSuite(suite);
    }

    this.testResults.endTime = new Date();
    this.testResults.totalDuration = this.testResults.endTime - this.testResults.startTime;

    await this.generateComprehensiveReport();
    await this.generateRecommendations();

    console.log('\n🎉 MASTER FUNCTIONALITY TEST SUITE COMPLETED');
    console.log(`⏱️  Total Duration: ${(this.testResults.totalDuration / 1000 / 60).toFixed(2)} minutes`);
  }

  async runTestSuite(suite) {
    console.log(`\n📋 Running ${suite.name} Tests...`);
    console.log(`   ${suite.description}`);
    
    const startTime = Date.now();
    let testerInstance;
    let results;

    try {
      testerInstance = new suite.tester();
      await testerInstance.initialize();

      // Run the appropriate test method based on the tester type
      if (suite.tester === UIComponentTester) {
        await testerInstance.runAllComponentTests();
      } else if (suite.tester === PageFunctionalityTester) {
        await testerInstance.runAllPageTests();
      } else if (suite.tester === APIEndpointTester) {
        await testerInstance.runAllEndpointTests();
      } else if (suite.tester === AuthenticationTester) {
        await testerInstance.runAllAuthTests();
      } else if (suite.tester === DatabaseIntegrationTester) {
        await testerInstance.runAllDatabaseTests();
      } else if (suite.tester === CrossPlatformAccessibilityTester) {
        await testerInstance.runAllCrossPlatformTests();
      }

      results = testerInstance.generateReport();

      this.testResults.testSuites[suite.name] = {
        ...results,
        duration: Date.now() - startTime,
        priority: suite.priority,
        status: results.summary.passRate >= 80 ? 'PASS' : 'FAIL'
      };

      // Update overall summary
      this.testResults.overallSummary.total += results.summary.total;
      this.testResults.overallSummary.passed += results.summary.passed;
      this.testResults.overallSummary.failed += results.summary.failed;

      // Track critical failures
      if (suite.priority === 'critical' && results.summary.passRate < 80) {
        this.testResults.criticalFailures.push({
          suite: suite.name,
          passRate: results.summary.passRate,
          errors: results.errors
        });
      }

      console.log(`   ✅ ${suite.name} completed: ${results.summary.passed}/${results.summary.total} (${results.summary.passRate}%)`);

    } catch (error) {
      console.log(`   ❌ ${suite.name} failed: ${error.message}`);
      
      this.testResults.testSuites[suite.name] = {
        summary: { total: 0, passed: 0, failed: 1, passRate: 0 },
        duration: Date.now() - startTime,
        priority: suite.priority,
        status: 'ERROR',
        error: error.message
      };

      this.testResults.overallSummary.total += 1;
      this.testResults.overallSummary.failed += 1;

      if (suite.priority === 'critical') {
        this.testResults.criticalFailures.push({
          suite: suite.name,
          passRate: 0,
          errors: [error.message]
        });
      }
    } finally {
      if (testerInstance && testerInstance.cleanup) {
        try {
          await testerInstance.cleanup();
        } catch (cleanupError) {
          console.log(`   ⚠️  Cleanup warning for ${suite.name}: ${cleanupError.message}`);
        }
      }
    }
  }

  async generateComprehensiveReport() {
    this.testResults.overallSummary.passRate = this.testResults.overallSummary.total > 0 ? 
      ((this.testResults.overallSummary.passed / this.testResults.overallSummary.total) * 100).toFixed(2) : 0;

    console.log('\n' + '='.repeat(100));
    console.log('📊 COMPREHENSIVE FUNCTIONALITY TEST REPORT');
    console.log('='.repeat(100));
    console.log(`🕐 Start Time: ${this.testResults.startTime.toLocaleString()}`);
    console.log(`🕐 End Time: ${this.testResults.endTime.toLocaleString()}`);
    console.log(`⏱️  Total Duration: ${(this.testResults.totalDuration / 1000 / 60).toFixed(2)} minutes`);
    console.log(`\n🎯 OVERALL RESULTS:`);
    console.log(`   Total Tests: ${this.testResults.overallSummary.total}`);
    console.log(`   Passed: ${this.testResults.overallSummary.passed} (${this.testResults.overallSummary.passRate}%)`);
    console.log(`   Failed: ${this.testResults.overallSummary.failed}`);

    // Overall status
    const overallStatus = this.testResults.overallSummary.passRate >= 90 ? '🟢 EXCELLENT' :
                         this.testResults.overallSummary.passRate >= 80 ? '🟡 GOOD' :
                         this.testResults.overallSummary.passRate >= 70 ? '🟠 NEEDS IMPROVEMENT' : '🔴 CRITICAL ISSUES';
    
    console.log(`\n🚦 OVERALL STATUS: ${overallStatus}`);

    console.log('\n📋 TEST SUITE BREAKDOWN:');
    for (const [suiteName, results] of Object.entries(this.testResults.testSuites)) {
      const statusIcon = results.status === 'PASS' ? '✅' : results.status === 'FAIL' ? '❌' : '⚠️';
      const priorityIcon = results.priority === 'critical' ? '🔴' : results.priority === 'high' ? '🟡' : '🟢';
      const duration = (results.duration / 1000).toFixed(1);
      
      console.log(`   ${statusIcon} ${priorityIcon} ${suiteName}:`);
      console.log(`      Results: ${results.summary?.passed || 0}/${results.summary?.total || 0} (${results.summary?.passRate || 0}%)`);
      console.log(`      Duration: ${duration}s`);
      console.log(`      Priority: ${results.priority}`);
    }

    // Critical failures
    if (this.testResults.criticalFailures.length > 0) {
      console.log('\n🚨 CRITICAL FAILURES:');
      this.testResults.criticalFailures.forEach(failure => {
        console.log(`   • ${failure.suite}: ${failure.passRate}% pass rate`);
        if (failure.errors && failure.errors.length > 0) {
          failure.errors.slice(0, 3).forEach(error => {
            console.log(`     - ${error}`);
          });
          if (failure.errors.length > 3) {
            console.log(`     ... and ${failure.errors.length - 3} more errors`);
          }
        }
      });
    }

    // Save detailed report to file
    await this.saveDetailedReport();
  }

  async generateRecommendations() {
    console.log('\n💡 RECOMMENDATIONS:');

    const passRate = parseFloat(this.testResults.overallSummary.passRate);

    if (passRate >= 95) {
      this.testResults.recommendations.push(
        '🎉 Excellent! Your application has outstanding functionality coverage.',
        '🔄 Consider setting up automated testing to maintain this quality.',
        '📈 Focus on performance optimization and user experience enhancements.'
      );
    } else if (passRate >= 85) {
      this.testResults.recommendations.push(
        '👍 Good functionality coverage with minor issues to address.',
        '🔍 Review failed tests and implement fixes for edge cases.',
        '🧪 Consider adding more comprehensive error handling tests.'
      );
    } else if (passRate >= 70) {
      this.testResults.recommendations.push(
        '⚠️ Moderate functionality issues detected.',
        '🛠️ Priority should be fixing critical component and API failures.',
        '🔐 Review authentication and security test failures immediately.',
        '📱 Address responsive design and accessibility issues.'
      );
    } else {
      this.testResults.recommendations.push(
        '🚨 Significant functionality issues require immediate attention.',
        '🔴 Focus on critical failures first - UI components and authentication.',
        '🏗️ Consider code review and refactoring for failed components.',
        '🧹 Implement proper error handling and validation.',
        '📋 Create a remediation plan with priorities and timelines.'
      );
    }

    // Test-specific recommendations
    for (const [suiteName, results] of Object.entries(this.testResults.testSuites)) {
      if (results.summary?.passRate < 80) {
        if (suiteName === 'UI Components') {
          this.testResults.recommendations.push('🔧 Fix UI component interactions and form validations');
        } else if (suiteName === 'Authentication & Authorization') {
          this.testResults.recommendations.push('🔐 Address authentication security vulnerabilities immediately');
        } else if (suiteName === 'API Endpoints') {
          this.testResults.recommendations.push('🌐 Review API error handling and validation logic');
        } else if (suiteName === 'Database Integration') {
          this.testResults.recommendations.push('🗄️ Fix database constraints and transaction handling');
        } else if (suiteName === 'Cross-Platform & Accessibility') {
          this.testResults.recommendations.push('♿ Improve responsive design and accessibility compliance');
        }
      }
    }

    this.testResults.recommendations.forEach(rec => console.log(`   ${rec}`));
  }

  async saveDetailedReport() {
    const reportDir = path.join(__dirname, '..', 'reports');
    
    try {
      // Ensure reports directory exists
      await fs.mkdir(reportDir, { recursive: true });
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const reportPath = path.join(reportDir, `functionality-test-report-${timestamp}.json`);
      
      const detailedReport = {
        metadata: {
          timestamp: this.testResults.endTime.toISOString(),
          duration: this.testResults.totalDuration,
          baseUrl: this.baseUrl,
          testSuitesRun: Object.keys(this.testResults.testSuites).length
        },
        summary: this.testResults.overallSummary,
        testSuites: this.testResults.testSuites,
        criticalFailures: this.testResults.criticalFailures,
        recommendations: this.testResults.recommendations
      };

      await fs.writeFile(reportPath, JSON.stringify(detailedReport, null, 2));
      console.log(`\n📄 Detailed report saved: ${reportPath}`);

      // Also save a human-readable summary
      const summaryPath = path.join(reportDir, `functionality-test-summary-${timestamp}.txt`);
      const summaryContent = this.generateTextSummary();
      await fs.writeFile(summaryPath, summaryContent);
      console.log(`📄 Summary report saved: ${summaryPath}`);

    } catch (error) {
      console.log(`⚠️  Failed to save report: ${error.message}`);
    }
  }

  generateTextSummary() {
    const lines = [];
    lines.push('FUNCTIONALITY TEST SUITE SUMMARY');
    lines.push('='.repeat(50));
    lines.push(`Execution Time: ${this.testResults.startTime.toLocaleString()}`);
    lines.push(`Duration: ${(this.testResults.totalDuration / 1000 / 60).toFixed(2)} minutes`);
    lines.push(`Base URL: ${this.baseUrl}`);
    lines.push('');
    lines.push('OVERALL RESULTS:');
    lines.push(`Total Tests: ${this.testResults.overallSummary.total}`);
    lines.push(`Passed: ${this.testResults.overallSummary.passed} (${this.testResults.overallSummary.passRate}%)`);
    lines.push(`Failed: ${this.testResults.overallSummary.failed}`);
    lines.push('');
    lines.push('TEST SUITES:');
    
    for (const [suiteName, results] of Object.entries(this.testResults.testSuites)) {
      lines.push(`${suiteName}:`);
      lines.push(`  Status: ${results.status}`);
      lines.push(`  Results: ${results.summary?.passed || 0}/${results.summary?.total || 0} (${results.summary?.passRate || 0}%)`);
      lines.push(`  Duration: ${(results.duration / 1000).toFixed(1)}s`);
      lines.push(`  Priority: ${results.priority}`);
      lines.push('');
    }

    if (this.testResults.criticalFailures.length > 0) {
      lines.push('CRITICAL FAILURES:');
      this.testResults.criticalFailures.forEach(failure => {
        lines.push(`- ${failure.suite}: ${failure.passRate}% pass rate`);
      });
      lines.push('');
    }

    lines.push('RECOMMENDATIONS:');
    this.testResults.recommendations.forEach(rec => {
      lines.push(`- ${rec.replace(/[🎉👍⚠️🚨🔴🟡🟢🔧🔐🌐🗄️♿💡🔄📈🔍🧪🛠️📱🏗️🧹📋📄]/g, '')}`);
    });

    return lines.join('\n');
  }

  getTestResults() {
    return this.testResults;
  }
}

// CLI execution
if (require.main === module) {
  async function main() {
    const testSuite = new MasterFunctionalityTestSuite();
    
    try {
      await testSuite.runCompleteTestSuite();
      
      const results = testSuite.getTestResults();
      const exitCode = results.overallSummary.passRate >= 80 ? 0 : 1;
      process.exit(exitCode);
      
    } catch (error) {
      console.error('❌ Test suite execution failed:', error.message);
      process.exit(1);
    }
  }

  main();
}

module.exports = { MasterFunctionalityTestSuite };