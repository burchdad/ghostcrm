# App Directory Reorganization Plan

## Current Issues
- 40+ directories at root level (too many)
- Mixed concerns without logical grouping
- Difficult to navigate and find related features
- No clear organization pattern

## Proposed Structure

```
src/app/
├── layout.tsx                    # Root layout
├── page.tsx                      # Homepage
├── icon.svg                      # App icon
├── lib/                          # Shared utilities (keep as-is)
│
├── (auth)/                       # Authentication flows
│   ├── login/
│   ├── register/
│   ├── reset-password/
│   └── join/                     # Team invitations
│
├── (public)/                     # Public pages (no auth required)
│   ├── demo/
│   ├── docs/
│   ├── terms/
│   └── roadmap/
│
├── (core)/                       # Main CRM functionality
│   ├── dashboard/
│   ├── leads/
│   ├── deals/
│   ├── calendar/
│   ├── appointments/
│   ├── calls/
│   ├── messaging/
│   ├── inbox/
│   └── client-portal/
│
├── (business)/                   # Business operations
│   ├── billing/
│   ├── finance/
│   ├── contracts/
│   ├── inventory/
│   └── performance/
│
├── (automation)/                 # Automation & AI features
│   ├── ai/
│   ├── ai-chart-test/
│   ├── automation/
│   ├── workflow/
│   ├── marketing/
│   └── gamification/
│
├── (analytics)/                  # Analytics & reporting
│   ├── bi/
│   ├── charts/
│   ├── reports/
│   └── performance/
│
├── (admin)/                      # Administration
│   ├── admin/
│   ├── settings/
│   ├── compliance/
│   ├── tenant-test/
│   ├── agent-control-panel/
│   └── developer/
│
├── (specialized)/                # Specialized features
│   ├── mobile/
│   ├── file/
│   ├── collaboration/
│   ├── knowledge/
│   ├── journey/
│   ├── onboarding/
│   ├── sla/
│   ├── branding/
│   └── localization/
│
└── api/                          # API routes (keep as-is)
```

## Benefits

### 1. **Logical Grouping**
- Related features are co-located
- Clear separation of concerns
- Easier mental model

### 2. **Route Groups**
- Groups don't affect URL structure
- Organize without changing routes
- Better developer experience

### 3. **Scalability**
- Easy to add new features to appropriate groups
- Clear guidelines for placement
- Prevents root directory clutter

### 4. **Navigation**
- Faster feature discovery
- Better IDE folder collapsing
- Reduced cognitive load

## Implementation Strategy

1. Create route group directories
2. Move existing directories to appropriate groups
3. Verify no routing changes (URLs stay the same)
4. Update any internal references
5. Test thoroughly

## URL Impact

**Important**: Route groups `(name)` don't affect URLs:
- `/dashboard` stays `/dashboard`
- `/login` stays `/login`
- `/billing` stays `/billing`

The organization is purely for developer experience!