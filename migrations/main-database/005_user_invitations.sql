-- User Invitations Table for GhostCRM
-- Add this table to your existing Supabase schema

CREATE TABLE user_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL,
    tier TEXT NOT NULL,
    invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
    invitation_token UUID DEFAULT gen_random_uuid(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, email)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_invitations_org_id ON user_invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_invitations_email ON user_invitations(email);
CREATE INDEX IF NOT EXISTS idx_user_invitations_token ON user_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_user_invitations_status ON user_invitations(status);
CREATE INDEX IF NOT EXISTS idx_user_invitations_expires ON user_invitations(expires_at);

-- RLS Policies
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;

-- Organization members can view invitations for their org
CREATE POLICY "Organization members can view invitations" ON user_invitations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organization_memberships 
            WHERE organization_id = user_invitations.organization_id 
            AND user_id = auth.uid() 
            AND status = 'active'
        )
    );

-- Only users with manage permissions can create invitations
CREATE POLICY "Admins can create invitations" ON user_invitations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM organization_memberships om
            JOIN user_roles ur ON om.role_id = ur.id
            WHERE om.organization_id = user_invitations.organization_id 
            AND om.user_id = auth.uid() 
            AND om.status = 'active'
            AND (ur.permissions ? 'users.manage' OR om.role = 'owner')
        )
    );

-- Admins can update invitations (cancel, resend, etc.)
CREATE POLICY "Admins can update invitations" ON user_invitations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM organization_memberships om
            JOIN user_roles ur ON om.role_id = ur.id
            WHERE om.organization_id = user_invitations.organization_id 
            AND om.user_id = auth.uid() 
            AND om.status = 'active'
            AND (ur.permissions ? 'users.manage' OR om.role = 'owner')
        )
    );

-- Function to clean up expired invitations
CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    UPDATE user_invitations 
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'pending' AND expires_at < NOW();
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to accept an invitation
CREATE OR REPLACE FUNCTION accept_invitation(invitation_token UUID, accepting_user_id UUID)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    organization_id UUID
) AS $$
DECLARE
    invitation_record user_invitations%ROWTYPE;
    role_record user_roles%ROWTYPE;
BEGIN
    -- Get the invitation
    SELECT * INTO invitation_record
    FROM user_invitations 
    WHERE user_invitations.invitation_token = accept_invitation.invitation_token
    AND status = 'pending' 
    AND expires_at > NOW();
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'Invalid or expired invitation', NULL::UUID;
        RETURN;
    END IF;
    
    -- Check if user is already in the organization
    IF EXISTS (
        SELECT 1 FROM organization_memberships
        WHERE organization_id = invitation_record.organization_id
        AND user_id = accepting_user_id
    ) THEN
        RETURN QUERY SELECT FALSE, 'User is already a member of this organization', NULL::UUID;
        RETURN;
    END IF;
    
    -- Get the role record
    SELECT * INTO role_record
    FROM user_roles 
    WHERE name = invitation_record.role 
    AND is_system_role = TRUE;
    
    -- Create organization membership
    INSERT INTO organization_memberships (
        organization_id,
        user_id,
        role,
        tier,
        role_id,
        status,
        created_at
    ) VALUES (
        invitation_record.organization_id,
        accepting_user_id,
        invitation_record.role,
        invitation_record.tier,
        role_record.id,
        'active',
        NOW()
    );
    
    -- Mark invitation as accepted
    UPDATE user_invitations 
    SET status = 'accepted', 
        accepted_at = NOW(),
        updated_at = NOW()
    WHERE user_invitations.invitation_token = accept_invitation.invitation_token;
    
    RETURN QUERY SELECT TRUE, 'Invitation accepted successfully', invitation_record.organization_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;