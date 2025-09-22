const required = ["NEXT_PUBLIC_SUPABASE_URL","NEXT_PUBLIC_SUPABASE_ANON_KEY","SUPABASE_SERVICE_ROLE_KEY"];
for (const k of required) if (!process.env[k]) throw new Error(`Missing env: ${k}`);
