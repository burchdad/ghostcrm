import type { RibbonControl } from "../core/types";

export const CONTROLS_COLLABORATION: RibbonControl[] = [
  {
    id: "collaboration-comments",
    group: "Collaboration",
    label: "Comments",
    icon: "💬",
    onClick: () => {
      // This will be handled by the parent component
      console.log("Open collaboration panel");
    },
    description: "View and add comments to this record"
  },
  {
    id: "collaboration-chat",
    group: "Collaboration", 
    label: "Team Chat",
    icon: "👥",
    onClick: () => {
      // This will be handled by the parent component
      console.log("Open team chat");
    },
    description: "Open team chat for real-time messaging"
  },
  {
    id: "collaboration-workspace",
    group: "Collaboration",
    label: "Shared Docs",
    icon: "📝",
    onClick: () => {
      // This will be handled by the parent component
      console.log("Open shared workspace");
    },
    description: "Access shared documents and collaborative editing"
  },
  {
    id: "collaboration-whiteboard",
    group: "Collaboration",
    label: "Whiteboard",
    icon: "🎨",
    onClick: () => {
      // This will be handled by the parent component
      console.log("Open collaborative whiteboard");
    },
    description: "Open collaborative whiteboard for visual brainstorming"
  },
  {
    id: "collaboration-meeting",
    group: "Collaboration",
    label: "Start Meeting",
    icon: "🎥",
    onClick: () => {
      console.log("Start video meeting");
    },
    description: "Start a video meeting with team members"
  },
  {
    id: "collaboration-share",
    group: "Collaboration", 
    label: "Share Record",
    icon: "🔗",
    submenu: [
      {
        id: "share-team",
        label: "Share with Team",
        onClick: () => console.log("Share with team")
      },
      {
        id: "share-link",
        label: "Generate Public Link", 
        onClick: () => console.log("Generate public link")
      },
      {
        id: "share-email",
        label: "Email Record",
        onClick: () => console.log("Email record")
      },
      {
        id: "share-pdf",
        label: "Export as PDF",
        onClick: () => console.log("Export as PDF")
      }
    ],
    description: "Share this record with others"
  },
  {
    id: "collaboration-mentions",
    group: "Collaboration",
    label: "@Mentions",
    icon: "📣",
    onClick: () => {
      console.log("View mentions");
    },
    description: "View all mentions and notifications"
  },
  {
    id: "collaboration-activity",
    group: "Collaboration",
    label: "Activity Feed",
    icon: "📈",
    onClick: () => {
      console.log("View activity feed");
    },
    description: "View recent activity and changes"
  },
  {
    id: "collaboration-permissions",
    group: "Collaboration",
    label: "Permissions",
    icon: "🔒",
    submenu: [
      {
        id: "perm-access",
        label: "Manage Access",
        onClick: () => console.log("Manage access")
      },
      {
        id: "perm-roles",
        label: "User Roles",
        onClick: () => console.log("Configure user roles")
      },
      {
        id: "perm-sharing",
        label: "Sharing Settings",
        onClick: () => console.log("Configure sharing settings")
      },
      {
        id: "perm-privacy",
        label: "Privacy Controls",
        onClick: () => console.log("Configure privacy controls")
      }
    ],
    description: "Manage collaboration permissions and access"
  },
  {
    id: "collaboration-notifications",
    group: "Collaboration",
    label: "Notifications",
    icon: "🔔",
    submenu: [
      {
        id: "notif-follow",
        label: "Follow Record",
        onClick: () => console.log("Follow record")
      },
      {
        id: "notif-unfollow",
        label: "Unfollow Record", 
        onClick: () => console.log("Unfollow record")
      },
      {
        id: "notif-settings",
        label: "Notification Settings",
        onClick: () => console.log("Configure notifications")
      },
      {
        id: "notif-digest",
        label: "Digest Settings",
        onClick: () => console.log("Configure digest settings")
      }
    ],
    description: "Manage notifications for this record"
  }
];
