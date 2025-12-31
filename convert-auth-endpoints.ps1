# PowerShell script to convert API endpoints from supaFromReq to JWT authentication
# This script will systematically update all endpoints to use the new JWT authentication pattern

Write-Host "🔄 Starting conversion of API endpoints from supaFromReq to JWT authentication..." -ForegroundColor Cyan

# Get all files that use supaFromReq
$files = Get-ChildItem -Path "src\app\api" -Recurse -Filter "*.ts" | Where-Object {
    (Get-Content $_.FullName -Raw) -match "supaFromReq"
}

Write-Host "📝 Found $($files.Count) files to convert:" -ForegroundColor Yellow
foreach ($file in $files) {
    Write-Host "  - $($file.FullName.Replace((Get-Location).Path + '\', ''))" -ForegroundColor Gray
}

foreach ($file in $files) {
    Write-Host "`n🔧 Converting: $($file.Name)" -ForegroundColor Green
    
    try {
        $content = Get-Content $file.FullName -Raw
        $originalContent = $content
        
        # Skip if already converted (contains getUserFromRequest import)
        if ($content -match "getUserFromRequest") {
            Write-Host "  ✅ Already converted, skipping..." -ForegroundColor DarkGreen
            continue
        }
        
        # 1. Update imports
        $content = $content -replace 'import \{ supaFromReq \} from "@/lib/supa-ssr";', ''
        $content = $content -replace 'import \{ getMembershipOrgId \} from "@/lib/rbac";', ''
        
        # Add new imports at the top after NextRequest import
        if ($content -match 'import \{ NextRequest') {
            $content = $content -replace '(import \{ NextRequest[^}]*\} from "[^"]*";)', "`$1`nimport { createClient } from `"@supabase/supabase-js`";`nimport { getUserFromRequest, isAuthenticated } from `"@/lib/auth/server`";"
        }
        
        # Add runtime and supabaseAdmin client
        if ($content -match 'export const dynamic') {
            $content = $content -replace '(export const dynamic[^;]*;)', "`$1`n// Use Node.js runtime to avoid Edge Runtime issues with Supabase`nexport const runtime = `"nodejs`";`n`n// Create a service role client for admin operations`nconst supabaseAdmin = createClient(`n  process.env.NEXT_PUBLIC_SUPABASE_URL!,`n  process.env.SUPABASE_SERVICE_ROLE_KEY!`n);"
        }
        
        # 2. Replace supaFromReq initialization with JWT auth check
        $content = $content -replace 'const \{ s, res \} = supaFromReq\(req\);', ''
        $content = $content -replace 'const org_id = await getMembershipOrgId\(s\);', ''
        
        # Add JWT authentication check after the try block starts
        if ($content -match 'try \{') {
            $authCheck = @"
    // Check authentication using JWT
    if (!isAuthenticated(req)) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get user data from JWT
    const user = getUserFromRequest(req);
    if (!user || !user.organizationId) {
      return new Response(
        JSON.stringify({ error: "User organization not found" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const organizationId = user.organizationId;
"@
            $content = $content -replace '(try \{)', "`$1`n$authCheck"
        }
        
        # 3. Replace database calls
        $content = $content -replace 'await s\.', 'await supabaseAdmin.'
        $content = $content -replace '\.eq\("org_id", org_id\)', '.eq("organization_id", organizationId)'
        $content = $content -replace '\.or\(`"organization_id\.eq\.\$\{org_id\}[^`"]*`"\)', '.eq("organization_id", organizationId)'
        
        # 4. Fix return statements that use res.headers
        $content = $content -replace ', res\.headers\)', ')'
        
        # 5. Replace org_id variable references with organizationId
        $content = $content -replace '\borg_id\b', 'organizationId'
        
        # Only write if content actually changed
        if ($content -ne $originalContent) {
            Set-Content $file.FullName $content -Encoding UTF8
            Write-Host "  ✅ Converted successfully" -ForegroundColor DarkGreen
        } else {
            Write-Host "  ⚠️ No changes made" -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "  ❌ Error converting file: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n🎉 Conversion complete! All API endpoints should now use JWT authentication." -ForegroundColor Green
Write-Host "📝 Please test the endpoints to ensure they work correctly." -ForegroundColor Cyan