#!/usr/bin/env node

/**
 * GhostCRM Supabase Migration Runner
 * Outputs SQL migrations for Supabase database
 */

const fs = require('fs');
const path = require('path');

async function runSupabaseMigrations() {
  console.log('🚀 GhostCRM Supabase Migration SQL');
  console.log('Copy and paste the following SQL into your Supabase SQL Editor');
  console.log('='.repeat(80));
  console.log('');
  
  const migrationsDir = path.join(__dirname);
  const migrationFiles = [
    '001_complete_crm_schema.sql'
  ].filter(file => fs.existsSync(path.join(migrationsDir, file)));
  
  if (migrationFiles.length === 0) {
    console.error('❌ No migration files found');
    process.exit(1);
  }
  
  migrationFiles.forEach((file, index) => {
    const filePath = path.join(migrationsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`-- ${file.toUpperCase()}`);
    console.log('-- ' + '='.repeat(60));
    console.log(content);
    console.log('');
  });
  
  console.log('='.repeat(80));
  console.log('🎯 INSTRUCTIONS:');
  console.log('1. Copy ALL the SQL above');
  console.log('2. Go to Supabase Dashboard → SQL Editor');
  console.log('3. Paste and RUN the SQL');
  console.log('4. Verify all tables are created successfully');
  console.log('5. Check that RLS policies are in place');
}

// Run if called directly
if (require.main === module) {
  runSupabaseMigrations().catch(console.error);
}