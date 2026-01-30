# Middleware Debug Setup

## Enable Debug Logging

Add to your `.env.local`:
```
MW_DEBUG=true
```

## Supabase Cookie Names to Look For

In production DevTools (Application → Cookies), verify these patterns:

✅ **Common Supabase SSR cookies:**
- `sb-access-token`
- `sb-refresh-token`
- `sb-<project-ref>-access-token`
- `sb-<project-ref>-refresh-token`

✅ **Required cookie properties:**
- `Domain: .ghostcrm.ai` (with leading dot)
- `Secure: true` (production only)
- `SameSite: Lax`
- `HttpOnly: true` (for auth tokens)

## Final Production Checklist

Test these scenarios to ensure cookie preservation works:

1. **Cross-domain session persistence:**
   - Login on `ghostcrm.ai`
   - Navigate to `tenant.ghostcrm.ai`
   - Should not require re-login ✅

2. **Session refresh during redirect:**
   - Let session get close to expiry
   - Navigate to protected route that triggers redirect
   - Should arrive at destination with fresh session ✅

3. **Logout propagation:**
   - Logout on main domain
   - Check that session is cleared on subdomain ✅

4. **Invalid subdomain handling:**
   - Visit `nonexistent.ghostcrm.ai/anything`
   - Should show tenant-not-found without infinite loop ✅

## Debug Commands

Enable debug logging and watch middleware behavior:

```bash
# Enable debug mode
echo "MW_DEBUG=true" >> .env.local

# Watch logs in development
npm run dev

# In production, check server logs for MW_DEBUG output
```

The middleware now properly preserves all Supabase SSR cookie writes across redirects and rewrites! 🔒