'use client';

import React from 'react';
import { AuthProvider } from '@/contexts/auth-context';
import { RibbonProvider } from "@/components/ribbon";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
import { I18nProvider } from "@/components/utils/I18nProvider";

/**
 * CENTRALIZED PROVIDERS
 * 
 * This is the ONLY file that should own client providers.
 * No other layout should ever add/duplicate auth providers.
 * 
 * Rule: All client-side context providers go here and only here.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <AuthProvider>
        <ThemeProvider>
          <RibbonProvider>
            {children}
          </RibbonProvider>
        </ThemeProvider>
      </AuthProvider>
    </I18nProvider>
  );
}