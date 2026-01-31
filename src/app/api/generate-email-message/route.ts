import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getUserFromRequest, isAuthenticated } from '@/lib/auth/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // Initialize OpenAI with environment credentials at runtime
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    // Check authentication using Supabase SSR
    if (!(await isAuthenticated(req))) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get user data from Supabase session
    const user = await getUserFromRequest(req);
    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'User or organization not found' }, { status: 401 });
    }

    const { organizationId: orgId } = user;
    console.log('🔍 [EMAIL API] Authentication successful:', { 
      orgId, 
      orgName: 'your dealership' // Will be dynamically extracted later
    });

    // Parse request body
    const { leadData, emailType = "followup", tone = "professional" } = await req.json();

    if (!leadData || !leadData.first_name) {
      return NextResponse.json({ error: 'Lead data with first_name required' }, { status: 400 });
    }

    console.log('🤖 [EMAIL API] Generating AI email message...');

    // Create context-aware prompt for email generation
    const companyName = "your dealership"; // Will be extracted from org data later
    
    const leadContext = `
Lead Information:
- Name: ${leadData.first_name} ${leadData.last_name || ''}
- Email: ${leadData.email || 'Not provided'}
- Stage: ${leadData.stage || 'inquiry'}
- Vehicle Interest: ${leadData.vehicle_interest || 'vehicles'}
- Budget Range: ${leadData.budget_range || 'Not specified'}
- Source: ${leadData.source || 'website'}
- Description: ${leadData.description || 'Interested in purchasing a vehicle'}
`.trim();

    const emailTypePrompts = {
      marketing: "Create a marketing email promoting current inventory and special offers",
      followup: "Create a follow-up email to check in on the lead's interest and next steps",
      appointment: "Create an email to schedule or confirm an appointment for vehicle viewing",
      thankyou: "Create a thank you email for the lead's interest and time",
      information: "Create an informational email providing requested details about vehicles",
      promotion: "Create a promotional email about current deals and incentives",
      reminder: "Create a friendly reminder email about pending actions or appointments"
    };

    const toneInstructions = {
      professional: "Use a professional, business-appropriate tone",
      friendly: "Use a warm, friendly, and approachable tone",
      urgent: "Use an urgent but respectful tone that encourages quick action",
      casual: "Use a casual, conversational tone while remaining respectful"
    };

    const prompt = `
You are a sales representative at ${companyName}, an automotive dealership. Write a personalized email to a potential customer.

${leadContext}

Email Type: ${emailTypePrompts[emailType as keyof typeof emailTypePrompts] || emailTypePrompts.followup}
Tone: ${toneInstructions[tone as keyof typeof toneInstructions] || toneInstructions.professional}

Requirements:
1. Address the customer by their first name
2. Reference their specific vehicle interest and stage in the sales process
3. Include a clear call to action
4. Keep the email professional yet personal
5. Mention the dealership name (${companyName}) naturally
6. Include relevant details based on the email type
7. Keep it concise but informative (150-300 words)
8. Include appropriate greeting and sign-off
9. Do NOT use placeholder text like [Your Name] - end with "Best regards," only

Write the complete email content:
    `.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert automotive sales representative who writes personalized, effective emails to potential customers. Your emails are professional, engaging, and drive action while building relationships."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    const emailContent = completion.choices[0]?.message?.content?.trim();

    if (!emailContent) {
      throw new Error('Failed to generate email content');
    }

    console.log('✅ [EMAIL API] AI email generated successfully');

    return NextResponse.json({
      emailContent,
      metadata: {
        type: emailType,
        tone,
        leadName: `${leadData.first_name} ${leadData.last_name || ''}`.trim(),
        companyName
      }
    });

  } catch (error) {
    console.error('❌ [EMAIL API] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate email message',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}