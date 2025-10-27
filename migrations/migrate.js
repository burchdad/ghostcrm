#!/usr/bin/env node

/**
 * Migration Management Script for GhostCRM
 * Handles both SQL Server (main database) and PostgreSQL (client databases) migrations
 */

const fs = require('fs').promises
const path = require('path')

class MigrationManager {
  constructor() {
    this.migrationsDir = path.join(__dirname)
    this.mainDbDir = path.join(this.migrationsDir, 'main-database')
    this.clientProvisioningDir = path.join(this.migrationsDir, 'client-provisioning')
  }

  /**
   * List all available migrations
   */
  async listMigrations() {
    console.log('📋 GhostCRM Migration Status\n')
    
    // Main Database Migrations (SQL Server)
    console.log('🏢 Main Database Migrations (SQL Server):')
    const mainFiles = await this.getMainDbMigrations()
    mainFiles.forEach((file, index) => {
      console.log(`  ${index + 1}. ${file}`)
    })
    
    console.log('\n🏬 Client Database Migrations (PostgreSQL):')
    const clientFiles = await this.getClientMigrations()
    clientFiles.forEach((file, index) => {
      console.log(`  ${index + 1}. ${file}`)
    })
    
    console.log('\n📁 Legacy Files (to be cleaned up):')
    const legacyFiles = await this.getLegacyFiles()
    legacyFiles.forEach(file => {
      console.log(`  ⚠️  ${file}`)
    })
  }

  /**
   * Get main database migration files
   */
  async getMainDbMigrations() {
    const files = await fs.readdir(this.mainDbDir)
    return files
      .filter(file => file.match(/^\d{3}_.*\.sql$/))
      .sort()
  }

  /**
   * Get client provisioning migration files
   */
  async getClientMigrations() {
    const files = await fs.readdir(this.clientProvisioningDir)
    return files
      .filter(file => file.match(/^\d{3}_.*\.pgsql$/))
      .sort()
  }

  /**
   * Get legacy files that need cleanup
   */
  async getLegacyFiles() {
    const files = await fs.readdir(this.mainDbDir)
    return files
      .filter(file => file.startsWith('supabase_'))
      .sort()
  }

  /**
   * Validate migration file naming and content
   */
  async validateMigrations() {
    console.log('🔍 Validating Migrations...\n')
    
    let hasErrors = false

    // Check for duplicate numbers in main database
    const mainFiles = await this.getMainDbMigrations()
    const mainNumbers = mainFiles.map(file => file.substring(0, 3))
    const duplicateNumbers = mainNumbers.filter((num, index) => mainNumbers.indexOf(num) !== index)
    
    if (duplicateNumbers.length > 0) {
      console.log('❌ Duplicate migration numbers in main database:', duplicateNumbers)
      hasErrors = true
    }

    // Check for missing sequence numbers
    for (let i = 1; i <= mainFiles.length; i++) {
      const expectedNumber = String(i).padStart(3, '0')
      if (!mainNumbers.includes(expectedNumber)) {
        console.log(`⚠️  Missing migration number: ${expectedNumber}`)
      }
    }

    // Validate client migrations
    const clientFiles = await this.getClientMigrations()
    if (clientFiles.length === 0) {
      console.log('⚠️  No client migration files found')
    } else {
      console.log(`✅ Found ${clientFiles.length} client migration files`)
    }

    // Check for legacy files
    const legacyFiles = await this.getLegacyFiles()
    if (legacyFiles.length > 0) {
      console.log(`⚠️  Found ${legacyFiles.length} legacy files that should be cleaned up`)
    }

    if (!hasErrors) {
      console.log('\n✅ Migration validation completed successfully!')
    } else {
      console.log('\n❌ Migration validation found issues that need attention')
    }

    return !hasErrors
  }

  /**
   * Generate a new migration file template
   */
  async generateMigration(name, type = 'main') {
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').substring(0, 14)
    const sanitizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '_')
    
    let targetDir, nextNumber, template
    
    if (type === 'main') {
      targetDir = this.mainDbDir
      const existingFiles = await this.getMainDbMigrations()
      nextNumber = String(existingFiles.length + 1).padStart(3, '0')
      template = this.getMainDbTemplate(sanitizedName)
    } else {
      targetDir = this.clientProvisioningDir
      const existingFiles = await this.getClientMigrations()
      nextNumber = String(existingFiles.length + 1).padStart(3, '0')
      template = this.getClientTemplate(sanitizedName)
    }
    
    const filename = `${nextNumber}_${sanitizedName}.${type === 'main' ? 'sql' : 'pgsql'}`
    const filepath = path.join(targetDir, filename)
    
    await fs.writeFile(filepath, template)
    
    console.log(`✅ Created migration: ${filename}`)
    return filepath
  }

  /**
   * Get template for main database migration
   */
  getMainDbTemplate(name) {
    return `-- Migration: ${name}
-- Database: SQL Server (Main Admin Database)
-- Created: ${new Date().toISOString()}

-- Description:
-- [Describe what this migration does]

-- =====================================
-- ${name.toUpperCase().replace(/_/g, ' ')}
-- =====================================

-- [Add your SQL Server migration code here]

-- Example:
-- IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='new_table' AND xtype='U')
-- CREATE TABLE new_table (
--   id INT IDENTITY(1,1) PRIMARY KEY,
--   name NVARCHAR(255) NOT NULL,
--   created_at DATETIME DEFAULT GETDATE()
-- );

-- =====================================
-- ROLLBACK INSTRUCTIONS
-- =====================================
-- [Include rollback commands if needed]
-- DROP TABLE IF EXISTS new_table;
`
  }

  /**
   * Get template for client database migration
   */
  getClientTemplate(name) {
    return `-- Migration: ${name}
-- Database: PostgreSQL (Client Databases)
-- Created: ${new Date().toISOString()}

-- Description:
-- [Describe what this migration adds to client databases]

-- =====================================
-- ${name.toUpperCase().replace(/_/g, ' ')}
-- =====================================

-- [Add your PostgreSQL migration code here]

-- Example:
-- CREATE TABLE IF NOT EXISTS new_feature (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     name VARCHAR(255) NOT NULL,
--     description TEXT,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- -- Enable RLS
-- ALTER TABLE new_feature ENABLE ROW LEVEL SECURITY;

-- -- Create indexes
-- CREATE INDEX IF NOT EXISTS idx_new_feature_name ON new_feature(name);

-- =====================================
-- INTEGRATION WITH PROVISIONING
-- =====================================
-- [Note: This migration will be automatically applied to new client databases]
-- [Existing client databases may need manual application]
`
  }

  /**
   * Clean up legacy files
   */
  async cleanupLegacyFiles() {
    console.log('🧹 Cleaning up legacy files...\n')
    
    const legacyFiles = await this.getLegacyFiles()
    
    if (legacyFiles.length === 0) {
      console.log('✅ No legacy files to clean up')
      return
    }

    console.log('Legacy files found:')
    legacyFiles.forEach(file => {
      console.log(`  - ${file}`)
    })

    console.log('\nThese files have been integrated into the new migration system:')
    console.log('  - supabase_collab_schema.sql → 002_collaboration_features.sql')
    console.log('  - supabase_multi_tenant_schema.sql → 003_inventory_management.sql')
    console.log('  - supabase_collab_schema_postgres.sql → (duplicate, can be removed)')

    // In a real implementation, you might move these to an archive folder
    console.log('\n💡 Recommendation: Archive these files to a backup location before deleting')
  }

  /**
   * Fix duplicate migration numbers
   */
  async fixDuplicateNumbers() {
    console.log('🔧 Fixing duplicate migration numbers...\n')
    
    const mainFiles = await this.getMainDbMigrations()
    const duplicates = mainFiles.filter(file => file.startsWith('004_'))
    
    if (duplicates.length > 1) {
      // Rename integration_preferences to 006
      const integrationFile = duplicates.find(file => file.includes('integration_preferences'))
      if (integrationFile) {
        const oldPath = path.join(this.mainDbDir, integrationFile)
        const newName = integrationFile.replace('004_', '006_')
        const newPath = path.join(this.mainDbDir, newName)
        
        await fs.rename(oldPath, newPath)
        console.log(`✅ Renamed ${integrationFile} → ${newName}`)
      }
    }
  }
}

// CLI Interface
async function main() {
  const manager = new MigrationManager()
  const command = process.argv[2]
  
  switch (command) {
    case 'list':
      await manager.listMigrations()
      break
      
    case 'validate':
      await manager.validateMigrations()
      break
      
    case 'generate':
      const name = process.argv[3]
      const type = process.argv[4] || 'main'
      if (!name) {
        console.log('Usage: node migrate.js generate <migration_name> [main|client]')
        process.exit(1)
      }
      await manager.generateMigration(name, type)
      break
      
    case 'cleanup':
      await manager.cleanupLegacyFiles()
      break
      
    case 'fix':
      await manager.fixDuplicateNumbers()
      break
      
    default:
      console.log(`
🚀 GhostCRM Migration Manager

Usage:
  node migrate.js list         - List all migrations
  node migrate.js validate     - Validate migration structure
  node migrate.js generate <name> [type] - Generate new migration
  node migrate.js cleanup      - Show legacy file cleanup info
  node migrate.js fix          - Fix duplicate migration numbers

Examples:
  node migrate.js generate "add user roles" main
  node migrate.js generate "add custom fields" client
`)
  }
}

if (require.main === module) {
  main().catch(console.error)
}

module.exports = MigrationManager