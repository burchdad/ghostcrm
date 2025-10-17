import { NextRequest, NextResponse } from "next/server";
import { ClientConfigManager, type ClientConfig } from "@/lib/client-config";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('client_id');
    const action = searchParams.get('action');

    if (action === 'test_connection' && clientId) {
      const config = await ClientConfigManager.getClientConfig(clientId);
      const result = await ClientConfigManager.testConnection(config);
      return NextResponse.json({ success: true, data: result });
    }

    if (clientId) {
      const config = await ClientConfigManager.getClientConfig(clientId);
      return NextResponse.json({ success: true, data: config });
    }

    const configs = await ClientConfigManager.getAllClientConfigs();
    return NextResponse.json({ success: true, data: configs });
  } catch (error) {
    console.error('GET /api/admin/client-config error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch client configurations' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, config, client_id } = body;

    switch (action) {
      case 'create':
      case 'update': {
        if (!config) {
          return NextResponse.json({ success: false, error: 'Configuration data required' }, { status: 400 });
        }

        const savedConfig = await ClientConfigManager.saveClientConfig(config);
        return NextResponse.json({ 
          success: true, 
          data: { config: savedConfig, message: `Configuration ${action}d successfully` } 
        });
      }

      case 'delete': {
        if (!client_id) {
          return NextResponse.json({ success: false, error: 'Client ID required' }, { status: 400 });
        }

        await ClientConfigManager.deleteClientConfig(client_id);
        return NextResponse.json({ 
          success: true, 
          data: { message: 'Configuration deleted successfully' } 
        });
      }

      case 'test_connection': {
        if (!config) {
          return NextResponse.json({ success: false, error: 'Configuration required for testing' }, { status: 400 });
        }

        const result = await ClientConfigManager.testConnection(config);
        return NextResponse.json({ success: true, data: result });
      }

      case 'migrate_data': {
        const { from_client_id, to_client_id } = body;
        if (!from_client_id || !to_client_id) {
          return NextResponse.json({ success: false, error: 'Source and target client IDs required' }, { status: 400 });
        }

        const result = await ClientConfigManager.migrateClientData(from_client_id, to_client_id);
        return NextResponse.json({ success: true, data: result });
      }

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('POST /api/admin/client-config error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
}