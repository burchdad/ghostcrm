# 🔒 Security Test Suite

This directory contains comprehensive security tests designed to identify vulnerabilities and security issues in the GhostCRM application.

## ⚠️ **IMPORTANT WARNING**

**NEVER run these tests against a production environment!** These tests are designed to find and exploit vulnerabilities, which could:
- Overload your server
- Trigger security alerts
- Cause data corruption
- Expose sensitive information

**Only run against development environments!**

## 🧪 Test Files

### Core Test Suites

#### `penetration-test.js`
Comprehensive penetration testing suite covering:
- API rate limiting & DDoS protection
- Authentication bypass attempts
- SQL/NoSQL injection testing
- Multi-tenant data isolation
- XSS & input validation
- CSRF protection testing
- Information disclosure
- JWT security testing
- Authorization bypass attempts

#### `targeted-vulnerabilities.js`
Focused tests for specific vulnerabilities found in code analysis:
- JWT secret exposure
- Supabase admin key exposure
- Rate limiting bypass techniques
- CORS/Origin validation bypass
- Database injection vulnerabilities
- Session security issues
- File upload security
- Environment variable disclosure
- Multi-tenant isolation testing
- Error information disclosure

#### `concurrency-tests.js`
Tests for race conditions and concurrent access issues:
- Concurrent user registration
- Database operation race conditions
- Authentication race conditions
- Rate limit race conditions
- File upload concurrency
- Memory leak detection
- Deadlock detection
- Data consistency under load
- Resource exhaustion protection
- Cache coherency testing

### Test Runner

#### `security-test-runner.js`
Main test orchestrator that:
- Executes all security test suites
- Generates comprehensive security reports
- Calculates security scores
- Provides remediation recommendations
- Saves detailed results to files

## 🚀 How to Run

### Prerequisites
1. Start your development server:
   ```bash
   npm run dev
   ```

2. Ensure your server is running on `http://localhost:3000`

### Running All Security Tests
```bash
# Run the complete security test suite
node tests/security/security-test-runner.js

# Run individual test files
node tests/security/penetration-test.js
node tests/security/targeted-vulnerabilities.js
node tests/security/concurrency-tests.js
```

### Environment Variables
```bash
# Optional: Specify different target URL
export TEST_BASE_URL=http://localhost:3001
node tests/security/security-test-runner.js
```

## 📊 Understanding Results

### Security Score
- **95-100**: EXCELLENT - Production ready
- **85-94**: GOOD - Minor issues to address
- **70-84**: FAIR - Several issues need fixing
- **50-69**: POOR - Major security concerns
- **0-49**: CRITICAL - Not ready for production

### Test Results
- ✅ **PASS**: Security control is working correctly
- ❌ **FAIL**: Potential vulnerability identified
- 🚨 **CRITICAL**: Immediate security risk found

### Common Issues Found

#### Critical Vulnerabilities
- SQL injection vulnerabilities
- Authentication bypass
- JWT security issues
- Rate limiting bypass
- Information disclosure
- CSRF vulnerabilities

#### Warnings
- Missing security headers
- Weak input validation
- Inconsistent rate limiting
- Information leakage in errors

## 🛠️ Fixing Common Issues

### Authentication Issues
```javascript
// Bad: No rate limiting
app.post('/api/login', async (req, res) => {
  // Direct login without limits
});

// Good: With rate limiting
app.post('/api/login', rateLimiter, async (req, res) => {
  // Protected login endpoint
});
```

### Input Validation
```javascript
// Bad: No validation
const { email } = req.body;

// Good: Proper validation
const { email } = validateSchema.parse(req.body);
```

### JWT Security
```javascript
// Bad: Weak secret
const JWT_SECRET = 'supersecret';

// Good: Strong secret
const JWT_SECRET = process.env.JWT_SECRET; // 256-bit random string
```

### SQL Injection Protection
```javascript
// Bad: String concatenation
const query = `SELECT * FROM users WHERE email = '${email}'`;

// Good: Parameterized queries
const query = 'SELECT * FROM users WHERE email = ?';
const result = await db.query(query, [email]);
```

## 📋 Security Checklist

Use this checklist after running tests:

### Authentication & Authorization
- [ ] Strong JWT secrets (not default values)
- [ ] Proper session management
- [ ] Rate limiting on auth endpoints
- [ ] Account lockout mechanisms
- [ ] Multi-factor authentication

### Input Validation
- [ ] All inputs validated and sanitized
- [ ] XSS protection implemented
- [ ] SQL injection protection
- [ ] File upload restrictions
- [ ] Path traversal protection

### API Security
- [ ] Rate limiting on all endpoints
- [ ] CORS properly configured
- [ ] CSRF protection enabled
- [ ] API versioning implemented
- [ ] Request size limits

### Data Protection
- [ ] Sensitive data encrypted
- [ ] Database access controls
- [ ] Multi-tenant isolation
- [ ] Audit logging enabled
- [ ] Data backup security

### Infrastructure
- [ ] HTTPS everywhere
- [ ] Security headers set
- [ ] Error handling secure
- [ ] Monitoring and alerting
- [ ] Regular security updates

## 📁 Test Results

Test results are automatically saved to:
- `test-results/security-report-[timestamp].json`

The report includes:
- Detailed vulnerability findings
- Security score calculation
- Remediation recommendations
- Production readiness assessment

## 🔄 Regular Testing

### Recommended Schedule
- **Before each deployment**: Run full security suite
- **Weekly**: Run targeted vulnerability tests
- **Monthly**: Run complete penetration tests
- **After security updates**: Re-run all tests

### Continuous Integration
Add to your CI/CD pipeline:
```yaml
# .github/workflows/security.yml
name: Security Tests
on: [push, pull_request]
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Start dev server
        run: npm run dev &
      - name: Wait for server
        run: sleep 10
      - name: Run security tests
        run: node tests/security/security-test-runner.js
```

## 🆘 Need Help?

If you find critical vulnerabilities:

1. **Don't panic** - these tests are designed to find issues
2. **Document the findings** - check the generated report
3. **Prioritize critical issues** - fix these first
4. **Test your fixes** - re-run tests after changes
5. **Get expert help** - consider professional security audit

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [Next.js Security Guidelines](https://nextjs.org/docs/advanced-features/security-headers)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

---

**Remember**: Security is an ongoing process, not a one-time check. Regular testing and monitoring are essential for maintaining a secure application.