// Theme context and provider for managing application-wide theme settings
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface ThemeSettings {
  // General Appearance
  mode: 'light' | 'dark' | 'system';
  colorScheme: string;
  accentColor: string;
  
  // Layout
  sidebarPosition: 'left' | 'right';
  sidebarStyle: 'compact' | 'expanded' | 'auto';
  topbarStyle: 'fixed' | 'static' | 'hidden';
  
  // Typography
  fontSize: 'small' | 'medium' | 'large';
  fontFamily: string;
  
  // Components
  cardStyle: 'flat' | 'elevated' | 'outlined';
  buttonStyle: 'rounded' | 'square' | 'pill';
  borderRadius: number;
  
  // Density
  density: 'compact' | 'comfortable' | 'spacious';
  
  // Animation
  animationsEnabled: boolean;
  transitionSpeed: 'slow' | 'normal' | 'fast';
  
  // Custom Colors
  customColors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

const defaultTheme: ThemeSettings = {
  mode: 'light',
  colorScheme: 'blue',
  accentColor: '#3B82F6',
  
  sidebarPosition: 'left',
  sidebarStyle: 'expanded',
  topbarStyle: 'fixed',
  
  fontSize: 'medium',
  fontFamily: 'Inter',
  
  cardStyle: 'elevated',
  buttonStyle: 'rounded',
  borderRadius: 8,
  
  density: 'comfortable',
  
  animationsEnabled: true,
  transitionSpeed: 'normal',
  
  customColors: {
    primary: '#3B82F6',
    secondary: '#6B7280',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#06B6D4',
  }
};

interface ThemeContextType {
  theme: ThemeSettings;
  updateTheme: (updates: Partial<ThemeSettings>) => void;
  resetTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeSettings>(defaultTheme);
  const [isDark, setIsDark] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('ghostcrm-theme');
    if (savedTheme) {
      try {
        const parsedTheme = JSON.parse(savedTheme);
        setTheme({ ...defaultTheme, ...parsedTheme });
      } catch (error) {
        console.warn('Failed to parse saved theme, using defaults');
      }
    }
  }, []);

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('ghostcrm-theme', JSON.stringify(theme));
  }, [theme]);

  // Handle system theme detection
  useEffect(() => {
    const updateSystemTheme = () => {
      if (theme.mode === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDark(prefersDark);
      } else {
        setIsDark(theme.mode === 'dark');
      }
    };

    updateSystemTheme();

    if (theme.mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', updateSystemTheme);
      return () => mediaQuery.removeEventListener('change', updateSystemTheme);
    }
  }, [theme.mode]);

  // Apply CSS variables to document root
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply custom colors
    root.style.setProperty('--color-primary', theme.customColors.primary);
    root.style.setProperty('--color-secondary', theme.customColors.secondary);
    root.style.setProperty('--color-success', theme.customColors.success);
    root.style.setProperty('--color-warning', theme.customColors.warning);
    root.style.setProperty('--color-error', theme.customColors.error);
    root.style.setProperty('--color-info', theme.customColors.info);
    
    // Apply accent color
    root.style.setProperty('--color-accent', theme.accentColor);
    
    // Apply border radius
    root.style.setProperty('--border-radius', `${theme.borderRadius}px`);
    
    // Apply font settings
    root.style.setProperty('--font-family', theme.fontFamily);
    
    // Apply font size
    const fontSizes = {
      small: '14px',
      medium: '16px',
      large: '18px'
    };
    root.style.setProperty('--font-size-base', fontSizes[theme.fontSize]);
    
    // Apply density spacing
    const densitySpacing = {
      compact: '0.5rem',
      comfortable: '0.75rem',
      spacious: '1rem'
    };
    root.style.setProperty('--spacing-density', densitySpacing[theme.density]);
    
    // Apply animation settings
    if (!theme.animationsEnabled) {
      root.style.setProperty('--transition-duration', '0ms');
    } else {
      const transitionSpeeds = {
        slow: '500ms',
        normal: '300ms',
        fast: '150ms'
      };
      root.style.setProperty('--transition-duration', transitionSpeeds[theme.transitionSpeed]);
    }
    
    // Apply dark/light mode classes
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }

    // Apply layout classes
    root.setAttribute('data-sidebar-position', theme.sidebarPosition);
    root.setAttribute('data-sidebar-style', theme.sidebarStyle);
    root.setAttribute('data-topbar-style', theme.topbarStyle);
    root.setAttribute('data-card-style', theme.cardStyle);
    root.setAttribute('data-button-style', theme.buttonStyle);
    root.setAttribute('data-density', theme.density);
    
  }, [theme, isDark]);

  const updateTheme = (updates: Partial<ThemeSettings>) => {
    setTheme(prev => ({ ...prev, ...updates }));
  };

  const resetTheme = () => {
    setTheme(defaultTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, resetTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Utility function to get CSS classes based on theme
export const getThemeClasses = (theme: ThemeSettings, isDark: boolean) => {
  const classes: string[] = [];
  
  // Base theme class
  classes.push(isDark ? 'theme-dark' : 'theme-light');
  
  // Color scheme
  classes.push(`theme-${theme.colorScheme}`);
  
  // Font size
  classes.push(`text-${theme.fontSize}`);
  
  // Density
  classes.push(`density-${theme.density}`);
  
  return classes.join(' ');
};