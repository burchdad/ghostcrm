"use client";
import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Phone, Bot, RefreshCw, FileText, BarChart3 } from 'lucide-react';
import { generateAdvancedFallbackScript, detectCustomerLanguagePreference, getLanguageSwitchedAgentType } from "../../utils/call-scripts/fallbackScriptManager";
import './AICallScriptModal.css';

interface Lead {
  "Full Name": string;
  "Phone Number": string;
  "Stage"?: string;
  "Vehicle Interest"?: string;
  "Budget Range"?: string;
}

interface CallObjective {
  id: string;
  text: string;
  checked: boolean;
}

interface AICallScriptModalProps {
  open: boolean;
  onClose: () => void;
  callLead: Lead | null;
  callConnecting: boolean;
  handleCallAction: () => void;
}

// ElevenLabs Voice Catalog with professional voices
const voiceCatalog = {
  female: [
    {
      id: "sarah",
      name: "Sarah",
      description: "Professional, warm, confident",
      elevenLabsId: "EXAVITQu4vr4xnSDxMaL", // Replace with actual ElevenLabs voice ID
      preview: "https://api.elevenlabs.io/v1/voices/EXAVITQu4vr4xnSDxMaL/preview",
      traits: ["Clear articulation", "Trustworthy tone", "Professional warmth"]
    },
    {
      id: "maria",
      name: "Maria (Bilingual)",
      description: "Professional Spanish/English, cultural sensitivity",
      elevenLabsId: "ErXwobaYiN019PkySvjV", // Replace with actual bilingual voice ID
      preview: "https://api.elevenlabs.io/v1/voices/ErXwobaYiN019PkySvjV/preview",
      traits: ["Native Spanish fluency", "Cultural awareness", "Professional bilingual"]
    },
    {
      id: "jessica",
      name: "Jessica",
      description: "Energetic, engaging, friendly",
      elevenLabsId: "cgSgspJ2msm6clMCkdW9", // Replace with actual ElevenLabs voice ID
      preview: "https://api.elevenlabs.io/v1/voices/cgSgspJ2msm6clMCkdW9/preview",
      traits: ["High energy", "Engaging personality", "Natural conversationalist"]
    }
  ],
  male: [
    {
      id: "michael",
      name: "Michael",
      description: "Authoritative, professional, trustworthy",
      elevenLabsId: "flq6f7yk4E4fJM5XTYuZ", // Replace with actual ElevenLabs voice ID
      preview: "https://api.elevenlabs.io/v1/voices/flq6f7yk4E4fJM5XTYuZ/preview",
      traits: ["Deep, authoritative tone", "Executive presence", "Trustworthy delivery"]
    },
    {
      id: "carlos",
      name: "Carlos (Bilingual)",
      description: "Professional Spanish/English, business expertise",
      elevenLabsId: "onwK4e9ZLuTAKqWW03F9", // Replace with actual bilingual voice ID
      preview: "https://api.elevenlabs.io/v1/voices/onwK4e9ZLuTAKqWW03F9/preview",
      traits: ["Business Spanish fluency", "Professional expertise", "Cultural business acumen"]
    },
    {
      id: "david",
      name: "David",
      description: "Consultative, knowledgeable, analytical",
      elevenLabsId: "AZnzlk1XvdvUeBnXmlld", // Replace with actual ElevenLabs voice ID
      preview: "https://api.elevenlabs.io/v1/voices/AZnzlk1XvdvUeBnXmlld/preview",
      traits: ["Analytical approach", "Expert knowledge", "Consultative style"]
    }
  ]
};

// Simplified agent configuration focusing on voice and language, not rigid personality
const agentConfig = {
  voices: voiceCatalog,
  defaultPersonality: "adaptive", // AI will adapt dynamically based on conversation flow
  supportedLanguages: ["en", "es"],
  personalityTraits: [
    "Authentic and natural",
    "Responsive to customer cues",
    "Adaptable communication style",
    "Professional yet personable",
    "Goal-oriented but not pushy"
  ]
};

const defaultCallObjectives = [
  { id: "1", text: "Qualify budget and timeline", checked: true },
  { id: "2", text: "Understand specific vehicle needs", checked: true },
  { id: "3", text: "Schedule test drive", checked: false },
  { id: "4", text: "Discuss financing options", checked: false }
];

export function AICallScriptModal({
  open,
  onClose,
  callLead,
  callConnecting,
  handleCallAction
}: AICallScriptModalProps) {
  const [callScript, setCallScript] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("sarah"); // Default to Sarah voice
  const [selectedGender, setSelectedGender] = useState<"male" | "female">("female");
  const [preferredLanguage, setPreferredLanguage] = useState("en");
  const [callObjectives, setCallObjectives] = useState<CallObjective[]>(defaultCallObjectives);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);

  // Generate AI call script using OpenAI API for dynamic, adaptive AI agent conversations
  const generateAICallScript = async (lead: Lead | null, voiceId = "sarah", language = "en") => {
    if (!lead) return "";
    
    const leadStage = lead["Stage"] || "new";
    const leadName = lead["Full Name"] || "prospect";
    const vehicleInterest = lead["Vehicle Interest"] || "vehicle";
    const budgetRange = lead["Budget Range"];
    
    // Get selected voice configuration
    const selectedVoiceConfig = voiceCatalog[selectedGender].find(voice => voice.id === voiceId) || voiceCatalog.female[0];
    
    // Enhanced prompt for ADAPTIVE AI agent with dynamic personality adjustment
    const prompt = `You are an adaptive AI sales agent having a real-time phone conversation with a potential car buyer. Your personality and approach should dynamically adjust based on customer responses and conversation flow - do NOT stick to a rigid script or predetermined personality type.

VOICE & TECHNICAL CONFIGURATION:
- Voice: ${selectedVoiceConfig.name} (${selectedVoiceConfig.description})
- Voice Traits: ${selectedVoiceConfig.traits.join(", ")}
- ElevenLabs Voice ID: ${selectedVoiceConfig.elevenLabsId}
- Primary Language: ${language === "es" ? "Spanish (Native fluency)" : "English (Native speaker)"}
- Bilingual Capability: ${selectedVoiceConfig.id.includes("bilingual") || selectedVoiceConfig.name.includes("Bilingual") ? "Fluent Spanish/English switching" : "English primary, Spanish transfer available"}

LEAD PROFILE:
- Name: ${leadName}
- Phone: ${lead["Phone Number"]}
- Current Stage: ${leadStage}
- Vehicle Interest: ${vehicleInterest}
- Budget Range: ${budgetRange || "Not specified"}

ADAPTIVE PERSONALITY INSTRUCTIONS:
🧠 **DYNAMIC INTELLIGENCE**: 
- Start professionally but READ THE CUSTOMER and adapt your energy level
- If they sound rushed, be direct and efficient
- If they sound friendly and chatty, be warmer and more conversational
- If they sound skeptical, be more consultative and educational
- If they sound ready to buy, be confident and action-oriented

🎯 **CONVERSATION FLOW WITH REAL-TIME ADAPTATION**:
1. **Opening with Language Check**: 
   - Natural greeting with immediate language preference check
   - "Hi ${leadName}! Quick question - are you comfortable continuing in English, or would you prefer Spanish?"
   
2. **ADAPTIVE DISCOVERY**: 
   - Adjust questioning style based on their responses
   - If short answers: Ask more engaging, open questions
   - If detailed responses: Dive deeper with follow-up questions
   - Match their communication style naturally

3. **INTELLIGENT PRESENTATION**: 
   - Present benefits based on what they actually care about
   - Use their language style (formal vs casual)
   - Reference their specific situation organically

4. **NATURAL OBJECTION HANDLING**: 
   - Don't be pushy if they resist - be understanding
   - If price sensitive: Focus on value and options
   - If time sensitive: Respect their timeline
   - Adapt your approach based on their specific concerns

5. **AUTHENTIC CLOSING**: 
   - Read their readiness level
   - Soft close if they seem hesitant
   - Direct close if they seem ready
   - Always offer next steps that match their comfort level

REAL-TIME CONVERSATION GUIDELINES:
✅ **BE GENUINELY CONVERSATIONAL**:
- Sound like a real person, not a script
- Use natural speech patterns and contractions
- Include appropriate pauses and reactions
- Show genuine interest in their responses

🎭 **PERSONALITY ADAPTATION EXAMPLES**:
- Customer sounds busy: "I know your time is valuable, so let me be direct..."
- Customer is chatty: "I love hearing that! Tell me more about..."
- Customer seems skeptical: "I completely understand that concern. Let me explain..."
- Customer sounds excited: "That's fantastic! I can tell you're going to love this..."

LANGUAGE SWITCHING PROTOCOLS:
- ALWAYS ask language preference in first 30 seconds
- If customer chooses Spanish: Continue entire conversation in natural Spanish
- If customer chooses other language: "Let me connect you with our specialist"
- Maintain same adaptive intelligence regardless of language

WHISPER TRANSCRIPTION OPTIMIZATION:
- Speak clearly in chosen language with natural pacing
- Use customer's name 2-3 times naturally throughout conversation
- Include clear verbal transitions that sound natural
- End with specific, actionable next step
- Internal logs remain in English regardless of conversation language

CRITICAL SUCCESS FACTORS:
🌟 **AUTHENTICITY OVER SCRIPTS**: Sound like a real person having a genuine conversation
🌟 **CUSTOMER-CENTRIC ADAPTATION**: Let THEM guide the energy and style of the conversation  
🌟 **INTELLIGENT RESPONSIVENESS**: Actually listen and respond to what they're telling you
🌟 **NATURAL LANGUAGE ACCOMMODATION**: Language switching should feel seamless and caring
🌟 **GOAL-ORIENTED FLEXIBILITY**: Always working toward appointment/sale but adapting method to customer

Generate a conversational guide for an AI agent that will have LIVE, ADAPTIVE conversations - not rigid script-following. This agent should feel like talking to a smart, empathetic sales person who reads people well and adjusts their approach accordingly.`;

    try {
      // Call OpenAI API with enhanced adaptive conversation parameters
      const response = await fetch('/api/generate-call-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          conversationType: 'adaptive-ai-agent', // Flag for adaptive conversation
          transcriptionEnabled: true,
          multilingualEnabled: true,
          voiceConfig: {
            id: selectedVoiceConfig.id,
            name: selectedVoiceConfig.name,
            elevenLabsId: selectedVoiceConfig.elevenLabsId,
            gender: selectedGender,
            traits: selectedVoiceConfig.traits
          },
          primaryLanguage: language,
          supportedLanguages: ['en', 'es'],
          personalityMode: 'adaptive', // Dynamic personality adjustment
          leadData: {
            name: leadName,
            stage: leadStage,
            vehicleInterest: vehicleInterest,
            budgetRange: budgetRange,
            phone: lead["Phone Number"]
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate adaptive AI conversation script');
      }

      const data = await response.json();
      return data.script || generateAdaptiveFallbackScript(lead, selectedVoiceConfig, language);
      
    } catch (error) {
      console.error('Error generating adaptive AI conversation script:', error);
      // Fallback to adaptive conversation templates
      return generateAdaptiveFallbackScript(lead, selectedVoiceConfig, language);
    }
  };

  // Adaptive fallback script generator for when OpenAI API is unavailable
  const generateAdaptiveFallbackScript = (lead: Lead | null, voiceConfig: any, language: string) => {
    if (!lead) return "";
    
    const leadName = lead["Full Name"] || "there";
    const vehicleInterest = lead["Vehicle Interest"] || "a vehicle";
    const budgetRange = lead["Budget Range"];
    
    const fallbackScript = language === "es" ? 
      generateSpanishAdaptiveFallback(leadName, vehicleInterest, budgetRange, voiceConfig) :
      generateEnglishAdaptiveFallback(leadName, vehicleInterest, budgetRange, voiceConfig);
    
    return `${fallbackScript}

🤖 ADAPTIVE AI AGENT NOTES (FALLBACK MODE):
- Voice: ${voiceConfig.name} (${voiceConfig.description})
- ElevenLabs Voice ID: ${voiceConfig.elevenLabsId}
- Language: ${language === "es" ? "Spanish conversation mode" : "English conversation mode"}
- Personality Mode: ADAPTIVE - adjust based on customer responses
- This conversation will be transcribed in real-time via Whisper
- AI should read customer cues and adapt approach dynamically
- Fallback scripts provide framework, but agent should improvise based on responses
- Customer language preference logged for all future interactions`;
  };

  const generateEnglishAdaptiveFallback = (name: string, vehicle: string, budget?: string, voiceConfig?: any) => `
🎙️ ADAPTIVE AI CONVERSATION FRAMEWORK
Voice: ${voiceConfig?.name || "Sarah"} - ${voiceConfig?.description || "Professional, warm, confident"}

🌍 LANGUAGE PREFERENCE OPENING:
Hi ${name}! This is ${voiceConfig?.name || "[Agent Name]"} from Ghost Auto CRM. Hope you're having a great day!

Quick question - are you comfortable continuing in English, or would you prefer Spanish? I want to make sure this works perfectly for you.

[PAUSE - READ THEIR RESPONSE AND ADAPT]
[If they seem rushed: "I'll keep this brief and focused"]
[If they seem friendly: "I love your energy! This is going to be fun"]
[If they sound skeptical: "I completely understand - let me explain why I'm calling"]

🧠 ADAPTIVE DISCOVERY (Match their communication style):
I'm calling about your interest in ${vehicle}. ${budget ? `I saw you're looking in the ${budget} range, which is perfect timing.` : ""}

[ADAPT BASED ON THEIR ENERGY]:
- If they give short answers: "What's the most important feature for your next vehicle?"
- If they're talkative: "Tell me what got you interested in ${vehicle} - I'd love to hear the story"
- If they sound busy: "What would make ${vehicle} the perfect fit for your needs?"

[PAUSE - LISTEN TO THEIR RESPONSE AND MIRROR THEIR STYLE]

💡 ADAPTIVE PRESENTATION (Based on what they actually said):
- If they mentioned family: Focus on safety and space
- If they mentioned work: Focus on reliability and professionalism  
- If they mentioned fun: Focus on performance and style
- If they mentioned budget: Focus on value and financing options

🎯 ADAPTIVE CLOSING (Read their readiness level):
- If enthusiastic: "I'd love to show you this in person - are you free this week?"
- If hesitant: "Would it help if I sent you some information first?"
- If price-focused: "Let me see what special offers we have available"
- If busy: "When would be the best time for a quick 15-minute call?"`;

  const generateSpanishAdaptiveFallback = (name: string, vehicle: string, budget?: string, voiceConfig?: any) => `
🎙️ MARCO DE CONVERSACIÓN ADAPTATIVA AI 
Voz: ${voiceConfig?.name || "Maria"} - ${voiceConfig?.description || "Professional Spanish/English, cultural sensitivity"}

🌍 APERTURA CON PREFERENCIA DE IDIOMA:
¡Hola ${name}! Soy ${voiceConfig?.name || "[Nombre del Agente]"} de Ghost Auto CRM. ¡Espero que esté teniendo un día excelente!

Pregunta rápida - ¿se siente cómodo continuando en español, o prefiere inglés? Quiero asegurarme de que esto funcione perfectamente para usted.

[PAUSA - LEA SU RESPUESTA Y ADAPTESE]
[Si parecen con prisa: "Seré breve y directo al punto"]  
[Si parecen amigables: "¡Me encanta su energía! Esto va a ser genial"]
[Si suenan escépticos: "Entiendo completamente - permítame explicar por qué le llamo"]

🧠 DESCUBRIMIENTO ADAPTATIVO (Coincida con su estilo de comunicación):
Le llamo sobre su interés en ${vehicle}. ${budget ? `Vi que está buscando en el rango de ${budget}, que es el momento perfecto.` : ""}

[ADAPTESE BASADO EN SU ENERGÍA]:
- Si dan respuestas cortas: "¿Cuál es la característica más importante para su próximo vehículo?"
- Si son conversadores: "Cuénteme qué le interesó en ${vehicle} - me encantaría escuchar la historia"
- Si suenan ocupados: "¿Qué haría que ${vehicle} sea perfecto para sus necesidades?"

[PAUSA - ESCUCHE SU RESPUESTA Y REFLEJE SU ESTILO]

💡 PRESENTACIÓN ADAPTATIVA (Basado en lo que realmente dijeron):
- Si mencionaron familia: Enfóquese en seguridad y espacio
- Si mencionaron trabajo: Enfóquese en confiabilidad y profesionalismo
- Si mencionaron diversión: Enfóquese en rendimiento y estilo  
- Si mencionaron presupuesto: Enfóquese en valor y opciones de financiamiento

🎯 CIERRE ADAPTATIVO (Lea su nivel de preparación):
- Si están entusiasmados: "Me encantaría mostrarle esto en persona - ¿está libre esta semana?"
- Si están dudosos: "¿Le ayudaría si le envío algo de información primero?"
- Si se enfocan en precio: "Permítame ver qué ofertas especiales tenemos disponibles"
- Si están ocupados: "¿Cuándo sería el mejor momento para una llamada rápida de 15 minutos?"`;

  // Get available voices for selected gender
  const getAvailableVoices = () => {
    return voiceCatalog[selectedGender] || voiceCatalog.female;
  };

  // Initiate AI call using existing telephony infrastructure
  const initiateAICall = async () => {
    if (!callLead || !callScript) {
      console.error('Missing lead data or call script');
      return;
    }

    const selectedVoiceConfig = voiceCatalog[selectedGender].find(voice => voice.id === selectedVoice) || voiceCatalog.female[0];
    
    try {
      console.log('🚀 [AI CALL] Attempting to initiate AI call...');
      
      let response: Response | undefined;
      let primaryFailed = false;
      
      try {
        // Try primary endpoint first
        console.log('🎯 [AI CALL] Trying primary endpoint: /api/voice/initiate-ai-call');
        response = await fetch('/api/voice/initiate-ai-call', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies for authentication
          body: JSON.stringify({
            to: callLead["Phone Number"],
            leadData: {
              name: callLead["Full Name"],
              vehicleInterest: callLead["Vehicle Interest"],
              stage: callLead["Stage"],
              budgetRange: callLead["Budget Range"]
            },
            aiConfig: {
              script: callScript,
              voice: {
                id: selectedVoiceConfig.id,
                name: selectedVoiceConfig.name,
                elevenLabsId: selectedVoiceConfig.elevenLabsId,
                gender: selectedGender,
                language: preferredLanguage
              },
              personalityMode: 'adaptive',
              multilingualEnabled: true,
              supportedLanguages: ['en', 'es']
            }
          }),
        });

        if (response.status === 404) {
          console.warn('❌ [AI CALL] Primary endpoint returned 404');
          primaryFailed = true;
        }
      } catch (fetchError) {
        console.warn('❌ [AI CALL] Primary endpoint fetch failed:', fetchError);
        primaryFailed = true;
      }

      // If primary endpoint fails with 404 or other errors, try fallback endpoint
      if (primaryFailed || !response || !response.ok) {
        console.warn('⚠️ [AI CALL] Primary endpoint failed, trying fallback endpoint...');
        try {
          console.log('🔄 [AI CALL] Trying fallback endpoint: /api/voice/call/start');
          response = await fetch('/api/voice/call/start', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              to: callLead["Phone Number"],
              script: callScript,
              leadId: callLead["ID"] || callLead["id"] || null
            }),
          });
          console.log('📡 [AI CALL] Fallback endpoint response status:', response.status);
        } catch (fallbackError) {
          console.error('❌ [AI CALL] Fallback endpoint also failed:', fallbackError);
          throw new Error('Both primary and fallback endpoints failed');
        }
      }

      if (!response || !response.ok) {
        const errorData = response ? await response.json().catch(() => ({})) : {};
        console.error('❌ [AI CALL] Call initiation failed:', {
          status: response?.status,
          statusText: response?.statusText,
          error: errorData
        });
        throw new Error(`Call initiation failed: ${response?.status || 'unknown'} - ${errorData.error || response?.statusText || 'unknown error'}`);
      }

      const result = await response.json();
      console.log('✅ [AI CALL] Call initiated successfully:', result);
      
      // Call the parent handler to update UI state
      handleCallAction();
      
    } catch (error) {
      console.error('Error initiating AI call:', error);
      alert('Failed to initiate call. Please check your telephony configuration.');
    }
  };

  // Generate initial script when lead changes or modal opens
  useEffect(() => {
    if (open && callLead) {
      const loadScript = async () => {
        setIsGeneratingScript(true);
        setCallScript("🤖 AI is crafting an adaptive conversation strategy...");
        try {
          const script = await generateAICallScript(callLead, selectedVoice, preferredLanguage);
          setCallScript(script);
        } catch (error) {
          console.error('Error generating adaptive script:', error);
          setCallScript("Sorry, there was an error generating the script. Please try regenerating it.");
        } finally {
          setIsGeneratingScript(false);
        }
      };
      loadScript();
    }
  }, [open, callLead, selectedVoice, preferredLanguage]);

  const regenerateScript = async () => {
    if (callLead) {
      setIsGeneratingScript(true);
      setCallScript("🔄 Regenerating adaptive AI conversation strategy...");
      try {
        const newScript = await generateAICallScript(callLead, selectedVoice, preferredLanguage);
        setCallScript(newScript);
      } catch (error) {
        console.error('Error regenerating script:', error);
        setCallScript("Sorry, there was an error generating the script. Please try again.");
      } finally {
        setIsGeneratingScript(false);
      }
    }
  };

  const handleVoiceChange = async (voiceId: string) => {
    setSelectedVoice(voiceId);
    if (callLead) {
      setIsGeneratingScript(true);
      setCallScript("🎙️ Adapting conversation to new voice personality...");
      try {
        const newScript = await generateAICallScript(callLead, voiceId, preferredLanguage);
        setCallScript(newScript);
      } catch (error) {
        console.error('Error adapting to new voice:', error);
        setCallScript("Sorry, there was an error adapting the script. Please try again.");
      } finally {
        setIsGeneratingScript(false);
      }
    }
  };

  const handleGenderChange = (gender: "male" | "female") => {
    setSelectedGender(gender);
    // Auto-select first voice of selected gender
    const firstVoice = voiceCatalog[gender][0];
    if (firstVoice) {
      handleVoiceChange(firstVoice.id);
    }
  };

  const handleLanguageChange = (language: string) => {
    setPreferredLanguage(language);
    if (callLead) {
      regenerateScript();
    }
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`AI Call Script - ${callLead?.["Full Name"] || "Lead"}`}
      size="ultra"
    >
      <div className="ai-call-script-modal">        

        {/* Main Content Grid */}
        <div className="call-grid">
          
          {/* Left Column - Lead Details & Controls */}
          <div className="call-column">
            
            {/* Lead Information Card */}
            <div className="call-card">
              <div className="call-card-header">
                <div className="call-card-header-dot"></div>
                Lead Information
              </div>
              <div className="call-card-body">
                {callLead && (
                  <div>
                    <div className="info-row blue">
                      <span className="info-label blue">Name</span>
                      <span className="info-value blue">{callLead["Full Name"]}</span>
                    </div>
                    <div className="info-row green">
                      <span className="info-label green">Phone</span>
                      <span className="info-value green">{callLead["Phone Number"]}</span>
                    </div>
                    <div className="info-row purple">
                      <span className="info-label purple">Stage</span>
                      <span className="stage-badge">
                        {callLead["Stage"] || "new"}
                      </span>
                    </div>
                    <div className="info-row orange">
                      <span className="info-label orange">Interest</span>
                      <span className="info-value orange">{callLead["Vehicle Interest"] || "Not specified"}</span>
                    </div>
                    {callLead["Budget Range"] && (
                      <div className="info-row emerald">
                        <span className="info-label emerald">Budget</span>
                        <span className="info-value emerald">{callLead["Budget Range"]}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Voice & Language Configuration */}
            <div className="call-card">
              <div className="call-card-header">
                <div className="call-card-header-icon">🎙️</div>
                AI Agent Voice & Language
              </div>
              <div className="call-card-body">
                
                {/* Language Selection */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                    Primary Language
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleLanguageChange('en')}
                      style={{
                        padding: '6px 12px',
                        fontSize: '11px',
                        border: '1px solid #e5e7eb',
                        background: preferredLanguage === 'en' ? '#3b82f6' : 'white',
                        color: preferredLanguage === 'en' ? 'white' : '#374151',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                    >
                      🇺🇸 English
                    </button>
                    <button
                      onClick={() => handleLanguageChange('es')}
                      style={{
                        padding: '6px 12px',
                        fontSize: '11px',
                        border: '1px solid #e5e7eb',
                        background: preferredLanguage === 'es' ? '#3b82f6' : 'white',
                        color: preferredLanguage === 'es' ? 'white' : '#374151',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                    >
                      🇪🇸 Español
                    </button>
                  </div>
                </div>

                {/* Gender Selection */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                    Voice Gender
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleGenderChange('female')}
                      style={{
                        padding: '6px 12px',
                        fontSize: '11px',
                        border: '1px solid #e5e7eb',
                        background: selectedGender === 'female' ? '#ec4899' : 'white',
                        color: selectedGender === 'female' ? 'white' : '#374151',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                    >
                      👩 Female
                    </button>
                    <button
                      onClick={() => handleGenderChange('male')}
                      style={{
                        padding: '6px 12px',
                        fontSize: '11px',
                        border: '1px solid #e5e7eb',
                        background: selectedGender === 'male' ? '#3b82f6' : 'white',
                        color: selectedGender === 'male' ? 'white' : '#374151',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                    >
                      👨 Male
                    </button>
                  </div>
                </div>

                {/* Voice Selection */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                    Voice Personality
                  </label>
                  {getAvailableVoices().map((voice) => (
                    <div
                      key={voice.id}
                      onClick={() => handleVoiceChange(voice.id)}
                      style={{
                        padding: '10px',
                        marginBottom: '8px',
                        border: `1px solid ${selectedVoice === voice.id ? '#3b82f6' : '#e5e7eb'}`,
                        background: selectedVoice === voice.id ? '#eff6ff' : 'white',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ 
                            fontSize: '13px', 
                            fontWeight: '600', 
                            color: selectedVoice === voice.id ? '#1d4ed8' : '#374151',
                            marginBottom: '2px'
                          }}>
                            {voice.name}
                          </div>
                          <div style={{ 
                            fontSize: '11px', 
                            color: selectedVoice === voice.id ? '#3730a3' : '#6b7280',
                            marginBottom: '4px'
                          }}>
                            {voice.description}
                          </div>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {voice.traits.map((trait, idx) => (
                              <span 
                                key={idx} 
                                style={{
                                  fontSize: '9px',
                                  padding: '2px 6px',
                                  background: selectedVoice === voice.id ? '#dbeafe' : '#f3f4f6',
                                  color: selectedVoice === voice.id ? '#1e40af' : '#6b7280',
                                  borderRadius: '10px',
                                  fontWeight: '500'
                                }}
                              >
                                {trait}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: selectedVoice === voice.id ? '#3b82f6' : '#e5e7eb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {selectedVoice === voice.id && (
                            <div style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: 'white'
                            }} />
                          )}
                        </div>
                      </div>
                      
                      {/* Preview button */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Play ElevenLabs preview
                          window.open(voice.preview, '_blank');
                        }}
                        style={{
                          marginTop: '6px',
                          padding: '4px 8px',
                          fontSize: '9px',
                          border: `1px solid ${selectedVoice === voice.id ? '#3b82f6' : '#d1d5db'}`,
                          background: 'white',
                          color: selectedVoice === voice.id ? '#3b82f6' : '#6b7280',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontWeight: '500'
                        }}
                      >
                        🔊 Preview Voice
                      </button>
                    </div>
                  ))}
                </div>

                {/* AI Personality Note */}
                <div style={{
                  marginTop: '12px',
                  padding: '8px',
                  background: '#f0f9ff',
                  border: '1px solid #0ea5e9',
                  borderRadius: '4px'
                }}>
                  <div style={{ fontSize: '10px', color: '#0369a1', fontWeight: '600', marginBottom: '2px' }}>
                    🧠 Adaptive AI Personality
                  </div>
                  <div style={{ fontSize: '9px', color: '#0c4a6e', lineHeight: '1.3' }}>
                    AI agent will dynamically adjust personality based on customer responses - no rigid script following!
                  </div>
                </div>
              </div>
            </div>

            {/* Call Objectives */}
            <div className="call-card">
              <div className="call-card-header">
                <div className="call-card-header-icon green">✓</div>
                Call Objectives
              </div>
              <div className="call-card-body">
                <div className="objectives-container">
                  {callObjectives.map((objective) => (
                    <div key={objective.id} className="objective-item">
                      <input
                        type="checkbox"
                        checked={objective.checked}
                        onChange={(e) => {
                          setCallObjectives(prev => 
                            prev.map(obj => 
                              obj.id === objective.id 
                                ? { ...obj, checked: e.target.checked }
                                : obj
                            )
                          );
                        }}
                        className="objective-checkbox"
                      />
                      <span className="objective-text">{objective.text}</span>
                      <div className={`objective-status ${objective.checked ? 'checked' : 'unchecked'}`}></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Call Script Editor */}
            <div className="call-column script-editor-container">
            {/* Script Header */}
            <div className="script-header">
              <div className="script-header-icon">
                <Bot className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="script-header-title">Adaptive AI Conversation Framework</h3>
                <p className="script-header-subtitle">
                  {voiceCatalog[selectedGender].find(v => v.id === selectedVoice)?.name || "AI Agent"} • 
                  {preferredLanguage === 'es' ? ' Español' : ' English'} • 
                  Dynamic Personality Adaptation
                </p>
              </div>
            </div>

            {/* Script Editor */}
            <div className="script-editor">
              <textarea
                id="call-script"
                value={callScript}
                onChange={(e) => setCallScript(e.target.value)}
                placeholder="AI call script will appear here..."
                className="script-textarea"                
              />
            </div>

            {/* Script Controls */}
            <div className="script-controls">
              <div className="script-actions-top">
                <button
                  onClick={regenerateScript}
                  disabled={isGeneratingScript}
                  className="regenerate-button"
                  style={{
                    opacity: isGeneratingScript ? 0.7 : 1,
                    cursor: isGeneratingScript ? 'not-allowed' : 'pointer'
                  }}
                >
                  <RefreshCw className={`w-4 h-4 ${isGeneratingScript ? 'animate-spin' : ''}`} />
                  {isGeneratingScript ? 'Adapting...' : 'Regenerate Framework'}
                </button>
                <div className="script-status">
                  <div className={`script-status-dot ${isGeneratingScript ? 'generating' : ''}`} style={{
                    backgroundColor: isGeneratingScript ? '#f59e0b' : '#10b981'
                  }}></div>
                  {isGeneratingScript ? 'AI is adapting conversation...' : 'Adaptive framework ready'}
                </div>
              </div>
              
              <div className="call-action-buttons" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px'}}>
                <button className="call-start-button" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 12px', border: '1px solid #10b981', background: '#10b981', color: 'white', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: '600'}}>
                  <Phone className="w-4 h-4" />
                  Start Call
                </button>
                <button className="call-logs-button" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 12px', border: '1px solid #6366f1', background: 'white', color: '#6366f1', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: '500'}}>
                  <FileText className="w-4 h-4" />
                  View Call Logs
                </button>
              </div>
            </div>

            {/* Call Analytics */}
            <div className="analytics-container" style={{
              padding: '8px', 
              background: '#f8fafc', 
              borderRadius: '4px', 
              border: '1px solid #e2e8f0', 
              flexShrink: '0', 
              maxHeight: '240px', 
              overflowY: 'auto', 
              boxSizing: 'border-box', 
              maxWidth: '100%', 
              width: '100%'
            }}>
              <h4 className="analytics-header">
                <div className="analytics-icon">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                </div>
                Call Analytics
              </h4>
              
              <div className="analytics-grid">
                {/* Conversion Rate */}
                <div className="analytics-metric">
                  <div className="metric-header">
                    <span className="metric-label">Conversion Rate</span>
                    <span className="metric-change positive">↑ 12%</span>
                  </div>
                  <div className="metric-value">24.8%</div>
                  <div className="metric-period">Last 30 days</div>
                </div>

                {/* Avg Call Duration */}
                <div className="analytics-metric">
                  <div className="metric-header">
                    <span className="metric-label">Avg Duration</span>
                    <span className="metric-change neutral">→ 0%</span>
                  </div>
                  <div className="metric-value">6:42</div>
                  <div className="metric-period">Per call</div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="recent-activity">
                <h5 className="recent-activity-title">Recent Activity</h5>
                <div className="activity-list">
                  <div className="activity-item">
                    <span className="activity-label">Calls Today</span>
                    <span className="activity-value default">8</span>
                  </div>
                  <div className="activity-item">
                    <span className="activity-label">Connected</span>
                    <span className="activity-value success">6</span>
                  </div>
                  <div className="activity-item">
                    <span className="activity-label">Appointments</span>
                    <span className="activity-value purple">2</span>
                  </div>
                </div>
              </div>

              {/* Performance Score */}
              <div className="performance-score">
                <div className="score-header">
                  <span className="score-label">Performance Score</span>
                  <div className="score-value-container">
                    <span className="score-value">8.4</span>
                    <span className="score-max">/10</span>
                  </div>
                </div>
                <div className="score-bar-container">
                  <div className="score-bar"></div>
                </div>
                <div className="score-description">Excellent performance this week</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="action-bar">
          <div className="action-bar-info">
            <FileText className="w-4 h-4" />
            Adaptive conversation framework - AI will adjust dynamically during call
          </div>
          <div className="action-bar-buttons">
            <button 
              onClick={onClose}
              className="cancel-button"
            >
              Cancel
            </button>
            <button 
              onClick={initiateAICall}
              disabled={callConnecting || !callScript.trim()}
              className={`call-button ${callConnecting || !callScript.trim() ? 'disabled' : 'enabled'}`}
            >
              {callConnecting ? (
                <>
                  <Phone className={`w-4 h-4 call-button-icon ${callConnecting ? 'pulse' : ''}`} />
                  Connecting...
                </>
              ) : (
                <>
                  <Phone className="w-4 h-4" />
                  Initiate AI Call
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}