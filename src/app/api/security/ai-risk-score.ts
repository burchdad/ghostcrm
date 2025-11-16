import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI only if API key is available
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
}) : null;

// POST: AI security risk scoring
export async function POST(req: NextRequest) {
  const { orgData } = await req.json();
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are an expert AI security risk assessor. Review the provided organization data and assign a risk score (1-10), explain the score, and recommend mitigations. Be concise and actionable." },
        { role: "user", content: `Org data: ${JSON.stringify(orgData)}` }
      ],
      max_tokens: 300,
      temperature: 0.2,
    });
    const risk = completion.choices[0]?.message?.content || "No risk score available.";
    return NextResponse.json({ risk });
  } catch (err) {
    return NextResponse.json({ risk: "[AI Error] Unable to score risk right now." }, { status: 500 });
  }
}
