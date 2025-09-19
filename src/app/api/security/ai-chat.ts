import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { messages } = await req.json();
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are an expert AI security assistant for a CRM. Answer questions about audit logs, security risks, compliance, and best practices. If asked about audit logs, summarize and highlight anomalies. If asked about security risks, provide actionable recommendations. If asked about compliance, reference GDPR, CCPA, SOC2, etc. Always be concise and clear." },
        ...messages.map(m => ({ role: m.role, content: m.content }))
      ],
      max_tokens: 300,
      temperature: 0.2,
    });
    const reply = completion.choices[0]?.message?.content || "I'm your AI security assistant.";
    return NextResponse.json({ reply });
  } catch (err) {
    return NextResponse.json({ reply: "[AI Error] Unable to process your request right now." }, { status: 500 });
  }
}
