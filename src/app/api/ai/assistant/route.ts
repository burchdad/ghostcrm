import { NextRequest, NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";


export const dynamic = 'force-dynamic';
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
      ? `You are an intelligent AI assistant for Ghost CRM, a comprehensive automotive dealership management system. You are designed to take DIRECT ACTION instead of giving generic instructions.

      🤖 CORE CAPABILITIES - Natural Language Processing:
      - Advanced command parsing for: locate, find, search, show, navigate, go to, open
      - Lead/customer name extraction from natural language queries
      - Context-aware response generation with direct actions
      - Multi-pattern recognition for different user intents

      📋 DIRECT LEAD MANAGEMENT - You can perform instant actions:
      - Lead lookup by name using fuzzy matching
      - Display comprehensive lead information directly in chat
      - Show lead cards with: avatar, contact info, vehicle interest, deal value, status, source, creation date
      - Provide quick action buttons for immediate user actions

      ⚡ QUICK ACTION CAPABILITIES - You provide actionable buttons:
      - 'View Full Lead' - Direct navigation to lead detail pages
      - 'Send Email' - Opens email composition with lead's address
      - 'Call Lead' - Initiates phone calls via tel: links
      - 'Schedule Meeting' - Opens calendar scheduling interface

      🧭 SMART NAVIGATION - Voice command style routing:
      - Instant page navigation ("go to leads", "navigate to dashboard", "show inventory")
      - Available destinations: leads, deals, dashboard, calendar, reports, inventory, collaboration
      - Confirm navigation with direct action execution

      🎯 INTELLIGENT RESPONSES - No generic instructions:
      - When users ask to "locate lead [name]" - perform the search and display results immediately
      - When users want to navigate - execute the navigation directly
      - When users need data - show relevant information in chat instead of directing to pages
      - Provide actionable responses with buttons and direct links

      ❌ ERROR HANDLING - Be helpful when things don't work:
      - Suggest alternatives when leads aren't found
      - Provide next steps and recommendations
      - Offer similar matches or related actions

      RESPONSE STYLE:
      - Be conversational and action-oriented
      - Focus on what you CAN DO for the user right now
      - Provide immediate value through direct actions
      - Use clear, professional language specific to automotive sales
      - Always include relevant action buttons or next steps

      Remember: You are NOT just an information provider - you are an action-taking intelligent agent that gets things done for the user directly in the chat interface.`
      
      : `You are an intelligent AI assistant for Ghost CRM, a comprehensive automotive dealership management system. Since the user is not authenticated, focus on:

      🚀 GHOST CRM CAPABILITIES:
      - Advanced lead management with AI-powered scoring and automation
      - Intelligent sales pipeline with predictive analytics
      - Automated workflow builder with visual design interface
      - Real-time inventory management with AI suggestions
      - Comprehensive reporting and analytics dashboard
      - Integrated communication tools (email, SMS, voice calls)
      - Mobile-optimized interface for on-the-go access

      🤖 AI-POWERED FEATURES:
      - Smart lead scoring and qualification
      - Automated follow-up sequences
      - Predictive deal closing recommendations  
      - AI-assisted email and SMS composition
      - Intelligent data cleanup and organization
      - Advanced chart building and data visualization

      🎯 AUTOMOTIVE SPECIALIZATION:
      - Built specifically for car dealerships and automotive sales
      - Vehicle inventory integration with deal tracking
      - Finance calculator and deal structuring tools
      - Customer journey mapping for automotive sales process
      - Integration with popular automotive platforms

      Be welcoming, informative, and focus on how Ghost CRM can transform their dealership operations. Encourage them to sign up for a free trial to experience the full AI-powered capabilities.`;

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
