# 🔧 GhostCRM Scripts

This directory contains utility scripts for database operations and maintenance tasks.

## 📂 Active Scripts

### Database Migration Scripts
- `migrate-users-sqlserver.js` - Migrate users to SQL Server database
- `run-organizations-migration.js` - Run organization-related migrations

### Maintenance Scripts  
- `nightly-cleanup.js` - Automated nightly cleanup tasks

## 📂 Archive
- `/archive/` - Contains historical scripts that were used for one-time fixes

## 🚀 Running Scripts

Make sure you're in the project root directory before running scripts:

```bash
# Run from project root
cd "d:\Program Files\Github Repositories\ghostcrm"

# Run a script
node scripts/migrate-users-sqlserver.js
node scripts/run-organizations-migration.js
node scripts/nightly-cleanup.js
```

## ⚠️ Important Notes

- Always test scripts in a development environment first
- Make sure database connections are properly configured
- Review script contents before running in production
- Some scripts may require specific environment variables

## 📝 Adding New Scripts

When adding new scripts:
1. Add them to the appropriate category above
2. Include clear documentation in the script file
3. Test thoroughly before using in production
4. Archive old scripts when they're no longer needed