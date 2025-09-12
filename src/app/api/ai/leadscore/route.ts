import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { leads, messages } = await req.json();
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return new Response("Missing OpenAI API key", { status: 500 });

  const prompt = `You are an expert CRM assistant. Score each lead from 0-100 based on engagement, recent activity, and likelihood to close. Leads: ${JSON.stringify(leads)}. Messages: ${JSON.stringify(messages)}. Return a JSON array of {leadId, score, suggestion}.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    return new Response(error, { status: 500 });
  }

  const data = await response.json();
  // Extract JSON from OpenAI response
  const text = data.choices?.[0]?.message?.content || "";
  let scores = [];
  try {
    scores = JSON.parse(text);
  } catch {
    scores = [{ error: "Could not parse AI response", raw: text }];
  }
  return new Response(JSON.stringify(scores), { status: 200 });
}
