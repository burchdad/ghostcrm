import { NextRequest, NextResponse } from 'next/server';
import { connectionStorage } from '../../../../../lib/crypto/secure-storage';
import { credentialManager } from '../../../../../lib/crypto/secure-credentials';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'anonymous';
    const connectionId = searchParams.get('connectionId');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (connectionId) {
      // Get specific connection
      const result = await connectionStorage.getConnection(connectionId, userId);
      
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: result.error === 'Access denied' ? 403 : 404 }
        );
      }

      // Remove decrypted credentials from response for security
      const { decryptedCredentials, ...safeConnection } = result.connection!;
      
      return NextResponse.json({
        success: true,
        data: {
          connection: {
            ...safeConnection,
            hasCredentials: Object.keys(safeConnection.encryptedCredentials).length > 0
          }
        }
      });
    }

    // Query connections
    const result = await connectionStorage.queryConnections({
      userId,
      category: category || undefined,
      status: status as any || undefined,
      limit,
      offset
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    // Get connection statistics
    const stats = await connectionStorage.getConnectionStats(userId);

    return NextResponse.json({
      success: true,
      data: {
        connections: result.connections,
        total: result.total,
        stats,
        pagination: {
          limit,
          offset,
          total: result.total,
          pages: Math.ceil((result.total || 0) / limit)
        }
      }
    });

  } catch (error) {
    console.error('Connection query error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to query connections' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { connectionId, userId, updates } = body;

    if (!connectionId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Connection ID and User ID are required' },
        { status: 400 }
      );
    }

    // Validate updates
    const allowedUpdates = ['status', 'isEnabled', 'isConnected', 'metadata'];
    const validUpdates = Object.keys(updates).every(key => allowedUpdates.includes(key));
    
    if (!validUpdates) {
      return NextResponse.json(
        { success: false, error: 'Invalid update fields' },
        { status: 400 }
      );
    }

    const result = await connectionStorage.updateConnection(connectionId, userId, updates);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.error === 'Access denied' ? 403 : 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { updated: true }
    });

  } catch (error) {
    console.error('Connection update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update connection' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get('connectionId');
    const userId = searchParams.get('userId');

    if (!connectionId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Connection ID and User ID are required' },
        { status: 400 }
      );
    }

    const result = await connectionStorage.deleteConnection(connectionId, userId);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.error === 'Access denied' ? 403 : 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { deleted: true }
    });

  } catch (error) {
    console.error('Connection deletion error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete connection' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, connectionId, userId } = body;

    if (action === 'test') {
      // Test a stored connection
      if (!connectionId || !userId) {
        return NextResponse.json(
          { success: false, error: 'Connection ID and User ID are required' },
          { status: 400 }
        );
      }

      const credentialsResult = await connectionStorage.getCredentialsForUse(connectionId, userId);
      
      if (!credentialsResult.success) {
        return NextResponse.json(
          { success: false, error: credentialsResult.error },
          { status: 404 }
        );
      }

      // Test the connection with decrypted credentials
      // This would integrate with the existing testConnection logic
      return NextResponse.json({
        success: true,
        data: {
          testResult: 'Connection credentials retrieved successfully',
          status: 'active',
          lastTested: new Date().toISOString()
        }
      });

    } else if (action === 'refresh') {
      // Refresh OAuth tokens
      return NextResponse.json({
        success: false,
        error: 'Token refresh not yet implemented'
      });

    } else if (action === 'validate_encryption') {
      // Validate encryption system
      const validation = credentialManager.validateKeyStrength();
      
      return NextResponse.json({
        success: true,
        data: {
          encryption: {
            isValid: validation.isValid,
            warnings: validation.warnings,
            algorithm: 'AES-256-CBC',
            status: validation.isValid ? 'secure' : 'needs_attention'
          }
        }
      });

    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Connection action error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to perform action' },
      { status: 500 }
    );
  }
}