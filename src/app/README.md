# App Directory Structure

This directory contains the Next.js 13+ App Router structure for GhostCRM, organized using route groups for optimal developer experience and maintainability.

## 📁 Directory Organization

```
src/app/
├── layout.tsx                    # Root layout with providers
├── page.tsx                      # Homepage
├── icon.svg                      # App icon
├── lib/                          # Shared utilities and helpers
├── api/                          # API routes (REST endpoints)
│
├── (auth)/                       # 🔐 Authentication & User Management
│   ├── login/                    # /login - User login
│   ├── register/                 # /register - User registration
│   ├── reset-password/           # /reset-password - Password recovery
│   └── join/                     # /join - Team invitations
│
├── (public)/                     # 🌐 Public Pages (No Authentication)
│   ├── demo/                     # /demo - Product demo
│   ├── docs/                     # /docs - Documentation
│   ├── terms/                    # /terms - Terms of service
│   └── roadmap/                  # /roadmap - Product roadmap
│
├── (core)/                       # 💼 Core CRM Functionality
│   ├── dashboard/                # /dashboard - Main dashboard
│   ├── leads/                    # /leads - Lead management
│   ├── deals/                    # /deals - Deal pipeline
│   ├── calendar/                 # /calendar - Calendar view
│   ├── appointments/             # /appointments - Appointment scheduling
│   ├── calls/                    # /calls - Call management
│   ├── messaging/                # /messaging - Internal messaging
│   ├── inbox/                    # /inbox - Communication hub
│   └── client-portal/            # /client-portal - Client access
│
├── (business)/                   # 💰 Business Operations
│   ├── billing/                  # /billing - Billing management
│   ├── finance/                  # /finance - Financial operations
│   ├── contracts/                # /contracts - Contract management
│   └── inventory/                # /inventory - Inventory tracking
│
├── (automation)/                 # 🤖 Automation & AI Features
│   ├── ai/                       # /ai - AI tools and features
│   ├── ai-chart-test/            # /ai-chart-test - AI chart testing
│   ├── automation/               # /automation - Workflow automation
│   ├── workflow/                 # /workflow - Workflow management
│   ├── marketing/                # /marketing - Marketing automation
│   └── gamification/             # /gamification - Gamification features
│
├── (analytics)/                  # 📊 Analytics & Reporting
│   ├── bi/                       # /bi - Business intelligence
│   ├── charts/                   # /charts - Chart management
│   ├── reports/                  # /reports - Report generation
│   ├── performance/              # /performance - Performance metrics
│   └── data/                     # /data - Data management
│
├── (admin)/                      # ⚙️ Administration & Configuration
│   ├── admin/                    # /admin - Admin panel
│   ├── settings/                 # /settings - Application settings
│   ├── compliance/               # /compliance - Compliance management
│   ├── tenant-test/              # /tenant-test - Multi-tenant testing
│   ├── agent-control-panel/      # /agent-control-panel - Agent management
│   └── developer/                # /developer - Developer tools
│
└── (specialized)/                # 🔧 Specialized Features
    ├── mobile/                   # /mobile - Mobile-specific features
    ├── file/                     # /file - File management
    ├── collaboration/            # /collaboration - Team collaboration
    ├── knowledge/                # /knowledge - Knowledge base
    ├── onboarding/               # /onboarding - User onboarding
    ├── sla/                      # /sla - Service level agreements
    ├── branding/                 # /branding - Brand customization
    └── localization/             # /localization - Internationalization
```

## 🎯 Route Groups Explained

Route groups use parentheses `(name)` and **do not affect URL structure**. They are purely for organization:

- `/dashboard` → Located in `(core)/dashboard/` but URL remains `/dashboard`
- `/login` → Located in `(auth)/login/` but URL remains `/login`
- `/billing` → Located in `(business)/billing/` but URL remains `/billing`

## 📋 Adding New Routes

### Decision Framework

When adding a new route, ask these questions:

1. **Is it authentication-related?** → `(auth)/`
2. **Is it core CRM functionality?** → `(core)/`
3. **Is it business/financial?** → `(business)/`
4. **Is it automation/AI?** → `(automation)/`
5. **Is it analytics/reporting?** → `(analytics)/`
6. **Is it admin/configuration?** → `(admin)/`
7. **Is it specialized/niche?** → `(specialized)/`
8. **Is it public-facing?** → `(public)/`

### Examples

```bash
# New contact management feature
(core)/contacts/

# New payment processing feature  
(business)/payments/

# New AI chatbot feature
(automation)/chatbots/

# New custom dashboard feature
(analytics)/dashboards/

# New user management feature
(admin)/users/

# New webhook management feature
(specialized)/webhooks/

# New landing page
(public)/features/
```

## 🏗️ File Structure Conventions

### Route Structure
```
(group)/feature-name/
├── page.tsx                     # Main route component
├── layout.tsx                   # Optional layout
├── loading.tsx                  # Loading UI
├── error.tsx                    # Error UI
├── not-found.tsx               # 404 UI
├── components/                  # Route-specific components
│   ├── FeatureComponent.tsx
│   └── FeatureModal.tsx
├── hooks/                       # Route-specific hooks
│   └── useFeatureData.ts
└── utils/                       # Route-specific utilities
    └── featureHelpers.ts
```

### Import Patterns
```typescript
// ✅ Preferred: Absolute imports with organized components
import { Modal } from "@/components/modals/Modal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/utils/ToastProvider";

// ✅ Route-specific imports
import FeatureComponent from "./components/FeatureComponent";
import { useFeatureData } from "./hooks/useFeatureData";

// ✅ Cross-route imports (when necessary)
import DashboardMetrics from "@/app/(core)/dashboard/components/DashboardMetrics";
```

## 🔗 Navigation & Linking

All existing URLs remain unchanged:

```typescript
// Navigation works exactly the same
<Link href="/dashboard">Dashboard</Link>
<Link href="/login">Login</Link>
<Link href="/billing">Billing</Link>
<Link href="/admin">Admin</Link>

// Router also works the same
router.push('/dashboard');
router.push('/leads');
```

## 📚 Component Organization

Components are organized in `/src/components/` by function:

```
src/components/
├── layout/          # Layout components (headers, sidebars)
├── navigation/      # Navigation components (menus, breadcrumbs)
├── modals/         # Modal dialogs
├── dashboards/     # Dashboard-specific components
├── onboarding/     # Onboarding components
├── feedback/       # Feedback & state components (loading, errors)
├── utils/          # Utility components (tooltips, providers)
├── global/         # Global components (AI assistant)
├── ui/             # UI primitives (buttons, inputs)
└── ribbon/         # Ribbon system components
```

## 🚨 Important Rules

### ✅ DO:
- Use route groups for logical organization
- Keep related routes together
- Follow the established naming conventions
- Use absolute imports for components (`@/components/...`)
- Maintain consistent file structure within routes
- Document new route purposes

### ❌ DON'T:
- Create new root-level directories without justification
- Mix unrelated functionality in the same route group
- Use route groups for URL segments (use regular folders instead)
- Break existing URL structures
- Create deeply nested route groups

## 🔄 Migration Guide

When moving existing routes or creating new ones:

1. **Identify the appropriate route group** using the decision framework
2. **Create the directory structure** following conventions
3. **Update any imports** to use absolute paths where possible
4. **Test the route** to ensure it works correctly
5. **Update any navigation** or internal links if needed

## 🛠️ Development Workflow

### Starting Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run linting
npm run type-check   # Check TypeScript
```

### Adding New Features
1. Determine the appropriate route group
2. Create the directory structure
3. Add route components (page.tsx, layout.tsx, etc.)
4. Add route-specific components, hooks, and utilities
5. Update navigation if needed
6. Test the new route

### Best Practices
- Keep route-specific code within the route directory
- Share common functionality through `/src/components/`
- Use TypeScript for all new code
- Follow the existing code style and patterns
- Write tests for new functionality

## 📖 References

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Route Groups Documentation](https://nextjs.org/docs/app/building-your-application/routing/route-groups)
- [Component Organization Guide](../components/README.md)

## 🚀 Future Feature Considerations

### Planned Features & Route Placement

#### **Authentication Enhancements** → `(auth)/`
- Two-factor authentication (`2fa/`)
- Social login providers (`social/`)
- Password policies (`password-policy/`)
- Account recovery (`account-recovery/`)
- Session management (`sessions/`)

#### **Core CRM Expansions** → `(core)/`
- Contact management (`contacts/`)
- Task management (`tasks/`)
- Notes & annotations (`notes/`)
- Activity timeline (`activities/`)
- Pipeline customization (`pipelines/`)
- Quote generation (`quotes/`)
- Proposal builder (`proposals/`)
- Document management (`documents/`)

#### **Business Operations** → `(business)/`
- Invoice generation (`invoicing/`)
- Payment processing (`payments/`)
- Subscription management (`subscriptions/`)
- Revenue tracking (`revenue/`)
- Commission tracking (`commissions/`)
- Expense management (`expenses/`)
- Tax management (`tax/`)
- Accounting integration (`accounting/`)

#### **Advanced Automation** → `(automation)/`
- Chatbot builder (`chatbots/`)
- Email sequences (`sequences/`)
- Lead scoring (`lead-scoring/`)
- Trigger management (`triggers/`)
- Workflow templates (`templates/`)
- A/B testing (`ab-testing/`)
- Personalization engine (`personalization/`)
- Predictive analytics (`predictions/`)

#### **Enhanced Analytics** → `(analytics)/`
- Custom dashboards (`dashboards/`)
- Sales forecasting (`forecasting/`)
- Cohort analysis (`cohorts/`)
- Customer segmentation (`segmentation/`)
- ROI analysis (`roi/`)
- Conversion funnels (`funnels/`)
- Real-time metrics (`real-time/`)
- Data visualization (`visualizations/`)

#### **Administration Features** → `(admin)/`
- User management (`users/`)
- Role-based permissions (`roles/`)
- Audit logging (`audit/`)
- System monitoring (`monitoring/`)
- Backup management (`backups/`)
- Integration management (`integrations/`)
- API key management (`api-keys/`)
- White-label customization (`white-label/`)

#### **Specialized Tools** → `(specialized)/`
- Webhook management (`webhooks/`)
- Data import/export (`data-sync/`)
- Third-party integrations (`integrations/`)
- Mobile app features (`mobile-features/`)
- Offline capabilities (`offline/`)
- Real-time collaboration (`real-time-collab/`)
- Video conferencing (`video/`)
- Screen sharing (`screen-share/`)

#### **Public Features** → `(public)/`
- Knowledge base (`knowledge-base/`)
- Help center (`help/`)
- Community forum (`community/`)
- Status page (`status/`)
- Changelog (`changelog/`)
- API documentation (`api-docs/`)
- Developer portal (`developers/`)

## ⚡ Optimization Considerations

### Performance Optimizations

#### **Route-Level Optimizations**
```typescript
// Implement in high-traffic routes
export const dynamic = 'force-static'; // For static content
export const revalidate = 3600; // For semi-static content
export const runtime = 'edge'; // For edge runtime performance
```

#### **Code Splitting Strategies**
- **Route-based splitting**: Automatic with App Router
- **Component-based splitting**: Lazy load heavy components
- **Feature-based splitting**: Split large features into chunks
- **Conditional loading**: Load features based on user permissions

#### **Caching Strategies**
- **Static Generation**: For public pages and dashboards
- **Incremental Static Regeneration**: For frequently updated content
- **Server-side caching**: Redis for API responses
- **Client-side caching**: React Query for data fetching
- **CDN optimization**: For static assets and API responses

### Architecture Optimizations

#### **Route Organization**
- **Parallel routes**: For complex dashboard layouts
- **Intercepting routes**: For modal workflows
- **Route handlers**: Optimized API endpoints
- **Middleware optimization**: Authentication and routing logic

#### **Data Fetching Patterns**
```typescript
// Optimized data fetching in routes
// (core)/dashboard/page.tsx
async function getData() {
  const res = await fetch('/api/dashboard', {
    next: { revalidate: 300 } // Cache for 5 minutes
  });
  return res.json();
}

// Streaming for large datasets
export default async function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
```

#### **Bundle Optimization**
- **Tree shaking**: Remove unused code
- **Dynamic imports**: Load components on demand
- **Bundle analysis**: Monitor and optimize bundle sizes
- **Preloading**: Critical route preloading

### Scalability Optimizations

#### **Route Group Scaling**
- **Micro-frontends**: Consider federation for large route groups
- **Module boundaries**: Clear separation between route groups
- **Shared dependencies**: Optimize common imports
- **Route-specific assets**: Minimize cross-route dependencies

#### **Database Optimizations**
- **Query optimization**: Route-specific query patterns
- **Connection pooling**: Efficient database connections
- **Read replicas**: Separate read/write operations
- **Caching layers**: Multiple levels of caching

#### **Monitoring & Observability**
```typescript
// Add to critical routes
import { analytics } from '@/lib/analytics';

export default function CriticalPage() {
  useEffect(() => {
    analytics.track('route_accessed', {
      route: '/dashboard',
      timestamp: Date.now()
    });
  }, []);
}
```

### Future Architecture Considerations

#### **Multi-tenancy Scaling**
- **Tenant isolation**: Route-level tenant separation
- **Shared components**: Cross-tenant component optimization
- **Data partitioning**: Tenant-specific data strategies
- **Resource allocation**: Per-tenant resource management

#### **Internationalization (i18n)**
- **Route-based locales**: `/en/dashboard`, `/es/dashboard`
- **Dynamic content**: Locale-specific content loading
- **RTL support**: Right-to-left language optimization
- **Currency/date formatting**: Locale-specific formatting

#### **Progressive Web App (PWA)**
- **Service workers**: Route-specific caching strategies
- **Offline functionality**: Critical route offline support
- **Push notifications**: Route-based notification system
- **App shell**: Optimized app shell architecture

#### **Security Enhancements**
- **Route-level security**: Per-route authentication/authorization
- **Content Security Policy**: Route-specific CSP headers
- **Rate limiting**: Route-based rate limiting
- **Audit trails**: Route access logging and monitoring

---

**Last Updated**: October 2025  
**Maintainer**: Development Team  
**Version**: 2.0 (Reorganized Structure)