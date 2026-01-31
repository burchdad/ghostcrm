"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideHome, LucideUser, LucideBarChart2, LucideCar, LucideCalendar, Zap, Users, Shield, Activity, Settings, DollarSign, UserCog, TrendingUp, Building, CreditCard, FileText, ChevronDown, ChevronRight, MoreHorizontal, Palette, Bot } from "lucide-react";
import { useAuth } from '@/contexts/auth-context';
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';
import './Sidebar.css';

// MVP Feature Configuration
const ENABLED_FEATURES = new Set([
  '/dashboard',
  '/leads', 
  '/deals',
  '/inventory',
  '/calendar',
  '/automation',
  '/collaboration',
  '/ai',
  '/ai-agents',
  '/admin/testing'
]);

interface SidebarCounts {
  leads: number;
  deals: number;
  dashboard: number;
  inventory: number;
  calendar: number;
  automation: number;
  collaboration: number;
  performance: number;
  finance: number;
}

interface SidebarItem {
  name: string;
  path: string;
  icon: any;
  role: string[];
  enabled: boolean;
  comingSoon?: string;
  countKey?: keyof SidebarCounts;
  section?: string;
  ownerOnly?: boolean;
  tenantOwnerOnly?: boolean;
  tenantAdminOnly?: boolean;
  salesManagerOnly?: boolean;
  salesRepOnly?: boolean;
  subItems?: SidebarItem[];
  isDropdown?: boolean;
  expandable?: boolean;
}

const DEFAULT_ITEMS: SidebarItem[] = [
  // Software Owner Features
  { name: "Software Dashboard", path: "/owner/dashboard", icon: LucideHome, role: ["owner"], enabled: false, comingSoon: "Q1 2025", section: "overview", ownerOnly: true },
  { name: "Leads", path: "/leads", icon: LucideUser, role: ["owner"], enabled: true, countKey: "leads", section: "operations", ownerOnly: true },
  { name: "Deals", path: "/deals", icon: LucideBarChart2, role: ["owner"], enabled: true, countKey: "deals", section: "operations", ownerOnly: true },
  { name: "Calendar", path: "/calendar", icon: LucideCalendar, role: ["owner"], enabled: true, countKey: "calendar", section: "operations", ownerOnly: true },
  { name: "Collaboration", path: "/collaboration", icon: Users, role: ["owner"], enabled: true, countKey: "collaboration", section: "operations", ownerOnly: true },
  { name: "Automation", path: "/automation", icon: Zap, role: ["owner"], enabled: true, countKey: "automation", section: "operations", ownerOnly: true },
  { name: "Stripe", path: "/owner/stripe", icon: CreditCard, role: ["owner"], enabled: false, comingSoon: "Q1 2025", section: "platform", ownerOnly: true },
  { name: "AI Agents", path: "/ai-agents", icon: Activity, role: ["owner"], enabled: true, section: "platform", ownerOnly: true },
  { name: "AI Sales Agents", path: "/owner/ai-sales", icon: Bot, role: ["owner"], enabled: false, comingSoon: "Q1 2025", section: "platform", ownerOnly: true },
  { name: "Cybersecurity", path: "/admin/testing", icon: Shield, role: ["owner"], enabled: true, section: "platform", ownerOnly: true },
  { name: "Software Settings", path: "/owner/settings", icon: Settings, role: ["owner"], enabled: false, comingSoon: "Q1 2025", section: "platform", ownerOnly: true },
  
  // Tenant Owner Features
  { 
    name: "Business", 
    path: "#", 
    icon: LucideHome, 
    role: ["owner"], 
    enabled: true, 
    section: "overview", 
    tenantOwnerOnly: true,
    expandable: true,
    subItems: [
      { name: "Dashboard", path: "/tenant-owner/dashboard", icon: LucideBarChart2, role: ["owner"], enabled: true, tenantOwnerOnly: true },
      { name: "Leads", path: "/tenant-owner/leads", icon: LucideUser, role: ["owner"], enabled: true, countKey: "leads", tenantOwnerOnly: true },
      { name: "Deals", path: "/tenant-owner/deals", icon: LucideBarChart2, role: ["owner"], enabled: true, countKey: "deals", tenantOwnerOnly: true },
      { name: "Inventory", path: "/tenant-owner/inventory", icon: LucideCar, role: ["owner"], enabled: true, countKey: "inventory", tenantOwnerOnly: true },
      { name: "Calendar", path: "/tenant-owner/calendar", icon: LucideCalendar, role: ["owner"], enabled: true, countKey: "calendar", tenantOwnerOnly: true },
      { name: "Collaboration", path: "/tenant-owner/collaboration", icon: Users, role: ["owner"], enabled: true, countKey: "collaboration", tenantOwnerOnly: true },
      { name: "Automation", path: "/tenant-owner/automation", icon: Zap, role: ["owner"], enabled: true, countKey: "automation", tenantOwnerOnly: true }
    ]
  },
  { 
    name: "Management", 
    path: "#", 
    icon: Settings, 
    role: ["owner"], 
    enabled: true, 
    section: "management", 
    tenantOwnerOnly: true,
    expandable: true,
    subItems: [
      { name: "Voice OS™", path: "/tenant-owner/voice-os", icon: Bot, role: ["owner"], enabled: true, tenantOwnerOnly: true },
      { name: "Team Management", path: "/tenant-owner/team", icon: UserCog, role: ["owner"], enabled: true, tenantOwnerOnly: true },
      { name: "Business Settings", path: "/tenant-owner/settings", icon: Settings, role: ["owner"], enabled: true, tenantOwnerOnly: true },
      { name: "Financial Overview", path: "/tenant-owner/finance", icon: DollarSign, role: ["owner"], enabled: true, tenantOwnerOnly: true },
      { name: "Business Analytics", path: "/tenant-owner/analytics", icon: TrendingUp, role: ["owner"], enabled: true, tenantOwnerOnly: true },
      { name: "Billing & Subscriptions", path: "/tenant-owner/billing", icon: CreditCard, role: ["owner"], enabled: true, tenantOwnerOnly: true },
      { name: "Reports & Insights", path: "/tenant-owner/reports", icon: FileText, role: ["owner"], enabled: true, tenantOwnerOnly: true },
      { name: "Organization Profile", path: "/tenant-owner/profile", icon: Building, role: ["owner"], enabled: true, tenantOwnerOnly: true },
      { name: "AI Sales Agents", path: "/tenant-owner/ai-sales", icon: Bot, role: ["owner"], enabled: true, tenantOwnerOnly: true }
    ]
  },
  
  // Tenant Admin Features
  { name: "Admin Dashboard", path: "/admin/dashboard", icon: LucideHome, role: ["admin"], enabled: true, section: "overview", tenantAdminOnly: true },
  { name: "Inventory", path: "/inventory", icon: LucideCar, role: ["admin"], enabled: true, countKey: "inventory", section: "operations", tenantAdminOnly: true },
  { name: "Calendar", path: "/calendar", icon: LucideCalendar, role: ["admin"], enabled: true, countKey: "calendar", section: "operations", tenantAdminOnly: true },
  { name: "Collaboration", path: "/collaboration", icon: Users, role: ["admin"], enabled: true, countKey: "collaboration", section: "operations", tenantAdminOnly: true },
  { name: "Automation", path: "/automation", icon: Zap, role: ["admin"], enabled: true, countKey: "automation", section: "operations", tenantAdminOnly: true },
  { name: "Financial Overview", path: "/tenant-owner/finance", icon: DollarSign, role: ["admin"], enabled: true, section: "management", tenantAdminOnly: true },
  
  // Tenant Sales Manager Features
  { name: "Dashboard", path: "/dashboard", icon: LucideHome, role: ["manager"], enabled: true, countKey: "dashboard", section: "overview", salesManagerOnly: true },
  { 
    name: "Leads", 
    path: "/leads", 
    icon: LucideUser, 
    role: ["manager"], 
    enabled: true, 
    countKey: "leads", 
    section: "sales", 
    salesManagerOnly: true,
    expandable: true,
    subItems: [
      { name: "All Leads", path: "/leads", icon: LucideUser, role: ["manager"], enabled: true, salesManagerOnly: true },
      { name: "Kanban View", path: "/leads/kanban", icon: LucideBarChart2, role: ["manager"], enabled: true, salesManagerOnly: true }
    ]
  },
  { name: "Deals", path: "/deals", icon: LucideBarChart2, role: ["manager"], enabled: true, countKey: "deals", section: "sales", salesManagerOnly: true },
  { name: "Inventory", path: "/inventory", icon: LucideCar, role: ["manager"], enabled: true, countKey: "inventory", section: "operations", salesManagerOnly: true },
  { name: "Calendar", path: "/calendar", icon: LucideCalendar, role: ["manager"], enabled: true, countKey: "calendar", section: "operations", salesManagerOnly: true },
  { name: "Collaboration", path: "/collaboration", icon: Users, role: ["manager"], enabled: true, countKey: "collaboration", section: "operations", salesManagerOnly: true },
  
  // Tenant Sales Rep Features
  { name: "Sales Dashboard", path: "/sales/dashboard", icon: LucideHome, role: ["sales_rep"], enabled: true, section: "overview", salesRepOnly: true },
  { 
    name: "Leads", 
    path: "/leads", 
    icon: LucideUser, 
    role: ["sales_rep"], 
    enabled: true, 
    countKey: "leads", 
    section: "sales", 
    salesRepOnly: true,
    expandable: true,
    subItems: [
      { name: "All Leads", path: "/leads", icon: LucideUser, role: ["sales_rep"], enabled: true, salesRepOnly: true },
      { name: "Kanban View", path: "/leads/kanban", icon: LucideBarChart2, role: ["sales_rep"], enabled: true, salesRepOnly: true }
    ]
  },
  { name: "Deals", path: "/deals", icon: LucideBarChart2, role: ["sales_rep"], enabled: true, countKey: "deals", section: "sales", salesRepOnly: true },
  { name: "Inventory", path: "/inventory", icon: LucideCar, role: ["sales_rep"], enabled: true, countKey: "inventory", section: "operations", salesRepOnly: true },
  { name: "Calendar", path: "/calendar", icon: LucideCalendar, role: ["sales_rep"], enabled: true, countKey: "calendar", section: "operations", salesRepOnly: true },
  { name: "Collaboration", path: "/collaboration", icon: Users, role: ["sales_rep"], enabled: true, countKey: "collaboration", section: "operations", salesRepOnly: true }
]

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth(); // Get user from AuthContext
  const { isCompleted: onboardingCompleted } = useOnboardingStatus(); // Track onboarding status
  const items = DEFAULT_ITEMS;
  const [order, setOrder] = useState(items.map((_, i) => i));
  const [counts, setCounts] = useState<SidebarCounts>({
    leads: 0,
    deals: 0,
    dashboard: 0,
    inventory: 0,
    calendar: 0,
    automation: 0,
    collaboration: 0,
    performance: 0,
    finance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [dropdownOpen, setDropdownOpen] = useState<Set<string>>(new Set());

  // Determine user type and role
  // Check if user has tenant/organization context (indicates tenant owner vs software owner)
  const hasOrganizationContext = (user?.tenantId && user.tenantId.trim() !== '') || 
                                 (user?.organizationId && user.organizationId.trim() !== '');
  
  // Alternative detection for tenant owners: check if on tenant-owner path or known tenant owner email
  const isOnTenantOwnerPath = pathname.startsWith('/tenant-owner');
  const isKnownTenantOwner = user?.email === 'burchsl4@gmail.com';
  const isTenantOwnerByPath = isOnTenantOwnerPath || isKnownTenantOwner;
  
  // Role-based access determination - handle multiple role formats
  const isOwnerRole = user?.role === 'owner' || user?.role === 'tenant-owner';
  
  // Special case: if user has 'user' role but is on tenant-owner path AND has organizationId, treat as tenant owner
  const isUserOnTenantPath = user?.role === 'user' && isOnTenantOwnerPath && hasOrganizationContext;
  
  const isSoftwareOwner = isOwnerRole && !hasOrganizationContext && !isTenantOwnerByPath; // Platform owner
  const isTenantOwner = isOwnerRole || isUserOnTenantPath || (hasOrganizationContext && isTenantOwnerByPath); // Dealership owner
  const isTenantAdmin = user?.role === 'admin' && hasOrganizationContext; // Dealership admin
  const isSalesManager = user?.role === 'manager' && hasOrganizationContext; // Sales Manager
  const isSalesRep = user?.role === 'sales_rep' && hasOrganizationContext; // Sales Rep

  // Debug logging for role detection
  console.log('🔍 [Sidebar] Role detection:', {
    userRole: user?.role,
    tenantId: user?.tenantId,
    hasOrganizationContext,
    isOnTenantOwnerPath,
    isKnownTenantOwner,
    isTenantOwnerByPath,
    isSoftwareOwner,
    isTenantOwner,
    pathname
  });

  // Determine if sidebar should be blurred during onboarding
  const shouldBlurSidebar = isTenantOwner && !onboardingCompleted;

  // Toggle expandable items
  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemName)) {
        newSet.delete(itemName);
      } else {
        newSet.add(itemName);
      }
      return newSet;
    });
  };

  // Toggle dropdown items
  const toggleDropdown = (itemName: string) => {
    setDropdownOpen(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemName)) {
        newSet.delete(itemName);
      } else {
        newSet.add(itemName);
      }
      return newSet;
    });
  };

  // Fetch live counts from API
  useEffect(() => {
    async function fetchCounts() {
      try {
        const response = await fetch('/api/sidebar/counts');
        const result = await response.json();
        
        if (result.success) {
          setCounts(result.data);
        } else {
          console.error('Failed to fetch sidebar counts:', result.error);
        }
      } catch (error) {
        console.error('Error fetching sidebar counts:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCounts();

    // Refresh counts every 30 seconds for live updates
    const interval = setInterval(fetchCounts, 30000);
    
    // Listen for real-time count updates from other parts of the app
    const handleCountUpdate = (event: CustomEvent) => {
      setCounts(event.detail);
    };
    
    window.addEventListener('sidebarCountsUpdated', handleCountUpdate as EventListener);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('sidebarCountsUpdated', handleCountUpdate as EventListener);
    };
  }, []);

  // Filter items based on role and context
  const filtered = order.map((i) => items[i]).filter((item) => {
    // Software Owner filtering
    if (isSoftwareOwner) {
      return item.ownerOnly && !item.tenantOwnerOnly && !item.tenantAdminOnly && !item.salesManagerOnly && !item.salesRepOnly;
    }
    
    // Tenant Owner filtering
    if (isTenantOwner) {
      return item.tenantOwnerOnly;
    }
    
    // Tenant Admin filtering
    if (isTenantAdmin) {
      return item.tenantAdminOnly;
    }
    
    // Sales Manager filtering
    if (isSalesManager) {
      return item.salesManagerOnly;
    }
    
    // Sales Rep filtering
    if (isSalesRep) {
      return item.salesRepOnly;
    }
    
    // Default: no items shown for unknown roles
    return false;
  });
  
  // Group items by section for better visual hierarchy
  const groupedItems = filtered.reduce((acc, item) => {
    const section = item.section || 'general';
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {} as Record<string, typeof filtered>);

  const sectionOrder = ['overview', 'sales', 'operations', 'management', 'platform', 'analytics', 'security', 'general'];
  const sectionLabels = {
    overview: 'Overview',
    sales: 'Sales',
    operations: 'Operations', 
    management: 'Management',
    platform: 'Platform',
    analytics: 'Analytics',
    security: 'Security',
    general: 'General'
  };

  return (
    <div className={`sidebar themed-bg-secondary themed-border ${
      shouldBlurSidebar ? 'blur-sm pointer-events-none relative' : ''
    }`}>
      {shouldBlurSidebar && (
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 text-center max-w-xs mx-4">
            <div className="text-2xl mb-2">🚀</div>
            <p className="text-sm font-medium text-gray-800">Complete your onboarding</p>
            <p className="text-xs text-gray-600 mt-1">Unlock your dealership dashboard</p>
          </div>
        </div>
      )}
      {/* Navigation takes full height */}
      <nav role="navigation" aria-label="Main Navigation">
        <div className="space-y-6">
          {sectionOrder.map(sectionKey => {
            const sectionItems = groupedItems[sectionKey];
            if (!sectionItems || sectionItems.length === 0) return null;
            
            return (
              <div key={sectionKey} className="space-y-1">
                {/* Section Header - only show for sections other than overview */}
                {sectionKey !== 'overview' && (
                  <div className="section-header">
                    <h3>
                      {sectionLabels[sectionKey as keyof typeof sectionLabels]}
                    </h3>
                  </div>
                )}
                
                {/* Section Items */}
                <ul className="space-y-1">
                  {sectionItems.map((item) => {
                    const { name, path, icon: Icon, countKey, comingSoon, expandable, isDropdown, subItems } = item;
                    const active = pathname === path;
                    const count = countKey ? counts[countKey] : 0;
                    const showBadge = count > 0;
                    const isComingSoon = !item.enabled && comingSoon;
                    const isExpanded = expandedItems.has(name);
                    const isDropdownOpen = dropdownOpen.has(name);
                    
                    return (
                      <li key={`${path}-${name}`}>
                        {/* Main Item */}
                        {isComingSoon ? (
                          <div className="nav-item coming-soon">
                            <span className="nav-item-content">
                              <Icon />
                              <span>{name}</span>
                            </span>
                            <span className="coming-soon-badge">
                              {comingSoon}
                            </span>
                          </div>
                        ) : expandable ? (
                          <button
                            onClick={() => toggleExpanded(name)}
                            className={`nav-item${active ? ' active' : ''}`}
                          >
                            <span className="nav-item-content">
                              <Icon />
                              <span>{name}</span>
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              {showBadge && !loading && (
                                <span className="nav-badge">
                                  {count > 99 ? '99+' : count}
                                </span>
                              )}
                              {isExpanded ? 
                                <ChevronDown className="nav-chevron expanded" /> : 
                                <ChevronRight className="nav-chevron" />
                              }
                            </span>
                          </button>
                        ) : isDropdown ? (
                          <button
                            onClick={() => toggleDropdown(name)}
                            className="nav-item"
                          >
                            <span className="nav-item-content">
                              <Icon />
                              <span>{name}</span>
                            </span>
                            {isDropdownOpen ? 
                              <ChevronDown className="nav-chevron dropdown-open" /> : 
                              <ChevronRight className="nav-chevron" />
                            }
                          </button>
                        ) : (
                          <Link
                            href={path}
                            className={`nav-item${active ? ' active' : ''}`}
                          >
                            <span className="nav-item-content">
                              <Icon />
                              <span>{name}</span>
                              {loading && countKey && (
                                <span className="loading-dot"></span>
                              )}
                            </span>
                            {showBadge && !loading && (
                              <span className="nav-badge">
                                {count > 99 ? '99+' : count}
                              </span>
                            )}
                          </Link>
                        )}
                        
                        {/* Sub Items for Expandable */}
                        {expandable && isExpanded && subItems && (
                          <ul className="sub-nav">
                            {subItems.map((subItem) => {
                              const subActive = pathname === subItem.path;
                              const subCount = subItem.countKey ? counts[subItem.countKey] : 0;
                              const subShowBadge = subCount > 0;
                              
                              return (
                                <li key={subItem.path}>
                                  <Link
                                    href={subItem.path}
                                    className={`nav-item${subActive ? ' active' : ''}`}
                                  >
                                    <span className="nav-item-content">
                                      <subItem.icon />
                                      <span>{subItem.name}</span>
                                    </span>
                                    {subShowBadge && !loading && (
                                      <span className="nav-badge">
                                        {subCount > 99 ? '99+' : subCount}
                                      </span>
                                    )}
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                        
                        {/* Sub Items for Dropdown */}
                        {isDropdown && isDropdownOpen && subItems && (
                          <ul className="sub-nav">
                            {subItems.map((subItem) => {
                              const subActive = pathname === subItem.path;
                              const subIsComingSoon = !subItem.enabled && subItem.comingSoon;
                              
                              return (
                                <li key={subItem.path}>
                                  {subIsComingSoon ? (
                                    <div className="nav-item coming-soon">
                                      <span className="nav-item-content">
                                        <subItem.icon />
                                        <span>{subItem.name}</span>
                                      </span>
                                      <span className="coming-soon-badge">
                                        {subItem.comingSoon}
                                      </span>
                                    </div>
                                  ) : (
                                    <Link
                                      href={subItem.path}
                                      className={`nav-item${subActive ? ' active' : ''}`}
                                    >
                                      <span className="nav-item-content">
                                        <subItem.icon />
                                        <span>{subItem.name}</span>
                                      </span>
                                    </Link>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </nav>
      {/* QuickAddButton now floats globally - use the floating Quick Add button on the left side */}
    </div>
  );
}