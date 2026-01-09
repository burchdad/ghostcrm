// Voice Persona Management System
// Enhanced voice system with personas, context-aware switching, and brand safety

export interface VoicePersona {
  id: string;
  name: string;
  description: string;
  voiceId: string; // Reference to actual voice file
  tenantId: string;
  
  // Persona Configuration
  label: string; // "Warm follow-up voice", "Urgent collections voice"
  tonePreset: 'friendly' | 'authoritative' | 'empathetic' | 'playful' | 'professional' | 'urgent';
  emotionalRange: {
    warmth: number; // 0-100
    authority: number;
    empathy: number;
    energy: number;
  };
  
  // Use Case Mapping
  useCases: Array<'outbound_reminder' | 'inbound_support' | 'post_sale_checkin' | 
                  'collections' | 'onboarding' | 'vip_calls' | 'emergency'>;
  
  // Context Rules
  contextRules: {
    timeOfDay?: Array<'morning' | 'afternoon' | 'evening'>;
    callType?: Array<'cold_outbound' | 'warm_follow_up' | 'customer_service' | 'sales_close'>;
    customerSegment?: Array<'vip' | 'new_lead' | 'existing_customer' | 'past_due'>;
    department?: Array<'sales' | 'support' | 'collections' | 'onboarding'>;
    language?: Array<'en' | 'es' | 'fr'>;
  };
  
  // Voice Health Scoring
  healthScore: {
    clarity: number; // 0-100
    consistency: number;
    emotionalRange: number;
    noiseLevel: number;
    overall: number; // Calculated score
    lastAnalyzed: string;
    recommendations: string[];
  };
  
  // Performance Analytics
  analytics: {
    totalCalls: number;
    completionRate: number;
    avgCallDuration: number;
    customerSatisfactionScore: number;
    conversionRate: number;
    hangupRate: number;
  };
  
  // Brand Safety & Compliance
  brandSafety: {
    approved: boolean;
    approvedBy?: string;
    approvedAt?: string;
    contentFilters: Array<'harassment' | 'threats' | 'inappropriate' | 'compliance'>;
    lastReview: string;
  };
  
  // Training & Optimization
  training: {
    phoneticCoverage: number; // 0-100
    sampleCount: number;
    suggestedImprovements: string[];
    nextTrainingRecommended: string;
  };
  
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VoicePersonaRule {
  id: string;
  personaId: string;
  priority: number; // Higher number = higher priority
  conditions: {
    timeRange?: { start: string; end: string };
    dayOfWeek?: Array<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'>;
    callType?: string;
    customerTags?: string[];
    leadSource?: string;
    callAttempt?: number; // 1st attempt, 2nd attempt, etc.
    previousCallOutcome?: 'answered' | 'voicemail' | 'no_answer' | 'busy';
  };
  action: {
    usePersona: string;
    escalationTrigger?: 'key_moment' | 'customer_objection' | 'closing_attempt';
    contextMessage?: string; // e.g., "Hey, it's John, the owner here..."
  };
}

// Smart Voice Selection Engine
export class VoicePersonaEngine {
  private personas: VoicePersona[] = [];
  private rules: VoicePersonaRule[] = [];
  
  constructor(tenantId: string) {
    // Load tenant's personas and rules
  }
  
  /**
   * Select the best persona for a given call context
   */
  selectPersona(context: {
    callType: string;
    customerSegment: string;
    timeOfDay: string;
    department: string;
    language: string;
    callAttempt: number;
    customerHistory?: any;
    isVIP?: boolean;
  }): VoicePersona | null {
    
    // Apply rules in priority order
    const applicableRules = this.rules
      .filter(rule => this.ruleMatches(rule, context))
      .sort((a, b) => b.priority - a.priority);
    
    if (applicableRules.length > 0) {
      const selectedRule = applicableRules[0];
      return this.personas.find(p => p.id === selectedRule.action.usePersona) || null;
    }
    
    // Fallback to best matching persona
    return this.findBestMatchingPersona(context);
  }
  
  /**
   * Context-aware voice switching during call
   */
  shouldSwitchVoice(currentPersona: VoicePersona, callEvent: {
    type: 'key_moment' | 'objection_handling' | 'closing_attempt' | 'complaint_escalation';
    customerResponse?: string;
    callDuration?: number;
  }): VoicePersona | null {
    
    // Example: Switch to owner voice for key moments
    if (callEvent.type === 'key_moment' || callEvent.type === 'complaint_escalation') {
      const ownerPersona = this.personas.find(p => 
        p.tonePreset === 'authoritative' && 
        p.useCases.includes('vip_calls')
      );
      return ownerPersona || null;
    }
    
    return null;
  }
  
  private ruleMatches(rule: VoicePersonaRule, context: any): boolean {
    // Implement rule matching logic
    return true; // Simplified for now
  }
  
  private findBestMatchingPersona(context: any): VoicePersona | null {
    // Score personas based on context match
    let bestPersona: VoicePersona | null = null;
    let bestScore = 0;
    
    for (const persona of this.personas.filter(p => p.isActive && p.brandSafety.approved)) {
      const score = this.scorePersonaMatch(persona, context);
      if (score > bestScore) {
        bestScore = score;
        bestPersona = persona;
      }
    }
    
    return bestPersona;
  }
  
  private scorePersonaMatch(persona: VoicePersona, context: any): number {
    let score = 0;
    
    // Base score from health
    score += persona.healthScore.overall * 0.3;
    
    // Performance score
    score += persona.analytics.completionRate * 0.3;
    
    // Context relevance
    if (persona.contextRules.callType?.includes(context.callType)) score += 25;
    if (persona.contextRules.customerSegment?.includes(context.customerSegment)) score += 20;
    if (persona.contextRules.department?.includes(context.department)) score += 15;
    if (persona.contextRules.language?.includes(context.language)) score += 10;
    
    return score;
  }
}

// Voice Health Analyzer
export class VoiceHealthAnalyzer {
  
  /**
   * Analyze voice sample and generate health score
   */
  static async analyzeVoiceHealth(audioBuffer: Buffer): Promise<VoicePersona['healthScore']> {
    
    // TODO: Implement actual audio analysis
    // This would use audio processing libraries or AI services
    
    const mockAnalysis: VoicePersona['healthScore'] = {
      clarity: Math.floor(Math.random() * 20) + 80, // 80-100
      consistency: Math.floor(Math.random() * 15) + 85, // 85-100
      emotionalRange: Math.floor(Math.random() * 30) + 70, // 70-100
      noiseLevel: Math.floor(Math.random() * 10) + 90, // 90-100 (higher = less noise)
      overall: 0,
      lastAnalyzed: new Date().toISOString(),
      recommendations: [] as string[]
    };
    
    // Calculate overall score
    mockAnalysis.overall = Math.round(
      (mockAnalysis.clarity * 0.3) +
      (mockAnalysis.consistency * 0.3) +
      (mockAnalysis.emotionalRange * 0.2) +
      (mockAnalysis.noiseLevel * 0.2)
    );
    
    // Generate recommendations
    if (mockAnalysis.clarity < 85) {
      mockAnalysis.recommendations.push("Record in a quieter environment for better clarity");
    }
    if (mockAnalysis.emotionalRange < 80) {
      mockAnalysis.recommendations.push("Try varying your tone more to increase emotional range");
    }
    if (mockAnalysis.noiseLevel < 90) {
      mockAnalysis.recommendations.push("Background noise detected. Use noise cancellation or quieter space");
    }
    if (mockAnalysis.overall >= 95) {
      mockAnalysis.recommendations.push("Excellent voice quality! This is production-ready.");
    }
    
    return mockAnalysis;
  }
  
  /**
   * Generate insights for voice performance
   */
  static generateVoiceInsights(personas: VoicePersona[]): string[] {
    const insights: string[] = [];
    
    // Find best performing persona
    const bestPerformer = personas
      .filter(p => p.analytics.totalCalls > 10)
      .sort((a, b) => b.analytics.conversionRate - a.analytics.conversionRate)[0];
    
    if (bestPerformer) {
      insights.push(
        `Your "${bestPerformer.name}" persona performs ${bestPerformer.analytics.conversionRate}% better on conversions than your average voice`
      );
    }
    
    // Analyze completion rates
    const avgCompletionRate = personas.reduce((sum, p) => sum + p.analytics.completionRate, 0) / personas.length;
    const topCompleter = personas.sort((a, b) => b.analytics.completionRate - a.analytics.completionRate)[0];
    
    if (topCompleter && topCompleter.analytics.completionRate > avgCompletionRate + 10) {
      insights.push(
        `Your "${topCompleter.name}" voice has ${Math.round(topCompleter.analytics.completionRate - avgCompletionRate)}% fewer hangups than your other voices`
      );
    }
    
    // Health score insights
    const needsImprovement = personas.filter(p => p.healthScore.overall < 80);
    if (needsImprovement.length > 0) {
      insights.push(
        `${needsImprovement.length} voice${needsImprovement.length > 1 ? 's' : ''} could benefit from re-recording for better quality`
      );
    }
    
    return insights;
  }
}

export default VoicePersonaEngine;