// Main fallback script manager for multilingual AI call agents
// Intelligently selects appropriate language and flow based on agent type and customer preference

import { 
  generateEnglishProfessionalFlow, 
  generateEnglishAggressiveFlow, 
  generateEnglishFriendlyFlow, 
  generateEnglishConsultativeFlow 
} from './englishFallbackScripts';

import { 
  generateSpanishProfessionalFlow, 
  generateSpanishFriendlyFlow, 
  generateSpanishAggressiveFlow, 
  generateSpanishConsultativeFlow 
} from './spanishFallbackScripts';

interface Lead {
  [key: string]: any;
  "Full Name"?: string;
  "Phone Number"?: string;
  "Stage"?: string;
  "Vehicle Interest"?: string;
  "Budget Range"?: string;
}

interface AgentType {
  id: string;
  name: string;
  description: string;
  features: string[];
  voice: string;
  language: string;
}

// Enhanced fallback system with intelligent language routing
export const generateAdvancedFallbackScript = (
  lead: Lead | null, 
  agentType: string,
  agentTypes: AgentType[]
) => {
  if (!lead) return "";
  
  const leadName = lead["Full Name"] || "there";
  const vehicleInterest = lead["Vehicle Interest"] || "a vehicle";
  const budgetRange = lead["Budget Range"];
  const selectedAgent = agentTypes.find(agent => agent.id === agentType);
  const agentLanguage = selectedAgent?.language || "en";
  
  // Intelligent conversation flow selection based on agent type and language
  const conversationFlows = {
    // English flows
    'professional-female': () => generateEnglishProfessionalFlow(leadName, vehicleInterest, budgetRange),
    'professional-male': () => generateEnglishProfessionalFlow(leadName, vehicleInterest, budgetRange),
    'aggressive-male': () => generateEnglishAggressiveFlow(leadName, vehicleInterest, budgetRange),
    'friendly-female': () => generateEnglishFriendlyFlow(leadName, vehicleInterest, budgetRange),
    'consultative-male': () => generateEnglishConsultativeFlow(leadName, vehicleInterest, budgetRange),
    
    // Spanish flows
    'professional-female-es': () => generateSpanishProfessionalFlow(leadName, vehicleInterest, budgetRange),
    'friendly-male-es': () => generateSpanishFriendlyFlow(leadName, vehicleInterest, budgetRange),
    'aggressive-male-es': () => generateSpanishAggressiveFlow(leadName, vehicleInterest, budgetRange),
    'consultative-male-es': () => generateSpanishConsultativeFlow(leadName, vehicleInterest, budgetRange)
  };

  // Get the appropriate conversation script
  const flowFunction = conversationFlows[agentType as keyof typeof conversationFlows] || 
                      conversationFlows['professional-female'];
  
  const conversationScript = flowFunction();
  
  // Add multilingual system notes
  const systemNotes = generateSystemNotes(agentLanguage, selectedAgent);
  
  return `${conversationScript}

${systemNotes}`;
};

// Generate intelligent system notes based on agent language and type
const generateSystemNotes = (agentLanguage: string, selectedAgent: AgentType | undefined) => {
  const isSpanishAgent = agentLanguage === 'es';
  const agentPersonality = selectedAgent?.description || "professional approach";
  
  return `
📞 LIVE AI AGENT NOTES (${isSpanishAgent ? 'SPANISH FALLBACK' : 'ENGLISH FALLBACK'}):
- This conversation will be transcribed in real-time via Whisper
- ${isSpanishAgent ? 'Sistema configurado para conversación en español' : 'System configured for English conversation'}
- Language switching available if customer requests different language
- Agent personality: ${agentPersonality}
- Adapt responses based on customer tone and engagement
- Log key decision points and objections for follow-up
- Maintain natural conversation flow while hitting key sales points
- Customer responses will be captured and analyzed for next actions

🌐 MULTILINGUAL FALLBACK INTELLIGENCE:
- Primary language: ${isSpanishAgent ? 'Spanish (Español)' : 'English'}
- Backup language support: ${isSpanishAgent ? 'English available on request' : 'Spanish available on request'}
- Cultural adaptation: ${isSpanishAgent ? 'Hispanic/Latino business communication styles' : 'North American business communication styles'}
- Emergency language transfer: Available for unsupported languages
- Whisper transcription: Maintains English logs regardless of conversation language

🔄 FALLBACK SYSTEM STATUS:
- OpenAI API: Currently unavailable (using enhanced templates)
- Conversation quality: High (culturally-adapted scripts)
- Language accuracy: Native-level fluency maintained
- Sales effectiveness: Optimized for conversion in preferred language`;
};

// Language detection helper for intelligent routing
export const detectCustomerLanguagePreference = (customerResponse: string): 'en' | 'es' | 'other' => {
  if (!customerResponse) return 'en'; // Default to English
  
  const spanishIndicators = [
    'español', 'hablar español', 'en español', 'prefiero español',
    'sí, español', 'spanish por favor', 'no inglés', 'no english'
  ];
  
  const englishIndicators = [
    'english', 'yes english', 'continue in english', 'english please',
    'i prefer english', 'stay in english'
  ];
  
  const response = customerResponse.toLowerCase();
  
  if (spanishIndicators.some(indicator => response.includes(indicator))) {
    return 'es';
  }
  
  if (englishIndicators.some(indicator => response.includes(indicator))) {
    return 'en';
  }
  
  // If unclear, check for Spanish language patterns
  const spanishPatterns = ['sí', 'no hablo', 'me gusta', 'quiero', 'necesito', 'gracias'];
  if (spanishPatterns.some(pattern => response.includes(pattern))) {
    return 'es';
  }
  
  return 'other'; // Requires human agent transfer
};

// Agent type mapping for language switching
export const getLanguageSwitchedAgentType = (currentAgentType: string, targetLanguage: 'en' | 'es'): string => {
  const agentMappings = {
    // English to Spanish mappings
    'professional-female': 'professional-female-es',
    'professional-male': 'professional-female-es', // Default to female Spanish professional
    'aggressive-male': 'aggressive-male-es',
    'friendly-female': 'friendly-male-es',
    'consultative-male': 'consultative-male-es',
    
    // Spanish to English mappings
    'professional-female-es': 'professional-female',
    'friendly-male-es': 'friendly-female',
    'aggressive-male-es': 'aggressive-male',
    'consultative-male-es': 'consultative-male'
  };
  
  if (targetLanguage === 'es' && !currentAgentType.includes('-es')) {
    return agentMappings[currentAgentType as keyof typeof agentMappings] || 'professional-female-es';
  }
  
  if (targetLanguage === 'en' && currentAgentType.includes('-es')) {
    return agentMappings[currentAgentType as keyof typeof agentMappings] || 'professional-female';
  }
  
  return currentAgentType; // No change needed
};