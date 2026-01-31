/**
 * AI Agents Chat API Route
 * 
 * Endpoint for conversational interactions with the AI agents
 */

import { NextRequest, NextResponse } from 'next/server';
import { ConversationalAgentManager } from '@/ai-agents';

let conversationalAgent: ConversationalAgentManager | null = null;

// Initialize the conversational agent
async function getConversationalAgent() {
  if (!conversationalAgent) {
    conversationalAgent = new ConversationalAgentManager();
    await conversationalAgent.initialize();
    await conversationalAgent.start();
  }
  return conversationalAgent;
}

// POST /api/agents/chat - Send message to conversational agent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, userId, sessionId } = body;
    
    if (!message || !userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Message and userId are required' 
        },
        { status: 400 }
      );
    }
    
    const agent = await getConversationalAgent();
    const response = await agent.chat(message, userId, sessionId);
    
    return NextResponse.json({
      success: true,
      data: {
        message: response.message,
        type: response.type,
        data: response.data,
        suggestedActions: response.suggestedActions,
        followUpQuestions: response.followUpQuestions,
        relatedInsights: response.relatedInsights,
        sessionId: sessionId || 'default',
        timestamp: new Date().toISOString(),
      }
    });
    
  } catch (error) {
    console.error('Failed to process chat message:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process chat message',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/agents/chat - Get conversation history
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');
    
    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'userId is required' 
        },
        { status: 400 }
      );
    }
    
    const agent = await getConversationalAgent();
    
    if (sessionId) {
      // Get specific conversation history
      const history = agent.getConversationHistory(userId, sessionId);
      return NextResponse.json({
        success: true,
        data: {
          messages: history,
          sessionId,
          userId,
        }
      });
    } else {
      // Get all user conversations
      const conversations = agent.getUserConversations(userId);
      return NextResponse.json({
        success: true,
        data: {
          conversations: conversations.map(conv => ({
            id: conv.id,
            title: conv.title,
            messageCount: conv.messages.length,
            lastActivity: conv.lastActivity,
            status: conv.status,
          })),
          userId,
        }
      });
    }
    
  } catch (error) {
    console.error('Failed to get conversation data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get conversation data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
