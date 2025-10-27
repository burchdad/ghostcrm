"use client";
import React from 'react';

interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: number | string;
  className?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  cols = { default: 1, md: 2, lg: 3 },
  gap = 6,
  className = ''
}) => {
  const getGridClasses = () => {
    let classes = 'grid ';
    
    // Default columns
    if (cols.default) classes += `grid-cols-${cols.default} `;
    
    // Responsive columns
    if (cols.sm) classes += `sm:grid-cols-${cols.sm} `;
    if (cols.md) classes += `md:grid-cols-${cols.md} `;
    if (cols.lg) classes += `lg:grid-cols-${cols.lg} `;
    if (cols.xl) classes += `xl:grid-cols-${cols.xl} `;
    if (cols['2xl']) classes += `2xl:grid-cols-${cols['2xl']} `;
    
    // Gap
    classes += `gap-${gap} `;
    
    return classes + className;
  };

  return (
    <div className={getGridClasses()}>
      {children}
    </div>
  );
};

interface ResponsiveStackProps {
  children: React.ReactNode;
  direction?: {
    default?: 'row' | 'col';
    sm?: 'row' | 'col';
    md?: 'row' | 'col';
    lg?: 'row' | 'col';
  };
  gap?: number;
  className?: string;
}

export const ResponsiveStack: React.FC<ResponsiveStackProps> = ({
  children,
  direction = { default: 'col', md: 'row' },
  gap = 4,
  className = ''
}) => {
  const getFlexClasses = () => {
    let classes = 'flex ';
    
    // Default direction
    if (direction.default === 'row') classes += 'flex-row ';
    else classes += 'flex-col ';
    
    // Responsive directions
    if (direction.sm === 'row') classes += 'sm:flex-row ';
    else if (direction.sm === 'col') classes += 'sm:flex-col ';
    
    if (direction.md === 'row') classes += 'md:flex-row ';
    else if (direction.md === 'col') classes += 'md:flex-col ';
    
    if (direction.lg === 'row') classes += 'lg:flex-row ';
    else if (direction.lg === 'col') classes += 'lg:flex-col ';
    
    // Gap
    classes += `gap-${gap} `;
    
    return classes + className;
  };

  return (
    <div className={getFlexClasses()}>
      {children}
    </div>
  );
};

interface MobileHiddenProps {
  children: React.ReactNode;
  breakpoint?: 'sm' | 'md' | 'lg' | 'xl';
}

export const MobileHidden: React.FC<MobileHiddenProps> = ({
  children,
  breakpoint = 'md'
}) => {
  return (
    <div className={`hidden ${breakpoint}:block`}>
      {children}
    </div>
  );
};

interface MobileOnlyProps {
  children: React.ReactNode;
  breakpoint?: 'sm' | 'md' | 'lg' | 'xl';
}

export const MobileOnly: React.FC<MobileOnlyProps> = ({
  children,
  breakpoint = 'md'
}) => {
  return (
    <div className={`block ${breakpoint}:hidden`}>
      {children}
    </div>
  );
};

// Hook for responsive behavior
export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = React.useState('');

  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setBreakpoint('sm');
      else if (width < 768) setBreakpoint('md');
      else if (width < 1024) setBreakpoint('lg');
      else if (width < 1280) setBreakpoint('xl');
      else setBreakpoint('2xl');
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobile: breakpoint === 'sm',
    isTablet: breakpoint === 'md',
    isDesktop: ['lg', 'xl', '2xl'].includes(breakpoint),
    breakpoint
  };
};