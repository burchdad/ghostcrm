const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function createSubdomainsTable() {
    console.log('🚀 [SETUP] Creating subdomains table...');

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    try {
        // Read the SQL file
        const sqlPath = path.join(__dirname, 'create_subdomains_table.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('📝 [SETUP] Executing SQL...');
        
        // Execute the SQL
        const { data, error } = await supabase.rpc('exec_sql', { 
            sql_query: sql 
        });

        if (error) {
            console.error('❌ [SETUP] Error creating table:', error);
            
            // Try alternative method - execute statements individually
            console.log('🔄 [SETUP] Trying alternative method...');
            
            const statements = sql
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0 && !s.startsWith('--'));

            for (const statement of statements) {
                console.log('📝 [SETUP] Executing:', statement.substring(0, 50) + '...');
                const { error: stmtError } = await supabase.rpc('exec_sql', { 
                    sql_query: statement + ';' 
                });
                if (stmtError) {
                    console.error('❌ [SETUP] Statement error:', stmtError);
                } else {
                    console.log('✅ [SETUP] Statement executed successfully');
                }
            }
        } else {
            console.log('✅ [SETUP] Subdomains table created successfully:', data);
        }

        // Verify table exists
        console.log('🔍 [SETUP] Verifying table creation...');
        const { data: tables, error: listError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')
            .eq('table_name', 'subdomains');

        if (listError) {
            console.error('❌ [SETUP] Error checking tables:', listError);
        } else if (tables && tables.length > 0) {
            console.log('✅ [SETUP] Subdomains table verified to exist');
        } else {
            console.log('❌ [SETUP] Subdomains table not found after creation');
        }

    } catch (error) {
        console.error('❌ [SETUP] Unexpected error:', error);
    }
}

// Run the setup
createSubdomainsTable();