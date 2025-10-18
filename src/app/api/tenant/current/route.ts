import { NextRequest, NextResponse } from "next/server";
import { getTenantBySubdomain } from "@/lib/tenant/database";
import { getSubdomain } from "@/lib/tenant/utils";

export async function GET(request: NextRequest) {
  try {
    // Extract tenant info from request
    const hostname = request.headers.get('host') || '';
    const subdomain = getSubdomain(hostname);
    
    if (!subdomain) {
      return NextResponse.json(
        { error: "No tenant subdomain detected" },
        { status: 400 }
      );
    }

    // Try to get tenant from database
    let tenant = null;
    try {
      tenant = await getTenantBySubdomain(subdomain);
    } catch (dbError) {
      console.warn("Database fetch failed, using fallback data:", dbError);
      
      // Fallback tenant data for development
      const sampleTenants = {
        'demo': {
          id: 1,
          subdomain: 'demo',
          name: 'Demo Dealership',
          config: { features: ['leads', 'inventory', 'finance'] },
          branding: {
            primary_color: '#1f2937',
            company_name: 'Demo Dealership'
          },
          settings: {},
          status: 'active' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          plan: 'basic' as const,
          user_limit: 10,
          storage_limit_mb: 1000,
          admin_email: 'admin@demo.ghostautocrm.com'
        },
        'acme-auto': {
          id: 2,
          subdomain: 'acme-auto',
          name: 'ACME Auto Sales',
          config: { features: ['leads', 'inventory', 'finance', 'compliance'] },
          branding: {
            primary_color: '#dc2626',
            company_name: 'ACME Auto Sales'
          },
          settings: {},
          status: 'active' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          plan: 'professional' as const,
          user_limit: 25,
          storage_limit_mb: 5000,
          admin_email: 'manager@acmeauto.com'
        },
        'premium-cars': {
          id: 3,
          subdomain: 'premium-cars',
          name: 'Premium Cars LLC',
          config: { features: ['leads', 'inventory', 'finance', 'compliance', 'advanced_reporting'] },
          branding: {
            primary_color: '#059669',
            company_name: 'Premium Cars LLC'
          },
          settings: {},
          status: 'active' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          plan: 'enterprise' as const,
          user_limit: 100,
          storage_limit_mb: 20000,
          admin_email: 'admin@premiumcars.com'
        }
      };
      
      tenant = sampleTenants[subdomain as keyof typeof sampleTenants] || null;
    }
    
    if (!tenant) {
      return NextResponse.json(
        { error: `Tenant '${subdomain}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      tenant,
      subdomain,
      isMarketingSite: false
    });
  } catch (error) {
    console.error("Error in tenant API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}