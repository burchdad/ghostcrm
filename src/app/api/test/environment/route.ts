export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/test/environment
 * Test endpoint to check environment variables and URL construction
 */
export async function GET(req: NextRequest) {
  const request_url = new URL(req.url);
  const host = req.headers.get('host') || 'localhost:3000';
  const protocol = req.headers.get('x-forwarded-proto') || 'http';
  
  return NextResponse.json({
    environment: {
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NODE_ENV: process.env.NODE_ENV
    },
    request_info: {
      host,
      protocol,
      full_url: req.url,
      origin: request_url.origin
    },
    constructed_urls: {
      env_based: process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/billing/success` : 'NOT_SET',
      hardcoded: 'https://ghostcrm.ai/billing/success',
      request_based: `${protocol}://${host}/billing/success`
    }
  });
}