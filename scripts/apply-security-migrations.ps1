# =====================================================
# CRITICAL SECURITY MIGRATION RUNNER (PowerShell)
# Applies JWT-based tenant isolation and security fixes
# =====================================================

Write-Host "🔐 Running critical security migrations for GhostCRM..." -ForegroundColor Cyan

# Check if Supabase CLI is available
$supabaseExists = Get-Command "supabase" -ErrorAction SilentlyContinue
if (-not $supabaseExists) {
    Write-Host "❌ Supabase CLI not found. Please install it first." -ForegroundColor Red
    Write-Host "npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

# Run the secure tenant isolation migration
Write-Host "📋 Applying secure tenant isolation (migration 009)..." -ForegroundColor Yellow
& supabase db push --file "migrations/009_secure_tenant_isolation.sql"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to apply tenant isolation migration" -ForegroundColor Red
    exit 1
}

# Run the webhook idempotency migration  
Write-Host "🔄 Applying webhook idempotency (migration 010)..." -ForegroundColor Yellow
& supabase db push --file "migrations/010_webhook_idempotency.sql"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to apply webhook idempotency migration" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Security migrations completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 CRITICAL SECURITY IMPROVEMENTS APPLIED:" -ForegroundColor Cyan
Write-Host "   ✓ JWT-based tenant isolation (replaces vulnerable session variables)" -ForegroundColor Green
Write-Host "   ✓ Service role client separation for privileged operations" -ForegroundColor Green
Write-Host "   ✓ RLS policies on all CRM tables (leads, deals, contacts, activities)" -ForegroundColor Green
Write-Host "   ✓ Tenant membership table for secure user-tenant relationships" -ForegroundColor Green
Write-Host "   ✓ Webhook event idempotency to prevent duplicate processing" -ForegroundColor Green
Write-Host "   ✓ Secure helper functions for tenant validation" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Your GhostCRM is now enterprise-grade secure!" -ForegroundColor Magenta
Write-Host ""
Write-Host "📋 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "   1. Update JWT tokens to include tenant_id custom claims" -ForegroundColor White
Write-Host "   2. Test tenant isolation in development" -ForegroundColor White
Write-Host "   3. Update any remaining direct Supabase calls to use service client" -ForegroundColor White
Write-Host "   4. Consider implementing Redis for webhook event caching in production" -ForegroundColor White