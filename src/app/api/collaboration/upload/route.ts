import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserFromRequest, isAuthenticated } from '@/lib/auth/server';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/collaboration/upload
 * Upload files for sharing in channels
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication using Supabase SSR
    if (!(await isAuthenticated(request))) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get user data from Supabase session
    const user = await getUserFromRequest(request);
    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'Invalid token or missing organization' }, { status: 401 });
    }

    const tenantId = user.organizationId;
    const userId = user.id;

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const channelId = formData.get('channelId') as string;

    // Validate input
    if (!file || !channelId) {
      return NextResponse.json(
        { error: 'File and channel ID are required' },
        { status: 400 }
      );
    }

    // Verify channel access
    const { data: channel } = await supabase
      .from('collaboration_channels')
      .select('id, organization_id, type, members')
      .eq('id', channelId)
      .eq('organization_id', tenantId)
      .single();

    if (!channel) {
      return NextResponse.json(
        { error: 'Channel not found or access denied' },
        { status: 404 }
      );
    }

    // For private/direct channels, verify user is a member
    if ((channel.type === 'private' || channel.type === 'direct') && 
        !channel.members?.includes(userId)) {
      return NextResponse.json(
        { error: 'Access denied to this channel' },
        { status: 403 }
      );
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Generate file ID and mock URL (in production, upload to cloud storage)
    const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const mockUrl = `/api/collaboration/files/${fileId}/${encodeURIComponent(file.name)}`;

    // Store file metadata in database
    const { data: uploadedFile, error: fileError } = await supabase
      .from('collaboration_files')
      .insert([{
        filename: file.name,
        size: file.size,
        mime_type: file.type,
        url: mockUrl,
        channel_id: channelId,
        uploaded_by: userId,
        organization_id: tenantId
      }])
      .select()
      .single();

    if (fileError) {
      console.error('Error storing file metadata:', fileError);
      return NextResponse.json(
        { error: 'Failed to store file metadata' },
        { status: 500 }
      );
    }

    // Return file upload result
    const fileInfo = {
      id: uploadedFile.id,
      name: uploadedFile.filename,
      size: uploadedFile.size,
      type: uploadedFile.mime_type,
      url: uploadedFile.url,
      uploadedBy: uploadedFile.uploaded_by,
      uploadedAt: new Date(uploadedFile.created_at)
    };

    return NextResponse.json(fileInfo);

  } catch (error) {
    console.error('Error in file upload API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}