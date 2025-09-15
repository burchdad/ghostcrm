import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import crypto from 'crypto';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const secretSchema = z.object({
  url: z.string().url(),
  user: z.string()
});

// Utility: Encrypt secret
function encryptSecret(secret: string): string {
  const cipher = crypto.createCipheriv('aes-256-cbc', process.env.SECRET_ENCRYPT_KEY!.padEnd(32, '0'), Buffer.alloc(16));
  let encrypted = cipher.update(secret, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

// POST: Rotate secret for an endpoint
export async function POST(req: Request) {
  const body = await req.json();
  const parsed = secretSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid secret rotation data', details: parsed.error.errors }, { status: 400 });
  }
  // Generate new secret
  const newSecret = crypto.randomBytes(32).toString('hex');
  const encryptedSecret = encryptSecret(newSecret);
  // Store encrypted secret in Supabase (never return plain secret)
  const { error } = await supabase.from('api_endpoint_secrets').upsert([
    { url: body.url, secret: encryptedSecret, updated_at: new Date().toISOString() }
  ], { onConflict: 'url' });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  // Audit log
  await supabase.from('api_endpoint_audit').insert({ endpoint_url: body.url, action: 'rotate-secret', user: body.user, details: 'Secret rotated', timestamp: new Date().toISOString() });
  return NextResponse.json({ success: true });
}

// GET: Never return secrets (compliance)
export async function GET() {
  return NextResponse.json({ success: false, error: 'Access to secrets is forbidden for compliance.' }, { status: 403 });
}
