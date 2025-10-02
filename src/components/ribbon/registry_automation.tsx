import type { RibbonControl, ControlId } from "./types";

// Advanced Automation controls: add real navigation and feature logic
export const CONTROLS_AUTOMATION: RibbonControl[] = [
  {
    id: "workflowBuilder" as ControlId,
    group: "Automation",
    label: "Workflow Builder",
    onClick: () => {
      window.location.href = "/automation/workflow-builder";
    }
  },
  {
    id: "triggerSettings" as ControlId,
    group: "Automation",
    label: "Trigger Settings",
    onClick: () => {
      window.location.href = "/automation/trigger-settings";
    }
  },
  {
    id: "dripCampaigns" as ControlId,
    group: "Automation",
    label: "Drip Campaigns",
    onClick: () => {
      window.location.href = "/automation/drip-campaigns";
    }
  },
  {
    id: "assignRules" as ControlId,
    group: "Automation",
    label: "Assign Rules",
    onClick: () => {
      window.location.href = "/automation/assign-rules";
    }
  },
  {
    id: "emailSequences" as ControlId,
    group: "Automation",
    label: "Email Sequences",
    onClick: () => {
      window.location.href = "/automation/email-sequences";
    }
  },
  {
    id: "autoTasks" as ControlId,
    group: "Automation",
    label: "Auto Tasks",
    onClick: () => {
      window.location.href = "/automation/auto-tasks";
    }
  }
];
