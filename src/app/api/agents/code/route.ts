import { NextRequest, NextResponse } from 'next/server';
import { CodeIntelligenceAgent } from '@/ai-agents/agents/CodeIntelligenceAgent';
import path from 'path';


export const dynamic = 'force-dynamic';
// Runtime configuration
export const runtime = 'nodejs';

// Function to safely get or create agent instance
function getSafeCodeAgent() {
  try {
    // Only create agent if OpenAI is configured
    if (!process.env.OPENAI_API_KEY) {
      console.log('🔄 OpenAI API key not configured, agent features disabled');
      return null;
    }
    return new CodeIntelligenceAgent();
  } catch (error) {
    console.error('💻 Failed to create Code Intelligence Agent:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const codeAgent = getSafeCodeAgent();
    
    if (!codeAgent) {
      return NextResponse.json({
        success: true,
        agent: {
          id: 'code-intelligence',
          name: 'Code Intelligence Agent',
          description: 'Code analysis and improvement (OpenAI API key required)',
          version: '1.0.0',
          status: 'unavailable',
          lastScan: new Date().toISOString(),
          codebaseHealth: 'unknown',
          issues: [],
          features: [],
          improvements: [],
          metrics: {},
          recommendations: ['Configure OpenAI API key to enable code intelligence features']
        }
      });
    }

    // Initialize the agent if needed
    await codeAgent.initialize();
    
    const status = await codeAgent.getCodeAnalysisStatus();
    
    return NextResponse.json({
      success: true,
      agent: {
        id: codeAgent.id,
        name: codeAgent.name,
        description: codeAgent.description,
        version: codeAgent.version,
        status: status.status,
        lastScan: status.lastScan,
        codebaseHealth: status.codebaseHealth,
        issues: status.issues,
        features: status.features,
        improvements: status.improvements,
        metrics: status.metrics,
        recommendations: status.recommendations
      }
    });
  } catch (error) {
    console.error('💻 [CODE_API] Error getting status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get code intelligence agent status',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const codeAgent = getSafeCodeAgent();
    
    if (!codeAgent) {
      return NextResponse.json({
        success: false,
        error: 'Code Intelligence Agent unavailable. OpenAI API key required.',
      }, { status: 503 });
    }

    const body = await request.json();
    const { action, params } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Action is required' },
        { status: 400 }
      );
    }

    // Initialize the agent if needed
    await codeAgent.initialize();

    const result = await codeAgent.performAction(action, params);

    return NextResponse.json({
      success: true,
      action,
      result
    });
  } catch (error) {
    console.error('💻 [CODE_API] Error performing action:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to perform code intelligence action',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

//  Additional endpoints for specific code intelligence features
export async function PUT(request: NextRequest) {
  try {
    const codeAgent = getSafeCodeAgent();
    
    if (!codeAgent) {
      return NextResponse.json({
        success: false,
        error: 'Code Intelligence Agent unavailable. OpenAI API key required.',
      }, { status: 503 });
    }

    // Initialize the agent if needed
    await codeAgent.initialize();

    const body = await request.json();
    const { type, data } = body;

    switch (type) {
      case 'scan_file':
        if (!data.filePath) {
          return NextResponse.json(
            { success: false, error: 'File path is required' },
            { status: 400 }
          );
        }
        
        const fileAnalysis = await codeAgent.performAction('analyze_file', { filePath: data.filePath });
        return NextResponse.json({
          success: true,
          type: 'file_analysis',
          result: fileAnalysis
        });

      case 'generate_fix':
        if (!data.issueId) {
          return NextResponse.json(
            { success: false, error: 'Issue ID is required' },
            { status: 400 }
          );
        }
        
        const fix = await codeAgent.performAction('fix_issue', { issueId: data.issueId });
        return NextResponse.json({
          success: true,
          type: 'issue_fix',
          result: fix
        });

      case 'feature_request':
        if (!data.description) {
          return NextResponse.json(
            { success: false, error: 'Feature description is required' },
            { status: 400 }
          );
        }
        
        const feature = await codeAgent.performAction('build_feature', { featureDescription: data.description });
        return NextResponse.json({
          success: true,
          type: 'feature_analysis',
          result: feature
        });

      case 'code_review':
        if (!data.target) {
          return NextResponse.json(
            { success: false, error: 'Review target (file path or diff) is required' },
            { status: 400 }
          );
        }
        
        const review = await codeAgent.performAction('code_review', { filePath: data.target });
        return NextResponse.json({
          success: true,
          type: 'code_review',
          result: review
        });

      default:
        return NextResponse.json(
          { success: false, error: `Unknown operation type: ${type}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('💻 [CODE_API] Error in PUT operation:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to perform code intelligence operation',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
