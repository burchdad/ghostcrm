import { NextRequest, NextResponse } from 'next/server';


export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  try {
    // Return mock collaboration status
    return NextResponse.json({
      status: 'success',
      data: {
        activeCollaborators: 3,
        onlineUsers: ['user1', 'user2', 'user3'],
        lastActivity: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Collaboration API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collaboration status' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Return mock collaboration creation response
    return NextResponse.json({
      status: 'success',
      data: {
        sessionId: 'collab_' + Date.now(),
        participants: [body.userId],
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Collaboration creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create collaboration session' },
      { status: 500 }
    );
  }
}
