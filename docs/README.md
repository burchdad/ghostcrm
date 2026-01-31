# 📚 GhostCRM Documentation

This directory contains all project documentation organized by category.

## 📂 Directory Structure

### `/setup/`
Configuration and setup guides for various services:
- Telnyx setup and configuration
- Stripe integration setup  
- Production domain setup
- Authentication setup

### `/features/`
Feature implementation documentation:
- Promo code system
- Multi-language support
- Feature gating system
- Role-based authentication
- Automated subdomain system

### `/development/`
Development and enhancement documentation:
- Development roadmap
- Enhancement plans
- Performance improvements
- Deployment system
- Project cleanup summaries

## Key Documents

- `GHOSTCRM_COMPLETE_FEATURES.md` - Complete feature overview
- `SECURITY_COMPLIANCE_ENHANCEMENTS.md` - Security compliance documentation

## Migration Information

SQL migration files are organized in:
- `migrations/` - Current migration files
- `migrations/archive/obsolete/` - Archived obsolete migration files
- `supabase/migrations/` - Supabase-specific migrations
- `TENANT_SETUP_GUIDE.md` - Guide for setting up new tenants
- `SECURE_CREDENTIALS_SYSTEM.md` - Security and credentials architecture
- `DYNAMIC_CHART_SYSTEM.md` - Dynamic charting system design

### `/deployment/`
Deployment and production-related documentation:
- `vercel-deployment-guide.md` - Comprehensive Vercel deployment guide
- `PRODUCTION_TESTING_PLAN.md` - Production testing procedures
- `/archive/` - Historical deployment documentation

### Root Documentation
- `MVP-LAUNCH-SUMMARY.md` - MVP launch summary and milestones
- `COMPONENTS_REORGANIZATION_COMPLETE.md` - Component reorganization summary

## 🔗 Related Documentation

- **Database**: See `/migrations/README.md` for database schema and migration info
- **Components**: See `/src/components/README.md` for component documentation
- **API**: See `/src/app/api/` for API endpoint documentation

## 📝 Contributing

When adding new documentation:
1. Place technical architecture docs in `/architecture/`
2. Place deployment/production docs in `/deployment/`
3. Place general project docs in the root `/docs/` folder
4. Update this README when adding new categories