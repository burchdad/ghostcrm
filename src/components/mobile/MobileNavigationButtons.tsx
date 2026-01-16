'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import {
  Brain,
  Activity,
  Users,
  FileText,
  Package,
  Building2,
  ChevronUp,
  ChevronDown,
  Zap,
  Calendar,
  BarChart3,
  Settings
} from 'lucide-react';

interface MobileNavButton {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: string;
  badgeColor?: 'green' | 'blue' | 'orange' | 'red';
  isActive?: boolean;
  subItems?: {
    label: string;
    href: string;
    icon: React.ReactNode;
  }[];
}

const MobileNavigationButtons: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [loadingItem, setLoadingItem] = useState<string | null>(null);

  const navigationItems: MobileNavButton[] = [
    {
      id: 'virtual-gm',
      label: 'Virtual GM',
      icon: <Brain className="w-6 h-6" />,
      href: '/tenant-owner/dashboard',
      badge: 'Live',
      badgeColor: 'green',
      isActive: pathname === '/tenant-owner/dashboard',
      subItems: [
        {
          label: 'AI Command Center',
          href: '/tenant-owner/dashboard',
          icon: <Activity className="w-4 h-4" />
        },
        {
          label: 'Daily Briefing',
          href: '/tenant-owner/briefing',
          icon: <FileText className="w-4 h-4" />
        },
        {
          label: 'Performance Review',
          href: '/tenant-owner/performance',
          icon: <BarChart3 className="w-4 h-4" />
        }
      ]
    },
    {
      id: 'real-time-briefing',
      label: 'Real-Time GM Briefing',
      icon: <Zap className="w-6 h-6" />,
      href: '/tenant-owner/briefing',
      badge: 'Active',
      badgeColor: 'blue',
      isActive: pathname === '/tenant-owner/briefing'
    },
    {
      id: 'leads',
      label: 'View Leads',
      icon: <Users className="w-6 h-6" />,
      href: '/tenant-owner/leads',
      badge: '12',
      badgeColor: 'orange',
      isActive: pathname === '/tenant-owner/leads'
    },
    {
      id: 'deals',
      label: 'Deals',
      icon: <FileText className="w-6 h-6" />,
      href: '/tenant-owner/deals',
      badge: '8',
      badgeColor: 'blue',
      isActive: pathname === '/tenant-owner/deals'
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: <Package className="w-6 h-6" />,
      href: '/tenant-owner/inventory',
      isActive: pathname === '/tenant-owner/inventory'
    },
    {
      id: 'command-center',
      label: 'Dealership Command Center',
      icon: <Building2 className="w-6 h-6" />,
      href: '/tenant-owner/command-center',
      badge: 'New',
      badgeColor: 'red',
      isActive: pathname === '/tenant-owner/command-center',
      subItems: [
        {
          label: 'Live Analytics',
          href: '/tenant-owner/analytics',
          icon: <BarChart3 className="w-4 h-4" />
        },
        {
          label: 'Team Calendar',
          href: '/tenant-owner/calendar',
          icon: <Calendar className="w-4 h-4" />
        },
        {
          label: 'System Settings',
          href: '/tenant-owner/settings',
          icon: <Settings className="w-4 h-4" />
        }
      ]
    }
  ];

  const handleNavigation = async (item: MobileNavButton) => {
    // Haptic feedback for mobile devices
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    if (item.subItems && item.subItems.length > 0) {
      setExpandedItem(expandedItem === item.id ? null : item.id);
    } else {
      setLoadingItem(item.id);
      try {
        router.push(item.href);
      } catch (error) {
        console.error('Navigation failed:', error);
      } finally {
        // Clear loading state after navigation attempt
        setTimeout(() => setLoadingItem(null), 1000);
      }
    }
  };
  
  const handleSubNavigation = async (href: string, parentId: string) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(30);
    }
    
    setLoadingItem(parentId);
    try {
      router.push(href);
    } catch (error) {
      console.error('Sub-navigation failed:', error);
    } finally {
      setTimeout(() => setLoadingItem(null), 1000);
    }
  };

  const getBadgeStyles = (color: string) => {
    const styles = {
      green: 'bg-green-500 text-white animate-pulse',
      blue: 'bg-blue-500 text-white',
      orange: 'bg-orange-500 text-white',
      red: 'bg-red-500 text-white animate-bounce'
    };
    return styles[color as keyof typeof styles] || 'bg-gray-500 text-white';
  };

  return (
    <div className="mobile-nav-buttons">
      <div className="mobile-nav-grid">
        {navigationItems.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="mobile-nav-item"
          >
            <motion.button
              onClick={() => handleNavigation(item)}
              className={`mobile-nav-button ${
                item.isActive ? 'active' : ''
              } ${
                loadingItem === item.id ? 'loading' : ''
              }`}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              disabled={loadingItem === item.id}
            >
              <div className="mobile-nav-button-content">
                <div className={`mobile-nav-icon ${
                  loadingItem === item.id ? 'loading' : ''
                }`}>
                  {loadingItem === item.id ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Activity className="w-6 h-6" />
                    </motion.div>
                  ) : (
                    item.icon
                  )}
                </div>
                
                <div className="mobile-nav-text">
                  <span className="mobile-nav-label">{item.label}</span>
                  {item.badge && (
                    <span className={`mobile-nav-badge ${getBadgeStyles(item.badgeColor || 'blue')}`}>
                      {item.badge}
                    </span>
                  )}
                </div>

                {item.subItems && (
                  <div className="mobile-nav-chevron">
                    {expandedItem === item.id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                )}
              </div>
            </motion.button>

            <AnimatePresence>
              {expandedItem === item.id && item.subItems && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mobile-nav-submenu"
                >
                  {item.subItems.map((subItem, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleSubNavigation(subItem.href, item.id)}
                      className={`mobile-nav-subitem ${
                        loadingItem === item.id ? 'loading' : ''
                      }`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      disabled={loadingItem === item.id}
                    >
                      <div className="mobile-nav-subitem-icon">
                        {subItem.icon}
                      </div>
                      <span>{subItem.label}</span>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MobileNavigationButtons;