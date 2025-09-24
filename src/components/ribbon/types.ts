export type RibbonContext = "dashboard" | "analytics" | "leads" | "inventory" | "settings";

export type ControlId =
  | "profile" | "notifications" | "theme" | "language"
  | "quickActions" | "bulkOps" | "saveLayout" | "share" | "export"
  | "aiTools" | "automation" | "data" | "billing" | "developer";

export type RibbonControl = {
  id: ControlId;
  group: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  render?: (args: RenderArgs) => React.ReactNode;
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
};
