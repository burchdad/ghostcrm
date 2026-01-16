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
  Plus,
  X,
  Zap,
  Calendar,
  BarChart3,
  Settings,
  Menu
} from 'lucide-react';

interface FloatingNavButton {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  badge?: string;
  badgeColor?: 'green' | 'blue' | 'orange' | 'red';
}

const MobileFloatingNavigation: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navigationItems: FloatingNavButton[] = [
    {
      id: 'virtual-gm',
      label: 'Virtual GM',
      icon: <Brain className="w-5 h-5" />,
      href: '/tenant-owner/dashboard',
      color: '#8b5cf6',
      badge: 'Live',
      badgeColor: 'green'
    },
    {
      id: 'briefing',
      label: 'GM Briefing',
      icon: <Zap className="w-5 h-5" />,
      href: '/tenant-owner/briefing',
      color: '#3b82f6',
      badge: 'Active',
      badgeColor: 'blue'
    },
    {
      id: 'leads',
      label: 'Leads',
      icon: <Users className="w-5 h-5" />,
      href: '/tenant-owner/leads',
      color: '#f59e0b',
      badge: '12',
      badgeColor: 'orange'
    },
    {
      id: 'deals',
      label: 'Deals',
      icon: <FileText className="w-5 h-5" />,
      href: '/tenant-owner/deals',
      color: '#10b981',
      badge: '8',
      badgeColor: 'blue'
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: <Package className="w-5 h-5" />,
      href: '/tenant-owner/inventory',
      color: '#ef4444'
    },
    {
      id: 'command-center',
      label: 'Command Center',
      icon: <Building2 className="w-5 h-5" />,
      href: '/tenant-owner/command-center',
      color: '#6366f1',
      badge: 'New',
      badgeColor: 'red'
    }
  ];

  const handleNavigation = (href: string) => {
    router.push(href);
    setIsOpen(false);
  };

  const getBadgeStyles = (color: string) => {
    const styles = {
      green: 'bg-green-500 text-white',
      blue: 'bg-blue-500 text-white',
      orange: 'bg-orange-500 text-white',
      red: 'bg-red-500 text-white animate-pulse'
    };
    return styles[color as keyof typeof styles] || 'bg-gray-500 text-white';
  };

  return (
    <div className="mobile-floating-nav">
      {/* Main FAB Toggle Button */}
      <motion.button
        className="floating-nav-toggle"
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.1 }}
        animate={{
          rotate: isOpen ? 45 : 0,
          backgroundColor: isOpen ? '#ef4444' : '#8b5cf6'
        }}
        transition={{ duration: 0.2 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.1 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.1 }}
            >
              <Menu className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Floating Navigation Items */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="floating-nav-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            
            {/* Navigation Items */}
            <div className="floating-nav-items">
              {navigationItems.map((item, index) => (
                <motion.button
                  key={item.id}
                  className="floating-nav-item"
                  style={{ backgroundColor: item.color }}
                  onClick={() => handleNavigation(item.href)}
                  initial={{
                    scale: 0,
                    opacity: 0,
                    x: 20,
                    y: 20
                  }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    x: 0,
                    y: -((index + 1) * 70) // Stack items vertically above main button
                  }}
                  exit={{
                    scale: 0,
                    opacity: 0,
                    x: 20,
                    y: 20
                  }}
                  transition={{
                    delay: index * 0.05,
                    duration: 0.2,
                    type: "spring",
                    stiffness: 260,
                    damping: 20
                  }}
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="floating-nav-item-content">
                    {item.icon}
                    {item.badge && (
                      <span className={`floating-nav-badge ${getBadgeStyles(item.badgeColor || 'blue')}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  
                  {/* Tooltip */}
                  <motion.div
                    className="floating-nav-tooltip"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (index * 0.05) + 0.2 }}
                  >
                    {item.label}
                  </motion.div>
                </motion.button>
              ))}
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileFloatingNavigation;