"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LucideHome,
  LucideUser,
  LucideBarChart2,
  LucideCar,
  LucideCalendar,
  Zap,
  Users,
  Shield,
  Activity,
  Settings,
  DollarSign,
  UserCog,
  TrendingUp,
  Building,
  CreditCard,
  FileText,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Palette,
  Bot,
  Search,
  Bell,
  Star,
  Target,
  Bookmark,
  Plus,
  Sparkles,
  Layers,
  Database,
  Workflow,
  type LucideIcon,
} from "lucide-react";

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

type UserRole = "admin" | "owner" | "manager" | "sales_rep";

interface SidebarItem {
  name: string;
  path: string;
  icon: LucideIcon;
  role: UserRole[];
  enabled: boolean;
  comingSoon?: string;
  countKey?: keyof SidebarCounts;
  section?: SidebarSectionKey;
  ownerOnly?: boolean;
  tenantOwnerOnly?: boolean;
  tenantAdminOnly?: boolean;
  salesManagerOnly?: boolean;
  salesRepOnly?: boolean;
  subItems?: SidebarItem[];
  isDropdown?: boolean;
  expandable?: boolean;
  gradient?: string;
  description?: string;
  isNew?: boolean;
  isPro?: boolean;
}

type SidebarSectionKey = "overview" | "sales" | "operations" | "tools" | "management";

const MODERN_ITEMS: SidebarItem[] = [
  // Dashboard Section
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LucideHome,
    role: ["admin", "owner", "manager", "sales_rep"],
    enabled: true,
    countKey: "dashboard",
    section: "overview",
    gradient: "from-blue-500 to-blue-600",
    description: "Your business overview",
  },

  // Sales Section
  {
    name: "Leads",
    path: "/leads",
    icon: Users,
    role: ["admin", "owner", "manager", "sales_rep"],
    enabled: true,
    countKey: "leads",
    section: "sales",
    gradient: "from-green-500 to-emerald-600",
    description: "Manage your prospects",
    expandable: true,
    subItems: [
      {
        name: "All Leads",
        path: "/leads",
        icon: Users,
        role: ["admin", "owner", "manager", "sales_rep"],
        enabled: true,
      },
      {
        name: "Kanban View",
        path: "/leads/kanban",
        icon: Layers,
        role: ["admin", "owner", "manager", "sales_rep"],
        enabled: true,
        isNew: true,
      },
      {
        name: "Lead Analytics",
        path: "/leads/analytics",
        icon: TrendingUp,
        role: ["admin", "owner", "manager"],
        enabled: true,
      },
    ],
  },

  {
    name: "Deals",
    path: "/deals",
    icon: Target,
    role: ["admin", "owner", "manager", "sales_rep"],
    enabled: true,
    countKey: "deals",
    section: "sales",
    gradient: "from-purple-500 to-purple-600",
    description: "Track your sales pipeline",
  },

  // Operations Section
  {
    name: "Inventory",
    path: "/inventory",
    icon: Database,
    role: ["admin", "owner", "manager", "sales_rep"],
    enabled: true,
    countKey: "inventory",
    section: "operations",
    gradient: "from-orange-500 to-red-500",
    description: "Manage your vehicles",
  },

  {
    name: "Calendar",
    path: "/calendar",
    icon: LucideCalendar,
    role: ["admin", "owner", "manager", "sales_rep"],
    enabled: true,
    countKey: "calendar",
    section: "operations",
    gradient: "from-indigo-500 to-blue-600",
    description: "Schedule & appointments",
  },

  {
    name: "Collaboration",
    path: "/collaboration",
    icon: Users,
    role: ["admin", "owner", "manager", "sales_rep"],
    enabled: true,
    countKey: "collaboration",
    section: "operations",
    gradient: "from-pink-500 to-rose-600",
    description: "Team communication",
  },

  // Automation Section
  {
    name: "Automation",
    path: "/automation",
    icon: Workflow,
    role: ["admin", "owner", "manager"],
    enabled: true,
    countKey: "automation",
    section: "tools",
    gradient: "from-violet-500 to-purple-600",
    description: "Automate your workflow",
    isPro: true,
  },

  {
    name: "AI Assistant",
    path: "/ai",
    icon: Sparkles,
    role: ["admin", "owner", "manager", "sales_rep"],
    enabled: true,
    section: "tools",
    gradient: "from-cyan-500 to-blue-600",
    description: "AI-powered insights",
    isNew: true,
  },
];

const sectionOrder: SidebarSectionKey[] = ["overview", "sales", "operations", "tools", "management"];

const sectionLabels: Record<SidebarSectionKey, string> = {
  overview: "Overview",
  sales: "Sales & CRM",
  operations: "Operations",
  tools: "AI & Automation",
  management: "Management",
};

const sectionIcons: Record<SidebarSectionKey, LucideIcon> = {
  overview: Activity,
  sales: TrendingUp,
  operations: Settings,
  tools: Sparkles,
  management: Shield,
};

export default function ModernSidebar() {
  const pathname = usePathname();

  // Cast here so TS doesn't fight your AuthContext shape
  const { user } = useAuth() as {
    user: {
      role?: UserRole | string;
      name?: string;
      email?: string;
    } | null;
  };

  const userRole = (user?.role as UserRole | undefined) ?? undefined;
  const userName = user?.name;
  const userEmail = user?.email;

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
  const [expandedItems, setExpandedItems] = useState<Set<string>>(() => new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [favoriteItems, setFavoriteItems] = useState<Set<string>>(() => new Set());

  // Mock data loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      setCounts({
        leads: 23,
        deals: 12,
        dashboard: 5,
        inventory: 156,
        calendar: 8,
        automation: 3,
        collaboration: 2,
        performance: 0,
        finance: 0,
      });
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemName)) {
        newSet.delete(itemName);
      } else {
        newSet.add(itemName);
      }
      return newSet;
    });
  };

  const toggleFavorite = (itemName: string) => {
    setFavoriteItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemName)) {
        newSet.delete(itemName);
      } else {
        newSet.add(itemName);
      }
      return newSet;
    });
  };

  // Filter items based on role
  const filteredItems = MODERN_ITEMS.filter((item) => {
    if (!userRole) return false;
    return item.role.includes(userRole as UserRole);
  });

  // Group items by section
  const groupedItems = filteredItems.reduce<Record<SidebarSectionKey | "general", SidebarItem[]>>(
    (acc, item) => {
      const section = item.section ?? "general";
      if (!acc[section]) acc[section] = [];
      acc[section].push(item);
      return acc;
    },
    {} as Record<SidebarSectionKey | "general", SidebarItem[]>
  );

  // Filter items based on search
  const filteredBySearch = searchTerm
    ? filteredItems.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : null;

  return (
    <div className="modern-sidebar flex flex-col h-full bg-gradient-to-b from-slate-50 to-white border-r border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">GhostCRM</h2>
            <p className="text-xs text-slate-500">{userRole ?? "User"}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 border-0 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 space-y-2">
        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm">
          <Plus className="w-4 h-4" />
          Add New Lead
        </button>

        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 rounded-md transition-colors">
            <Bell className="w-3 h-3" />
            <span>3</span>
          </button>
          <button className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 rounded-md transition-colors">
            <Star className="w-3 h-3" />
            <span>Favorites</span>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 pb-4 overflow-y-auto">
        {searchTerm && filteredBySearch ? (
          /* Search Results */
          <div className="space-y-1">
            <h3 className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Search Results ({filteredBySearch.length})
            </h3>
            {filteredBySearch.map((item) => {
              const active = pathname === item.path;
              const Icon = item.icon;
              const count = item.countKey ? counts[item.countKey] : 0;

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`relative flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all group ${
                    active
                      ? "bg-white shadow-md ring-1 ring-slate-200 text-slate-900"
                      : "text-slate-600 hover:bg-white hover:shadow-sm hover:text-slate-900"
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-md ${
                      active
                        ? `bg-gradient-to-r ${item.gradient ?? "from-slate-500 to-slate-700"} text-white shadow-sm`
                        : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{item.name}</span>
                      {item.isNew && (
                        <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded-full font-medium">
                          New
                        </span>
                      )}
                      {item.isPro && (
                        <span className="px-1.5 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full font-medium">
                          Pro
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs text-slate-500 truncate">{item.description}</p>
                    )}
                  </div>

                  {count > 0 && (
                    <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-medium">
                      {count > 99 ? "99+" : count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ) : (
          /* Regular Navigation */
          <div className="space-y-6">
            {sectionOrder.map((sectionKey) => {
              const sectionItems = groupedItems[sectionKey];
              if (!sectionItems || sectionItems.length === 0) return null;

              const SectionIcon = sectionIcons[sectionKey];

              return (
                <div key={sectionKey} className="space-y-2">
                  {/* Section Header */}
                  <div className="flex items-center gap-2 px-3 py-1">
                    <SectionIcon className="w-4 h-4 text-slate-400" />
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {sectionLabels[sectionKey]}
                    </h3>
                  </div>

                  {/* Section Items */}
                  <div className="space-y-1">
                    {sectionItems.map((item) => {
                      const active =
                        pathname === item.path ||
                        (item.expandable && pathname.startsWith(item.path));
                      const isExpanded = expandedItems.has(item.name);
                      const isFavorite = favoriteItems.has(item.name);
                      const Icon = item.icon;
                      const count = item.countKey ? counts[item.countKey] : 0;

                      return (
                        <div key={item.name}>
                          {/* Main Item */}
                          <div className="relative group">
                            <Link
                              href={item.expandable ? "#" : item.path}
                              onClick={(e) => {
                                if (item.expandable) {
                                  e.preventDefault();
                                  toggleExpanded(item.name);
                                }
                              }}
                              className={`relative flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all ${
                                active
                                  ? "bg-white shadow-md ring-1 ring-slate-200 text-slate-900"
                                  : "text-slate-600 hover:bg-white hover:shadow-sm hover:text-slate-900"
                              }`}
                            >
                              <div
                                className={`p-1.5 rounded-md ${
                                  active
                                    ? `bg-gradient-to-r ${
                                        item.gradient ?? "from-slate-500 to-slate-700"
                                      } text-white shadow-sm`
                                    : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                                }`}
                              >
                                <Icon className="w-4 h-4" />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium truncate">{item.name}</span>
                                  {item.isNew && (
                                    <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded-full font-medium">
                                      New
                                    </span>
                                  )}
                                  {item.isPro && (
                                    <span className="px-1.5 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full font-medium">
                                      Pro
                                    </span>
                                  )}
                                </div>
                                {item.description && (
                                  <p className="text-xs text-slate-500 truncate">
                                    {item.description}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-1">
                                {count > 0 && (
                                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-medium">
                                    {count > 99 ? "99+" : count}
                                  </span>
                                )}
                                {item.expandable && (
                                  <ChevronRight
                                    className={`w-4 h-4 text-slate-400 transition-transform ${
                                      isExpanded ? "rotate-90" : ""
                                    }`}
                                  />
                                )}
                              </div>
                            </Link>

                            {/* Favorite Button */}
                            <button
                              type="button"
                              onClick={() => toggleFavorite(item.name)}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Star
                                className={`w-3 h-3 ${
                                  isFavorite ? "text-yellow-500 fill-current" : "text-slate-400"
                                }`}
                              />
                            </button>
                          </div>

                          {/* Sub Items */}
                          {item.expandable && isExpanded && item.subItems && (
                            <div className="ml-8 mt-1 space-y-1">
                              {item.subItems.map((subItem) => {
                                const subActive = pathname === subItem.path;
                                const SubIcon = subItem.icon;

                                return (
                                  <Link
                                    key={subItem.path}
                                    href={subItem.path}
                                    className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-all ${
                                      subActive
                                        ? "bg-blue-50 text-blue-700 font-medium"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                                    }`}
                                  >
                                    <SubIcon className="w-3 h-3" />
                                    <span className="truncate">{subItem.name}</span>
                                    {subItem.isNew && (
                                      <span className="px-1 py-0.5 text-xs bg-green-100 text-green-600 rounded font-medium">
                                        New
                                      </span>
                                    )}
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-slate-100 to-slate-50 rounded-lg">
          <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">
              {userName?.charAt(0) || userEmail?.charAt(0) || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-700 truncate">
              {userName || userEmail || "User"}
            </p>
            <p className="text-xs text-slate-500">{userRole ?? "Member"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
