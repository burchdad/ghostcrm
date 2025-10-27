// Main components barrel export
// Re-export from organized directories

// Layout components
export * from "./layout";

// Navigation components
export * from "./navigation";

// Modal components
export * from "./modals";

// Dashboard components
export * from "./dashboards";

// Onboarding components
export * from "./onboarding";

// Feedback components
export * from "./feedback";

// Utility components
export * from "./utils";

// Global components
export * from "./global";

// Ribbon system
export * from "./ribbon";

// UI primitives
export { /* other UI exports except Modal and ToastProvider */ } from "./ui";
export { Modal } from "./modals";
export { ToastProvider } from "./utils";

// Legacy exports for compatibility
// These will be removed in future versions
export { default as CollapseLayout } from "./layout/CollapseLayout";
export { default as ConditionalLayout } from "./layout/ConditionalLayout";
export { default as UnifiedToolbar } from "./navigation/UnifiedToolbar";
export { default as ComingSoonWrapper } from "./feedback/ComingSoonWrapper";