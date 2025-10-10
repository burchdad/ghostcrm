"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faUser,
  faDollarSign,
  faCar,
  faCalendar,
  faChartLine,
  faFileAlt
} from "@fortawesome/free-solid-svg-icons";
import SidebarAIAssistant from "./SidebarAIAssistant";

const DEFAULT_ITEMS = [
  { name: "Dashboard", path: "/dashboard", icon: faHome, badge: 0, role: ["admin","sales"] },
  { name: "Leads", path: "/leads", icon: faUser, badge: 2, role: ["sales"] },
  { name: "Deals", path: "/deals", icon: faDollarSign, badge: 1, role: ["sales"] },
  { name: "Inventory", path: "/inventory", icon: faCar, badge: 0, role: ["admin"] },
  { name: "Calendar", path: "/calendar", icon: faCalendar, badge: 0, role: ["admin"] },
  { name: "Performance", path: "/performance", icon: faChartLine, badge: 0, role: ["admin"] },
  { name: "Finance", path: "/finance", icon: faFileAlt, badge: 0, role: ["admin"] }
]

export default function Sidebar() {
  const pathname = usePathname();
  const items = DEFAULT_ITEMS;

  return (
    <div className="flex flex-col relative w-full h-full" style={{ backgroundColor: '#f9fafc' }}>
      <div className="flex flex-col flex-1">
        <nav className="px-4 py-6" role="navigation" aria-label="Main Navigation">
          <ul className="space-y-2">
            {items.map(({ name, path, icon, badge }) => {
              const active = pathname === path;
              return (
                <li key={path}>
                  <Link
                    href={path}
                    className={["relative flex items-center rounded-xl transition justify-between gap-2",
                      active ? "text-white" : "text-gray-300 hover:text-white",
                    ].join(" ")}
                    style={{
                      padding: '12px 16px',
                      backgroundColor: active ? 'rgba(66, 153, 225, 0.15)' : 'transparent'
                    }}
                  >
                    <span className="flex items-center" style={{ gap: '12px' }}>
                      <span className="flex items-center justify-center w-9 h-9 rounded-lg" style={{ backgroundColor: '#97cff9' }}>
                        <FontAwesomeIcon icon={icon} className="w-4 h-4 text-white" />
                      </span>
                      <span className="font-semibold text-sm">{name}</span>
                    </span>
                    {badge ? (
                      <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">{badge}</span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="flex flex-1 items-end justify-center px-3 pb-6">
          <div className="w-full max-w-xs">
            <SidebarAIAssistant />
          </div>
        </div>
      </div>
    </div>
  );
}