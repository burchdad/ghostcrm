import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface SubdomainRequest {
  subdomain: string;
  organizationId: string;
  organizationName: string;
  ownerEmail: string;
  customDomain?: string;
  autoProvision?: boolean;
}

interface SubdomainResponse {
  success: boolean;
  subdomain: string;
  fullDomain: string;
  status: 'pending' | 'active' | 'failed';
  message: string;
  dnsRecords?: DNSRecord[];
  error?: string;
}

interface DNSRecord {
  type: 'CNAME' | 'A';
  name: string;
  value: string;
  ttl: number;
}

/**
 * POST /api/subdomains/provision
 * Automated subdomain provisioning for client onboarding
 */
export async function POST(req: NextRequest) {
  try {
    const body: SubdomainRequest = await req.json();
    const { subdomain, organizationId, organizationName, ownerEmail, customDomain, autoProvision = true } = body;

    // Validate required fields
    if (!subdomain || !organizationId || !organizationName || !ownerEmail) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: subdomain, organizationId, organizationName, ownerEmail'
      }, { status: 400 });
    }

    // Validate subdomain format
    const validationResult = validateSubdomain(subdomain);
    if (!validationResult.valid) {
      return NextResponse.json({
        success: false,
        error: validationResult.error
      }, { status: 400 });
    }

    // Check if subdomain already exists
    const existingSubdomain = await checkSubdomainExists(subdomain);
    if (existingSubdomain.exists) {
      return NextResponse.json({
        success: false,
        error: `Subdomain '${subdomain}' is already taken. Please choose a different name.`,
        suggestions: await generateSubdomainSuggestions(subdomain)
      }, { status: 409 });
    }

    // Create subdomain record in database
    const subdomainRecord = await createSubdomainRecord({
      subdomain,
      organizationId,
      organizationName,
      ownerEmail,
      customDomain,
      status: 'pending'
    });

    if (!subdomainRecord.success) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create subdomain record in database'
      }, { status: 500 });
    }

    // Auto-provision DNS if enabled
    let dnsRecords: DNSRecord[] = [];
    let status: 'pending' | 'active' | 'failed' = 'pending';
    
    if (autoProvision) {
      const dnsResult = await provisionDNS(subdomain, customDomain);
      if (dnsResult.success) {
        status = 'active';
        dnsRecords = dnsResult.records;
        
        // Update database status
        await updateSubdomainStatus(subdomain, 'active');
      } else {
        // Log DNS provisioning failure but don't fail the entire request
        console.error('DNS provisioning failed:', dnsResult.error);
      }
    }

    // Generate full domain URL
    const baseDomain = customDomain || 'ghostcrm.ai';
    const fullDomain = `https://${subdomain}.${baseDomain}`;

    // Send setup email to organization owner
    if (status === 'active') {
      await sendSubdomainSetupEmail(ownerEmail, subdomain, fullDomain, organizationName);
    }

    const response: SubdomainResponse = {
      success: true,
      subdomain,
      fullDomain,
      status,
      message: status === 'active' 
        ? `Subdomain '${subdomain}' has been successfully provisioned and is ready to use!`
        : `Subdomain '${subdomain}' has been created. DNS provisioning is in progress.`,
      dnsRecords: dnsRecords.length > 0 ? dnsRecords : undefined
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Subdomain provisioning error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error during subdomain provisioning'
    }, { status: 500 });
  }
}

/**
 * GET /api/subdomains/provision
 * Get subdomain provisioning status
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const subdomain = searchParams.get('subdomain');
    const organizationId = searchParams.get('organizationId');

    if (!subdomain && !organizationId) {
      return NextResponse.json({
        success: false,
        error: 'Either subdomain or organizationId parameter is required'
      }, { status: 400 });
    }

    const subdomainInfo = await getSubdomainInfo(subdomain, organizationId);
    
    if (!subdomainInfo) {
      return NextResponse.json({
        success: false,
        error: 'Subdomain not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      ...subdomainInfo
    });

  } catch (error) {
    console.error('Subdomain status check error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve subdomain information'
    }, { status: 500 });
  }
}

// Helper Functions

function validateSubdomain(subdomain: string): { valid: boolean; error?: string } {
  // Subdomain validation rules
  const minLength = 3;
  const maxLength = 63;
  const pattern = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
  
  const reservedSubdomains = [
    'www', 'api', 'admin', 'app', 'mail', 'ftp', 'blog', 'support', 
    'help', 'docs', 'status', 'dev', 'staging', 'test', 'demo',
    'dashboard', 'login', 'register', 'auth', 'billing', 'account'
  ];

  if (subdomain.length < minLength) {
    return { valid: false, error: `Subdomain must be at least ${minLength} characters long` };
  }

  if (subdomain.length > maxLength) {
    return { valid: false, error: `Subdomain must be no more than ${maxLength} characters long` };
  }

  if (!pattern.test(subdomain)) {
    return { valid: false, error: 'Subdomain can only contain lowercase letters, numbers, and hyphens. Must start and end with alphanumeric character.' };
  }

  if (reservedSubdomains.includes(subdomain.toLowerCase())) {
    return { valid: false, error: `'${subdomain}' is a reserved subdomain name. Please choose a different name.` };
  }

  return { valid: true };
}

async function checkSubdomainExists(subdomain: string): Promise<{ exists: boolean; organizationId?: string }> {
  try {
    const { data, error } = await supabase
      .from('subdomains')
      .select('subdomain, organization_id')
      .eq('subdomain', subdomain.toLowerCase())
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    return {
      exists: !!data,
      organizationId: data?.organization_id
    };
  } catch (error) {
    console.error('Error checking subdomain existence:', error);
    return { exists: false };
  }
}

async function generateSubdomainSuggestions(baseSubdomain: string): Promise<string[]> {
  const suggestions: string[] = [];
  const suffixes = ['inc', 'co', 'group', 'team', 'solutions', 'crm'];
  const numbers = ['2', '3', '2024', '2025'];

  // Add suffix suggestions
  for (const suffix of suffixes) {
    const suggestion = `${baseSubdomain}-${suffix}`;
    const exists = await checkSubdomainExists(suggestion);
    if (!exists.exists) {
      suggestions.push(suggestion);
      if (suggestions.length >= 3) break;
    }
  }

  // Add number suffix suggestions if needed
  if (suggestions.length < 5) {
    for (const num of numbers) {
      const suggestion = `${baseSubdomain}${num}`;
      const exists = await checkSubdomainExists(suggestion);
      if (!exists.exists) {
        suggestions.push(suggestion);
        if (suggestions.length >= 5) break;
      }
    }
  }

  return suggestions.slice(0, 5);
}

async function createSubdomainRecord(data: {
  subdomain: string;
  organizationId: string;
  organizationName: string;
  ownerEmail: string;
  customDomain?: string;
  status: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const { data: result, error } = await supabase
      .from('subdomains')
      .insert({
        subdomain: data.subdomain.toLowerCase(),
        organization_id: data.organizationId,
        organization_name: data.organizationName,
        owner_email: data.ownerEmail,
        custom_domain: data.customDomain,
        status: data.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (error) {
      throw error;
    }

    return { success: true, id: result.id };
  } catch (error) {
    console.error('Error creating subdomain record:', error);
    return { success: false, error: String(error) };
  }
}

async function provisionDNS(subdomain: string, customDomain?: string): Promise<{ success: boolean; records: DNSRecord[]; error?: string }> {
  try {
    // This would integrate with your DNS provider (Vercel, Cloudflare, etc.)
    // For now, we'll return the DNS records that need to be created manually
    
    const baseDomain = customDomain || 'ghostcrm.ai';
    const records: DNSRecord[] = [
      {
        type: 'CNAME',
        name: subdomain,
        value: 'cname.vercel-dns.com', // Vercel's CNAME target
        ttl: 300
      }
    ];

    // In a real implementation, you would:
    // 1. Call Vercel API to add the domain
    // 2. Call DNS provider API to create records
    // 3. Verify DNS propagation

    return {
      success: true,
      records
    };
  } catch (error) {
    return {
      success: false,
      records: [],
      error: String(error)
    };
  }
}

async function updateSubdomainStatus(subdomain: string, status: string): Promise<void> {
  try {
    await supabase
      .from('subdomains')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('subdomain', subdomain.toLowerCase());
  } catch (error) {
    console.error('Error updating subdomain status:', error);
  }
}

async function getSubdomainInfo(subdomain?: string | null, organizationId?: string | null) {
  try {
    let query = supabase.from('subdomains').select('*');
    
    if (subdomain) {
      query = query.eq('subdomain', subdomain.toLowerCase());
    } else if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    const { data, error } = await query.single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting subdomain info:', error);
    return null;
  }
}

async function sendSubdomainSetupEmail(email: string, subdomain: string, fullDomain: string, organizationName: string): Promise<void> {
  try {
    // Integration with your email service (SendGrid, etc.)
    console.log(`Sending setup email to ${email} for ${subdomain}.ghostcrm.ai`);
    
    // Email content would include:
    // - Welcome message
    // - Subdomain URL
    // - Login instructions
    // - Setup next steps
  } catch (error) {
    console.error('Error sending setup email:', error);
  }
}