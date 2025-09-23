import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST: AI anomaly detection and audit log analysis
export async function POST(req: NextRequest) {
  const { auditLogs } = await req.json();
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are an expert AI security analyst. Analyze the provided audit logs for anomalies, suspicious activity, compliance issues, and assign a risk score (1-10). Summarize findings and recommend mitigations. Output should be concise and actionable." },
        { role: "user", content: `Audit logs: ${JSON.stringify(auditLogs)}` }
      ],
      max_tokens: 400,
      temperature: 0.2,
    });
    const analysis = completion.choices[0]?.message?.content || "No analysis available.";
    return NextResponse.json({ analysis });
  } catch (err: any) {
    console.error("[AI][AUDIT_ANALYSIS]", err?.message || err);
    return NextResponse.json({
      error: "Failed to analyze audit logs with AI",
      code: "AI_AUDIT_ANALYSIS_ERROR",
      details: err?.message || String(err),
      analysis: "[AI Error] Unable to analyze audit logs right now."
    }, { status: 500 });
  }
}
