import { createRouteHandler } from "@/utils/api";
import { openai } from "@/lib/openai";
import { z } from "zod";
import { getUserIdFromRequest } from "@/utils/auth";

// POST: Run AI analytics or anomaly detection
export const POST = createRouteHandler(async (req) => {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return { status: 401, body: { error: "Unauthorized: Invalid or missing token" } };
  }
  const schema = z.object({
    prompt: z.string(),
    cardId: z.string().optional()
  });
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
  return { status: 400, body: { error: "Invalid body", details: parsed.error.issues } };
  }
  const { prompt, cardId } = parsed.data;
  // Call OpenAI for analytics or anomaly detection (latest SDK)
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "user", content: prompt }
    ],
    max_tokens: 200
  });
  return { status: 200, body: { result: completion.choices[0].message.content } };
});
