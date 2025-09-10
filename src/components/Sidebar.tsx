"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideHome, LucideUser, LucideCar, LucideCalendar, LucideSettings, LucideBarChart2 } from "lucide-react";

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: LucideHome },
  { name: "Leads", path: "/leads", icon: LucideUser },
  { name: "Deals", path: "/deals", icon: LucideBarChart2 },
  { name: "Inventory", path: "/inventory", icon: LucideCar },
  { name: "Appointments", path: "/appointments", icon: LucideCalendar },
  { name: "Performance", path: "/performance", icon: LucideBarChart2 },
  { name: "Admin", path: "/admin", icon: LucideSettings }
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 bg-white border-r p-4 hidden md:block">
      <h2 className="text-xl font-bold mb-6">Ghost Auto CRM</h2>
      <nav className="space-y-2">
        {navItems.map(({ name, path, icon: Icon }) => (
          <Link href={path} key={name}>
            <div className={`flex items-center p-2 rounded-lg transition ${pathname === path ? "bg-gray-200" : "hover:bg-gray-100"}`}>
              <Icon className="w-5 h-5 mr-2" />
              {name}
            </div>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
