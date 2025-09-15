import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  // Optionally set baseURL or other config here
});

export { openai };
