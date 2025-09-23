"use client";
import React, { useState, useRef } from "react";
import { FiChevronLeft, FiChevronRight, FiHome, FiBox, FiCalendar, FiBarChart2, FiSettings } from "react-icons/fi";
import { Drawer } from "./Drawer";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LucideHome, LucideUser, LucideCar, LucideCalendar, LucideSettings, LucideBarChart2 } from "lucide-react";
import { SidebarAIAssistant } from "./SidebarAIAssistant";

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: LucideHome, badge: 0, role: "all" },
  { name: "Leads", path: "/leads", icon: LucideUser, badge: 2, role: "sales" },
  { name: "Deals", path: "/deals", icon: LucideBarChart2, badge: 1, role: "sales" },
  { name: "Inventory", path: "/inventory", icon: LucideCar, badge: 0, role: "admin" },
  { name: "Appointments", path: "/appointments", icon: LucideCalendar, badge: 3, role: "all" },
  { name: "Performance", path: "/performance", icon: LucideBarChart2, badge: 0, role: "admin" },
  { name: "Admin", path: "/admin", icon: LucideSettings, badge: 0, role: "admin" }
];


export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [role, setRole] = useState("all");
  const [search, setSearch] = useState("");
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [navOrder, setNavOrder] = useState(navItems.map((_, i) => i));
  const sidebarRef = useRef<HTMLDivElement>(null);

  const filteredNav = navOrder
    .map((i) => navItems[i])
    .filter(
      (item) =>
        item.name.toLowerCase().includes(search.toLowerCase()) &&
        (item.role === role || item.role === "all")
    );

  function handleDragStart(idx: number) {
    setDragIdx(idx);
  }

  function handleDrop(idx: number) {
    if (dragIdx === null || dragIdx === idx) return;
    const newOrder = [...navOrder];
    const [removed] = newOrder.splice(dragIdx, 1);
    newOrder.splice(idx, 0, removed);
    setNavOrder(newOrder);
    setDragIdx(null);
  }

  function toggleCollapse() {
    setCollapsed((c) => {
      const next = !c;
      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("sidebar-collapsed", next);
      }
      return next;
    });
  }

  return (
    // CONTENT-ONLY container (layout provides the fixed <aside>)
    <div
      ref={sidebarRef}
      className="flex flex-col h-full bg-white rounded-r-2xl shadow-md border-r border-gray-200"
      tabIndex={0}
      aria-label="Sidebar Navigation"
    >
      {/* Header */}
      <div className={`flex items-center justify-between px-4 pt-4 pb-2 ${collapsed ? "flex-col px-0 pt-2 pb-0" : ""}`}>
        {!collapsed  
        }

        <button
          className="ml-2 p-2 rounded-full bg-gray-100 hover:bg-blue-100 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={toggleCollapse}
          aria-label={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          title={collapsed ? "Expand" : "Collapse"}
          style={{ transition: "background 0.2s" }}
        >
          {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>
      </div>

      {/* Filters */}
      {!collapsed && (
        <div className="px-4 pb-2">
          <label className="text-xs text-gray-500">Role Filter</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full mt-1 h-8 rounded-md border px-2 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ appearance: 'none' }}
          >
            <option value="all">All</option>
            <option value="sales">Sales</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2" role="navigation" aria-label="Main Navigation">
        <ul className="space-y-1">
          {filteredNav.map(({ name, path, icon: Icon, badge }, idx) => (
            <li
              key={name}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDrop={() => handleDrop(idx)}
              onDragOver={(e) => e.preventDefault()}
            >
              <a
                className={`flex items-center px-2 py-2 rounded hover:bg-blue-50 transition ${
                  pathname === path ? "font-bold text-blue-700 bg-blue-100" : ""
                } ${collapsed ? "justify-center" : ""}`}
                href={path}
                aria-label={name}
                title={name}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(path);
                }}
              >
                <Icon className="w-5 h-5 mr-2" />
                {!collapsed && name}
                {!collapsed && badge > 0 && (
                  <span className="ml-2 px-2 h-8 flex items-center rounded-md border bg-red-500 text-white text-xs shadow-sm">
                    {badge}
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* AI assistant */}
      {!collapsed && (
        <div className="px-2 pt-4 pb-4">
          <SidebarAIAssistant />
        </div>
      )}
    </div>
  );
}

