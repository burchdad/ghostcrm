"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideHome, LucideUser, LucideBarChart2, LucideCar, LucideCalendar } from "lucide-react";
import SidebarAIAssistant from "./SidebarAIAssistant";
import { CollapseToggle, useCollapse } from "@/components/collapse";

const DEFAULT_ITEMS = [
  { name: "Dashboard", path: "/dashboard", icon: LucideHome, badge: 0, role: ["admin","sales"] },
  { name: "Leads", path: "/leads", icon: LucideUser, badge: 2, role: ["sales"] },
  { name: "Deals", path: "/deals", icon: LucideBarChart2, badge: 1, role: ["sales"] },
  { name: "Inventory", path: "/inventory", icon: LucideCar, badge: 0, role: ["admin"] },
  { name: "Appointments", path: "/appointments", icon: LucideCalendar, badge: 3, role: ["admin"] },
  { name: "Performance", path: "/performance", icon: LucideBarChart2, badge: 0, role: ["admin"] }
]

export default function Sidebar() {
  const pathname = usePathname();
  const { collapsed } = useCollapse();
  const [role, setRole] = React.useState("Select Role");
  const [search, setSearch] = React.useState("");
  const items = DEFAULT_ITEMS;
  const [order, setOrder] = React.useState(items.map((_, i) => i));

  const filtered =
    role === "Select Role"
      ? []
      : order
          .map((i) => items[i])
          .filter((it) =>
            (role === "admin" ? true : it.role.includes(role)) &&
            it.name.toLowerCase().includes(search.toLowerCase())
          );

  return (
    <div className="h-full w-full bg-white flex flex-col rounded-r-2xl shadow-md border-r border-gray-200">
      <div className="pt-4 pb-2 px-3 flex items-center">
        {!collapsed && <span className="font-bold text-xl text-blue-700 truncate">Ghost Auto CRM</span>}
        <CollapseToggle className="ml-auto" />
      </div>;
      {!collapsed && (
        <div className="px-3 pb-3">
          <div className="rounded-lg bg-gray-100 border border-gray-200 p-3 space-y-2">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full h-9 rounded-md border px-2 text-xs text-center bg-white"
            >
              <option value="Select Role">Select Role</option>
              <option value="admin">Admin</option>
              <option value="sales">Sales</option>
            </select>
          </div>
        </div>
      )}
    <div className="flex flex-col flex-1">
      <nav className="px-1" role="navigation" aria-label="Main Navigation">
        <ul className="space-y-1">
          {filtered.map(({ name, path, icon: Icon, badge }) => {
            const active = pathname === path;
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
      </nav>;
      {!collapsed && (
        <div className="flex flex-1 items-center justify-center px-3">
          <div className="w-full max-w-xs">
            <SidebarAIAssistant />
          </div>
        </div>
      )}
    </div>
  </div>
  )
};