import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  console.log('🔍 [WEBHOOK TEST] GET request received');
  return NextResponse.json({ 
    status: 'ok', 
    message: 'Telnyx webhook endpoint is reachable',
    timestamp: new Date().toISOString(),
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL
  });
}

export async function POST(req: NextRequest) {
  console.log('🔍 [WEBHOOK TEST] POST request received');
  const body = await req.json().catch(() => ({}));
  console.log('🔍 [WEBHOOK TEST] Request body:', body);
  
  return NextResponse.json({ 
    status: 'ok', 
    message: 'Telnyx webhook test endpoint received POST',
    timestamp: new Date().toISOString(),
    receivedData: body
  });
}