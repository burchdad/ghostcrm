import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export default async function HealthCheck() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
  
  const { data: { user } } = await supabase.auth.getUser();
  
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">🔍 Production Routing Health Check</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Status</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <strong>User:</strong> {user ? user.email : 'Not authenticated'}
          </div>
          <div>
            <strong>Email Verified:</strong> {user?.email_confirmed_at ? '✅ Yes' : '❌ No'}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Subdomain Tests */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">🏢 Subdomain Routing Tests</h3>
          <div className="space-y-3 text-sm">
            <div className="bg-gray-50 p-3 rounded">
              <strong>A) Invalid subdomain:</strong>
              <br />
              <a href="https://doesnotexist.ghostcrm.ai/app" className="text-blue-600 hover:underline" target="_blank">
                https://doesnotexist.ghostcrm.ai/app
              </a>
              <br />
              <span className="text-gray-600">Expected: Rewrite to /tenant-not-found (no loop)</span>
            </div>
            
            <div className="bg-gray-50 p-3 rounded">
              <strong>B) Valid subdomain, unauth, protected:</strong>
              <br />
              <a href="https://demo.ghostcrm.ai/app" className="text-blue-600 hover:underline" target="_blank">
                https://demo.ghostcrm.ai/app
              </a>
              <br />
              <span className="text-gray-600">Expected: Redirect to /login?redirect=%2Fapp</span>
            </div>
            
            <div className="bg-gray-50 p-3 rounded">
              <strong>C) Valid subdomain, public route:</strong>
              <br />
              <a href="https://demo.ghostcrm.ai/login" className="text-blue-600 hover:underline" target="_blank">
                https://demo.ghostcrm.ai/login
              </a>
              <br />
              <span className="text-gray-600">Expected: Page loads (no RLS blocking)</span>
            </div>
          </div>
        </div>
        
        {/* Main Domain Tests */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">🏠 Main Domain State Tests</h3>
          <div className="space-y-3 text-sm">
            <div className="bg-gray-50 p-3 rounded">
              <strong>State A - Unauth:</strong>
              <br />
              <a href="https://ghostcrm.ai/" className="text-blue-600 hover:underline" target="_blank">
                https://ghostcrm.ai/ (✅ allow)
              </a>
              <br />
              <a href="https://ghostcrm.ai/app" className="text-blue-600 hover:underline" target="_blank">
                https://ghostcrm.ai/app (➡️ /login)
              </a>
            </div>
            
            <div className="bg-gray-50 p-3 rounded">
              <strong>State B - Unpaid:</strong>
              <br />
              <a href="https://ghostcrm.ai/billing" className="text-blue-600 hover:underline" target="_blank">
                https://ghostcrm.ai/billing (✅ allow)
              </a>
              <br />
              <a href="https://ghostcrm.ai/app" className="text-blue-600 hover:underline" target="_blank">
                https://ghostcrm.ai/app (➡️ /billing)
              </a>
            </div>
            
            <div className="bg-gray-50 p-3 rounded">
              <strong>State C - Paid:</strong>
              <br />
              <a href="https://ghostcrm.ai/billing/success" className="text-blue-600 hover:underline" target="_blank">
                https://ghostcrm.ai/billing/success (✅ no bounce)
              </a>
              <br />
              <a href="https://ghostcrm.ai/app" className="text-blue-600 hover:underline" target="_blank">
                https://ghostcrm.ai/app (➡️ subdomain)
              </a>
            </div>
          </div>
        </div>
        
        {/* API Health Check */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 md:col-span-2">
          <h3 className="text-lg font-semibold mb-4">🩺 Live Health Check</h3>
          <div className="bg-gray-50 p-4 rounded mb-4">
            <p className="mb-3">Get detailed routing state and debug info:</p>
            <div className="flex flex-wrap gap-3">
              <a 
                href="/api/health/tenant"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                target="_blank"
              >
                Check Main Domain State
              </a>
              <a 
                href="https://demo.ghostcrm.ai/api/health/tenant"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                target="_blank"
              >
                Check Subdomain State
              </a>
            </div>
            <p className="text-sm text-gray-600 mt-3">
              Security-hardened endpoint: Shows different details based on authentication level.
              Unauthenticated = public-safe routing info only. Authenticated = full diagnostics.
            </p>
          </div>
          
          {/* Provisioning Delay Scenario */}
          <div className="bg-amber-50 border border-amber-200 rounded p-4">
            <h4 className="font-medium mb-2">⏳ Provisioning Delay Testing</h4>
            <p className="text-sm text-gray-700 mb-3">
              Real-world scenario: User pays → webhook processing → tenant may not exist yet.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                <span className="text-sm">Visit `/billing/success` immediately after payment</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span className="text-sm">Check health endpoint shows "provisioning" status</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-sm">Page should show "Provisioning workspace..." not billing redirect</span>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-3">
              Expected: No immediate bounce to subdomain if provisioning incomplete.
            </p>
          </div>
        </div>
        
        {/* RLS Test */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 md:col-span-2">
          <h3 className="text-lg font-semibold mb-4">🔒 RLS Policy Verification</h3>
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
            <p className="text-sm mb-3">
              <strong>Test your RLS policies manually in Supabase SQL Editor:</strong>
            </p>
            <div className="space-y-2 font-mono text-xs bg-white p-3 rounded border">
              <div>-- As anonymous user:</div>
              <div className="text-blue-600">SELECT * FROM subdomains WHERE status='active' AND subdomain='demo';</div>
              <div className="text-gray-600">-- Should return 1 row with minimal fields</div>
              <br />
              <div>-- Should return 0 rows (no inactive subdomains visible):</div>
              <div className="text-blue-600">SELECT * FROM subdomains WHERE status!='active';</div>
            </div>
            <p className="text-sm text-gray-600 mt-3">
              If the first query returns 0 rows but the subdomain exists, your RLS policy needs to be applied.
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">✅ Production Readiness Checklist</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-2">Routing Tests:</h4>
            <ul className="space-y-1 text-gray-700">
              <li>□ Invalid subdomain → tenant-not-found (no loop)</li>
              <li>□ Valid subdomain + unauth → login redirect</li>
              <li>□ Valid subdomain + public path → loads</li>
              <li>□ Unauth main domain → correct redirects</li>
              <li>□ Paid user main domain → no bounce on allowed paths</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Integration Tests:</h4>
            <ul className="space-y-1 text-gray-700">
              <li>□ Stripe checkout has client_reference_id</li>
              <li>□ Webhook handles subscription lifecycle</li>
              <li>□ RLS allows subdomain discovery</li>
              <li>□ Cookies work across domain/subdomain</li>
              <li>□ Health endpoint provides clear state</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}