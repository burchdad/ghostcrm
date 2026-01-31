import { NextResponse } from 'next/server';


export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
  const body = await req.json();
  // TODO: Connect to OpenAI or similar for real suggestions
  return NextResponse.json({ status: 'ok', suggestions: ['Share with manager', 'Tag IT for review'] });
}

