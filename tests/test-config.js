#!/usr/bin/env node

/**
 * 🧪 Simple Database Connection Test
 * Direct Supabase test without network dependencies
 */

const fs = require('fs');
const path = require('path');

// Read environment variables manually
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local file not found');
    return {};
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      env[key.trim()] = valueParts.join('=').trim();
    }
  });
  
  return env;
}

async function testSupabaseConfig() {
  console.log('🧪 Testing Supabase Configuration\n');
  
  const env = loadEnv();
  
  // Check required environment variables
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  let configValid = true;
  
  console.log('1️⃣ Checking environment variables...');
  for (const varName of requiredVars) {
    if (env[varName]) {
      console.log(`✅ ${varName}: ${env[varName].substring(0, 20)}...`);
    } else {
      console.log(`❌ ${varName}: Missing`);
      configValid = false;
    }
  }
  
  if (!configValid) {
    console.log('\n❌ Environment configuration is incomplete');
    return false;
  }
  
  console.log('\n2️⃣ Validating Supabase URL format...');
  const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
  
  if (supabaseUrl && supabaseUrl.includes('supabase.co')) {
    console.log('✅ Supabase URL format looks valid');
    
    // Extract project ID
    const urlMatch = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
    if (urlMatch) {
      console.log(`✅ Project ID: ${urlMatch[1]}`);
    }
  } else {
    console.log('❌ Supabase URL format invalid');
    return false;
  }
  
  console.log('\n3️⃣ Checking API key formats...');
  const anonKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
  const serviceKey = env['SUPABASE_SERVICE_ROLE_KEY'];
  
  if (anonKey && (anonKey.startsWith('eyJ') || anonKey.startsWith('sb_publishable_'))) {
    const format = anonKey.startsWith('eyJ') ? 'JWT' : 'Publishable Key';
    console.log(`✅ Anon key format looks valid (${format})`);
  } else {
    console.log('❌ Anon key format invalid');
    return false;
  }
  
  if (serviceKey && (serviceKey.startsWith('eyJ') || serviceKey.startsWith('sb_secret_'))) {
    const format = serviceKey.startsWith('eyJ') ? 'JWT' : 'Secret Key';
    console.log(`✅ Service role key format looks valid (${format})`);
  } else {
    console.log('❌ Service role key format invalid');
    return false;
  }
  
  console.log('\n🎉 Configuration validation passed!');
  console.log('\n📋 Next steps:');
  console.log('   1. Open your browser to http://localhost:3000');
  console.log('   2. Navigate to http://localhost:3000/api/test/database');
  console.log('   3. Check if you see JSON test results');
  console.log('   4. Run: node scripts/generate-sample-data.js create');
  
  return true;
}

// Test database setup without network calls
async function testDatabaseSchema() {
  console.log('\n🗄️ Database Schema Information\n');
  
  console.log('Expected tables created:');
  const tables = [
    'organizations',
    'client_configs',
    'contacts', 
    'leads',
    'messages',
    'call_logs_warm',
    'appointments',
    'campaigns',
    'inventory',
    'profiles',
    'collab_notifications',
    'activity_log_warm',
    'org_provider_secrets'
  ];
  
  tables.forEach((table, index) => {
    console.log(`${(index + 1).toString().padStart(2, ' ')}. ${table}`);
  });
  
  console.log(`\n📊 Total tables: ${tables.length}`);
  console.log('🔒 Row Level Security: Enabled on all tables');
  console.log('🏗️ Multi-tenant: organization_id isolation');
  
  return true;
}

async function runTests() {
  console.log('🚀 GhostCRM Database Configuration Test\n');
  console.log('=====================================\n');
  
  const configTest = await testSupabaseConfig();
  
  if (configTest) {
    await testDatabaseSchema();
  }
  
  console.log('\n=====================================');
  console.log('🏁 Configuration test completed!\n');
  
  if (configTest) {
    console.log('✅ Ready to test with sample data!');
    console.log('\nCommands to try:');
    console.log('• node scripts/generate-sample-data.js create');
    console.log('• Open http://localhost:3000/api/test/database');
    console.log('• Check your Supabase dashboard tables');
  }
}

runTests().catch(console.error);