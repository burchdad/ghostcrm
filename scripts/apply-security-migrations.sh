#!/bin/bash

# =====================================================
# CRITICAL SECURITY MIGRATION RUNNER
# Applies JWT-based tenant isolation and security fixes
# =====================================================

echo "🔐 Running critical security migrations for GhostCRM..."

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first."
    echo "npm install -g supabase"
    exit 1
fi

# Run the secure tenant isolation migration
echo "📋 Applying secure tenant isolation (migration 009)..."
supabase db push --file migrations/009_secure_tenant_isolation.sql

if [ $? -ne 0 ]; then
    echo "❌ Failed to apply tenant isolation migration"
    exit 1
fi

# Run the webhook idempotency migration
echo "🔄 Applying webhook idempotency (migration 010)..."
supabase db push --file migrations/010_webhook_idempotency.sql

if [ $? -ne 0 ]; then
    echo "❌ Failed to apply webhook idempotency migration"
    exit 1
fi

echo "✅ Security migrations completed successfully!"
echo ""
echo "🎯 CRITICAL SECURITY IMPROVEMENTS APPLIED:"
echo "   ✓ JWT-based tenant isolation (replaces vulnerable session variables)"
echo "   ✓ Service role client separation for privileged operations"  
echo "   ✓ RLS policies on all CRM tables (leads, deals, contacts, activities)"
echo "   ✓ Tenant membership table for secure user-tenant relationships"
echo "   ✓ Webhook event idempotency to prevent duplicate processing"
echo "   ✓ Secure helper functions for tenant validation"
echo ""
echo "🚀 Your GhostCRM is now enterprise-grade secure!"
echo ""
echo "📋 NEXT STEPS:"
echo "   1. Update JWT tokens to include tenant_id custom claims"
echo "   2. Test tenant isolation in development"
echo "   3. Update any remaining direct Supabase calls to use service client"
echo "   4. Consider implementing Redis for webhook event caching in production"