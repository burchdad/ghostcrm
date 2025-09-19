
import { NextRequest } from "next/server";
import { openai } from "@/lib/openai";
import { NextResponse } from "next/server";

// Simulate inventory fetch (replace with Supabase or real DB/API in production)
async function getInventoryContext() {
  // Example: fetch from /api/inventory (could be replaced with Supabase client)
  const inventory = [
    { id: 1, year: 2025, make: "Tesla", model: "Model S", status: "available" },
    { id: 2, year: 2024, make: "Ford", model: "F-150", status: "pending" },
    { id: 3, year: 2023, make: "BMW", model: "X5", status: "sold" },
    { id: 4, year: 2005, make: "Chevy", model: "Silverado", status: "pre-order" },
    { id: 5, year: 2022, make: "Toyota", model: "Camry", status: "in-transit" },
  ];
  return inventory;
}


export async function POST(req: NextRequest) {
  const { messages } = await req.json();
  if (!messages || !Array.isArray(messages)) {
    return new Response(JSON.stringify({ error: "Missing messages array" }), { status: 400 });
  }
  // Fetch inventory context
  const inventory = await getInventoryContext();
  // Build context string for prompt
  const inventoryContext = inventory.map(v => `${v.year} ${v.make} ${v.model} - ${v.status}`).join("; ");
  // Inject inventory context as system prompt
  const systemPrompt = `You are an advanced automotive CRM assistant. You have access to real-time dealership inventory. Here is the current inventory: ${inventoryContext}. Use this data to answer questions about vehicle availability, status (pre-order, in-transit, on-hold, scheduled for delivery, ordered, sold, available, pending), and provide helpful, context-aware responses. If a vehicle is not found, say so. Always be professional and helpful.`;
  const fullMessages = [
    { role: "system", content: systemPrompt },
    ...messages
  ];
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: fullMessages,
      max_tokens: 256,
      temperature: 0.7,
    });
    const aiMessage = completion.choices[0]?.message?.content || "";
    return new Response(JSON.stringify({ message: aiMessage }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
