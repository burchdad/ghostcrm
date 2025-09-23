import fetch from "node-fetch";

export async function summarizeCall(transcript: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return "";
  const prompt = `Summarize this sales call for CRM audit log. Focus on intent, outcome, and next steps.\n\nTranscript:\n${transcript}`;
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    }),
  }).then(r=>r.json());
  return resp.choices?.[0]?.message?.content?.trim() || "";
}
