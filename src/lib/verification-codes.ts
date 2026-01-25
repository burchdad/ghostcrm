import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * Generate a random 6-digit verification code
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Create and store a verification code for a user
 */
export async function createVerificationCode(userId: string, email: string): Promise<string> {
  const code = generateVerificationCode();
  
  // Clean up any existing codes for this user first
  await supabaseAdmin
    .from('verification_codes')
    .delete()
    .eq('user_id', userId);

  // Insert new verification code
  const { error } = await supabaseAdmin
    .from('verification_codes')
    .insert({
      user_id: userId,
      email: email.toLowerCase(),
      code: code,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
      used: false
    });

  if (error) {
    console.error('[VERIFICATION] Failed to create code:', error);
    throw new Error('Failed to generate verification code');
  }

  console.log('[VERIFICATION] Created code for user:', userId);
  return code;
}

/**
 * Validate a verification code
 */
export async function validateVerificationCode(email: string, code: string): Promise<{ valid: boolean; userId?: string }> {
  const { data: codeRecord, error } = await supabaseAdmin
    .from('verification_codes')
    .select('user_id')
    .eq('email', email.toLowerCase())
    .eq('code', code)
    .eq('used', false)
    .gte('expires_at', new Date().toISOString())
    .maybeSingle();

  if (error || !codeRecord) {
    return { valid: false };
  }

  return { valid: true, userId: codeRecord.user_id };
}