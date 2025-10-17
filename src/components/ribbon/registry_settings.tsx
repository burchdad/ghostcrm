import type { RibbonControl } from "./types";

// Advanced Settings controls: add real navigation, modal, and feature logic
export const CONTROLS_SETTINGS: RibbonControl[] = [
  {
    id: "userPreferences",
    group: "Settings",
    label: "User Preferences",
    onClick: () => {
      window.location.href = "/settings/preferences";
    }
  },
  {
    id: "workspaceSettings",
    group: "Settings",
    label: "Workspace Settings",
    onClick: () => {
      window.location.href = "/settings/workspace";
    }
  },
  {
    id: "notificationSettings",
    group: "Settings",
    label: "Notification Settings",
    onClick: () => {
      window.location.href = "/settings/notifications";
    }
  },
  {
    id: "themeAppearance",
    group: "Settings",
    label: "Theme/Appearance",
    onClick: () => {
      window.location.href = "/settings/theme";
    }
  },
  {
    id: "appIntegrations",
    group: "Settings",
    label: "App Integrations",
    onClick: () => {
      window.location.href = "/settings/integrations";
    }
  },
  {
    id: "manageTeams",
    group: "Settings",
    label: "Manage Teams",
    onClick: () => {
      window.location.href = "/settings/teams";
    }
  },
  {
    id: "permissionsRoles",
    group: "Settings",
    label: "Permissions / Roles",
    onClick: () => {
      window.location.href = "/settings/roles";
    }
  }
];
