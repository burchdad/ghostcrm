import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const { email, verify = false } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    // Get user by email
    const { data: users, error: getUserError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (getUserError) {
      return NextResponse.json({ error: 'Failed to get users' }, { status: 500 });
    }
    
    const user = users.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const response = {
      user: {
        id: user.id,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at,
        created_at: user.created_at,
        user_metadata: user.user_metadata
      }
    };
    
    // If verify flag is true, manually verify the email
    if (verify && !user.email_confirmed_at) {
      const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        { email_confirm: true }
      );
      
      if (updateError) {
        return NextResponse.json({ 
          error: 'Failed to verify email',
          details: updateError,
          ...response
        }, { status: 500 });
      }
      
      return NextResponse.json({
        success: true,
        message: 'Email verified successfully',
        user: {
          id: updatedUser.user.id,
          email: updatedUser.user.email,
          email_confirmed_at: updatedUser.user.email_confirmed_at,
          created_at: updatedUser.user.created_at,
          user_metadata: updatedUser.user.user_metadata
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      ...response
    });
    
  } catch (error) {
    console.error('Error in manual verification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}