import type { RibbonControl, ControlId } from "./types";

// Advanced AI controls: add real navigation and feature logic
export const CONTROLS_AI: RibbonControl[] = [
  {
    id: "smartSuggestions" as ControlId,
    group: "AI",
    label: "Smart Suggestions",
    onClick: () => {
      window.location.href = "/ai/smart-suggestions";
    }
  },
  {
    id: "predictiveLeadScoring" as ControlId,
    group: "AI",
    label: "Predictive Lead Scoring",
    onClick: () => {
      window.location.href = "/ai/predictive-lead-scoring";
    }
  },
  {
    id: "autoEmailGenerator" as ControlId,
    group: "AI",
    label: "Auto Email Generator",
    onClick: () => {
      window.location.href = "/ai/auto-email-generator";
    }
  },
  {
    id: "aiChatAssistant" as ControlId,
    group: "AI",
    label: "AI Chat Assistant",
    onClick: () => {
      window.location.href = "/ai/chat-assistant";
    }
  },
  {
    id: "dataCleanup" as ControlId,
    group: "AI",
    label: "Data Cleanup (AI-Powered)",
    onClick: () => {
      window.location.href = "/ai/data-cleanup";
    }
  }
];
