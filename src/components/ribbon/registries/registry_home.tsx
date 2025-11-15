import { Bell, User, Globe, Save, Share2, Download, Sparkles, Shuffle, Database, CreditCard, Wrench } from "lucide-react";
import type { RibbonControl } from "../core/types";

// Helper function to get tenant-aware route based on user role
function getTenantRoute(user: any, basePath: string): string {
  if (!user || !user.role) return basePath;
  
  const roleMapping: Record<string, string> = {
    'owner': 'tenant-owner',
    'admin': 'tenant-owner', // Admin can access owner routes
    'manager': 'tenant-salesmanager',
    'sales_rep': 'tenant-salesrep',
    'user': 'tenant-salesrep' // Default users to sales rep level
  };
  
  const tenantPrefix = roleMapping[user.role] || 'tenant-salesrep';
  return `/${tenantPrefix}${basePath}`;
}

export const CONTROLS: RibbonControl[] = [
  // Home
  {
    id: "quickActions",
    group: "Home",
    label: "Dashboard",
    onClick: (user?: any) => {
      const route = getTenantRoute(user, "/dashboard");
      window.location.href = route;
    }
  },
  {
    id: "bulkOps",
    group: "Home", 
    label: "Activity Feed",
    onClick: (user?: any) => {
      // Fallback to analytics page since collaboration routes don't exist yet
      const route = getTenantRoute(user, "/analytics");
      window.location.href = route;
    }
  },
  {
    id: "quickActions",
    group: "Home",
    label: "Recent Records",
    onClick: (user?: any) => {
      const route = getTenantRoute(user, "/dashboard");
      window.location.href = `${route}?page=recent`;
    }
  },
  {
    id: "aiTools",
    group: "Home",
    label: "Help / Tour",
    onClick: (user?: any) => {
      // Fallback to settings page since onboarding routes don't exist yet
      const route = getTenantRoute(user, "/settings");
      window.location.href = route;
    }
  }
];
