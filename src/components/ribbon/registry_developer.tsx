import type { RibbonControl, ControlId } from "./types";

// Advanced Developer controls: add real navigation and feature logic
export const CONTROLS_DEVELOPER: RibbonControl[] = [
  {
    id: "apiKeys" as ControlId,
    group: "Developer",
    label: "API Keys",
    onClick: () => {
      window.location.href = "/developer/api-keys";
    }
  },
  {
    id: "webhooks" as ControlId,
    group: "Developer",
    label: "Webhooks",
    onClick: () => {
      window.location.href = "/developer/webhooks";
    }
  },
  {
    id: "customScripts" as ControlId,
    group: "Developer",
    label: "Custom Scripts",
    onClick: () => {
      window.location.href = "/developer/custom-scripts";
    }
  },
  {
    id: "appMarketplace" as ControlId,
    group: "Developer",
    label: "App Marketplace",
    onClick: () => {
      window.location.href = "/developer/app-marketplace";
    }
  },
  {
    id: "sandboxMode" as ControlId,
    group: "Developer",
    label: "Sandbox Mode",
    onClick: () => {
      window.location.href = "/developer/sandbox-mode";
    }
  },
  {
    id: "auditLogs" as ControlId,
    group: "Developer",
    label: "Audit Logs",
    onClick: () => {
      window.location.href = "/developer/audit-logs";
    }
  }
];
