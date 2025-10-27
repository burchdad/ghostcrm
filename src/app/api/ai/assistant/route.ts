import { NextRequest, NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const { message, isAuthenticated, conversationHistory } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const openai = getOpenAI();

    // Create system context based on authentication status
    const systemContext = isAuthenticated 
      ? `You are an AI assistant for Ghost Auto CRM, a comprehensive automotive dealership management system. You help users with:

      - Lead management and customer relationship management
      - Sales pipeline and deal tracking
      - Workflow automation and process optimization
      - Inventory management
      - Performance analytics and reporting
      - Integration setup and troubleshooting
      - General CRM best practices for automotive dealerships
      - Chart and data visualization recommendations

      SPECIAL FEATURES:
      - When users ask about charts, graphs, or data visualization, explain that you can help them create charts by describing what they want to visualize. The system has AI chart building capabilities that can create interactive charts from their data.
      - For analysis requests, provide insights and suggest visiting the dashboard or reports section for detailed analytics.
      - If they ask about current page analysis, provide contextual recommendations based on the page they're viewing.

      Be helpful, professional, and specific to automotive dealership needs. If users ask about specific data or records, explain that they can use the CRM's data analysis features or provide guidance on where to find that information in the system.`
      
      : `You are an AI assistant for Ghost Auto CRM, a comprehensive automotive dealership management system. Since the user is not authenticated, focus on:

      - Explaining Ghost Auto CRM features and capabilities
      - Automotive CRM best practices and benefits
      - How the platform can help improve dealership operations
      - General automotive industry insights
      - Encouraging them to sign up to access full functionality
      - Highlighting advanced features like AI-powered analytics and chart building

      Be welcoming, informative, and focus on the value proposition without accessing any specific user data.`;

    // Convert conversation history to OpenAI format
    const messages: Array<{role: "system" | "user" | "assistant", content: string}> = [
      {
        role: "system",
        content: systemContext
      }
    ];

    // Add conversation history (last few messages for context)
    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.forEach((msg: any) => {
        if (msg.role === "user" || msg.role === "assistant") {
          messages.push({
            role: msg.role as "user" | "assistant",
            content: msg.content
          });
        }
      });
    }

    // Add current message
    messages.push({
      role: "user",
      content: message
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using the latest efficient model
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    });

    const response = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response. Please try again.";

    return NextResponse.json({ 
      response,
      model: "gpt-4o-mini",
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("AI Assistant API Error:", error);
    
    if (error.message?.includes("API key")) {
      return NextResponse.json(
        { error: "OpenAI API configuration error. Please check your API key." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        error: "Failed to process your message. Please try again.",
        response: "I'm experiencing technical difficulties right now. Please try again in a moment or contact support if the issue persists."
      },
      { status: 500 }
    );
  }
}