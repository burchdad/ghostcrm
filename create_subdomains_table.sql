-- Create subdomains table for tenant subdomain management
CREATE TABLE IF NOT EXISTS public.subdomains (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subdomain VARCHAR(63) NOT NULL UNIQUE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'placeholder' CHECK (status IN ('placeholder', 'active', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    activated_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subdomains_subdomain ON public.subdomains(subdomain);
CREATE INDEX IF NOT EXISTS idx_subdomains_organization_id ON public.subdomains(organization_id);
CREATE INDEX IF NOT EXISTS idx_subdomains_status ON public.subdomains(status);

-- Enable RLS
ALTER TABLE public.subdomains ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their organization's subdomains" 
    ON public.subdomains FOR SELECT 
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM public.users 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert subdomains for their organization" 
    ON public.subdomains FOR INSERT 
    WITH CHECK (
        organization_id IN (
            SELECT organization_id 
            FROM public.users 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update their organization's subdomains" 
    ON public.subdomains FOR UPDATE 
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM public.users 
            WHERE id = auth.uid()
        )
    );

-- Add comment
COMMENT ON TABLE public.subdomains IS 'Manages tenant subdomains and their activation status';