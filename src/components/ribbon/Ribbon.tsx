"use client";
import React, { useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useRibbon } from "./RibbonProvider";
import {
  CONTROLS,
  CONTROLS_AI,
  CONTROLS_AUTOMATION,
  CONTROLS_DATA,
  CONTROLS_DEVELOPER,
  CONTROLS_EDIT,
  CONTROLS_FILE,
  CONTROLS_REPORTS,
  CONTROLS_SETTINGS
} from "./registry";
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
  if (pathname === "/" || pathname.includes("/login") || pathname.includes("/register") || pathname.includes("/onboarding")) {
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
  if (pathname.includes("/finance")) {
    return "Finance";
  }
  if (pathname.includes("/settings")) {
    return "Settings";
  }
  return "Home"; // Default fallback
}

// Function to get contextual controls based on current route
function getContextualControls(contextualTab: string): any[] {
  switch (contextualTab) {
    case "Dashboard":
      return [
        // View & Layout Management
        { id: "dashboard-overview" as any, group: "Dashboard", label: "Overview", icon: "📊", onClick: () => console.log("Dashboard Overview") },
        { id: "dashboard-refresh" as any, group: "Dashboard", label: "Refresh", icon: "🔄", onClick: () => window.location.reload() },
        { id: "dashboard-fullscreen" as any, group: "Dashboard", label: "Fullscreen", icon: "🖥️", onClick: () => console.log("Toggle Fullscreen") },
        { id: "dashboard-reset" as any, group: "Dashboard", label: "Reset Layout", icon: "↩️", onClick: () => console.log("Reset Dashboard Layout") },
        
        // Widget Management with Submenus
        { id: "widgets-table" as any, group: "Dashboard", label: "Table Widgets", icon: "📋", 
          submenu: [
            { label: "Leads Table", onClick: () => console.log("Add Leads Table Widget") },
            { label: "Deals Pipeline", onClick: () => console.log("Add Deals Pipeline Widget") },
            { label: "Sales Performance", onClick: () => console.log("Add Sales Performance Widget") },
            { label: "Activity Log", onClick: () => console.log("Add Activity Log Widget") },
            { label: "Custom Query", onClick: () => console.log("Add Custom Query Widget") }
          ]
        },
        { id: "widgets-chart" as any, group: "Dashboard", label: "Chart Widgets", icon: "�", 
          submenu: [
            { label: "Revenue Chart", onClick: () => console.log("Add Revenue Chart") },
            { label: "Conversion Funnel", onClick: () => console.log("Add Conversion Funnel") },
            { label: "Performance Metrics", onClick: () => console.log("Add Performance Metrics") },
            { label: "Pipeline Analytics", onClick: () => console.log("Add Pipeline Analytics") },
            { label: "Custom Chart", onClick: () => console.log("Add Custom Chart") }
          ]
        },
        { id: "widgets-kpi" as any, group: "Dashboard", label: "KPI Widgets", icon: "🎯", 
          submenu: [
            { label: "Revenue This Month", onClick: () => console.log("Add Revenue KPI") },
            { label: "Leads Generated", onClick: () => console.log("Add Leads KPI") },
            { label: "Conversion Rate", onClick: () => console.log("Add Conversion KPI") },
            { label: "Team Performance", onClick: () => console.log("Add Team Performance KPI") },
            { label: "Custom KPI", onClick: () => console.log("Add Custom KPI") }
          ]
        },
        { id: "widgets-realtime" as any, group: "Dashboard", label: "Real-time Widgets", icon: "⚡", 
          submenu: [
            { label: "Live Activity Feed", onClick: () => console.log("Add Live Activity Feed") },
            { label: "Real-time Notifications", onClick: () => console.log("Add Real-time Notifications") },
            { label: "Live Chat Widget", onClick: () => console.log("Add Live Chat Widget") },
            { label: "System Status", onClick: () => console.log("Add System Status Widget") }
          ]
        },
        
        // Templates & Marketplace
        { id: "dashboard-templates" as any, group: "Dashboard", label: "Templates", icon: "🎨", 
          submenu: [
            { label: "Browse Marketplace", onClick: () => console.log("Open Template Marketplace") },
            { label: "Sales Dashboard", onClick: () => console.log("Apply Sales Dashboard Template") },
            { label: "Executive Overview", onClick: () => console.log("Apply Executive Template") },
            { label: "Team Performance", onClick: () => console.log("Apply Team Performance Template") },
            { label: "Custom Template", onClick: () => console.log("Create Custom Template") },
            { label: "Import Template", onClick: () => console.log("Import Dashboard Template") }
          ]
        },
        
        // Layout Management
        { id: "dashboard-save-layout" as any, group: "Dashboard", label: "Save Layout", icon: "💾", onClick: () => console.log("Save Dashboard Layout") },
        { id: "dashboard-share-layout" as any, group: "Dashboard", label: "Share Layout", icon: "🔗", 
          submenu: [
            { label: "Share with Team", onClick: () => console.log("Share with Team") },
            { label: "Public Link", onClick: () => console.log("Generate Public Link") },
            { label: "Export Layout", onClick: () => console.log("Export Layout File") },
            { label: "Email Dashboard", onClick: () => console.log("Email Dashboard") }
          ]
        },
        
        // Data & Export Options
        { id: "dashboard-export" as any, group: "Dashboard", label: "Export", icon: "📤", 
          submenu: [
            { label: "Export as PDF", onClick: () => console.log("Export Dashboard as PDF") },
            { label: "Export as Image", onClick: () => console.log("Export Dashboard as Image") },
            { label: "Export Data (Excel)", onClick: () => console.log("Export Dashboard Data") },
            { label: "Schedule Report", onClick: () => console.log("Schedule Dashboard Report") }
          ]
        },
        
        // Advanced Options
        { id: "dashboard-filters" as any, group: "Dashboard", label: "Global Filters", icon: "🔍", onClick: () => console.log("Configure Global Filters") },
        { id: "dashboard-automation" as any, group: "Dashboard", label: "Automation", icon: "🤖", 
          submenu: [
            { label: "Auto-refresh Settings", onClick: () => console.log("Configure Auto-refresh") },
            { label: "Scheduled Updates", onClick: () => console.log("Configure Scheduled Updates") },
            { label: "Alert Triggers", onClick: () => console.log("Configure Alert Triggers") },
            { label: "Data Sync", onClick: () => console.log("Configure Data Sync") }
          ]
        },
        { id: "dashboard-permissions" as any, group: "Dashboard", label: "Permissions", icon: "🔒", 
          submenu: [
            { label: "Manage Access", onClick: () => console.log("Manage Dashboard Access") },
            { label: "User Roles", onClick: () => console.log("Configure User Roles") },
            { label: "Sharing Settings", onClick: () => console.log("Configure Sharing Settings") }
          ]
        },
        { id: "dashboard-settings" as any, group: "Dashboard", label: "Settings", icon: "⚙️", 
          submenu: [
            { label: "Theme & Colors", onClick: () => console.log("Configure Dashboard Theme") },
            { label: "Grid Settings", onClick: () => console.log("Configure Grid Settings") },
            { label: "Performance", onClick: () => console.log("Performance Settings") },
            { label: "Data Sources", onClick: () => console.log("Manage Data Sources") }
          ]
        }
      ];
    case "Leads":
      return [
        { id: "leads-new" as any, group: "Leads", label: "New Lead", icon: "➕", onClick: () => console.log("New Lead") },
        { id: "leads-import" as any, group: "Leads", label: "Import", icon: "📥", onClick: () => console.log("Import Leads") },
        { id: "leads-export" as any, group: "Leads", label: "Export", icon: "📤", onClick: () => console.log("Export Leads") },
        { id: "leads-filter" as any, group: "Leads", label: "Filter", icon: "🔍", onClick: () => console.log("Filter Leads") }
      ];
    case "Deals":
      return [
        { id: "deals-new" as any, group: "Deals", label: "New Deal", icon: "💰", onClick: () => console.log("New Deal") },
        { id: "deals-pipeline" as any, group: "Deals", label: "Pipeline", icon: "📊", onClick: () => console.log("Deal Pipeline") },
        { id: "deals-forecast" as any, group: "Deals", label: "Forecast", icon: "📈", onClick: () => console.log("Deal Forecast") },
        { id: "deals-reports" as any, group: "Deals", label: "Reports", icon: "📋", onClick: () => console.log("Deal Reports") }
      ];
    case "Inventory":
      return [
        { id: "inventory-add" as any, group: "Inventory", label: "Add Item", icon: "📦", onClick: () => console.log("Add Inventory") },
        { id: "inventory-scan" as any, group: "Inventory", label: "Scan", icon: "📱", onClick: () => console.log("Scan Inventory") },
        { id: "inventory-audit" as any, group: "Inventory", label: "Audit", icon: "📋", onClick: () => console.log("Inventory Audit") },
        { id: "inventory-reorder" as any, group: "Inventory", label: "Reorder", icon: "🔄", onClick: () => console.log("Reorder Items") }
      ];
    case "Calendar":
      return [
        { id: "calendar-new" as any, group: "Calendar", label: "New Event", icon: "📅", onClick: () => console.log("New Calendar Event") },
        { id: "calendar-view" as any, group: "Calendar", label: "View", icon: "👁️", onClick: () => console.log("Calendar View") },
        { id: "calendar-sync" as any, group: "Calendar", label: "Sync", icon: "🔄", onClick: () => console.log("Sync Calendar") },
        { id: "calendar-settings" as any, group: "Calendar", label: "Settings", icon: "⚙️", onClick: () => console.log("Calendar Settings") }
      ];
    case "Performance":
      return [
        { id: "performance-metrics" as any, group: "Performance", label: "Metrics", icon: "📊", onClick: () => console.log("Performance Metrics") },
        { id: "performance-reports" as any, group: "Performance", label: "Reports", icon: "📈", onClick: () => console.log("Performance Reports") },
        { id: "performance-goals" as any, group: "Performance", label: "Goals", icon: "🎯", onClick: () => console.log("Performance Goals") },
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
        { id: "home-welcome" as any, group: "Home", label: "Welcome", icon: "🏠", onClick: () => console.log("Welcome") },
        { id: "home-tour" as any, group: "Home", label: "Tour", icon: "🎯", onClick: () => console.log("Take Tour") },
        { id: "home-help" as any, group: "Home", label: "Help", icon: "❓", onClick: () => console.log("Help") },
        { id: "home-support" as any, group: "Home", label: "Support", icon: "🆘", onClick: () => console.log("Support") }
      ];
  }
}

export default function Ribbon() {
  const pathname = usePathname();
  const contextualTab = getContextualTabName(pathname);
  const contextualControls = getContextualControls(contextualTab);

  // Combine contextual controls with other static controls (excluding the old Home controls)
  const allControls: any[] = [
    ...contextualControls,
    ...CONTROLS_AI,
    ...CONTROLS_AUTOMATION,
    ...CONTROLS_DATA,
    ...CONTROLS_DEVELOPER,
    ...CONTROLS_EDIT,
    ...CONTROLS_FILE,
    ...CONTROLS_REPORTS,
    ...CONTROLS_SETTINGS
  ];

  const groups = useMemo(() => {
    const map = new Map<string, { ctrl: any; enabled: boolean; disabled: boolean }[]>();
    allControls.forEach(c => {
      const arr = map.get(c.group) || [];
      arr.push({ ctrl: c, enabled: true, disabled: false });
      map.set(c.group, arr);
    });
    return Array.from(map.entries());
  }, [contextualTab, pathname]);

  // Notifications logic (moved from Topbar)
  const [notifications, setNotifications] = useState<string[]>(["Welcome to GhostCRM!"]);
  const [unreadNotifications, setUnreadNotifications] = useState<string[]>(["Welcome to GhostCRM!"]);
  const markAsRead = (n: string) => setUnreadNotifications((x) => x.filter((v) => v !== n));
  const groupedNotifications = unreadNotifications.reduce((acc: Record<string, string[]>, n) => {
    const type = n.includes("lead") ? "Leads" : n.includes("Welcome") ? "System" : "Other";
    (acc[type] ||= []).push(n);
    return acc;
  }, {});
  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/leads");
        const data = await res.json();
        if (data.records) {
          const notes = ["Welcome to GhostCRM!", `You have ${data.records.length} leads.`];
          setNotifications(notes);
          setUnreadNotifications(notes);
        } else {
          const notes = ["Welcome to GhostCRM!", "Unable to fetch leads."];
          setNotifications(notes);
          setUnreadNotifications(notes);
        }
      } catch {
        const notes = ["Welcome to GhostCRM!", "Unable to fetch leads."];
        setNotifications(notes);
        setUnreadNotifications(notes);
      }
    })();
  }, []);

  // Profile dropdown logic
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  useOutsideClick(profileRef, () => showProfile && setShowProfile(false));

  // Notification dropdown logic
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useOutsideClick(dropdownRef, () => showDropdown && setShowDropdown(false));

  return (
    <>
      <div className="w-full flex items-center gap-3">
        {/* Ribbon groups on the left */}
        {groups.map(([title, items]) => (
          <RibbonGroup key={title} title={title} items={items} />
        ))}
        {/* Spacer to push icons to the right */}
        <div className="flex-1" />
        {/* Notifications button on far right */}
        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            className="relative"
            aria-label="Notifications"
            onClick={() => setShowDropdown((s) => !s)}
          >
            <span className="w-4 h-6 flex items-center justify-center rounded-full bg-gray-100 text-blue-600 text-xl">🔔</span>
            {unreadNotifications.length > 0 && (
              <span className="absolute -top-1 -right-1 px-4 py-0.5 bg-red-500 text-white text-[10px] rounded-full">{unreadNotifications.length}</span>
            )}
          </button>
          {showDropdown && (
            <div className="absolute top-full right-0 mt-2 bg-white border rounded-xl shadow-2xl z-50 w-80">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <div className="flex items-center gap-2">
                  <span className="text-xl text-blue-600">🔔</span>
                  <span className="font-bold text-base">Notifications</span>
                </div>
                <button className="text-xs text-red-500 hover:underline" onClick={() => setUnreadNotifications([])}>Clear All</button>
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
                            <button className="text-xs px-2 py-1 rounded bg-green-100 text-green-700" onClick={() => markAsRead(n)}>Mark as read</button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                {unreadNotifications.length === 0 && <div className="text-center text-gray-400 py-8">No notifications</div>}
              </div>
            </div>
          )}
        </div>
        {/* Profile button on far right */}
        <div ref={profileRef} className="relative ml-2">
          <button
            type="button"
            className="ml-1"
            aria-label="Profile"
            onClick={() => setShowProfile((s) => !s)}
          >
            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 text-purple-600 text-xl">👤</span>
          </button>
          {showProfile && (
            <div className="absolute top-full right-0 mt-2 bg-white border rounded-xl shadow-2xl z-50 w-72">
              {/* Use UserProfileDropdown component here */}
              {/* @ts-ignore */}
              {require("../UserProfileDropdown").UserProfileDropdown()}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function RibbonGroup({ title, items }: { title: string; items: { ctrl: any; disabled: boolean }[] }) {
  const [open, setOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  
  // Only show group button if at least one item is visible for this role/context
  const hasVisible = items.some(({ ctrl, disabled }) => !disabled);
  
  return (
    <div
      ref={ref}
      className="relative group"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => {
        setOpen(false);
        setHoveredItem(null);
      }}
    >
      <button
        type="button"
        className={`px-4 h-9 text-xs font-medium transition-all duration-200 outline-none rounded-md ${
          open 
            ? "bg-blue-500 text-white shadow-md" 
            : "text-gray-700 hover:bg-blue-100 hover:text-blue-700"
        } ${!hasVisible ? "opacity-50 cursor-not-allowed" : ""}`}
        disabled={!hasVisible}
      >
        {title}
      </button>
      {open && (
        <div className="absolute z-50 mt-2 left-0 w-64 bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg shadow-xl backdrop-blur-sm">
          <ul className="py-2">
            {hasVisible ? (
              items.filter(({ ctrl, disabled }) => !disabled).map(({ ctrl }) => (
                <li 
                  key={ctrl.id} 
                  className="relative mx-2"
                  onMouseEnter={() => setHoveredItem(ctrl.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={ctrl.onClick}
                      className={`w-full text-left px-3 py-2.5 text-sm rounded-md transition-all duration-150 flex items-center gap-3 ${
                        hoveredItem === ctrl.id 
                          ? 'bg-blue-500 text-white shadow-md transform scale-[1.02]' 
                          : 'text-gray-700 hover:bg-blue-100 hover:text-blue-700'
                      }`}
                    >
                      <span className="text-base">{ctrl.icon}</span>
                      <span className="font-medium">{ctrl.label}</span>
                      {ctrl.submenu && (
                        <span className={`ml-auto transition-colors ${
                          hoveredItem === ctrl.id ? 'text-blue-200' : 'text-gray-400'
                        }`}>▶</span>
                      )}
                    </button>
                  </div>
                  
                  {/* VS Code style submenu - appears to the right when hovering */}
                  {ctrl.submenu && hoveredItem === ctrl.id && (
                    <div className="absolute left-full top-0 ml-1 w-60 bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg shadow-xl backdrop-blur-sm z-60">
                      <ul className="py-2">
                        {ctrl.submenu.map((item: any, idx: number) => (
                          <li key={idx} className="mx-2">
                            <button
                              type="button"
                              onClick={item.onClick}
                              className="w-full text-left px-3 py-2 text-sm rounded-md transition-all duration-150 text-gray-700 hover:bg-blue-500 hover:text-white hover:shadow-md hover:transform hover:scale-[1.02] font-medium"
                            >
                              {item.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))
            ) : (
              <li className="px-5 py-3 text-sm text-gray-400 italic">No actions available</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

const defaultButton = (label: string, disabled: boolean) => () =>
  <button disabled={disabled}
          className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-blue-50 ${disabled ? "text-gray-400 cursor-not-allowed" : ""}`}>
    {label}
  </button>;
