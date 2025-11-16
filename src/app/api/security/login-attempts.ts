import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI only if API key is available
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
}) : null;

// GET: Fetch recent login attempts (stub)
export async function GET(req: NextRequest) {
  // TODO: Replace with real DB query
  const attempts = [
    { email: "admin@demo.com", ip: "192.168.1.10", timestamp: "2025-09-18T10:00:00Z", suspicious: false },
    { email: "unknown@demo.com", ip: "203.0.113.5", timestamp: "2025-09-18T10:05:00Z", suspicious: true },
    { email: "admin@demo.com", ip: "203.0.113.5", timestamp: "2025-09-18T10:06:00Z", suspicious: true },
  ];
  return NextResponse.json({ attempts });
}
