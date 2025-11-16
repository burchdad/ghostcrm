import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI only if API key is available
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
}) : null;

// POST: AI compliance check
export async function POST(req: NextRequest) {
  const { settings } = await req.json();
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are an expert compliance AI. Review the provided CRM settings for GDPR, CCPA, SOC2, and other compliance requirements. Summarize compliance status, highlight gaps, and recommend actions." },
        { role: "user", content: `Settings: ${JSON.stringify(settings)}` }
      ],
      max_tokens: 400,
      temperature: 0.2,
    });
    const compliance = completion.choices[0]?.message?.content || "No compliance analysis available.";
    return NextResponse.json({ compliance });
  } catch (err) {
    return NextResponse.json({ compliance: "[AI Error] Unable to check compliance right now." }, { status: 500 });
  }
}
