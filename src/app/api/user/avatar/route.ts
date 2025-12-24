import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const jwtSecret = process.env.JWT_SECRET!;

const supabase = createClient(supabaseUrl, supabaseKey);

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed image types
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

// POST - Upload avatar
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Avatar upload request received');

    // Get user info from JWT cookie
    const jwtCookie = request.cookies.get('ghostcrm_jwt');
    
    if (!jwtCookie) {
      console.error('❌ No JWT cookie found');
      return NextResponse.json({ error: 'Unauthorized - No JWT cookie' }, { status: 401 });
    }

    let jwtUser;
    try {
      jwtUser = jwt.verify(jwtCookie.value, jwtSecret) as any;
      console.log('✅ JWT verified successfully for user:', jwtUser.userId);
    } catch (jwtError: any) {
      console.error('❌ JWT verification failed:', jwtError);
      return NextResponse.json({ error: 'Unauthorized - Invalid JWT' }, { status: 401 });
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get('avatar') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Allowed types: JPEG, PNG, WebP, GIF' 
      }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 5MB' 
      }, { status: 400 });
    }

    // Get organization info
    let orgData;
    if (jwtUser.organizationId) {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, subdomain')
        .eq('id', jwtUser.organizationId)
        .single();
      
      if (error) {
        console.error('❌ Organization not found by ID:', error);
        return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
      }
      orgData = data;
    } else {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, subdomain')
        .eq('subdomain', jwtUser.subdomain || 'default')
        .single();

      if (error) {
        console.error('❌ Organization not found by subdomain:', error);
        return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
      }
      orgData = data;
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const timestamp = Date.now();
    const fileName = `avatar_${jwtUser.userId}_${timestamp}.${fileExtension}`;
    const filePath = `avatars/${orgData.id}/${fileName}`;

    console.log('📁 Uploading file to path:', filePath);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('user-files')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('❌ Upload failed:', uploadError);
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('user-files')
      .getPublicUrl(filePath);

    const avatarUrl = publicUrlData.publicUrl;

    // Update user profile with new avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', jwtUser.userId)
      .eq('organization_id', orgData.id);

    if (updateError) {
      console.error('❌ Profile update failed:', updateError);
      // Try to clean up uploaded file
      await supabase.storage.from('user-files').remove([filePath]);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    console.log('✅ Avatar uploaded and profile updated successfully');

    return NextResponse.json({
      success: true,
      avatarUrl,
      message: 'Avatar uploaded successfully'
    });

  } catch (error: any) {
    console.error('❌ Avatar upload error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// DELETE - Remove avatar
export async function DELETE(request: NextRequest) {
  try {
    console.log('🔄 Avatar delete request received');

    // Get user info from JWT cookie
    const jwtCookie = request.cookies.get('ghostcrm_jwt');
    
    if (!jwtCookie) {
      return NextResponse.json({ error: 'Unauthorized - No JWT cookie' }, { status: 401 });
    }

    let jwtUser;
    try {
      jwtUser = jwt.verify(jwtCookie.value, jwtSecret) as any;
    } catch (jwtError: any) {
      return NextResponse.json({ error: 'Unauthorized - Invalid JWT' }, { status: 401 });
    }

    // Get organization info
    let orgData;
    if (jwtUser.organizationId) {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, subdomain')
        .eq('id', jwtUser.organizationId)
        .single();
      
      if (error) {
        return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
      }
      orgData = data;
    } else {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, subdomain')
        .eq('subdomain', jwtUser.subdomain || 'default')
        .single();

      if (error) {
        return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
      }
      orgData = data;
    }

    // Get current profile to check for existing avatar
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', jwtUser.userId)
      .eq('organization_id', orgData.id)
      .single();

    if (profileError) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Extract file path from avatar URL if it exists
    if (profileData.avatar_url) {
      const urlParts = profileData.avatar_url.split('/');
      const storageIndex = urlParts.findIndex(part => part === 'user-files');
      if (storageIndex !== -1 && storageIndex < urlParts.length - 1) {
        const filePath = urlParts.slice(storageIndex + 1).join('/');
        
        // Delete file from storage
        const { error: deleteError } = await supabase.storage
          .from('user-files')
          .remove([filePath]);

        if (deleteError) {
          console.warn('⚠️ Failed to delete file from storage:', deleteError);
        }
      }
    }

    // Update profile to remove avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        avatar_url: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', jwtUser.userId)
      .eq('organization_id', orgData.id);

    if (updateError) {
      console.error('❌ Profile update failed:', updateError);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    console.log('✅ Avatar removed successfully');

    return NextResponse.json({
      success: true,
      message: 'Avatar removed successfully'
    });

  } catch (error: any) {
    console.error('❌ Avatar delete error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}