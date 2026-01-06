// AI SMS Message Generation API
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, isAuthenticated } from '@/lib/auth/server';

export async function POST(request: NextRequest) {
  try {
    // Check authentication using Supabase SSR
    if (!(await isAuthenticated(request))) {
      console.error('❌ [SMS API] Authentication failed');
      return NextResponse.json(
        { error: 'No authentication token found' },
        { status: 401 }
      );
    }

    // Get user data from Supabase session
    const user = await getUserFromRequest(request);
    if (!user || !user.organizationId) {
      console.error('❌ [SMS API] User or organization not found');
      return NextResponse.json(
        { error: 'User or organization not found' },
        { status: 401 }
      );
    }

    const orgId = user.organizationId;
    const orgName = 'your dealership'; // Default fallback
    
    console.log('🔍 [SMS API] Authentication successful:', {
      orgId: orgId,
      orgName: orgName
    });
    
    const { 
      leadData,
      messageType = 'followup', // followup, appointment, price_quote, etc.
      tone = 'professional' // professional, friendly, urgent
    } = await request.json();

    if (!leadData) {
      return NextResponse.json(
        { error: 'Missing lead data' },
        { status: 400 }
      );
    }

    // Extract lead information
    const leadName = leadData["Full Name"] || leadData.name || "there";
    const leadStage = leadData["Stage"] || leadData.stage || "inquiry";
    const vehicleInterest = leadData["Vehicle Interest"] || leadData.vehicleInterest || "vehicle";
    const budgetRange = leadData["Budget Range"] || leadData.budgetRange;
    const leadSource = leadData["Lead Source"] || leadData.source;

    // Generate AI SMS message
    const smsMessage = await generateAISMSMessage({
      leadName,
      leadStage,
      vehicleInterest,
      budgetRange,
      leadSource,
      organizationName: orgName,
      messageType,
      tone
    });

    return NextResponse.json({
      success: true,
      message: smsMessage,
      characterCount: smsMessage.length,
      isLongMessage: smsMessage.length > 160
    });

  } catch (error) {
    console.error('Error generating SMS message:', error);
    return NextResponse.json(
      { error: 'Internal server error during SMS generation' },
      { status: 500 }
    );
  }
}

interface SMSGenerationParams {
  leadName: string;
  leadStage: string;
  vehicleInterest: string;
  budgetRange?: string;
  leadSource?: string;
  organizationName: string;
  messageType: string;
  tone: string;
}

async function generateAISMSMessage(params: SMSGenerationParams): Promise<string> {
  const {
    leadName,
    leadStage,
    vehicleInterest,
    budgetRange,
    leadSource,
    organizationName,
    messageType,
    tone
  } = params;

  try {
    // Create context-aware prompt for AI SMS generation
    const prompt = `Generate a personalized SMS message for a car dealership lead with these details:

Lead Info:
- Name: ${leadName}
- Stage: ${leadStage}
- Vehicle Interest: ${vehicleInterest}
- Budget: ${budgetRange || 'Not specified'}
- Lead Source: ${leadSource || 'Not specified'}

Business Info:
- Company Name: ${organizationName}
- Message Type: ${messageType}
- Tone: ${tone}

Requirements:
- Sound like a real person, not automated
- Keep under 150 characters for single SMS
- Include the company name naturally
- Be specific to their vehicle interest and stage
- Create urgency without being pushy
- Use a conversational, human tone
- Don't use generic templates

Generate a natural, personalized SMS that feels like it's from a real sales person who knows this lead's specific situation.`;

    // Try to use OpenAI for AI generation
    if (process.env.OPENAI_API_KEY) {
      console.log('🤖 [SMS API] Generating AI SMS message...');
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are an expert car sales professional who writes personalized, human SMS messages. Always sound natural and conversational, never robotic.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 100,
          temperature: 0.8 // Higher creativity for more natural messages
        })
      });
      
      const data = await response.json();
      const aiMessage = data.choices?.[0]?.message?.content?.trim();
      
      if (aiMessage) {
        console.log('✅ [SMS API] AI message generated successfully');
        return aiMessage;
      }
    }
    
    // Fallback to intelligent template system if AI fails
    console.log('⚠️ [SMS API] Using fallback template system');
    return generateIntelligentFallback(params);
    
  } catch (error) {
    console.error('❌ [SMS API] Error in AI generation:', error);
    return generateIntelligentFallback(params);
  }
}

function generateIntelligentFallback(params: SMSGenerationParams): string {
  const { leadName, leadStage, vehicleInterest, budgetRange, organizationName, messageType } = params;
  
  // Intelligent fallback based on stage and context
  switch (leadStage.toLowerCase()) {
    case "new":
    case "inquiry":
      if (budgetRange) {
        return `Hi ${leadName}! Found some great ${vehicleInterest} options in your ${budgetRange} range. Free for a quick call? - ${organizationName}`;
      }
      return `Hi ${leadName}! Thanks for your ${vehicleInterest} inquiry. When's a good time to show you our best options? - ${organizationName}`;
      
    case "qualified":
    case "contacted":
      return `${leadName}, that ${vehicleInterest} you liked just got some new incentives. Want to lock in the deal? - ${organizationName}`;
      
    case "price_quote":
    case "financing":
      return `Great news ${leadName}! Your ${vehicleInterest} financing was approved with amazing terms. Can we finalize today? - ${organizationName}`;
      
    case "appointment":
      return `Hi ${leadName}! Confirming your appointment to see the ${vehicleInterest}. Still good for our scheduled time? - ${organizationName}`;
      
    default:
      return `${leadName}, new ${vehicleInterest} inventory just arrived! Thought you'd want first look. Interested? - ${organizationName}`;
  }
}