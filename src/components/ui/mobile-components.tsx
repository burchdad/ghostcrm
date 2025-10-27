// =============================================================================
// MOBILE-FIRST RESPONSIVE COMPONENT LIBRARY
// Touch-optimized interactions and adaptive layouts
// =============================================================================

'use client';

import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { 
  MenuIcon, 
  XIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  SearchIcon,
  FilterIcon,
  MoreVerticalIcon,
  PlusIcon,
  HeartIcon,
  StarIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// RESPONSIVE BREAKPOINT HOOK
// =============================================================================

const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const checkBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setBreakpoint('mobile');
      } else if (width < 1024) {
        setBreakpoint('tablet');
      } else {
        setBreakpoint('desktop');
      }
    };

    checkBreakpoint();
    window.addEventListener('resize', checkBreakpoint);
    return () => window.removeEventListener('resize', checkBreakpoint);
  }, []);

  return {
    breakpoint,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
    isMobileOrTablet: breakpoint === 'mobile' || breakpoint === 'tablet'
  };
};

// =============================================================================
// RESPONSIVE CARD COMPONENT
// =============================================================================

interface ResponsiveCardProps {
  children: ReactNode;
  className?: string;
  mobileLayout?: 'stack' | 'full' | 'compact';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: boolean;
  border?: boolean;
}

const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  children,
  className = '',
  mobileLayout = 'stack',
  padding = 'md',
  shadow = true,
  border = true
}) => {
  const { isMobile, isTablet } = useBreakpoint();

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4 md:p-6',
    lg: 'p-6 md:p-8'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'bg-white rounded-lg',
        shadow && 'shadow-sm',
        border && 'border border-gray-200',
        isMobile && mobileLayout === 'stack' && 'mx-4 mb-4',
        isMobile && mobileLayout === 'full' && 'mx-0 rounded-none border-x-0',
        isMobile && mobileLayout === 'compact' && 'mx-2 mb-2 rounded-md',
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </motion.div>
  );
};

// =============================================================================
// MOBILE NAVIGATION DRAWER
// =============================================================================

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  isOpen,
  onClose,
  children
}) => {
  const [startX, setStartX] = useState(0);

  const handlePanStart = (event: any, info: PanInfo) => {
    setStartX(info.point.x);
  };

  const handlePanEnd = (event: any, info: PanInfo) => {
    const deltaX = info.point.x - startX;
    const velocity = info.velocity.x;

    // Close drawer if swiped left with enough velocity or distance
    if (deltaX < -100 || velocity < -500) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            drag="x"
            dragConstraints={{ left: -300, right: 0 }}
            dragElastic={0.1}
            onPanStart={handlePanStart}
            onPanEnd={handlePanEnd}
            className="fixed inset-y-0 left-0 z-50 w-80 max-w-xs bg-white shadow-xl md:hidden"
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// =============================================================================
// TOUCH-OPTIMIZED BUTTON COMPONENT
// =============================================================================

interface TouchButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'touch';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

const TouchButton: React.FC<TouchButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  onClick,
  className = ''
}) => {
  const { isMobile } = useBreakpoint();

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 active:scale-95';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300',
    ghost: 'text-gray-700 hover:bg-gray-100 active:bg-gray-200',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    touch: 'px-6 py-4 text-base min-h-[48px]' // Minimum touch target size
  };

  // Use touch size on mobile if size is md or lg
  const finalSize = isMobile && (size === 'md' || size === 'lg') ? 'touch' : size;

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[finalSize],
        fullWidth && 'w-full',
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        children
      )}
    </motion.button>
  );
};

// =============================================================================
// SWIPEABLE CARD LIST
// =============================================================================

interface SwipeableCardProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: {
    icon: ReactNode;
    label: string;
    color: 'red' | 'green' | 'blue' | 'orange';
  };
  rightAction?: {
    icon: ReactNode;
    label: string;
    color: 'red' | 'green' | 'blue' | 'orange';
  };
}

const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction
}) => {
  const [dragX, setDragX] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100;
    const velocity = info.velocity.x;

    if (info.offset.x > threshold || velocity > 500) {
      // Swiped right
      if (onSwipeRight) {
        onSwipeRight();
      }
      setIsRevealed(false);
    } else if (info.offset.x < -threshold || velocity < -500) {
      // Swiped left
      if (onSwipeLeft) {
        onSwipeLeft();
      }
      setIsRevealed(false);
    } else {
      // Snap back
      setIsRevealed(false);
    }
    setDragX(0);
  };

  const actionColors = {
    red: 'bg-red-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    orange: 'bg-orange-500'
  };

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Action backgrounds */}
      {leftAction && (
        <div className={cn(
          'absolute inset-y-0 left-0 flex items-center justify-start px-6',
          actionColors[leftAction.color],
          'text-white'
        )}>
          <div className="flex items-center space-x-2">
            {leftAction.icon}
            <span className="font-medium">{leftAction.label}</span>
          </div>
        </div>
      )}
      
      {rightAction && (
        <div className={cn(
          'absolute inset-y-0 right-0 flex items-center justify-end px-6',
          actionColors[rightAction.color],
          'text-white'
        )}>
          <div className="flex items-center space-x-2">
            <span className="font-medium">{rightAction.label}</span>
            {rightAction.icon}
          </div>
        </div>
      )}

      {/* Card content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -150, right: 150 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        onDrag={(event, info) => setDragX(info.offset.x)}
        className="relative z-10 bg-white"
      >
        {children}
      </motion.div>
    </div>
  );
};

// =============================================================================
// MOBILE SEARCH BAR
// =============================================================================

interface MobileSearchProps {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onClear?: () => void;
  placeholder?: string;
  showFilter?: boolean;
  onFilterClick?: () => void;
}

const MobileSearch: React.FC<MobileSearchProps> = ({
  value,
  onChange,
  onFocus,
  onClear,
  placeholder = 'Search...',
  showFilter = false,
  onFilterClick
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative">
      <div className={cn(
        'flex items-center bg-gray-100 rounded-lg transition-all duration-200',
        isFocused && 'bg-white ring-2 ring-blue-500 ring-opacity-20'
      )}>
        <SearchIcon className="w-5 h-5 text-gray-400 ml-3" />
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            onFocus?.();
          }}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-1 bg-transparent px-3 py-3 text-base placeholder-gray-500 focus:outline-none"
        />

        {value && (
          <button
            onClick={() => {
              onChange('');
              onClear?.();
              inputRef.current?.focus();
            }}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <XIcon className="w-4 h-4" />
          </button>
        )}

        {showFilter && (
          <button
            onClick={onFilterClick}
            className="p-2 text-gray-400 hover:text-gray-600 mr-1"
          >
            <FilterIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// FLOATING ACTION BUTTON
// =============================================================================

interface FloatingActionButtonProps {
  onClick: () => void;
  icon?: ReactNode;
  label?: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  variant?: 'primary' | 'secondary';
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  icon = <PlusIcon className="w-6 h-6" />,
  label,
  position = 'bottom-right',
  variant = 'primary'
}) => {
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'bottom-center': 'bottom-6 left-1/2 transform -translate-x-1/2'
  };

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        'fixed z-50 flex items-center justify-center rounded-full shadow-lg transition-all duration-200',
        label ? 'px-4 py-3' : 'w-14 h-14',
        positionClasses[position],
        variantClasses[variant]
      )}
    >
      {icon}
      {label && <span className="ml-2 font-medium">{label}</span>}
    </motion.button>
  );
};

// =============================================================================
// MOBILE TABS COMPONENT
// =============================================================================

interface MobileTabsProps {
  tabs: Array<{
    id: string;
    label: string;
    icon?: ReactNode;
    badge?: string | number;
  }>;
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'scrollable' | 'fixed';
}

const MobileTabs: React.FC<MobileTabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'scrollable'
}) => {
  return (
    <div className={cn(
      'flex border-b border-gray-200 bg-white',
      variant === 'scrollable' ? 'overflow-x-auto scrollbar-hide' : 'grid grid-cols-3'
    )}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'flex items-center justify-center px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap min-w-0',
            variant === 'fixed' && 'flex-1',
            activeTab === tab.id
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          )}
        >
          {tab.icon && (
            <span className="w-5 h-5 mr-2 flex-shrink-0">
              {tab.icon}
            </span>
          )}
          <span className="truncate">{tab.label}</span>
          {tab.badge && (
            <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-600 rounded-full">
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

// =============================================================================
// PULL TO REFRESH COMPONENT
// =============================================================================

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  threshold?: number;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  threshold = 80
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);

  const handlePanStart = () => {
    if (window.scrollY === 0) {
      setIsPulling(true);
    }
  };

  const handlePan = (event: any, info: PanInfo) => {
    if (!isPulling || window.scrollY > 0) {
      setIsPulling(false);
      setPullDistance(0);
      return;
    }

    if (info.offset.y > 0) {
      setPullDistance(Math.min(info.offset.y, threshold * 1.5));
    }
  };

  const handlePanEnd = async (event: any, info: PanInfo) => {
    if (!isPulling) return;

    setIsPulling(false);

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  const refreshProgress = Math.min(pullDistance / threshold, 1);
  const shouldTriggerRefresh = pullDistance >= threshold;

  return (
    <div className="relative">
      {/* Pull indicator */}
      <AnimatePresence>
        {(isPulling || isRefreshing) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-0 left-0 right-0 z-10 flex items-center justify-center py-4"
            style={{ transform: `translateY(${Math.max(0, pullDistance - 60)}px)` }}
          >
            <div className="flex items-center space-x-2 text-gray-600">
              {isRefreshing ? (
                <>
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Refreshing...</span>
                </>
              ) : (
                <>
                  <motion.div
                    animate={{ rotate: shouldTriggerRefresh ? 180 : 0 }}
                    className="w-5 h-5"
                  >
                    <ChevronDownIcon className="w-5 h-5" />
                  </motion.div>
                  <span className="text-sm">
                    {shouldTriggerRefresh ? 'Release to refresh' : 'Pull to refresh'}
                  </span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.1}
        onPanStart={handlePanStart}
        onPan={handlePan}
        onPanEnd={handlePanEnd}
      >
        {children}
      </motion.div>
    </div>
  );
};

// =============================================================================
// RESPONSIVE GRID COMPONENT
// =============================================================================

interface ResponsiveGridProps {
  children: ReactNode;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
  className = ''
}) => {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  };

  return (
    <div
      className={cn(
        'grid',
        `grid-cols-${columns.mobile}`,
        `md:grid-cols-${columns.tablet}`,
        `lg:grid-cols-${columns.desktop}`,
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
};

// Helper component icons
const ChevronDownIcon = ({ className }: { className?: string }) => (
  <ChevronLeftIcon className={cn('rotate-90', className)} />
);

export {
  useBreakpoint,
  ResponsiveCard,
  MobileNavigation,
  TouchButton,
  SwipeableCard,
  MobileSearch,
  FloatingActionButton,
  MobileTabs,
  PullToRefresh,
  ResponsiveGrid
};