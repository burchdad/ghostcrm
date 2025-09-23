import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.formData();
  const digit = (body.get("Digits") || "").toString();
  let twiml = '<?xml version="1.0" encoding="UTF-8"?><Response>';
  if (digit === "1") twiml += '<Say>We will call you back shortly. Thank you!</Say>';
  else if (digit === "9") twiml += '<Say>You have been opted out. Goodbye.</Say>';
  else twiml += '<Say>Thank you. Goodbye.</Say>';
  twiml += '</Response>';
  return new NextResponse(twiml, { status:200, headers:{ "Content-Type":"text/xml" }});
}
