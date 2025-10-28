import { NextRequest, NextResponse } from "next/server";


export const dynamic = 'force-dynamic';
export async function GET(req: NextRequest) {
  const script = new URL(req.url).searchParams.get("script") || "Hello, this is GhostCRM calling to follow up.";
  // For conversational voice, you can stream to LLM here
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">${escapeXml(script)}</Say>
  <Pause length="1"/>
  <Say>If you'd like a callback, press 1. To opt out, press 9.</Say>
  <Gather input="dtmf" numDigits="1" action="/api/voice/twilio/gather" method="POST"/>
</Response>`;
  return new NextResponse(twiml, { status: 200, headers: { "Content-Type":"text/xml" }});
}

function escapeXml(s:string){return s.replace(/[<>&'"]/g,c=>({ '<':'&lt;','>':'&gt;','&':'&amp;',"'":'&apos;','"':'&quot;' } as any)[c]);}

