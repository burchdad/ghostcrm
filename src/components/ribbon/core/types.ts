export type RibbonContext = "dashboard" | "analytics" | "leads" | "inventory" | "settings";

export type ControlId =
  | "profile" | "notifications" | "theme" | "language"
  | "quickActions" | "bulkOps" | "saveLayout" | "share" | "export"
  | "aiTools" | "automation" | "data" | "billing" | "developer" | "salesPerformance" | "leadConversion" | "agentActivity" | "customReportBuilder" | "exportReport" | "scheduleReports"
  | "userPreferences"
  | "workspaceSettings"
  | "notificationSettings"
  | "themeAppearance"
  | "appIntegrations"
  | "manageTeams"
  | "permissionsRoles"
  | "collaboration-comments"
  | "collaboration-chat"
  | "collaboration-workspace"
  | "collaboration-whiteboard"
  | "collaboration-meeting"
  | "collaboration-share"
  | "collaboration-mentions"
  | "collaboration-activity"
  | "collaboration-permissions"
  | "collaboration-notifications"
  // AI Controls
  | "smartSuggestions"
  | "predictiveLeadScoring"
  | "autoEmailGenerator"
  | "aiChatAssistant"
  | "dataCleanup";

export type RibbonControl = {
  id: ControlId;
  group: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  description?: string;
  submenu?: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    onClick?: () => void;
  }>;
  render?: (args: RenderArgs) => React.ReactNode;
  contexts?: RibbonContext[]; // if undefined, show in all contexts
  requires?: ControlId[]; // all of these controls must be enabled to show this one
  excludes?: ControlId[]; // if any of these controls are enabled, do not show this one
};

export type RenderArgs = {
  disabled: boolean;
  onClick?: () => void;
  state: RibbonState;
};

export type RibbonState = {
  context: RibbonContext;
  theme: "light"|"dark"|"system"|"high-contrast";
  language: "en"|"es"|"fr"|"de";
  pageEnable: Set<ControlId>;
  pageDisable: Set<ControlId>;
  userEnable: Set<ControlId>;
  userDisable: Set<ControlId>;
};
