"use client";
import React, { useEffect, useRef, useState } from "react";
import { RibbonGroup } from "./ribbon/RibbonGroup";

// Hook: click outside to close
function useOutsideClick(ref: React.RefObject<HTMLElement>, callback: () => void) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, callback]);
}
import {
  FileIcon,
  Edit3Icon,
  BarChartIcon,
  SettingsIcon,
  EyeIcon,
  CpuIcon,
  ZapIcon,
  DatabaseIcon,
  ShieldIcon,
  CreditCardIcon,
  CodeIcon,
  HomeIcon,
} from "lucide-react";

type RibbonAction = {
  label: string;
  onClick: () => void;
};

type RibbonGroup = {
  title: string;
  icon?: React.ReactNode;
  allowedRoles: string[];
  actions: RibbonAction[];
};

// TODO: Replace with dynamic role from auth/store
const userRole = "admin";

const ribbonGroups: RibbonGroup[] = [
  {
    title: "Home",
    icon: <HomeIcon size={16} />,
    allowedRoles: ["admin", "manager", "analyst", "developer", "viewer"],
    actions: [
      { label: "Go to Dashboard", onClick: () => window.location.href = "/dashboard" },
      { label: "Go to Workspace", onClick: () => window.location.href = "/workspace" },
      { label: "Logout", onClick: () => alert("Logging out...") }
    ]
  },
  {
    title: "File",
    icon: <FileIcon size={16} />,
    allowedRoles: ["admin", "manager", "analyst", "developer", "viewer"],
    actions: [
      { label: "New Workspace", onClick: () => alert("Creating workspace...") },
      { label: "Save Dashboard", onClick: () => alert("Saving...") },
      { label: "Save as Template", onClick: () => alert("Template saved!") },
      { label: "Download PDF", onClick: () => alert("Downloading PDF...") },
      { label: "Export CSV", onClick: () => alert("Exporting CSV...") }
    ]
  },
  {
    title: "Edit",
    icon: <Edit3Icon size={16} />,
    allowedRoles: ["admin", "manager", "analyst", "developer", "viewer"],
    actions: [
      { label: "Undo", onClick: () => alert("Undo") },
      { label: "Redo", onClick: () => alert("Redo") },
      { label: "Reset Layout", onClick: () => alert("Resetting layout...") },
      { label: "Toggle High Contrast", onClick: () => alert("High contrast toggled") },
      { label: "Manage Widgets", onClick: () => alert("Managing widgets") }
    ]
  },
  {
    title: "Reports",
    icon: <BarChartIcon size={16} />,
    allowedRoles: ["admin", "manager", "analyst", "viewer"],
    actions: [
      { label: "Export Full Report", onClick: () => alert("Exporting...") },
      { label: "Share Report", onClick: () => alert("Sharing...") },
      { label: "Download Snapshot", onClick: () => alert("Snapshot ready") },
      { label: "Schedule Weekly Report", onClick: () => alert("Scheduling...") }
    ]
  },
  {
    title: "Settings",
    icon: <SettingsIcon size={16} />,
    allowedRoles: ["admin", "developer", "manager"],
    actions: [
      { label: "Profile", onClick: () => alert("Opening profile...") },
      { label: "Theme", onClick: () => alert("Switching theme...") },
      { label: "Language", onClick: () => alert("Changing language...") },
      { label: "API Keys", onClick: () => alert("Opening API keys...") },
      { label: "Notifications", onClick: () => alert("Notification preferences") }
    ]
  },
  {
    title: "View",
    icon: <EyeIcon size={16} />,
    allowedRoles: ["admin", "manager", "analyst", "developer", "viewer"],
    actions: [
      { label: "Toggle Sidebar", onClick: () => alert("Toggling sidebar...") },
      { label: "Toggle Chat Panel", onClick: () => alert("Chat panel toggled") },
      { label: "Switch Layout Mode", onClick: () => alert("Switched layout mode") },
      { label: "Zoom In", onClick: () => alert("Zoom in") },
      { label: "Zoom Out", onClick: () => alert("Zoom out") },
      { label: "Fullscreen Mode", onClick: () => alert("Toggled fullscreen") },
      { label: "Refresh View", onClick: () => window.location.reload() }
    ]
  },
  {
    title: "AI Tools",
    icon: <CpuIcon size={16} />,
    allowedRoles: ["admin", "manager", "analyst", "developer"],
    actions: [
      { label: "Launch AI Assistant", onClick: () => alert("Opening AI assistant...") },
      { label: "Predict Lead Quality", onClick: () => alert("Predicting...") },
      { label: "Generate Email Script", onClick: () => alert("Generating email...") },
      { label: "Smart Summary", onClick: () => alert("Summarizing...") }
    ]
  },
  {
    title: "Automation",
    icon: <ZapIcon size={16} />,
    allowedRoles: ["admin", "manager", "developer"],
    actions: [
      { label: "Manage Automations", onClick: () => alert("Managing...") },
      { label: "Create New Workflow", onClick: () => alert("New flow...") },
      { label: "View Trigger Logs", onClick: () => alert("Viewing logs...") },
      { label: "Pause All Bots", onClick: () => alert("Pausing bots...") }
    ]
  },
  {
    title: "Data",
    icon: <DatabaseIcon size={16} />,
    allowedRoles: ["admin", "developer", "analyst"],
    actions: [
      { label: "Import CSV", onClick: () => alert("Importing...") },
      { label: "Sync Google Sheets", onClick: () => alert("Syncing...") },
      { label: "View Raw JSON", onClick: () => alert("Opening raw data...") },
      { label: "Rebuild Index", onClick: () => alert("Rebuilding...") }
    ]
  },
  {
    title: "Security",
    icon: <ShieldIcon size={16} />,
    allowedRoles: ["admin", "compliance"],
    actions: [
      { label: "Access Logs", onClick: () => alert("Viewing access logs...") },
      { label: "MFA Settings", onClick: () => alert("Opening MFA settings...") },
      { label: "Permissions", onClick: () => alert("User permissions...") },
      { label: "Blocklist", onClick: () => alert("Editing blocklist...") }
    ]
  },
  {
    title: "Billing",
    icon: <CreditCardIcon size={16} />,
    allowedRoles: ["admin"],
    actions: [
      { label: "View Subscription", onClick: () => alert("Opening subscription...") },
      { label: "Payment Methods", onClick: () => alert("Editing payment methods...") },
      { label: "Invoices", onClick: () => alert("Viewing invoices...") },
      { label: "Upgrade Plan", onClick: () => alert("Upgrading plan...") }
    ]
  },
  {
    title: "Developer",
    icon: <CodeIcon size={16} />,
    allowedRoles: ["admin", "developer"],
    actions: [
      { label: "API Console", onClick: () => alert("API Console...") },
      { label: "API Docs", onClick: () => window.open("/docs", "_blank") },
      { label: "Webhooks", onClick: () => alert("Webhook settings...") },
      { label: "Tokens", onClick: () => alert("Access tokens...") },
      { label: "Sandbox Mode", onClick: () => alert("Sandbox toggled") }
    ]
  }
];

export default function GlobalBar() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Track refs for outside click
  const groupRefs = useRef<Record<string, HTMLDivElement | null>>({});
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      Object.entries(groupRefs.current).forEach(([title, ref]) => {
        if (ref && !ref.contains(event.target as Node) && openDropdown === title) {
          setOpenDropdown(null);
        }
      });
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdown]);

  return (
    <div className="w-full flex flex-wrap gap-3 text-sm items-center">
      {ribbonGroups
        .filter(group => group.allowedRoles.includes(userRole))
        .map(group => {
          const isOpen = openDropdown === group.title;
          return (
            <RibbonGroup
              key={group.title}
              title={group.title}
              icon={group.icon}
              actions={group.actions}
              isOpen={isOpen}
              onOpen={() => setOpenDropdown(group.title)}
              onClose={() => setOpenDropdown(null)}
              ref={el => { groupRefs.current[group.title] = el; }}
            />
          );
        })}
    </div>
  );
}
