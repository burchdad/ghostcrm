// /api/ai/nlq.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

// Initialize OpenAI only if API key is available
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;


// Define return type for AI NLQ parsing
interface ParsedAnalyticsCard {
  title?: string;
  chartType?: string;
  groupBy?: string;
  metric?: string;
  filters?: Record<string, any>;
  reps?: string[];
  status?: string[];
  color?: string;
  description?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { query } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Invalid query input' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an AI that helps parse analytics dashboard prompts into structured JSON for building custom chart cards. Your output should match this structure: { title, chartType, groupBy, metric, filters, reps, status, color, description }.`,
        },
        {
          role: 'user',
          content: `Parse this natural language query: ${query}`,
        },
      ],
      temperature: 0.2,
    });

    const aiReply = completion?.choices?.[0]?.message?.content;


    if (!aiReply) {
      return res.status(500).json({ error: 'Empty AI response' });
    }

    let parsed: ParsedAnalyticsCard;
    try {
      parsed = JSON.parse(aiReply);
    } catch (parseErr) {
      return res.status(500).json({ error: 'Failed to parse AI output as JSON', raw: aiReply });
    }

    return res.status(200).json(parsed);
  } catch (error: any) {
    console.error('[NLQ Error]', error);
    return res.status(500).json({ error: 'AI NLQ parsing failed', detail: error?.message || 'Unknown error' });
  }
}
