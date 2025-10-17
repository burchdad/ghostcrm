"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideHome, LucideUser, LucideBarChart2, LucideCar, LucideCalendar, Zap } from "lucide-react";
import SidebarAIAssistant from "./SidebarAIAssistant";

// MVP Feature Configuration
const ENABLED_FEATURES = new Set([
  '/dashboard',
  '/leads', 
  '/deals',
  '/inventory',
  '/calendar',
  '/automation',
  '/ai'
]);

interface SidebarCounts {
  leads: number;
  deals: number;
  dashboard: number;
  inventory: number;
  calendar: number;
  automation: number;
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
}

const DEFAULT_ITEMS: SidebarItem[] = [
  { name: "Dashboard", path: "/dashboard", icon: LucideHome, role: ["admin","sales"], enabled: true, countKey: "dashboard" },
  { name: "Leads", path: "/leads", icon: LucideUser, role: ["sales"], enabled: true, countKey: "leads" },
  { name: "Deals", path: "/deals", icon: LucideBarChart2, role: ["sales"], enabled: true, countKey: "deals" },
  { name: "Inventory", path: "/inventory", icon: LucideCar, role: ["admin", "sales"], enabled: true, countKey: "inventory" },
  { name: "Calendar", path: "/calendar", icon: LucideCalendar, role: ["admin", "sales"], enabled: true, countKey: "calendar" },
  { name: "Automation", path: "/automation", icon: Zap, role: ["admin", "sales"], enabled: true, countKey: "automation" },
  { name: "Performance", path: "/performance", icon: LucideBarChart2, role: ["admin"], enabled: false, comingSoon: "Jan 2026", countKey: "performance" },
  { name: "Finance", path: "/finance", icon: LucideBarChart2, role: ["admin"], enabled: false, comingSoon: "Dec 2025", countKey: "finance" }
]

export default function Sidebar() {
  const pathname = usePathname();
  const items = DEFAULT_ITEMS;
  const [order, setOrder] = useState(items.map((_, i) => i));
  const [counts, setCounts] = useState<SidebarCounts>({
    leads: 0,
    deals: 0,
    dashboard: 0,
    inventory: 0,
    calendar: 0,
    automation: 0,
    performance: 0,
    finance: 0,
  });
  const [loading, setLoading] = useState(true);

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

  const filtered = order.map((i) => items[i]).filter((item) => item.enabled);

  return (
    <div className="sidebar themed-bg-secondary flex flex-col h-full relative w-64 themed-border border-r overflow-hidden">
      <div className="flex flex-col flex-1 overflow-hidden w-full">
        <nav className="px-1 py-2 flex-1" role="navigation" aria-label="Main Navigation">
          <ul className="space-y-1 h-full">
            {filtered.map((item) => {
              const { name, path, icon: Icon, countKey } = item;
              const active = pathname === path;
              const count = countKey ? counts[countKey] : 0;
              const showBadge = count > 0;
              
              return (
                <li key={path}>
                  <Link
                    href={path}
                    className={["relative flex items-center rounded-md px-3 py-2 transition nav-text justify-between gap-2",
                      active ? "themed-accent-bg text-white ring-1 ring-inset ring-blue-400" : "themed-text-primary hover:bg-gray-100 dark:hover:bg-gray-700",
                    ].join(" ")}
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{name}</span>
                      {loading && countKey && (
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></span>
                      )}
                    </span>
                    {showBadge && !loading && (
                      <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full min-w-[20px] text-center">
                        {count > 99 ? '99+' : count}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="flex flex-1 items-center justify-center px-3 overflow-hidden">
          <div className="w-full">
            <SidebarAIAssistant />
          </div>
        </div>
      </div>
    </div>
  );
}