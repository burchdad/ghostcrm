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
  const [theme, setTheme] = useState('light');
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [role, setRole] = useState('all');
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [navOrder, setNavOrder] = useState(navItems.map((_, i) => i));
  const sidebarRef = useRef<HTMLDivElement>(null);
  const filteredNav = navOrder
    .map(i => navItems[i])
    .filter(item => item.name.toLowerCase().includes(search.toLowerCase()) && (item.role === role || item.role === 'all'));

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
    setCollapsed(c => !c);
  }

  // Sidebar content for desktop
  const sidebarContent = (
    <aside
      ref={sidebarRef}
      className={`flex flex-col h-screen bg-white shadow-md transition-all duration-300 ${collapsed ? "w-14" : "w-64"}`}
      aria-label="Sidebar Navigation"
    >
          {/* Removed duplicate collapse button at top left */}
          {/* Top section: logo, badge/profile, theme switcher */}
          <div className={`flex items-center justify-between px-4 pt-4 pb-2 ${collapsed ? 'flex-col px-0 pt-2 pb-0' : ''}`}> 
            {!collapsed && (
              <span className="font-bold text-xl text-blue-700">Ghost Auto CRM</span>
            )}
            {/* Profile/badge icon */}
            <span className={`ml-2 ${collapsed ? 'mx-auto' : ''}`} title="Profile">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-purple-200 text-lg">
                <span role="img" aria-label="badge">🟣</span>
              </span>
            </span>
            {/* Theme switcher */}
            <button
              className="ml-2 p-1 rounded-full bg-gray-100 hover:bg-blue-100 text-sm"
              aria-label="Toggle theme"
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              onClick={() => {
                const newTheme = theme === 'light' ? 'dark' : 'light';
                setTheme(newTheme);
                if (typeof document !== 'undefined') {
                  document.documentElement.classList.toggle('dark', newTheme === 'dark');
                }
              }}
            >
              {theme === 'light' ? '🌞' : '🌙'}
            </button>
            {/* Collapse button */}
            <button
              className="ml-2 p-2 rounded-full bg-gray-100 hover:bg-blue-100 text-lg"
              onClick={toggleCollapse}
              aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              title={collapsed ? 'Expand' : 'Collapse'}
              style={{ transition: 'background 0.2s' }}
            >
              {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
            </button>
          </div>
      {!collapsed && (
        <div className="px-4 pb-2">
          <label className="text-xs text-gray-500">Role Filter</label>
          <select value={role} onChange={e => setRole(e.target.value)} className="w-full mt-1 p-1 rounded border border-gray-300 text-xs">
            <option value="all">All</option>
            <option value="sales">Sales</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      )}
      <nav className="flex-1 px-2" role="navigation" aria-label="Main Navigation">
        <ul className="space-y-1">
          {filteredNav.map(({ name, path, icon: Icon, badge }, idx) => (
            <li key={name} draggable onDragStart={() => handleDragStart(idx)} onDrop={() => handleDrop(idx)} onDragOver={e => e.preventDefault()}>
              <a
                className={`flex items-center px-2 py-2 rounded hover:bg-blue-50 ${pathname === path ? "font-bold text-blue-700 bg-blue-100" : ""} justify-center`}
                href={path}
                aria-label={name}
                title={name}
                onClick={e => { e.preventDefault(); router.push(path); }}
              >
                <Icon className="w-5 h-5 mr-2" />
                {!collapsed && name}
                {!collapsed && badge > 0 && <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">{badge}</span>}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      {!collapsed && (
        <div className="px-2 pt-4 pb-4">
          <SidebarAIAssistant />
        </div>
      )}
    </aside>
  );

  // Mobile sidebar drawer
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block">{sidebarContent}</div>
      {/* Mobile Sidebar Drawer */}
      <button className="fixed bottom-4 left-4 z-50 md:hidden bg-blue-600 text-white rounded-full p-3 shadow-lg" aria-label="Open Sidebar" onClick={() => setDrawerOpen(true)}>
        <span className="sr-only">Open Sidebar</span>☰
      </button>
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} header={<span>Ghost Auto CRM</span>}>
        <div className="p-4">{sidebarContent}</div>
      </Drawer>
    </>
  );
}

