"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideHome, LucideUser, LucideBarChart2, LucideCar, LucideCalendar, Zap, Users, Shield, Activity } from "lucide-react";

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
}

const DEFAULT_ITEMS: SidebarItem[] = [
  { name: "Dashboard", path: "/dashboard", icon: LucideHome, role: ["admin","sales"], enabled: true, countKey: "dashboard", section: "overview" },
  { name: "Leads", path: "/leads", icon: LucideUser, role: ["sales"], enabled: true, countKey: "leads", section: "sales" },
  { name: "Deals", path: "/deals", icon: LucideBarChart2, role: ["sales"], enabled: true, countKey: "deals", section: "sales" },
  { name: "Inventory", path: "/inventory", icon: LucideCar, role: ["admin", "sales"], enabled: true, countKey: "inventory", section: "operations" },
  { name: "Calendar", path: "/calendar", icon: LucideCalendar, role: ["admin", "sales"], enabled: true, countKey: "calendar", section: "operations" },
  { name: "Collaboration", path: "/collaboration", icon: Users, role: ["admin", "sales"], enabled: true, countKey: "collaboration", section: "team" },
  { name: "Automation", path: "/automation", icon: Zap, role: ["admin", "sales"], enabled: true, countKey: "automation", section: "team" },
  { name: "Performance", path: "/performance", icon: LucideBarChart2, role: ["admin"], enabled: false, comingSoon: "Jan 2026", countKey: "performance", section: "analytics" },
  { name: "Finance", path: "/finance", icon: LucideBarChart2, role: ["admin"], enabled: false, comingSoon: "Dec 2025", countKey: "finance", section: "analytics" },
  { name: "AI Agents", path: "/ai-agents", icon: Activity, role: ["owner"], enabled: true, section: "system", ownerOnly: true },
  { name: "Cybersecurity", path: "/admin/testing", icon: Shield, role: ["owner"], enabled: true, section: "security", ownerOnly: true }
]

export default function Sidebar() {
  const pathname = usePathname();
  const items = DEFAULT_ITEMS;
  const [order, setOrder] = useState(items.map((_, i) => i));
  const [isOwner, setIsOwner] = useState(false);
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

  // Fetch user data for owner verification
  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch('/api/admin/auth/verify', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const userData = await response.json();
          setIsOwner(userData.isOwner || false);
        } else {
          // If API call fails (non-admin user), they're definitely not the owner
          setIsOwner(false);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        setIsOwner(false);
      }
    }

    fetchUserData();
  }, []);

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

  // Filter items based on enabled status and owner access
  const filtered = order.map((i) => items[i]).filter((item) => {
    if (!item.enabled) return false;
    if (item.ownerOnly && !isOwner) return false;
    return true;
  });
  
  // Group items by section for better visual hierarchy
  const groupedItems = filtered.reduce((acc, item) => {
    const section = item.section || 'general';
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {} as Record<string, typeof filtered>);

  const sectionOrder = ['overview', 'sales', 'operations', 'team', 'analytics', 'security', 'general'];
  const sectionLabels = {
    overview: 'Overview',
    sales: 'Sales',
    operations: 'Operations', 
    team: 'Team',
    analytics: 'Analytics',
    security: 'Security',
    general: 'General'
  };

  return (
    <div className="sidebar themed-bg-secondary flex flex-col h-full relative w-50 themed-border border-r overflow-hidden">
      {/* Navigation takes full height */}
      <nav className="p-3 h-full" role="navigation" aria-label="Main Navigation">
        <div className="space-y-6 h-full">
          {sectionOrder.map(sectionKey => {
            const sectionItems = groupedItems[sectionKey];
            if (!sectionItems || sectionItems.length === 0) return null;
            
            return (
              <div key={sectionKey} className="space-y-1">
                {/* Section Header - only show for sections other than overview */}
                {sectionKey !== 'overview' && (
                  <div className="px-3 py-1">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {sectionLabels[sectionKey as keyof typeof sectionLabels]}
                    </h3>
                  </div>
                )}
                
                {/* Section Items */}
                <ul className="space-y-1 list-none">
                  {sectionItems.map((item) => {
                    const { name, path, icon: Icon, countKey } = item;
                    const active = pathname === path;
                    const count = countKey ? counts[countKey] : 0;
                    const showBadge = count > 0;
                    return (
                      <li key={path} className="list-none">
                        <Link
                          href={path}
                          className={[
                            "relative flex items-center rounded-lg px-3 py-3 transition nav-text justify-between gap-3 group",
                            active 
                              ? "bg-blue-600 text-white ring-2 ring-blue-200" 
                              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                          ].join(" ")}
                        >
                          <span className="flex items-center gap-3 min-w-0 flex-1">
                            <Icon className={[
                              "h-5 w-5 flex-shrink-0 transition-colors",
                              active ? "text-white" : "text-gray-500 group-hover:text-gray-700"
                            ].join(" ")} />
                            <span className="font-medium truncate">{name}</span>
                            {loading && countKey && (
                              <span className="h-2 w-2 bg-gray-300 rounded-full animate-pulse flex-shrink-0"></span>
                            )}
                          </span>
                          {showBadge && !loading && (
                            <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full flex-shrink-0 font-semibold shadow-sm">
                              {count > 99 ? '99+' : count}
                            </span>
                          )}
                        </Link>
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