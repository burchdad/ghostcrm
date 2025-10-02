import { Bell, User, Globe, Save, Share2, Download, Sparkles, Shuffle, Database, CreditCard, Wrench } from "lucide-react";
import type { RibbonControl } from "./types";

export const CONTROLS: RibbonControl[] = [
  // Home
  {
    id: "quickActions",
    group: "Home",
    label: "Dashboard",
    onClick: () => {
      window.location.href = "/dashboard";
    }
  },
  {
    id: "bulkOps",
    group: "Home",
    label: "Activity Feed",
    onClick: () => {
      window.location.href = "/collaboration/real-time";
    }
  },
  {
    id: "quickActions",
    group: "Home",
    label: "Recent Records",
    onClick: () => {
      window.location.href = "/dashboard?page=recent";
    }
  },
  {
    id: "aiTools",
    group: "Home",
    label: "Help / Tour",
    onClick: () => {
      window.location.href = "/onboarding/guided-tours";
    }
  }
];
