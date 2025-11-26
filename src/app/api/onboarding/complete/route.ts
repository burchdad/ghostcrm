import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtToken } from '@/lib/jwt';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
    try {
        // Verify JWT token
        const token = req.cookies.get('ghostcrm_jwt')?.value;
        
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyJwtToken(token);
        if (!decoded) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // Parse request body
        const { organizationId } = await req.json();

        if (!organizationId) {
            return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
        }

        // Verify user owns this organization
        if (decoded.organizationId !== organizationId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Use service role to update organization
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Mark onboarding as completed
        const { error } = await supabaseAdmin
            .from('organizations')
            .update({ 
                onboarding_completed: true,
                updated_at: new Date().toISOString()
            })
            .eq('id', organizationId);

        if (error) {
            console.error('Error completing onboarding:', error);
            return NextResponse.json({ error: 'Failed to complete onboarding' }, { status: 500 });
        }

        console.log('✅ [ONBOARDING] Completed for organization:', organizationId);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error in onboarding completion:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}