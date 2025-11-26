import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtToken } from '@/lib/jwt';
import { createClient } from '@supabase/supabase-js';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
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

        const organizationId = params.id;

        // Verify user has access to this organization
        if (decoded.organizationId !== organizationId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Use service role to fetch organization
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data: organization, error } = await supabaseAdmin
            .from('organizations')
            .select('*')
            .eq('id', organizationId)
            .single();

        if (error) {
            console.error('Error fetching organization:', error);
            return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
        }

        return NextResponse.json(organization);

    } catch (error) {
        console.error('Error in organization fetch:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}