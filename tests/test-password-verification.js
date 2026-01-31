const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPasswordHashes() {
  try {
    console.log('🔍 Testing password verification for burchsl4@gmail.com...\n');
    
    // Get the user data
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, password_hash')
      .eq('email', 'burchsl4@gmail.com')
      .single();
    
    if (error || !user) {
      console.log('❌ User not found:', error?.message);
      return;
    }
    
    console.log('✅ User found:', user.email);
    console.log('🔐 Password hash from DB:', user.password_hash);
    console.log('📏 Hash length:', user.password_hash?.length);
    console.log('🔍 Hash starts with $2a/$2b:', user.password_hash?.startsWith('$2'));
    
    // Test different passwords
    const passwordsToTest = [
      'password123', // Our test password
      'Qwer12455mPzZq9hInYyPlC.wlCu9ZEMKxftOfyaYUKVluaGyk', // From the hash you mentioned
    ];
    
    for (const password of passwordsToTest) {
      console.log(`\n🧪 Testing password: "${password}"`);
      try {
        const isValid = await bcrypt.compare(password, user.password_hash);
        console.log(`  Result: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
      } catch (err) {
        console.log(`  Error: ${err.message}`);
      }
    }
    
    // Also test creating a new hash for comparison
    console.log('\n🔨 Creating new hash for "password123":');
    const newHash = await bcrypt.hash('password123', 12);
    console.log('  New hash:', newHash);
    
    const testNewHash = await bcrypt.compare('password123', newHash);
    console.log('  Verification of new hash:', testNewHash ? '✅ VALID' : '❌ INVALID');
    
  } catch (err) {
    console.log('❌ Error:', err.message);
  }
}

testPasswordHashes();