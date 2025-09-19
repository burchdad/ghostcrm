import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import fetch from "node-fetch";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const TWILIO_API_URL = process.env.TWILIO_API_URL;
const TWILIO_API_KEY = process.env.TWILIO_API_KEY;
const ADMIN_PHONE = process.env.ADMIN_PHONE;

// POST: AI analysis of login attempts for hacking detection and alerting
export async function POST(req: NextRequest) {
  const { attempts } = await req.json();
  let alert = "";
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are an expert AI security analyst. Review the provided login attempts for signs of hacking, brute force, or suspicious activity. If any risk is detected, output a clear alert and recommended actions. Be concise and actionable." },
        { role: "user", content: `Login attempts: ${JSON.stringify(attempts)}` }
      ],
      max_tokens: 200,
      temperature: 0.2,
    });
    alert = completion.choices[0]?.message?.content || "No suspicious activity detected.";
  } catch (err) {
    alert = "[AI Error] Unable to analyze login attempts right now.";
  }

  // If alert is suspicious, send notifications
  if (alert.toLowerCase().includes("suspicious") || alert.toLowerCase().includes("risk") || alert.toLowerCase().includes("hacking")) {
    // Slack notification
    if (SLACK_WEBHOOK_URL) {
      await fetch(SLACK_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: `[GhostCRM Security Alert] ${alert}` }),
      });
    }
    // SMS notification via Twilio
    if (TWILIO_API_URL && TWILIO_API_KEY && ADMIN_PHONE) {
      await fetch(TWILIO_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${TWILIO_API_KEY}`,
        },
        body: JSON.stringify({
          to: ADMIN_PHONE,
          message: `[GhostCRM Security Alert] ${alert}`,
        }),
      });
    }
  }
  return NextResponse.json({ alert });
}
