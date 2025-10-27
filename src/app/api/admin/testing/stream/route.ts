/**
 * REAL-TIME UPDATES STREAM
 * Server-Sent Events for live test progress updates
 */

import { NextRequest } from 'next/server';
import { activeConnections } from '@/lib/streamUtils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // TODO: Verify admin auth here
  
  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  // Add connection to active set
  activeConnections.add(writer);

  // Setup cleanup on connection close
  req.signal.addEventListener('abort', () => {
    activeConnections.delete(writer);
    writer.close().catch(() => {});
  });

  // Send initial connection message
  writer.write(encoder.encode('data: {"type":"connected","message":"Test monitoring connected"}\n\n'));

  // Send keepalive every 30 seconds
  const keepaliveInterval = setInterval(() => {
    if (!activeConnections.has(writer)) {
      clearInterval(keepaliveInterval);
      return;
    }
    
    writer.write(encoder.encode('data: {"type":"keepalive","timestamp":"' + new Date().toISOString() + '"}\n\n'))
      .catch(() => {
        activeConnections.delete(writer);
        clearInterval(keepaliveInterval);
      });
  }, 30000);

  return new Response(responseStream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  });
}