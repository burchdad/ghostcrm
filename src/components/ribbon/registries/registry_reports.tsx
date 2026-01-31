import type { RibbonControl } from "../core/types";

// Advanced Reports controls: add real navigation and export logic
export const CONTROLS_REPORTS: RibbonControl[] = [
  {
    id: "salesPerformance",
    group: "Reports",
    label: "Sales Performance",
    onClick: () => {
      window.location.href = "/reports/sales-performance";
    }
  },
  {
    id: "leadConversion",
    group: "Reports",
    label: "Lead Conversion",
    onClick: () => {
      window.location.href = "/reports/lead-conversion";
    }
  },
  {
    id: "agentActivity",
    group: "Reports",
    label: "Agent Activity",
    onClick: () => {
      window.location.href = "/reports/agent-activity";
    }
  },
  {
    id: "customReportBuilder",
    group: "Reports",
    label: "Custom Report Builder",
    onClick: () => {
      window.location.href = "/reports/custom-builder";
    }
  },
  {
    id: "exportReport",
    group: "Reports",
    label: "Export Report",
    onClick: () => {
      window.dispatchEvent(new CustomEvent("ribbon:exportReport"));
    }
  },
  {
    id: "scheduleReports",
    group: "Reports",
    label: "Schedule Reports",
    onClick: () => {
      window.location.href = "/reports/schedule";
    }
  }
];
