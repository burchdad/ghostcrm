import OpenAI from 'openai';

/**
 * Safe OpenAI client creation that gracefully handles missing API keys
 * during build time and development environments.
 */

/**
 * Creates a safe OpenAI client that won't crash during builds
 */
export function createSafeOpenAIClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) {
    console.log('🔄 OpenAI API key not configured, OpenAI features disabled');
    return null;
  }

  try {
    return new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  } catch (error) {
    console.error('Failed to initialize OpenAI client:', error);
    return null;
  }
}

/**
 * Helper function to wrap OpenAI operations with proper error handling
 */
export async function withOpenAI<T>(
  operation: (openai: OpenAI) => Promise<T>,
  fallback: T
): Promise<T> {
  const openai = createSafeOpenAIClient();
  
  if (!openai) {
    console.log('OpenAI not configured, returning fallback response');
    return fallback;
  }

  try {
    return await operation(openai);
  } catch (error) {
    console.error('OpenAI operation failed:', error);
    return fallback;
  }
}

/**
 * Check if OpenAI is properly configured
 */
export function isOpenAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

/**
 * Get mock chat completion response for fallback scenarios
 */
export function getMockChatCompletion(content: string = 'AI service temporarily unavailable'): any {
  return {
    id: 'mock-completion',
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: 'mock-model',
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content,
        },
        finish_reason: 'stop',
      },
    ],
    usage: {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    },
  };
}

/**
 * Safe chat completion with fallback
 */
export async function safeChatCompletion(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  options: Partial<OpenAI.Chat.Completions.ChatCompletionCreateParams> = {}
): Promise<any> {
  return withOpenAI(
    async (openai) => {
      return await openai.chat.completions.create({
        model: 'gpt-4',
        messages,
        temperature: 0.7,
        max_tokens: 1000,
        ...options,
      });
    },
    getMockChatCompletion('AI analysis temporarily unavailable. Please check OpenAI configuration.')
  );
}