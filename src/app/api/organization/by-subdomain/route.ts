import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Force dynamic rendering for request.url usage
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subdomain = searchParams.get('subdomain');

    if (!subdomain) {
      return NextResponse.json(
        { success: false, error: 'Subdomain parameter is required' },
        { status: 400 }
      );
    }

    // Query the organizations table for the subdomain
    const { data: organization, error } = await supabase
      .from('organizations')
      .select('id, name, subdomain, created_at')
      .eq('subdomain', subdomain)
      .single();

    if (error) {
      console.error('Error fetching organization by subdomain:', error);
      return NextResponse.json(
        { success: false, error: 'Organization not found' },
        { status: 404 }
      );
    }

    if (!organization) {
      return NextResponse.json(
        { success: false, error: 'Organization not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      organization: {
        id: organization.id,
        name: organization.name,
        subdomain: organization.subdomain,
        createdAt: organization.created_at
      }
    });

  } catch (error) {
    console.error('Error in organization by-subdomain API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}