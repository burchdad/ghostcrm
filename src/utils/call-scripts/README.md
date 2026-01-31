# Multilingual Call Script Fallback System Documentation

## Overview
The call script system has been reorganized into separate language-specific modules for better maintainability and scalability. This allows for intelligent fallback when the OpenAI API is unavailable, ensuring customers can continue to receive high-quality, culturally-adapted conversation scripts in their preferred language.

## File Structure

```
src/utils/call-scripts/
├── fallbackScriptManager.ts       # Main orchestrator and language detection
├── englishFallbackScripts.ts      # English conversation flows
└── spanishFallbackScripts.ts      # Spanish conversation flows
```

## Key Components

### 1. fallbackScriptManager.ts
**Primary Functions:**
- `generateAdvancedFallbackScript()` - Main entry point for fallback script generation
- `detectCustomerLanguagePreference()` - Intelligent language detection from customer responses
- `getLanguageSwitchedAgentType()` - Agent type mapping for language switching

**Features:**
- Intelligent agent type selection based on language preference
- Cultural adaptation notes and system instructions
- Fallback system status indicators
- Cross-language agent personality mapping

### 2. englishFallbackScripts.ts
**Conversation Flows:**
- `generateEnglishProfessionalFlow()` - Balanced, consultative approach
- `generateEnglishAggressiveFlow()` - Direct, urgency-focused approach  
- `generateEnglishFriendlyFlow()` - Warm, relationship-building approach
- `generateEnglishConsultativeFlow()` - Educational, expert advisor approach

**Key Features:**
- Language preference check in opening phase
- Dynamic language switching protocols
- Cultural sensitivity markers
- Whisper transcription optimization

### 3. spanishFallbackScripts.ts
**Conversation Flows:**
- `generateSpanishProfessionalFlow()` - Professional business Spanish approach
- `generateSpanishFriendlyFlow()` - Warm, culturally-adapted Spanish conversation
- `generateSpanishAggressiveFlow()` - Direct Spanish sales approach with cultural respect
- `generateSpanishConsultativeFlow()` - Expert consultation in professional Spanish

**Cultural Adaptations:**
- Hispanic/Latino business communication styles
- Natural Spanish sales terminology
- Cultural communication preferences
- Professional business Spanish phrases

## Language Detection Intelligence

### Automatic Detection Patterns
```javascript
Spanish Indicators: ['español', 'hablar español', 'en español', 'prefiero español']
English Indicators: ['english', 'yes english', 'continue in english']
Language Patterns: ['sí', 'no hablo', 'me gusta', 'quiero', 'necesito']
```

### Agent Type Mapping
```javascript
English to Spanish:
- professional-female → professional-female-es
- aggressive-male → aggressive-male-es
- friendly-female → friendly-male-es

Spanish to English: 
- professional-female-es → professional-female
- friendly-male-es → friendly-female
```

## Integration Points

### AICallScriptModal.tsx
- Imports fallback manager for enhanced script generation
- Maintains original AI API integration
- Falls back to language-specific scripts when API unavailable

### API Route (/api/generate-call-script)
- Uses fallback system when OpenAI API errors occur
- Passes agent types configuration to fallback generator
- Maintains consistency between AI-generated and fallback scripts

## Benefits

### 1. **Improved Maintainability**
- Separate files for each language reduce complexity
- Easy to add new languages or modify existing flows
- Clear separation of concerns

### 2. **Enhanced Cultural Sensitivity**
- Native-level language adaptations
- Cultural communication style respect
- Professional business terminology in appropriate languages

### 3. **Robust Fallback System**
- Guaranteed functionality when API unavailable
- Language-appropriate fallbacks based on customer preference
- Intelligent agent type mapping across languages

### 4. **Scalability**
- Easy to add new languages (French, German, etc.)
- Modular structure supports expansion
- Template system for consistent conversation quality

## Usage Examples

### Basic Fallback Generation
```typescript
import { generateAdvancedFallbackScript } from './fallbackScriptManager';

const script = generateAdvancedFallbackScript(
  leadData, 
  'professional-female-es', 
  agentTypes
);
```

### Language Detection
```typescript
import { detectCustomerLanguagePreference } from './fallbackScriptManager';

const language = detectCustomerLanguagePreference("Sí, prefiero español");
// Returns: 'es'
```

### Agent Type Language Switching
```typescript
import { getLanguageSwitchedAgentType } from './fallbackScriptManager';

const newAgentType = getLanguageSwitchedAgentType('professional-female', 'es');
// Returns: 'professional-female-es'
```

## Future Enhancements

### Planned Languages
- French (France/Canada variations)
- German (Business/Casual variations)  
- Portuguese (Brazil/Portugal variations)
- Italian

### Advanced Features
- Regional dialect support
- Industry-specific terminology
- Time-zone based greetings
- Cultural holiday awareness

## Best Practices

### 1. **Language Preference Priority**
- Always ask language preference in opening phase
- Respect customer choice immediately
- Never assume language based on name/location

### 2. **Cultural Sensitivity**
- Use appropriate business communication styles
- Respect cultural norms and expectations
- Maintain professional tone across all languages

### 3. **Fallback Quality**
- Ensure fallback scripts maintain same sales effectiveness
- Test conversation flows with native speakers
- Regular updates based on customer feedback

### 4. **Technical Considerations**
- Whisper transcription logs remain in English for internal processing
- Customer language preference saved for future interactions
- Agent personality consistency across languages

This modular approach ensures the GhostCRM system can provide excellent multilingual customer service regardless of external API availability, while maintaining cultural sensitivity and sales effectiveness across all supported languages.