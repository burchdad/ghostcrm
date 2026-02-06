"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Settings, 
  Building2, 
  Users, 
  BarChart3,
  Calendar,
  Car,
  MessageSquare,
  Zap,
  DollarSign,
  FileText,
  Bot,
  UserCog,
  TrendingUp,
  CreditCard,
  Shield,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import './FloatingNavButtons.css';

interface FloatingNavButtonsProps {
  className?: string;
}

interface NavCategory {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  items: NavItem[];
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  enabled: boolean;
  comingSoon?: string;
}

export default function FloatingNavButtons({ className = "" }: FloatingNavButtonsProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Don't render on desktop
  if (!isMobile) return null;

  // Don't render if no user
  if (!user) return null;

  const getNavCategories = (): NavCategory[] => {
    const categories: NavCategory[] = [];

    // Software Owner categories
    if (user.role === 'owner' && !user.tenantId) {
      categories.push({
        id: 'platform',
        name: 'Platform',
        icon: Shield,
        color: 'bg-purple-500',
        items: [
          { name: 'Leads', path: '/leads', icon: Users, enabled: true },
          { name: 'Deals', path: '/deals', icon: BarChart3, enabled: true },
          { name: 'Calendar', path: '/calendar', icon: Calendar, enabled: true },
          { name: 'Collaboration', path: '/collaboration', icon: MessageSquare, enabled: true },
          { name: 'Automation', path: '/automation', icon: Zap, enabled: true },
          { name: 'AI Agents', path: '/ai-agents', icon: Bot, enabled: true },
          { name: 'Cybersecurity', path: '/admin/testing', icon: Shield, enabled: true },
        ]
      });
    }

    // Tenant Owner categories
    if (user.role === 'owner' && user.tenantId) {
      categories.push(
        {
          id: 'business',
          name: 'Business',
          icon: Building2,
          color: 'bg-blue-500',
          items: [
            { name: 'Dashboard', path: '/tenant-owner/dashboard', icon: BarChart3, enabled: true },
            { name: 'Leads', path: '/tenant-owner/leads', icon: Users, enabled: true },
            { name: 'Deals', path: '/tenant-owner/deals', icon: BarChart3, enabled: true },
            { name: 'Inventory', path: '/tenant-owner/inventory', icon: Car, enabled: true },
            { name: 'Calendar', path: '/tenant-owner/calendar', icon: Calendar, enabled: true },
            { name: 'Collaboration', path: '/tenant-owner/collaboration', icon: MessageSquare, enabled: true },
            { name: 'Automation', path: '/tenant-owner/automation', icon: Zap, enabled: true },
          ]
        },
        {
          id: 'management',
          name: 'Management',
          icon: Settings,
          color: 'bg-green-500',
          items: [
            { name: 'Voice OS™', path: '/tenant-owner/voice-os', icon: Bot, enabled: true },
            { name: 'Team Management', path: '/tenant-owner/team', icon: UserCog, enabled: true },
            { name: 'Business Settings', path: '/tenant-owner/settings', icon: Settings, enabled: true },
            { name: 'Financial Overview', path: '/tenant-owner/finance', icon: DollarSign, enabled: true },
            { name: 'Business Analytics', path: '/tenant-owner/analytics', icon: TrendingUp, enabled: true },
            { name: 'Billing & Subscriptions', path: '/tenant-owner/billing', icon: CreditCard, enabled: true },
            { name: 'Reports & Insights', path: '/tenant-owner/reports', icon: FileText, enabled: true },
            { name: 'Organization Profile', path: '/tenant-owner/profile', icon: Building2, enabled: true },
            { name: 'AI Sales Agents', path: '/tenant-owner/ai-sales', icon: Bot, enabled: true },
          ]
        }
      );
    }

    // Tenant Admin categories
    if (user.role === 'admin') {
      categories.push({
        id: 'operations',
        name: 'Operations',
        icon: Settings,
        color: 'bg-orange-500',
        items: [
          { name: 'Admin Dashboard', path: '/admin/dashboard', icon: Home, enabled: true },
          { name: 'Inventory', path: '/inventory', icon: Car, enabled: true },
          { name: 'Calendar', path: '/calendar', icon: Calendar, enabled: true },
          { name: 'Collaboration', path: '/collaboration', icon: MessageSquare, enabled: true },
          { name: 'Automation', path: '/automation', icon: Zap, enabled: true },
          { name: 'Financial Overview', path: '/tenant-owner/finance', icon: DollarSign, enabled: true },
        ]
      });
    }

    // Sales Manager categories
    if (user.role === 'manager') {
      categories.push({
        id: 'sales',
        name: 'Sales',
        icon: TrendingUp,
        color: 'bg-indigo-500',
        items: [
          { name: 'Dashboard', path: '/dashboard', icon: Home, enabled: true },
          { name: 'Leads', path: '/leads', icon: Users, enabled: true },
          { name: 'Deals', path: '/deals', icon: BarChart3, enabled: true },
          { name: 'Inventory', path: '/inventory', icon: Car, enabled: true },
          { name: 'Calendar', path: '/calendar', icon: Calendar, enabled: true },
          { name: 'Collaboration', path: '/collaboration', icon: MessageSquare, enabled: true },
        ]
      });
    }

    // Sales Rep categories
    if (user.role === 'sales_rep') {
      categories.push({
        id: 'sales',
        name: 'Sales',
        icon: TrendingUp,
        color: 'bg-pink-500',
        items: [
          { name: 'Sales Dashboard', path: '/sales/dashboard', icon: Home, enabled: true },
          { name: 'Leads', path: '/leads', icon: Users, enabled: true },
          { name: 'Deals', path: '/deals', icon: BarChart3, enabled: true },
          { name: 'Inventory', path: '/inventory', icon: Car, enabled: true },
          { name: 'Calendar', path: '/calendar', icon: Calendar, enabled: true },
          { name: 'Collaboration', path: '/collaboration', icon: MessageSquare, enabled: true },
        ]
      });
    }

    return categories;
  };

  const categories = getNavCategories();

  const handleCategoryClick = (categoryId: string) => {
    // Accordion behavior: close the current category if it's already open,
    // otherwise close any open category and open the clicked one
    if (openCategory === categoryId) {
      setOpenCategory(null); // Close if clicking the same category
    } else {
      // Small delay to allow previous dropdown to start closing before opening new one
      if (openCategory) {
        setOpenCategory(null);
        setTimeout(() => setOpenCategory(categoryId), 100);
      } else {
        setOpenCategory(categoryId); // Open immediately if no category is open
      }
    }
  };

  const handleBackdropClick = () => {
    setOpenCategory(null);
  };

  const handleKeyDown = (event: React.KeyboardEvent, categoryId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCategoryClick(categoryId);
    } else if (event.key === 'Escape') {
      setOpenCategory(null);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {openCategory && (
        <div 
          className="floating-backdrop"
          onClick={handleBackdropClick}
        />
      )}

      {/* Floating Category Buttons */}
      <div className="floating-nav-buttons">
        {categories.map((category) => {
          const Icon = category.icon;
          const isOpen = openCategory === category.id;
          
          return (
            <div key={category.id} className="relative">
              {/* Dropdown Menu */}
              {isOpen && (
                <div className="floating-dropdown">
                  <div className="floating-dropdown-header">
                    <h3>{category.name}</h3>
                  </div>
                  
                  {category.items.map((item) => {
                    const ItemIcon = item.icon;
                    const isActive = pathname === item.path;
                    const isDisabled = !item.enabled;
                    
                    if (isDisabled) {
                      return (
                        <div
                          key={item.path}
                          className="floating-dropdown-item disabled"
                        >
                          <ItemIcon />
                          <span>{item.name}</span>
                          {item.comingSoon && (
                            <span className="coming-soon-badge">
                              {item.comingSoon}
                            </span>
                          )}
                        </div>
                      );
                    }
                    
                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        onClick={handleBackdropClick}
                        className={`floating-dropdown-item ${isActive ? 'active' : ''}`}
                      >
                        <ItemIcon />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
              
              {/* Category Button */}
              <button
                onClick={() => handleCategoryClick(category.id)}
                onKeyDown={(e) => handleKeyDown(e, category.id)}
                className={`floating-category-btn ${category.color} ${isOpen ? 'active' : ''}`}
                aria-label={`Open ${category.name} menu (${category.items.filter(item => item.enabled).length} items)`}
                aria-expanded={isOpen}
                tabIndex={0}
              >
                <Icon className="w-6 h-6" />
                {/* Item count badge */}
                <span className="category-badge" aria-hidden="true">
                  {category.items.filter(item => item.enabled).length}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}