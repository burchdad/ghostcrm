#!/usr/bin/env node

/**
 * ADMIN TESTING DASHBOARD SETUP
 * Installation and configuration script for the admin testing dashboard
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

async function setupAdminTestingDashboard() {
  console.log('🚀 Setting up Admin Testing Dashboard...\n');

  try {
    // 1. Install required dependencies
    console.log('📦 Installing dependencies...');
    await installDependencies();

    // 2. Create necessary directories
    console.log('📁 Creating directories...');
    await createDirectories();

    // 3. Set up environment variables
    console.log('⚙️  Setting up environment...');
    await setupEnvironment();

    // 4. Create admin user (if needed)
    console.log('👤 Admin user setup...');
    await setupAdminUser();

    // 5. Initialize database tables
    console.log('🗄️  Database setup...');
    await setupDatabase();

    // 6. Create default schedules
    console.log('📅 Setting up default schedules...');
    await setupDefaultSchedules();

    console.log('\n✅ Admin Testing Dashboard setup completed!');
    console.log('\n🎯 Next steps:');
    console.log('1. Start your application: npm run dev');
    console.log('2. Visit: https://ghostcrm.ai/admin/testing');
    console.log('3. Login with your admin credentials');
    console.log('4. Configure test schedules and alerts');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

async function installDependencies() {
  const dependencies = [
    'playwright@^1.40.0',
    '@axe-core/playwright@^4.8.2',
    'node-fetch@^2.6.7',
    'pg@^8.11.3',
    'uuid@^9.0.0',
    'node-cron@^3.0.3'
  ];

  console.log('  Installing packages:', dependencies.join(', '));
  
  // Check if package.json exists
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  try {
    await fs.access(packageJsonPath);
  } catch {
    console.log('  Creating package.json...');
    const packageJson = {
      name: 'ghostcrm-admin-testing',
      version: '1.0.0',
      scripts: {
        'admin:test': 'node tests/functionality/master-test-suite.js',
        'admin:install-browsers': 'npx playwright install'
      }
    };
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
  }

  // Install packages
  execSync(`npm install ${dependencies.join(' ')}`, { stdio: 'inherit' });
  
  // Install Playwright browsers
  console.log('  Installing Playwright browsers...');
  execSync('npx playwright install', { stdio: 'inherit' });
}

async function createDirectories() {
  const directories = [
    'tests/reports',
    'tests/functionality',
    'tests/security',
    'src/app/admin/testing',
    'src/app/api/admin/auth',
    'src/app/api/admin/testing',
    'src/app/api/admin/tenants',
    'migrations'
  ];

  for (const dir of directories) {
    const fullPath = path.join(process.cwd(), dir);
    try {
      await fs.mkdir(fullPath, { recursive: true });
      console.log(`  ✓ Created: ${dir}`);
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
      console.log(`  ✓ Exists: ${dir}`);
    }
  }
}

async function setupEnvironment() {
  const envPath = path.join(process.cwd(), '.env.local');
  
  let envContent = '';
  try {
    envContent = await fs.readFile(envPath, 'utf8');
  } catch {
    // File doesn't exist, will create new
  }

  const requiredVars = {
    'TEST_BASE_URL': 'https://ghostcrm.ai',
    'OWNER_EMAIL': 'admin@ghostcrm.com',
    'DB_HOST': 'localhost',
    'DB_PORT': '5432',
    'DB_NAME': 'ghostcrm',
    'DB_USER': 'postgres',
    'DB_PASSWORD': 'your_password_here'
  };

  let needsUpdate = false;
  let newEnvContent = envContent;

  for (const [key, defaultValue] of Object.entries(requiredVars)) {
    if (!envContent.includes(`${key}=`)) {
      newEnvContent += `\n# Admin Testing Dashboard\n${key}=${defaultValue}\n`;
      needsUpdate = true;
      console.log(`  ✓ Added: ${key}=${defaultValue}`);
    } else {
      console.log(`  ✓ Exists: ${key}`);
    }
  }

  if (needsUpdate) {
    await fs.writeFile(envPath, newEnvContent);
    console.log('  ⚠️  Please update the database credentials in .env.local');
  }
}

async function setupAdminUser() {
  console.log('  Admin user setup will be handled by your authentication system');
  console.log('  Ensure the user specified in OWNER_EMAIL has super_admin role');
}

async function setupDatabase() {
  console.log('  Database migration files have been created');
  console.log('  Run the migration: migrations/006_admin_testing_dashboard.sql');
  console.log('  ⚠️  Please execute the migration manually in your database');
}

async function setupDefaultSchedules() {
  const scheduleConfig = {
    schedules: [
      {
        name: 'Daily Full Test Suite',
        description: 'Complete functionality test for all tenants',
        test_suites: ['all'],
        target_tenants: ['all'],
        cron_expression: '0 2 * * *', // Daily at 2 AM
        active: false // Start disabled
      },
      {
        name: 'Weekly Security Audit',
        description: 'Authentication and security tests',
        test_suites: ['auth', 'api'],
        target_tenants: ['main'],
        cron_expression: '0 0 * * 0', // Weekly on Sunday
        active: false
      }
    ]
  };

  const configPath = path.join(process.cwd(), 'tests', 'admin-test-config.json');
  await fs.writeFile(configPath, JSON.stringify(scheduleConfig, null, 2));
  console.log('  ✓ Default schedule configuration created');
}

// CLI execution
if (require.main === module) {
  setupAdminTestingDashboard();
}

module.exports = { setupAdminTestingDashboard };