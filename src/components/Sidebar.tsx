"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideHome, LucideUser, LucideBarChart2, LucideCar, LucideCalendar } from "lucide-react";
import SidebarAIAssistant from "./SidebarAIAssistant";
import { CollapseToggle, useCollapse } from "@/components/collapse";

// MVP Feature Configuration
const ENABLED_FEATURES = new Set([
  '/dashboard',
  '/leads', 
  '/deals',
  '/ai'
]);

const DEFAULT_ITEMS = [
  { name: "Dashboard", path: "/dashboard", icon: LucideHome, badge: 0, role: ["admin","sales"], enabled: true },
  { name: "Leads", path: "/leads", icon: LucideUser, badge: 2, role: ["sales"], enabled: true },
  { name: "Deals", path: "/deals", icon: LucideBarChart2, badge: 1, role: ["sales"], enabled: true },
  { name: "Inventory", path: "/inventory", icon: LucideCar, badge: 0, role: ["admin"], enabled: false, comingSoon: "Dec 2025" },
  { name: "Calendar", path: "/calendar", icon: LucideCalendar, badge: 0, role: ["admin"], enabled: false, comingSoon: "Nov 2025" },
  { name: "Performance", path: "/performance", icon: LucideBarChart2, badge: 0, role: ["admin"], enabled: false, comingSoon: "Jan 2026" },
  { name: "Finance", path: "/finance", icon: LucideBarChart2, badge: 0, role: ["admin"], enabled: false, comingSoon: "Dec 2025" }
]

export default function Sidebar() {
  const pathname = usePathname();
  const { collapsed } = useCollapse();
  const items = DEFAULT_ITEMS;
  const [order, setOrder] = React.useState(items.map((_, i) => i));
  const [showAssistant, setShowAssistant] = React.useState(false);

  const filtered = order.map((i) => items[i]);

  return (
    <div
      className={`bg-blue-500 flex flex-col h-full relative ${collapsed ? 'w-10' : 'w-45'}`}
    >
      <div className="flex flex-col flex-1 overflow-hidden">
        <nav className="px-1 py-2 flex-1" role="navigation" aria-label="Main Navigation">
          <ul className="space-y-1 h-full">
            {filtered.map(({ name, path, icon: Icon, badge, enabled, comingSoon }) => {
              const active = pathname === path;
              
              if (!enabled) {
                // Coming Soon Item
                return (
                  <li key={path}>
                    <div
                      className={["relative flex items-center rounded-md px-3 py-2 transition cursor-not-allowed opacity-60",
                        collapsed ? "justify-center gap-0" : "justify-between gap-2",
                        "text-gray-500 bg-gray-50 border border-dashed border-gray-300"
                      ].join(" ")}
                      title={`${name} - Coming ${comingSoon}`}
                    >
                      <span className={["flex items-center", collapsed ? "" : "gap-2"].join(" ")}>
                        <Icon className="w-5 h-5" />
                        {!collapsed && <span className="font-medium">{name}</span>}
                      </span>
                      {!collapsed && (
                        <span className="ml-2 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                          Soon
                        </span>
                      )}
                    </div>
                  </li>
                );
              }
              
              // Enabled Item
              return (
                <li key={path}>
                  <Link
                    href={path}
                    className={["relative flex items-center rounded-md px-3 py-2 transition",
                      collapsed ? "justify-center gap-0" : "justify-between gap-2",
                      active ? "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-400" : "text-gray-800 hover:bg-gray-100",
                    ].join(" ")}
                  >
                    <span className={["flex items-center", collapsed ? "" : "gap-2"].join(" ")}>
                      <Icon className="w-5 h-5" />
                      {!collapsed && <span className="font-medium">{name}</span>}
                    </span>
                    {!collapsed && badge ? (
                      <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">{badge}</span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        {!collapsed ? (
          <div className="flex flex-1 items-center justify-center px-3">
            <div className="w-full max-w-xs">
              <SidebarAIAssistant />
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-1 items-left justify-left px-3">
              <button
                className="flex items-center justify-left w-10 h-10 rounded-full bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label="Open AI Assistant"
                onClick={() => setShowAssistant(true)}
              >
                {/* Help icon (LucideHelpCircle or similar) */}
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" fill="none" />
                  <path d="M12 16v-1m0-4a2 2 0 1 1 2 2c0 1-2 1-2 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            {showAssistant && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-none bg-opacity-40"
                onClick={(e) => {
                  // Only close if clicking the overlay, not the modal itself
                  if (e.target === e.currentTarget) {
                    setShowAssistant(false);
                  }
                }}
              >
                <div
                  className="bg-white rounded-lg shadow-lg p-6 max-w-xs w-full relative"
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    aria-label="Minimize"
                    onClick={() => {
                      setShowAssistant(false);
                    }}
                  >
                    &minus;
                  </button>
                  <SidebarAIAssistant />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}