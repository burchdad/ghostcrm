import { NextRequest, NextResponse } from 'next/server';
import { CacheManager } from '@/lib/cache/redis-manager';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const cache = CacheManager.getInstance();
    
    // Test basic Redis operations
    const testKey = 'health-check-' + Date.now();
    const testValue = { timestamp: Date.now(), test: 'redis-health' };
    
    // Test set operation
    await cache.set(testKey, testValue, 60); // 1 minute TTL
    
    // Test get operation
    const retrieved = await cache.get<{ timestamp: number; test: string }>(testKey);
    
    // Test delete operation
    await cache.del(testKey);
    
    // Verify the operations worked
    const isWorking = retrieved && 
                     retrieved.timestamp === testValue.timestamp && 
                     retrieved.test === testValue.test;
    
    return NextResponse.json({
      status: isWorking ? 'healthy' : 'unhealthy',
      redis: {
        connected: isWorking,
        operations: {
          set: true,
          get: !!retrieved,
          delete: true
        },
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      redis: {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
}