import { NextRequest, NextResponse } from "next/server";

// Use Node.js runtime to avoid Edge Runtime issues with Supabase
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { type, leadData } = await req.json();
    
    // Generate email based on type and lead data
    const email = generateEmail(type, leadData);
    
    return NextResponse.json({ email });
  } catch (error) {
    console.error("Failed to generate email:", error);
    return NextResponse.json(
      { error: "Failed to generate email" }, 
      { status: 500 }
    );
  }
}

function generateEmail(type: string, leadData: any) {
  const { name, company, industry, stage } = leadData;
  
  const templates = {
    welcome: {
      id: `welcome-${Date.now()}`,
      type: "welcome",
      subject: `Welcome to our community, ${name}!`,
      content: `Hi ${name},

Welcome to our community! I noticed you're with ${company || 'your company'} ${industry ? `in the ${industry} industry` : ''}.

We specialize in helping businesses like yours achieve their goals through innovative solutions. I'd love to learn more about your current challenges and see how we can help.

Would you be available for a brief 15-minute call this week to discuss your needs?

Looking forward to connecting!

Best regards,
[Your Name]
[Your Company]`,
      personalized: !!(name && company)
    },
    
    followup: {
      id: `followup-${Date.now()}`,
      type: "followup",
      subject: `Following up on our conversation, ${name}`,
      content: `Hi ${name},

I hope this email finds you well. I wanted to follow up on our previous conversation about ${company}'s needs.

Based on our discussion, I believe we can help ${company} ${industry ? `in the ${industry} sector` : ''} by:
• Streamlining your current processes
• Improving efficiency and productivity  
• Reducing operational costs

I've prepared some specific recommendations tailored to your situation. Would you like to schedule a call to discuss these in detail?

I'm available at your convenience this week.

Best regards,
[Your Name]`,
      personalized: !!(name && company)
    },
    
    proposal: {
      id: `proposal-${Date.now()}`,
      type: "proposal",
      subject: `Proposal for ${company || 'your business'} - Next Steps`,
      content: `Hi ${name},

Thank you for taking the time to discuss ${company}'s requirements with me. Based on our conversation, I'm excited to present a customized solution.

**Proposal Summary:**
${industry ? `For ${industry} businesses like ${company}, ` : ''}we recommend our comprehensive package that includes:

• Solution Component 1 - Tailored to your specific needs
• Solution Component 2 - Addressing your key challenges  
• Solution Component 3 - Ensuring long-term success

**Next Steps:**
1. Review the attached detailed proposal
2. Schedule a presentation call
3. Discuss implementation timeline

I'm confident this solution will deliver the results ${company} is looking for. 

When would be a good time for a 30-minute call to walk through the proposal?

Best regards,
[Your Name]`,
      personalized: !!(name && company)
    },
    
    nurture: {
      id: `nurture-${Date.now()}`,
      type: "nurture",
      subject: `Valuable insights for ${company || 'your business'}`,
      content: `Hi ${name},

I hope you're having a great week! I came across some insights that might be valuable for ${company || 'your business'}${industry ? ` in the ${industry} industry` : ''}.

**Industry Trend Alert:**
${industry ? `The ${industry} sector` : 'Your industry'} is seeing significant changes that could impact your business:

• Trend 1: [Relevant industry development]
• Trend 2: [Technology advancement]  
• Trend 3: [Market opportunity]

**Quick Question:**
How is ${company || 'your company'} preparing for these changes? I'd love to hear your perspective.

If you're interested in discussing strategies to stay ahead of these trends, I'm happy to share some best practices we've seen work well.

No pressure - just wanted to keep you informed!

Best regards,
[Your Name]`,
      personalized: !!(name && (company || industry))
    },
    
    closing: {
      id: `closing-${Date.now()}`,
      type: "closing",
      subject: `Ready to move forward with ${company}?`,
      content: `Hi ${name},

I hope you've had a chance to review our proposal for ${company || 'your business'}.

We're excited about the opportunity to partner with ${company}${industry ? ` and help drive success in the ${industry} industry` : ''}.

**Why Act Now:**
• Limited-time implementation discount
• Faster time to value
• Dedicated support during setup

I understand decision-making takes time, but I wanted to check if you have any final questions or concerns I can address.

Our implementation team has an opening next month, which would be perfect timing for ${company} to see results before [relevant business period].

Are you ready to move forward, or is there anything else you need from our side?

I'm here to make this as smooth as possible for you.

Best regards,
[Your Name]

P.S. If timing isn't right now, no worries - just let me know when might work better for ${company}.`,
      personalized: !!(name && company)
    }
  };
  
  return templates[type as keyof typeof templates] || templates.welcome;
}