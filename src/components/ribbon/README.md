# Ribbon System Documentation

The ribbon system has been reorganized into a clean, modular structure for better maintainability.

## Folder Structure

```
src/components/ribbon/
├── index.ts                    # Main export file for clean imports
├── core/                       # Core ribbon components
│   ├── Ribbon.tsx             # Main ribbon component
│   └── types.ts               # TypeScript definitions
├── providers/                  # Context providers and hooks
│   ├── RibbonProvider.tsx     # Main ribbon context provider
│   ├── ContextualRibbon.tsx   # Contextual ribbon logic
│   └── useRibbonPage.ts       # Hook for page-specific ribbon config
└── registries/                # Control registries by feature area
    ├── registry.tsx           # Main registry exports
    ├── registry_ai.tsx        # AI-related controls
    ├── registry_automation.tsx # Automation controls
    ├── registry_data.tsx      # Data management controls
    ├── registry_developer.tsx # Developer tools
    ├── registry_edit.tsx      # Edit operations
    ├── registry_file.tsx      # File operations
    ├── registry_home.tsx      # Home/general controls
    ├── registry_reports.tsx   # Reporting controls
    ├── registry_settings.tsx  # Settings controls
    └── collaboration-controls.tsx # Collaboration features
```

## Usage

Import ribbon components using the clean index exports:

```typescript
// Main components
import { Ribbon, RibbonProvider } from "@/components/ribbon";

// Hooks
import { useRibbonPage, useContextualRibbon } from "@/components/ribbon";

// Registry controls
import { CONTROLS_AI, CONTROLS_DATA, getAIControls } from "@/components/ribbon";

// Types
import type { RibbonControl, ControlId } from "@/components/ribbon";
```

## Key Features

- **Modular Structure**: Components are logically separated by purpose
- **Clean Imports**: Single index.ts file provides clean import paths
- **Server-Side Safe**: AI controls use client-side checks to avoid window errors
- **Type Safety**: Comprehensive TypeScript definitions
- **Contextual**: Dynamic controls based on current page/context

## Changes Made

1. **Removed unused components**: RibbonOld.tsx and RibbonGroup.tsx
2. **Organized into subdirectories**: core/, providers/, registries/
3. **Updated import paths**: All references now use clean imports via index.ts
4. **Fixed SSR issues**: Added client-side checks for window access in AI controls
5. **Maintained functionality**: All existing features preserved