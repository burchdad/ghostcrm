/**
 * AI Agents Business Metrics API Route
 * 
 * Endpoint for getting business intelligence and metrics from the AI agents
 */

import { NextRequest, NextResponse } from 'next/server';
import { BusinessIntelligenceAgent } from '@/ai-agents';

let businessAgent: BusinessIntelligenceAgent | null = null;

// Initialize the business intelligence agent
async function getBusinessAgent() {
  if (!businessAgent) {
    businessAgent = new BusinessIntelligenceAgent();
    await businessAgent.initialize();
    await businessAgent.start();
  }
  return businessAgent;
}

// GET /api/agents/business - Get business metrics and insights
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || 'system';
    const type = searchParams.get('type') || 'summary';
    
    const agent = await getBusinessAgent();
    
    if (type === 'insights') {
      // Get proactive business insights
      const insights = await agent.getProactiveInsights(userId);
      
      return NextResponse.json({
        success: true,
        data: {
          insights,
          timestamp: new Date().toISOString(),
        }
      });
      
    } else if (type === 'metrics') {
      // Get business metrics summary
      const metrics = await agent.getBusinessMetricsSummary();
      
      return NextResponse.json({
        success: true,
        data: {
          metrics,
          timestamp: new Date().toISOString(),
        }
      });
      
    } else {
      // Get complete business summary
      const [insights, metrics] = await Promise.all([
        agent.getProactiveInsights(userId),
        agent.getBusinessMetricsSummary(),
      ]);
      
      return NextResponse.json({
        success: true,
        data: {
          insights,
          metrics,
          timestamp: new Date().toISOString(),
        }
      });
    }
    
  } catch (error) {
    console.error('Failed to get business data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get business data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/agents/business - Ask business question
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, userId, sessionId } = body;
    
    if (!question || !userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Question and userId are required' 
        },
        { status: 400 }
      );
    }
    
    const agent = await getBusinessAgent();
    const response = await agent.askBusinessQuestion(question, userId, sessionId);
    
    return NextResponse.json({
      success: true,
      data: {
        answer: response.answer,
        insights: response.insights,
        recommendations: response.recommendations,
        followUpQuestions: response.followUpQuestions,
        data: response.data,
        timestamp: new Date().toISOString(),
      }
    });
    
  } catch (error) {
    console.error('Failed to process business question:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process business question',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}