-- GhostCRM Organizations Table for Supabase
-- This creates the organizations table required for multi-tenant support

-- Create organizations table
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  subdomain VARCHAR(100) UNIQUE,
  owner_id UUID, -- Reference to the user who owns this organization
  database_url TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  subscription_tier VARCHAR(50) DEFAULT 'starter',
  settings JSONB DEFAULT '{}',
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_organizations_subdomain ON public.organizations(subdomain);
CREATE INDEX idx_organizations_status ON public.organizations(status);
CREATE INDEX idx_organizations_subscription_tier ON public.organizations(subscription_tier);
CREATE INDEX idx_organizations_owner_id ON public.organizations(owner_id);

-- Enable Row Level Security
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Create policies for Row Level Security
CREATE POLICY "Organizations are viewable by authenticated users" ON public.organizations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Organizations can be inserted by authenticated users" ON public.organizations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Organizations can be updated by authenticated users" ON public.organizations
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Grant necessary permissions
GRANT ALL ON public.organizations TO authenticated;
GRANT ALL ON public.organizations TO anon;

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Now add foreign key references
ALTER TABLE public.users 
ADD CONSTRAINT fk_users_organization 
FOREIGN KEY (organization_id) REFERENCES public.organizations(id);

ALTER TABLE public.organizations
ADD CONSTRAINT fk_organizations_owner
FOREIGN KEY (owner_id) REFERENCES public.users(id);