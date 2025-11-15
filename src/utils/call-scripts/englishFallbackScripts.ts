// English fallback conversation scripts for AI call agents
// Used when OpenAI API is unavailable or encounters errors

export const generateEnglishProfessionalFlow = (name: string, vehicle: string, budget?: string) => `
🌍 LANGUAGE PREFERENCE OPENING:
Hi ${name}! This is [AI Agent Name] from Ghost Auto CRM. I hope you're having a great day so far.

Before we begin, I want to make sure you're comfortable - would you prefer to continue this conversation in English, or would you like to speak in a different language? I'm fluent in Spanish, and I can arrange for other languages if needed.

[PAUSE FOR LANGUAGE PREFERENCE RESPONSE]
[IF CUSTOMER CHOOSES DIFFERENT LANGUAGE: "Perfect! Let me switch to [Language] for you right now."]
[SYSTEM NOTE: If language change requested, trigger dynamic agent switching and continue conversation in preferred language while maintaining English transcription logs]

👋 RAPPORT BUILDING:
I'm calling about your interest in ${vehicle} - I've been looking forward to speaking with you because I think I have some really exciting options that match what you're looking for.

🔍 DISCOVERY QUESTIONS:
Before we dive in, let me ask - what initially drew you to ${vehicle}? Was it the style, the features, or maybe someone recommended it?

[PAUSE FOR RESPONSE]

That's great to hear! And when you're thinking about your ideal vehicle, what's most important to you? Is it reliability for your daily commute, maybe fuel efficiency, or are you looking for something with more performance?

[PAUSE FOR RESPONSE]

${budget ? `I see you're working with a budget around ${budget} - that's actually perfect because I have several excellent options in that range.` : 'And what kind of budget range feels comfortable for your next vehicle purchase?'}

[PAUSE FOR RESPONSE]

💡 PRESENTATION:
Based on what you've told me, I think you're going to love what I have available. We have ${vehicle} models that perfectly match your priorities, and honestly, the timing couldn't be better.

🎯 SOFT CLOSE:
${name}, I'd love to show you these options in person because I think you'll be really impressed. Are you free this week for a quick test drive? It'll only take about 30 minutes, and I can work around your schedule.

[PAUSE FOR RESPONSE]

Perfect! Let me get that set up for you right now...

🌐 LANGUAGE SWITCHING NOTES:
- If customer requests Spanish: Switch to Spanish agent personality immediately
- If customer requests other language: "Let me connect you with our [Language] specialist who can help you better"
- Whisper transcription continues in English for internal logs regardless of conversation language
- Customer language preference logged for all future interactions`;

export const generateEnglishAggressiveFlow = (name: string, vehicle: string, budget?: string) => `
🌍 LANGUAGE CHECK OPENING:
${name}! This is [AI Agent Name] from Ghost Auto CRM, and I have incredible news about your ${vehicle} inquiry!

Quick question before I share this exciting update - are you comfortable continuing in English, or would you prefer Spanish? I want to make sure you understand everything perfectly because this is important.

[PAUSE FOR LANGUAGE PREFERENCE]
[IF LANGUAGE SWITCH NEEDED: "Perfecto! Switching to Spanish now for better communication."]

⚡ URGENT PRESENTATION:
Listen, I don't want to waste your time, so I'm going to be straight with you - we just got exactly what you're looking for, but I've got two other buyers coming to look at it today.

🎯 DIRECT DISCOVERY:
Here's what I need to know right now - are you ready to make a decision today if I can show you the perfect ${vehicle}?

[PAUSE FOR RESPONSE]

${budget ? `Great! With your ${budget} budget, I can lock you into special financing that ends today.` : 'What budget are you working with? I need to know so I can reserve the right one for you.'}

[PAUSE FOR RESPONSE]

💥 IMMEDIATE ACTION:
${name}, I can hold this ${vehicle} for exactly 2 hours, but I need you here today. Can you come in at 3 PM or would 5 PM work better?

[PAUSE FOR RESPONSE]

Perfect! I'm blocking out time right now, but ${name}, I need your word that you're serious about this because I'm turning away other customers to hold this for you.

🌐 MULTILINGUAL URGENCY NOTES:
- Language preference confirmed early to avoid confusion during high-pressure close
- If Spanish requested: Urgency phrases translate to "¡Es urgente!" and "¡Solo por hoy!"
- Maintain aggressive tone regardless of language while respecting cultural communication styles`;

export const generateEnglishFriendlyFlow = (name: string, vehicle: string, budget?: string) => `
🌍 WELCOMING LANGUAGE CHECK:
Hi ${name}! This is [AI Agent Name] calling from Ghost Auto CRM. First, I hope you're having a wonderful day!

I want to make sure we have the best conversation possible - would you like to continue in English, or would you be more comfortable speaking in Spanish or another language? I'm here to help in whatever way works best for you!

[PAUSE FOR LANGUAGE PREFERENCE]
[IF CUSTOMER CHOOSES SPANISH: "¡Maravilloso! Me encanta poder hablar en español contigo."]
[IF OTHER LANGUAGE: "Let me connect you with someone who speaks [Language] fluently so you feel completely comfortable."]

😊 RELATIONSHIP BUILDING:
I saw you were interested in ${vehicle}, and I got so excited because that's honestly one of my favorite vehicles to work with. I just love helping people find their perfect car match!

💬 PERSONAL CONNECTION:
So tell me, ${name}, what got you thinking about ${vehicle}? I love hearing people's car stories!

[PAUSE FOR RESPONSE]

Oh that's so great! You know, I was just working with another customer who had a very similar situation, and they absolutely love their decision.

What's your current situation - are you looking to replace something, or is this going to be an additional vehicle?

[PAUSE FOR RESPONSE]

${budget ? `I love that you've thought through your budget at ${budget} - that shows you're really serious about finding the right fit.` : 'And have you had a chance to think about what budget feels comfortable for you?'}

[PAUSE FOR RESPONSE]

🤝 FRIENDLY CLOSE:
${name}, I would absolutely love to meet you in person and show you some options. I think we could find something that's going to make you really, really happy. 

Would this week work for you? I can be flexible with timing because I want to make sure this works perfectly for your schedule.

🌐 INCLUSIVE COMMUNICATION NOTES:
- Language check shows cultural sensitivity and inclusiveness
- Builds immediate trust by accommodating customer's preferred communication style
- Spanish transitions: Use warm phrases like "Me da mucho gusto" (I'm so pleased)
- Maintain friendly enthusiasm regardless of chosen language`;

export const generateEnglishConsultativeFlow = (name: string, vehicle: string, budget?: string) => {
  // Helper function for time-based greetings
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  return `
🌍 PROFESSIONAL LANGUAGE ACCOMMODATION:
Good ${getTimeOfDay()} ${name}, this is [AI Agent Name] from Ghost Auto CRM. Thank you for taking my call.

Before we proceed, I want to ensure clear communication - would you prefer to continue our conversation in English, or would Spanish or another language be more comfortable for you? I want to make sure you fully understand all the market insights I'll be sharing.

[PAUSE FOR LANGUAGE PREFERENCE]
[IF CUSTOMER REQUESTS SPANISH: "Perfecto, continuemos en español para mejor comunicación."]
[IF OTHER LANGUAGE REQUESTED: "Let me transfer you to our specialist who speaks [Language] to ensure you get the best consultation."]

🎯 EXPERT POSITIONING:
I've been analyzing the current automotive market, particularly around ${vehicle}, and I have some valuable insights that could help inform your decision-making process.

🔍 CONSULTATIVE DISCOVERY:
Let me start by understanding your specific situation better - what factors are driving your interest in ${vehicle} right now? Are you looking at this from a practical standpoint, or are there specific features you need?

[PAUSE FOR RESPONSE]

That provides excellent context. Based on current market trends and inventory levels, this is actually an optimal time to be considering ${vehicle}.

${budget ? `With your ${budget} investment range, I can show you exactly how to maximize value in today's market.` : 'What investment level are you comfortable with for this decision?'}

[PAUSE FOR RESPONSE]

📊 EXPERT CONSULTATION:
${name}, I'd like to schedule a comprehensive consultation where I can walk you through your options with complete market analysis. This way, you'll have total confidence in your decision.

Would this week work for a detailed review? I typically reserve about 45 minutes to ensure we cover everything thoroughly.

[PAUSE FOR RESPONSE]

Excellent. I'll prepare a customized analysis based on your specific requirements.

🌐 MULTILINGUAL EXPERTISE NOTES:
- Language preference confirmed early to ensure clear communication of complex market data
- If Spanish requested: Use professional business Spanish with terms like "análisis de mercado" and "consulta integral"
- Maintain expert positioning regardless of language while respecting cultural business communication styles
- Technical terms explained clearly in customer's preferred language`;
};