import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// File validation constants
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = ['audio/mp4', 'audio/wav', 'audio/mpeg', 'audio/webm', 'video/mp4'];
const MAX_DURATION = 300; // 5 minutes max

interface VoiceUpload {
  tenantId: string;
  voiceName: string;
  voiceType: 'primary' | 'sales' | 'support' | 'spanish' | 'custom';
  isActive: boolean;
  metadata: {
    originalName: string;
    duration: number;
    size: number;
    quality: 'processing' | 'good' | 'excellent' | 'poor';
  };
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('voice') as File;
    const tenantId = formData.get('tenantId') as string;
    const voiceName = formData.get('voiceName') as string;
    const voiceType = formData.get('voiceType') as string || 'primary';
    
    console.log(`🎤 [VOICE UPLOAD] Processing upload for tenant: ${tenantId}`);

    // Validation
    if (!file) {
      return NextResponse.json({ error: 'No voice file provided' }, { status: 400 });
    }

    if (!tenantId || !voiceName) {
      return NextResponse.json({ error: 'Tenant ID and voice name required' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 50MB' 
      }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Please upload MP4, WAV, or MP3 files only' 
      }, { status: 400 });
    }

    // Create tenant voice directory
    const voicesDir = join(process.cwd(), 'public', 'voices', tenantId);
    if (!existsSync(voicesDir)) {
      await mkdir(voicesDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'mp3';
    const fileName = `${voiceType}-${voiceName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${timestamp}.${extension}`;
    const filePath = join(voicesDir, fileName);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    console.log(`✅ [VOICE UPLOAD] File saved: ${fileName}`);

    // Basic audio analysis (we'll enhance this later)
    const audioMetadata = {
      originalName: file.name,
      duration: 0, // TODO: Extract actual duration
      size: file.size,
      quality: 'processing' as const
    };

    // Store voice record in database
    const voiceRecord: VoiceUpload = {
      tenantId,
      voiceName,
      voiceType: voiceType as any,
      isActive: false, // Starts inactive until approved
      metadata: audioMetadata
    };

    // TODO: Save to Supabase voices table
    // For now, we'll return the file path

    const publicUrl = `/voices/${tenantId}/${fileName}`;

    return NextResponse.json({
      success: true,
      voiceId: `${tenantId}_${voiceType}_${timestamp}`,
      fileName,
      publicUrl,
      metadata: audioMetadata,
      message: 'Voice uploaded successfully. Processing audio quality...'
    });

  } catch (error) {
    console.error('❌ [VOICE UPLOAD] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to upload voice file' 
    }, { status: 500 });
  }
}

// Get tenant voices
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
    }

    // TODO: Fetch from Supabase voices table
    // For now, return mock data structure
    
    const mockVoices = [
      {
        id: 'primary_001',
        name: 'Owner Voice',
        type: 'primary',
        isActive: true,
        url: `/voices/${tenantId}/primary-owner-voice.mp3`,
        uploadedAt: new Date().toISOString(),
        metadata: {
          duration: 45,
          size: 2048000,
          quality: 'excellent'
        }
      }
    ];

    return NextResponse.json({
      voices: mockVoices,
      tenantId
    });

  } catch (error) {
    console.error('❌ [VOICE FETCH] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch voices' 
    }, { status: 500 });
  }
}