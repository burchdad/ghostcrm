import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { BaseIntegration, IntegrationTemplate, getAllIntegrations, searchIntegrations, getIntegrationById } from "@/integrations";

// Use Node.js runtime to avoid Edge Runtime issues with Supabase
export const runtime = 'nodejs';

// GET: List all user integrations
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // For now, return mock data - later integrate with Supabase
    const mockIntegrations: BaseIntegration[] = [
      {
        id: 'slack-1',
        name: 'Slack Workspace',
        description: 'Main team communication',
        category: 'Communication',
        type: 'oauth',
        icon: '💬',
        color: 'bg-purple-500',
        isConnected: true,
        status: 'active',
        lastSync: new Date().toISOString(),
        connectedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        syncCount: 1247,
        errorCount: 2,
        settings: {
          channels: ['#sales', '#general'],
          notifications: ['deal-closed', 'new-lead']
        }
      },
      {
        id: 'openai-1',
        name: 'OpenAI GPT-4',
        description: 'AI-powered lead scoring and insights',
        category: 'AI & ML',
        type: 'api-key',
        icon: '🤖',
        color: 'bg-black',
        isConnected: true,
        status: 'active',
        lastSync: new Date().toISOString(),
        connectedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        syncCount: 892,
        errorCount: 0,
        settings: {
          model: 'gpt-4',
          temperature: 0.7
        }
      }
    ];

    // Apply filters
    let filteredIntegrations = mockIntegrations;

    if (category && category !== 'all') {
      filteredIntegrations = filteredIntegrations.filter(int => int.category === category);
    }

    if (status && status !== 'all') {
      filteredIntegrations = filteredIntegrations.filter(int => int.status === status);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredIntegrations = filteredIntegrations.filter(int => 
        int.name.toLowerCase().includes(searchLower) ||
        int.description.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({
      integrations: filteredIntegrations,
      total: filteredIntegrations.length
    });

  } catch (error) {
    console.error('Error fetching integrations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch integrations' },
      { status: 500 }
    );
  }
}

// POST: Create new integration from template
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { templateId, name, credentials, settings } = body;

    // Find the template
    const template = getIntegrationById(templateId);
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Create new integration
    const newIntegration: BaseIntegration = {
      id: `${template.id}-${Date.now()}`,
      name: name || template.name,
      description: template.description,
      category: template.category,
      type: template.type,
      icon: template.icon,
      color: template.color,
      isConnected: false,
      status: 'disabled',
      settings: { ...template.defaultSettings, ...settings },
      credentials: {
        type: template.type,
        fields: template.credentialFields,
        encrypted: true
      },
      connectedAt: new Date().toISOString()
    };

    // TODO: Save to Supabase
    // const { data, error } = await supabaseAdmin
    //   .from('integrations')
    //   .insert([newIntegration])
    //   .select()
    //   .single();

    return NextResponse.json({
      integration: newIntegration,
      message: 'Integration created successfully'
    });

  } catch (error) {
    console.error('Error creating integration:', error);
    return NextResponse.json(
      { error: 'Failed to create integration' },
      { status: 500 }
    );
  }
}

// PUT: Update existing integration
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, credentials, settings, status } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Integration ID is required' },
        { status: 400 }
      );
    }

    // TODO: Update in Supabase
    // const { data, error } = await supabaseAdmin
    //   .from('integrations')
    //   .update({
    //     credentials: credentials ? JSON.stringify(credentials) : undefined,
    //     settings: settings ? JSON.stringify(settings) : undefined,
    //     status,
    //     updated_at: new Date().toISOString()
    //   })
    //   .eq('id', id)
    //   .select()
    //   .single();

    return NextResponse.json({
      message: 'Integration updated successfully',
      id
    });

  } catch (error) {
    console.error('Error updating integration:', error);
    return NextResponse.json(
      { error: 'Failed to update integration' },
      { status: 500 }
    );
  }
}

// DELETE: Remove integration
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Integration ID is required' },
        { status: 400 }
      );
    }

    // TODO: Delete from Supabase
    // const { error } = await supabaseAdmin
    //   .from('integrations')
    //   .delete()
    //   .eq('id', id);

    return NextResponse.json({
      message: 'Integration deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting integration:', error);
    return NextResponse.json(
      { error: 'Failed to delete integration' },
      { status: 500 }
    );
  }
}