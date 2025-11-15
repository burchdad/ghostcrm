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

async function fixUserPassword() {
  try {
    console.log('🔧 Fixing password for burchsl4@gmail.com...\n');
    
    // Create a new hash for password123
    const newPasswordHash = await bcrypt.hash('password123', 12);
    console.log('🔐 New password hash:', newPasswordHash);
    
    // Test the new hash
    const testHash = await bcrypt.compare('password123', newPasswordHash);
    console.log('✅ New hash verification test:', testHash ? 'PASSED' : 'FAILED');
    
    if (!testHash) {
      console.log('❌ Hash verification failed, aborting');
      return;
    }
    
    // Update the user's password
    const { data, error } = await supabase
      .from('users')
      .update({ password_hash: newPasswordHash })
      .eq('email', 'burchsl4@gmail.com')
      .select('id, email')
      .single();
    
    if (error) {
      console.log('❌ Failed to update password:', error.message);
      return;
    }
    
    console.log('✅ Password updated successfully for user:', data.email);
    console.log('🔑 You can now login with:');
    console.log('   Email: burchsl4@gmail.com');
    console.log('   Password: password123');
    
  } catch (err) {
    console.log('❌ Error:', err.message);
  }
}

fixUserPassword();