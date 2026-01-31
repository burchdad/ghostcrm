"use client";
import React, { useMemo, useRef, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useRibbon } from "../providers/RibbonProvider";
import { useContextualRibbon, prioritizeNotifications, getContextualShortcuts } from "../providers/ContextualRibbon";
import { Menu, X, ChevronDown, ChevronRight, ChevronUp } from "lucide-react";
import {
  CONTROLS,
  CONTROLS_AUTOMATION,
  CONTROLS_COLLABORATION,
  CONTROLS_DATA,
  CONTROLS_DEVELOPER,
  CONTROLS_EDIT,
  CONTROLS_FILE,
  CONTROLS_REPORTS,
  CONTROLS_SETTINGS
} from "../registries/registry";
import { getAIControls } from "../registries/registry_ai";
import type { RibbonControl } from "./types";

function useOutsideClick(ref: React.RefObject<HTMLElement>, onClose: () => void) {
  React.useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onClose]);
}

// Function to get contextual tab name based on current route
function getContextualTabName(pathname: string): string {
  if (pathname === "/" || pathname.includes("/login") || pathname.includes("/register") || pathname.includes("/tenant-owner/setup")) {
    return "Home";
  }
  if (pathname.includes("/dashboard")) {
    return "Dashboard";
  }
  if (pathname.includes("/leads")) {
    return "Leads";
  }
  if (pathname.includes("/deals")) {
    return "Deals";
  }
  if (pathname.includes("/inventory")) {
    return "Inventory";
  }
  if (pathname.includes("/appointments") || pathname.includes("/calendar")) {
    return "Calendar";
  }
  if (pathname.includes("/performance")) {
    return "Performance";
  }
  if (pathname.includes("/bi")) {
    return "Business Intelligence";
  }
  if (pathname.includes("/reports")) {
    return "Reports";
  }
  if (pathname.includes("/settings")) {
    return "Settings";
  }
  if (pathname.includes("/finance")) {
    return "Finance";
  }
  return "Home";
}

// Function to get contextual controls based on the current page
function getContextualControls(contextualTab: string, router?: any): any[] {
  switch (contextualTab) {
    case "Dashboard":
      return [
        // Widget Management
        { id: "dashboard-add-widget" as any, group: "Dashboard", label: "Add Widget", icon: "➕", 
          submenu: [
            { label: "Sales Metrics", onClick: () => console.log("Add Sales Metrics Widget") },
            { label: "Lead Funnel", onClick: () => console.log("Add Lead Funnel Widget") },
            { label: "Revenue Chart", onClick: () => console.log("Add Revenue Chart Widget") },
            { label: "Team Performance", onClick: () => console.log("Add Team Performance Widget") },
            { label: "Custom Widget", onClick: () => console.log("Add Custom Widget") }
          ]
        },
        { id: "dashboard-layout" as any, group: "Dashboard", label: "Layout", icon: "📐", 
          submenu: [
            { label: "Grid View", onClick: () => console.log("Switch to Grid View") },
            { label: "List View", onClick: () => console.log("Switch to List View") },
            { label: "Compact View", onClick: () => console.log("Switch to Compact View") },
            { label: "Customize Layout", onClick: () => console.log("Customize Layout") }
          ]
        },
        
        // Real-time Features  
        { id: "dashboard-refresh" as any, group: "Dashboard", label: "Refresh", icon: "🔄", onClick: () => console.log("Refresh Dashboard") },
        { id: "dashboard-live-updates" as any, group: "Dashboard", label: "Live Updates", icon: "📡", 
          submenu: [
            { label: "Live Activity Feed", onClick: () => console.log("Add Live Activity Feed") },
            { label: "Real-time Notifications", onClick: () => console.log("Add Real-time Notifications") },
            { label: "Live Chat Widget", onClick: () => console.log("Add Live Chat Widget") },
            { label: "System Status", onClick: () => console.log("Add System Status Widget") }
          ]
        },
      ];
    case "Leads":
      return [
        // Quick Actions
        { id: "leads-add" as any, group: "Leads", label: "New Lead", icon: "➕", onClick: () => {
          window.location.href = "/leads/create";
        }},
        { id: "leads-import" as any, group: "Leads", label: "Import", icon: "📥", onClick: () => console.log("Import Leads") },
        { id: "leads-export" as any, group: "Leads", label: "Export", icon: "📤", onClick: () => console.log("Export Leads") },
        
        // Communication Actions
        { id: "leads-bulk-email" as any, group: "Leads", label: "Bulk Email", icon: "✉️", onClick: () => console.log("Bulk Email") },
        { id: "leads-bulk-sms" as any, group: "Leads", label: "Bulk SMS", icon: "💬", onClick: () => console.log("Bulk SMS") },
        
        // Management Actions
        { id: "leads-assign" as any, group: "Leads", label: "Assign", icon: "👤", onClick: () => console.log("Assign Leads") },
        { id: "leads-filter" as any, group: "Leads", label: "Filter", icon: "🔍", onClick: () => console.log("Filter Leads") },
        { id: "leads-refresh" as any, group: "Leads", label: "Refresh", icon: "🔄", onClick: () => window.location.reload() },
      ];
    case "Performance":
      return [
        { id: "performance-metrics" as any, group: "Performance", label: "Metrics", icon: "📊", onClick: () => console.log("Performance Metrics") },
        { id: "performance-goals" as any, group: "Performance", label: "Goals", icon: "🎯", onClick: () => console.log("Performance Goals") },
        { id: "performance-reports" as any, group: "Performance", label: "Reports", icon: "📈", onClick: () => console.log("Performance Reports") },
        { id: "performance-export" as any, group: "Performance", label: "Export", icon: "📤", onClick: () => console.log("Export Performance") }
      ];
    case "Finance":
      return [
        { id: "finance-invoices" as any, group: "Finance", label: "Invoices", icon: "💰", onClick: () => console.log("Finance Invoices") },
        { id: "finance-payments" as any, group: "Finance", label: "Payments", icon: "💳", onClick: () => console.log("Finance Payments") },
        { id: "finance-reports" as any, group: "Finance", label: "Reports", icon: "📊", onClick: () => console.log("Finance Reports") },
        { id: "finance-reconcile" as any, group: "Finance", label: "Reconcile", icon: "✅", onClick: () => console.log("Finance Reconcile") }
      ];
    default: // Home
      return [
        { id: "home-welcome" as any, group: "Home", label: "Welcome", icon: "🏠", onClick: () => router?.push('/tenant-owner/dashboard') },
        { id: "home-tour" as any, group: "Home", label: "Tour", icon: "🎯", onClick: () => console.log("Take Tour") },
        { id: "home-help" as any, group: "Home", label: "Help", icon: "❓", onClick: () => console.log("Help") },
        { id: "home-support" as any, group: "Home", label: "Support", icon: "🆘", onClick: () => console.log("Support") }
      ];
  }
}

function MobileRibbonGroup({ 
  title, 
  items, 
  isExpanded,
  onToggleExpansion,
  user
}: { 
  title: string; 
  items: { ctrl: any; disabled: boolean }[]; 
  isExpanded: boolean;
  onToggleExpansion: () => void;
  user?: any;
}) {
  const hasVisible = items.some(({ ctrl, disabled }) => !disabled);
  
  if (!hasVisible) return null;

  return (
    <div className="w-full border-b border-gray-100 last:border-b-0">
      <button
        type="button"
        onClick={onToggleExpansion}
        className="w-full flex items-center justify-between px-4 py-4 text-left transition-colors hover:bg-gray-50 touch-manipulation"
      >
        <span className="text-base font-semibold text-gray-800">{title}</span>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 gap-3">
            {items.filter(({ ctrl, disabled }) => !disabled).map(({ ctrl }) => (
              <button
                key={ctrl.id}
                type="button"
                onClick={() => ctrl.onClick?.(user)}
                className="flex flex-col items-center p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all touch-manipulation group"
              >
                <span className="text-xl mb-2 group-hover:scale-110 transition-transform">{ctrl.icon}</span>
                <span className="text-sm font-medium text-gray-700 text-center leading-tight group-hover:text-blue-700">
                  {ctrl.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DesktopRibbonGroup({ title, items, isTablet = false, user }: { title: string; items: { ctrl: any; disabled: boolean }[]; isTablet?: boolean; user?: any }) {
  const [open, setOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const hasVisible = items.some(({ ctrl, disabled }) => !disabled);
  
  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpen(false);
      setHoveredItem(null);
    }, 150);
  };

  if (!hasVisible) return null;

  return (
    <div
      ref={ref}
      className="relative group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        className={`${isTablet ? 'px-3 h-10 text-sm' : 'px-4 h-9 text-xs'} font-medium transition-all duration-200 outline-none rounded-md ${
          open 
            ? "bg-blue-500 text-white shadow-md" 
            : "text-gray-700 hover:bg-blue-100 hover:text-blue-700"
        } touch-manipulation`}
      >
        {title}
      </button>
      {open && (
        <div 
          className={`absolute z-50 mt-2 left-0 ${isTablet ? 'w-72' : 'w-64'} bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg shadow-xl backdrop-blur-sm`}
          onMouseEnter={() => {
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }
          }}
          onMouseLeave={handleMouseLeave}
        >
          <ul className="py-2">
            {items.filter(({ ctrl, disabled }) => !disabled).map(({ ctrl }) => (
              <li 
                key={ctrl.id} 
                className="relative mx-2"
                onMouseEnter={() => setHoveredItem(ctrl.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <button
                  type="button"
                  onClick={() => ctrl.onClick?.(user)}
                  className={`w-full text-left px-3 ${isTablet ? 'py-3' : 'py-2.5'} text-sm rounded-md transition-all duration-150 flex items-center gap-3 ${
                    hoveredItem === ctrl.id 
                      ? 'bg-blue-500 text-white shadow-md transform scale-[1.02]' 
                      : 'text-gray-700 hover:bg-blue-100 hover:text-blue-700'
                  } touch-manipulation`}
                >
                  <span className={isTablet ? 'text-lg' : 'text-base'}>{ctrl.icon}</span>
                  <span className="font-medium">{ctrl.label}</span>
                  {ctrl.submenu && (
                    <span className={`ml-auto transition-colors ${
                      hoveredItem === ctrl.id ? 'text-blue-200' : 'text-gray-400'
                    }`}>▶</span>
                  )}
                </button>
                
                {/* Submenu */}
                {ctrl.submenu && hoveredItem === ctrl.id && (
                  <div 
                    className="absolute left-full top-0 ml-1 w-60 bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg shadow-xl backdrop-blur-sm z-60"
                    onMouseEnter={() => {
                      if (timeoutRef.current) {
                        clearTimeout(timeoutRef.current);
                        timeoutRef.current = null;
                      }
                    }}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <ul className="py-2">
                      {ctrl.submenu.map((item: any, idx: number) => (
                        <li key={idx} className="mx-2">
                          <button
                            type="button"
                            onClick={() => item.onClick?.(user)}
                            className="w-full text-left px-3 py-2 text-sm rounded-md transition-all duration-150 text-gray-700 hover:bg-blue-500 hover:text-white hover:shadow-md hover:transform hover:scale-[1.02] font-medium touch-manipulation"
                          >
                            {item.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function Ribbon() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const contextualTab = getContextualTabName(pathname);
  const contextualControls = getContextualControls(contextualTab, router);
  
  // Smart contextual ribbon system
  const contextualConfig = useContextualRibbon();

  // Mobile responsive state
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Smart recommendations state
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [contextualHelp, setContextualHelp] = useState(false);

  // Detect screen size changes
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuOpen && !(event.target as Element).closest('.mobile-ribbon')) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [mobileMenuOpen]);

  // Toggle group expansion on mobile
  const toggleGroupExpansion = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  // Combine contextual controls with other static controls
  const allControls: any[] = [
    ...contextualControls,
    ...CONTROLS_FILE,
    ...getAIControls(),
    ...CONTROLS_AUTOMATION,
    ...CONTROLS_COLLABORATION,
    ...CONTROLS_DATA,
    ...CONTROLS_DEVELOPER,
    ...CONTROLS_EDIT,
    ...CONTROLS_REPORTS,
    ...CONTROLS_SETTINGS
  ];

  // Smart filtering based on contextual configuration
  const groups = useMemo(() => {
    const map = new Map<string, { ctrl: any; enabled: boolean; disabled: boolean }[]>();
    
    // Filter controls based on adaptive layout settings
    const filteredControls = allControls.filter(c => {
      // Hide groups that are not relevant for current context
      if (contextualConfig.adaptiveLayout.hiddenGroups.includes(c.group)) {
        return false;
      }
      return true;
    });
    
    filteredControls.forEach(c => {
      const arr = map.get(c.group) || [];
      arr.push({ ctrl: c, enabled: true, disabled: false });
      map.set(c.group, arr);
    });
    
    // Sort groups by priority (priority groups first)
    const sortedEntries = Array.from(map.entries()).sort(([titleA], [titleB]) => {
      const priorityA = contextualConfig.adaptiveLayout.priorityGroups.indexOf(titleA);
      const priorityB = contextualConfig.adaptiveLayout.priorityGroups.indexOf(titleB);
      
      // Priority groups come first
      if (priorityA !== -1 && priorityB === -1) return -1;
      if (priorityA === -1 && priorityB !== -1) return 1;
      if (priorityA !== -1 && priorityB !== -1) return priorityA - priorityB;
      
      // Alphabetical for non-priority groups
      return titleA.localeCompare(titleB);
    });
    
    return sortedEntries;
  }, [contextualTab, pathname, contextualConfig]);

  // Smart notifications with contextual prioritization
  const [notifications, setNotifications] = useState<string[]>(["Welcome to GhostCRM!"]);
  const [unreadNotifications, setUnreadNotifications] = useState<string[]>(["Welcome to GhostCRM!"]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useOutsideClick(dropdownRef, () => showDropdown && setShowDropdown(false));

  const markAsRead = (notification: string) => {
    setUnreadNotifications(prev => prev.filter(n => n !== notification));
  };

  // Use smart notification prioritization
  const prioritizedNotifications = useMemo(() => {
    const pageContext = pathname.includes('/leads') ? 'leads' : 
                       pathname.includes('/deals') ? 'deals' :
                       pathname.includes('/calendar') ? 'calendar' :
                       pathname.includes('/reports') ? 'reports' : 'general';
    
    return prioritizeNotifications(
      unreadNotifications.map(n => ({ type: 'general', message: n })),
      pageContext
    );
  }, [unreadNotifications, pathname]);

  const groupedNotifications = {
    "High Priority": prioritizedNotifications.slice(0, 2).map(n => n.message),
    "System": unreadNotifications.filter(n => n.includes("Welcome") || n.includes("System")),
    "Activity": unreadNotifications.filter(n => n.includes("Activity") || n.includes("Update")),
    "Alerts": unreadNotifications.filter(n => n.includes("Alert") || n.includes("Warning"))
  };

  return (
    <>
      {/* Mobile Layout - Clean hamburger menu approach */}
      {isMobile ? (
        <div className="mobile-ribbon bg-white border-b border-gray-200">
          {/* Mobile Header - Clean and minimal */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
                aria-label="Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                {contextualTab}
              </h1>
            </div>
            
            {/* Mobile Notifications - Simplified */}
            <div ref={dropdownRef} className="relative">
              <button
                type="button"
                className="relative p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
                aria-label="Notifications"
                onClick={() => setShowDropdown((s) => !s)}
              >
                <span className="text-xl">🔔</span>
                {unreadNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {unreadNotifications.length > 9 ? '9+' : unreadNotifications.length}
                  </span>
                )}
              </button>
              
              {/* Mobile Notifications Dropdown - Full width on small screens */}
              {showDropdown && (
                <div className="absolute top-full right-0 mt-2 w-80 max-w-[calc(100vw-1rem)] bg-white border border-gray-200 rounded-xl shadow-xl z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    <button 
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium touch-manipulation" 
                      onClick={() => setUnreadNotifications([])}
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {Object.entries(groupedNotifications).map(([type, notes]) => (
                      notes.length > 0 && (
                        <div key={type} className="p-4 border-b border-gray-50 last:border-b-0">
                          <h4 className="font-medium text-sm text-gray-700 mb-2">{type}</h4>
                          <div className="space-y-2">
                            {notes.map((n, idx) => (
                              <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-800">{n}</p>
                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-xs text-gray-500">
                                    {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                  </span>
                                  <button 
                                    className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-md font-medium touch-manipulation" 
                                    onClick={() => markAsRead(n)}
                                  >
                                    Mark as read
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    ))}
                    {unreadNotifications.length === 0 && (
                      <div className="text-center text-gray-500 py-8">
                        <span className="text-2xl mb-2 block">📫</span>
                        <p className="text-sm">No new notifications</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Mobile Hamburger Menu - Slide down panel */}
          {mobileMenuOpen && (
            <div className="bg-white border-t border-gray-200 shadow-lg">
              <div className="max-h-[calc(100vh-8rem)] overflow-y-auto">
                {/* Smart Quick Actions for mobile - Context-aware */}
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700">Quick Actions</h3>
                    {contextualConfig.smartRecommendations.length > 0 && (
                      <button
                        onClick={() => setShowRecommendations(!showRecommendations)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium touch-manipulation"
                      >
                        💡 {contextualConfig.smartRecommendations.length} Tips
                      </button>
                    )}
                  </div>
                  
                  {/* Priority actions based on context */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {contextualConfig.priorityActions.slice(0, 3).map((action) => (
                      <button 
                        key={action.id}
                        className="flex flex-col items-center p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all touch-manipulation"
                        onClick={() => console.log(`Priority action: ${action.id}`)}
                      >
                        <span className="text-xl mb-1">{action.icon}</span>
                        <span className="text-xs font-medium text-gray-700">{action.label}</span>
                      </button>
                    ))}
                  </div>
                  
                  {/* Smart recommendations panel */}
                  {showRecommendations && contextualConfig.smartRecommendations.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <h4 className="text-xs font-semibold text-blue-800 mb-2">Smart Recommendations</h4>
                      <div className="space-y-2">
                        {contextualConfig.smartRecommendations.slice(0, 2).map((rec, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <span className="text-sm text-blue-600 mt-0.5">
                              {rec.type === 'productivity' ? '⚡' : rec.type === 'opportunity' ? '🎯' : '�'}
                            </span>
                            <div className="flex-1">
                              <p className="text-xs text-blue-800">{rec.message}</p>
                              {rec.action && (
                                <button 
                                  className="text-xs text-blue-600 hover:text-blue-800 font-medium mt-1"
                                  onClick={() => console.log(`Recommendation action: ${rec.action}`)}
                                >
                                  Take Action →
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Collapsible ribbon groups */}
                {groups.map(([title, items]) => (
                  <MobileRibbonGroup 
                    key={title} 
                    title={title} 
                    items={items}
                    isExpanded={expandedGroups.has(title)}
                    onToggleExpansion={() => toggleGroupExpansion(title)}
                    user={user}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Desktop/Tablet Layout */
        <div className={`w-full flex items-center gap-3 bg-white border-b border-slate-200 px-4 py-2 ${
          isTablet ? 'overflow-x-auto' : ''
        }`}>
          {/* Ribbon groups */}
          <div className={`flex items-center gap-3 ${isTablet ? 'flex-nowrap' : ''}`}>
            {groups.map(([title, items]) => (
              <DesktopRibbonGroup 
                key={title} 
                title={title} 
                items={items}
                isTablet={isTablet}
                user={user}
              />
            ))}
          </div>
          
          {/* Spacer to push icons to the right */}
          <div className="flex-1" />
          
          {/* Smart Contextual Help Button */}
          {contextualConfig.contextualHelp && (
            <div className="relative">
              <button
                onClick={() => setContextualHelp(!contextualHelp)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                title={`${contextualConfig.contextualHelp.title} - Click for tips`}
              >
                <span className="text-lg">💡</span>
                <span className="hidden md:inline font-medium">Tips</span>
              </button>
              
              {/* Contextual Help Dropdown */}
              {contextualHelp && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <span className="text-lg">💡</span>
                      {contextualConfig.contextualHelp.title}
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-3">
                      {contextualConfig.contextualHelp.tips.map((tip, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <span className="text-blue-500 mt-1">•</span>
                          <p className="text-sm text-gray-700">{tip}</p>
                        </div>
                      ))}
                    </div>
                    
                    {/* Keyboard shortcuts for context */}
                    {getContextualShortcuts(contextualConfig.activeTab.toLowerCase()).length > 0 && (
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <h4 className="text-xs font-semibold text-gray-600 mb-2">Keyboard Shortcuts</h4>
                        <div className="space-y-1">
                          {getContextualShortcuts(contextualConfig.activeTab.toLowerCase()).slice(0, 3).map((shortcut, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                              <span className="text-xs text-gray-600">{shortcut.description}</span>
                              <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 rounded border">
                                {shortcut.key}
                              </kbd>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Desktop Notifications */}
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              className="relative"
              aria-label="Notifications"
              onClick={() => setShowDropdown((s) => !s)}
            >
              <span className="w-4 h-6 flex items-center justify-center rounded-full bg-gray-100 text-blue-600 text-xl">🔔</span>
              {unreadNotifications.length > 0 && (
                <span className="absolute -top-1 -right-1 px-4 py-0.5 bg-red-500 text-white text-[10px] rounded-full">
                  {unreadNotifications.length}
                </span>
              )}
            </button>
            
            {/* Desktop Notifications Dropdown */}
            {showDropdown && (
              <div className="absolute top-full right-0 mt-2 bg-white border rounded-xl shadow-2xl z-50 w-80">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                  <div className="flex items-center gap-2">
                    <span className="text-xl text-blue-600">🔔</span>
                    <span className="font-bold text-base">Notifications</span>
                  </div>
                  <button 
                    className="text-xs text-red-500 hover:underline" 
                    onClick={() => setUnreadNotifications([])}
                  >
                    Clear All
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto p-3">
                  {Object.entries(groupedNotifications).map(([type, notes]) => (
                    <div key={type} className="mb-4">
                      <div className="font-bold text-xs text-blue-700 mb-2">{type}</div>
                      <ul className="space-y-2">
                        {notes.map((n, idx) => (
                          <li key={idx} className="bg-white rounded-lg shadow-sm px-4 py-3 flex justify-between items-center border border-gray-100">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{n}</span>
                              <span className="text-xs text-gray-400 mt-1">
                                {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                className="text-xs px-2 py-1 rounded bg-green-100 text-green-700" 
                                onClick={() => markAsRead(n)}
                              >
                                Mark as read
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  {unreadNotifications.length === 0 && (
                    <div className="text-center text-gray-400 py-8">No notifications</div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Profile button */}
          <div className="flex items-center">
            <button 
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                U
              </span>
              <span className="hidden sm:inline">Profile</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}