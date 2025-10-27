# 🧪 GhostCRM Test Suite

This directory contains all automated and manual tests for the GhostCRM application, including a comprehensive admin testing dashboard for production monitoring.

## 📂 Directory Structure

### 🏠 Root Tests (Playwright)
- `api-smoke.spec.ts` - API smoke tests for critical endpoints
- `health.spec.ts` - Health check and basic functionality tests

### 🔗 `/integration/`
Integration tests for system components:
- `credential-security-test.js` - Security system integration test
- `oauth-system-test.js` - OAuth authentication flow test
- `universal-handler-test.js` - Universal API handler test

### 🧑‍💻 `/manual/`
Manual testing scripts:
- `api-lead-sync-test.js` - Manual API lead synchronization test

### 🔒 `/security/`
**Comprehensive Security Test Suite**:
- `security-test-runner.js` - Complete security test orchestrator
- `penetration-test.js` - Full penetration testing suite
- `targeted-vulnerabilities.js` - Tests for specific known vulnerabilities  
- `concurrency-tests.js` - Race condition and concurrency testing
- `demo.js` - Security test demonstration (no server required)
- `README.md` - Detailed security testing guide

**⚠️ WARNING: Only run security tests against development environments!**

### 🎯 `/functionality/`
**Complete Functionality Test Suite** - Tests every button, form, and interactive element:
- `master-test-suite.js` - Orchestrates all functionality tests
- `ui-component-tests.js` - UI component interaction testing
- `page-functionality-tests.js` - Page and route functionality
- `api-endpoint-tests.js` - Complete API endpoint coverage
- `authentication-tests.js` - Auth flows and security boundaries
- `database-integration-tests.js` - Database operations and integrity
- `cross-platform-accessibility-tests.js` - Responsive design and accessibility
- `package.json` - Test dependencies and scripts
- `README.md` - Comprehensive testing guide

### 🎛️ **Admin Testing Dashboard**
**Secure admin-only interface for production monitoring**:
- **Location**: `/admin/testing` (super admin access only)
- **Features**: Multi-tenant testing, scheduling, real-time monitoring
- **Security**: Role-based access, audit logging, IP restrictions
- **Automation**: Daily/weekly scheduled tests, alerts, reporting

## 🚀 Running Tests

### 🎛️ **Admin Testing Dashboard** (Recommended)
**Secure web interface for comprehensive testing**:
```bash
# 1. Setup (one-time)
node scripts/setup-admin-testing.js

# 2. Start application
npm run dev

# 3. Access dashboard
# Visit: http://localhost:3000/admin/testing
# Login with super admin credentials
```

**Dashboard Features**:
- **Manual Testing**: Run complete test suites on-demand
- **Scheduled Testing**: Automated daily/weekly test runs
- **Multi-Tenant Testing**: Test main app + all tenant instances
- **Real-Time Monitoring**: Live test progress and results
- **Historical Reports**: Trend analysis and performance tracking
- **Alert System**: Email/SMS notifications for failures
- **Data Integrity**: Detect unauthorized data tampering

### 🎯 Functionality Tests (Complete Coverage)
**Tests every button, form, and interactive element**:
```bash
cd tests/functionality

# Install dependencies
npm install

# Run complete test suite (487+ tests)
npm test

# Run individual test categories
npm run test:ui          # UI components
npm run test:pages       # Page functionality  
npm run test:api         # API endpoints
npm run test:auth        # Authentication
npm run test:db          # Database
npm run test:platform    # Cross-platform
```

### 🧪 Playwright Tests (Automated)
```bash
# Run all Playwright tests
npm run test

# Run with UI
npm run test:ui

# Debug mode
npm run test:debug
```

### 🔗 Integration Tests
```bash
# Ensure the dev server is running first
npm run dev

# Then run individual integration tests
node tests/integration/credential-security-test.js
node tests/integration/oauth-system-test.js
node tests/integration/universal-handler-test.js
```

### 🧑‍💻 Manual Tests
```bash
# Ensure the dev server is running first
npm run dev

# Run manual tests
node tests/manual/api-lead-sync-test.js
```

### Security Tests
```bash
# Ensure the dev server is running first
npm run dev

# Run complete security test suite
node tests/security/security-test-runner.js

# Run individual security tests
node tests/security/penetration-test.js
node tests/security/targeted-vulnerabilities.js
node tests/security/concurrency-tests.js

# View security test demo (no server required)
node tests/security/demo.js
```

**⚠️ CRITICAL: Only run security tests against development environments!**

## 📝 Adding New Tests

- **Playwright Tests**: Add `.spec.ts` files to the root `/tests/` directory
- **Integration Tests**: Add `.js` files to `/tests/integration/`
- **Manual Tests**: Add `.js` files to `/tests/manual/`
- **Security Tests**: Add to `/tests/security/` (follow existing patterns)

Make sure to update this README when adding new test categories or significant test files.

## 🔒 Security Testing

The security test suite identifies vulnerabilities and security issues. **Key findings**:

### Critical Issues Found:
- ❌ Hardcoded JWT secret fallback (`"supersecret"`)
- ❌ Potential Supabase key exposure  
- ❌ In-memory rate limiting (not distributed)
- ❌ CORS validation bypass possible
- ❌ SQL injection vulnerabilities

### Security Score: 62/100 (POOR)
**Status: NOT READY FOR PRODUCTION**

### Immediate Actions Required:
1. 🔥 **Fix JWT secret**: Use strong environment variable
2. 🔥 **Secure Supabase keys**: Remove hardcoded values
3. 🔥 **Implement distributed rate limiting**: Use Redis
4. ⚠️ **Improve CORS validation**: Use exact matching
5. ⚠️ **Add input validation**: Prevent injection attacks

Run `node tests/security/demo.js` for detailed findings and remediation steps.