# Production-Grade Health Endpoint Examples

## 1. Main Domain - Unauthenticated (Consistent Shape)
```json
{
  "ok": true,
  "request": {
    "host": "ghostcrm.ai",
    "pathname": "/app",
    "subdomain_detected": null
  },
  "auth": {
    "state": "A",
    "details": "unauthenticated"
  },
  "tenant": {
    "membership": "redacted",
    "billing": "redacted"
  },
  "routing": {
    "expected_action": "redirect_login",
    "subdomain_check": "not_applicable"
  },
  "cookies": {
    "expected_domain": ".ghostcrm.ai",
    "observed_cookie_names": [],
    "domain_scoping_inferred": "unknown",
    "secure_expected": true,
    "samesite_expected": "lax"
  },
  "billing": {
    "status": "redacted"
  },
  "limits": {
    "limit": 60,
    "remaining": 59,
    "reset_epoch": 1642767600
  },
  "checks": {
    "middleware_functional": true,
    "cookies_configured": false,
    "routing_correct": false
  }
}
```

## 2. Subdomain - Unauthenticated (Anti-Enumeration)
```json
{
  "ok": true,
  "request": {
    "host": "demo.ghostcrm.ai",
    "pathname": "/app",
    "subdomain_detected": "demo"
  },
  "auth": {
    "state": "A",
    "details": "unauthenticated"
  },
  "tenant": {
    "membership": "redacted",
    "billing": "redacted"
  },
  "routing": {
    "expected_action": "redirect_login",
    "subdomain_check": "requires_auth"
  },
  "cookies": {
    "expected_domain": ".ghostcrm.ai",
    "observed_cookie_names": [],
    "domain_scoping_inferred": "unknown",
    "secure_expected": true,
    "samesite_expected": "lax"
  },
  "billing": {
    "status": "redacted"
  },
  "limits": {
    "limit": 60,
    "remaining": 58,
    "reset_epoch": 1642767600
  },
  "checks": {
    "middleware_functional": true,
    "cookies_configured": false,
    "routing_correct": false
  }
}
```

## 3. Authenticated State B (Unpaid)
```json
{
  "ok": true,
  "request": {
    "host": "ghostcrm.ai",
    "pathname": "/app",
    "subdomain_detected": null
  },
  "auth": {
    "state": "B",
    "details": "authenticated"
  },
  "tenant": {
    "membership": "redacted",
    "billing": "redacted"
  },
  "routing": {
    "expected_action": "check_tenant_status",
    "subdomain_check": "not_applicable"
  },
  "cookies": {
    "expected_domain": ".ghostcrm.ai",
    "observed_cookie_names": ["sb-access-token", "sb-refresh-token"],
    "domain_scoping_inferred": "shared",
    "secure_expected": true,
    "samesite_expected": "lax"
  },
  "billing": {
    "status": "unpaid"
  },
  "limits": {
    "limit": 60,
    "remaining": 57,
    "reset_epoch": 1642767600
  },
  "checks": {
    "middleware_functional": true,
    "cookies_configured": true,
    "routing_correct": false
  }
}
```

## 4. Authenticated State C (Paid Member)
```json
{
  "ok": true,
  "request": {
    "host": "demo.ghostcrm.ai",
    "pathname": "/app",
    "subdomain_detected": "demo"
  },
  "auth": {
    "state": "C",
    "details": "authenticated"
  },
  "tenant": {
    "membership": "authorized_owner",
    "billing": "redacted"
  },
  "routing": {
    "expected_action": "check_membership",
    "subdomain_check": "exists_active"
  },
  "cookies": {
    "expected_domain": ".ghostcrm.ai",
    "observed_cookie_names": ["sb-access-token", "sb-refresh-token"],
    "domain_scoping_inferred": "shared",
    "secure_expected": true,
    "samesite_expected": "lax"
  },
  "billing": {
    "status": "active"
  },
  "limits": {
    "limit": 60,
    "remaining": 56,
    "reset_epoch": 1642767600
  },
  "checks": {
    "middleware_functional": true,
    "cookies_configured": true,
    "routing_correct": true
  }
}
```

## 5. Provisioning State
```json
{
  "ok": true,
  "request": {
    "host": "ghostcrm.ai",
    "pathname": "/billing/success",
    "subdomain_detected": null
  },
  "auth": {
    "state": "PROVISIONING",
    "details": "authenticated"
  },
  "tenant": {
    "membership": "redacted",
    "billing": "redacted"
  },
  "routing": {
    "expected_action": "check_tenant_status",
    "subdomain_check": "not_applicable"
  },
  "cookies": {
    "expected_domain": ".ghostcrm.ai",
    "observed_cookie_names": ["sb-access-token"],
    "domain_scoping_inferred": "shared",
    "secure_expected": true,
    "samesite_expected": "lax"
  },
  "billing": {
    "status": "provisioning"
  },
  "limits": {
    "limit": 60,
    "remaining": 55,
    "reset_epoch": 1642767600
  },
  "checks": {
    "middleware_functional": true,
    "cookies_configured": true,
    "routing_correct": false
  }
}
```

## 6. Rate Limited Response (Same Shape)
```json
{
  "ok": false,
  "request": {
    "host": "ghostcrm.ai",
    "pathname": "/app",
    "subdomain_detected": null
  },
  "auth": {
    "state": "UNKNOWN",
    "details": "redacted"
  },
  "tenant": {
    "membership": "redacted",
    "billing": "redacted"
  },
  "routing": {
    "expected_action": "rate_limited",
    "subdomain_check": "blocked"
  },
  "cookies": {
    "expected_domain": ".ghostcrm.ai",
    "observed_cookie_names": [],
    "domain_scoping_inferred": "unknown",
    "secure_expected": true,
    "samesite_expected": "lax"
  },
  "billing": {
    "status": "redacted"
  },
  "limits": {
    "limit": 60,
    "remaining": 0,
    "reset_epoch": 1642767600
  },
  "checks": {
    "middleware_functional": true,
    "cookies_configured": false,
    "routing_correct": false
  }
}
```

## Security Features ✅

**No Information Leakage:**
- Consistent response shape prevents enumeration
- "redacted" fields for unauthorized data  
- No user IDs, org IDs, or sensitive metadata
- Only cookie names exposed, never values

**Anti-Enumeration:**
- `subdomain_check: "requires_auth"` for unauth users
- No DB lookups for subdomain existence when unauth
- No timing differences between valid/invalid subdomains
- Consistent response structure regardless of tenant state

**Production Headers:**
- `Cache-Control: no-store, no-cache, must-revalidate`
- `Pragma: no-cache`  
- `X-Content-Type-Options: nosniff`
- `Retry-After` header on 429 responses

**Rate Limiting:**
- Consistent response structure even when rate limited
- Proper HTTP status codes and headers
- Remaining/reset metadata for client guidance
- Consistent response structure prevents timing attacks

✅ **Provisioning Support**:
- Detects "payment received but not provisioned" state
- Provides polling guidance for frontend
- Prevents user panic during provisioning delays

This health system is now production-safe while maintaining maximum diagnostic value! 🔒