import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated, getUserFromRequest } from '@/lib/auth/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Authenticate user
        if (!(await isAuthenticated(req))) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await getUserFromRequest(req);
        if (!user?.organizationId) {
            return NextResponse.json({ error: 'User organization not found' }, { status: 401 });
        }

        const organizationId = params.id;

        // Verify user has access to this organization
        if (user.organizationId.toString() !== organizationId) {
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