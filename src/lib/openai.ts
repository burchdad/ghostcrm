import { OpenAI } from "openai";

let openaiInstance: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!openaiInstance) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("Missing OpenAI API key. Set OPENAI_API_KEY environment variable.");
    }
    openaiInstance = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      // Optionally set baseURL or other config here
    });
  }
  return openaiInstance;
}

// For backward compatibility, but prefer using getOpenAI()
export const openai = {
  get chat() {
    return getOpenAI().chat;
  }
};
