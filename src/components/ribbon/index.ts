// Main exports for the ribbon system
export { default as Ribbon } from "./core/Ribbon";
export { RibbonProvider } from "./providers/RibbonProvider";
export { useContextualRibbon } from "./providers/ContextualRibbon";
export { default as useRibbonPage } from "./providers/useRibbonPage";

// Registry exports
export * from "./registries/registry";

// Types
export type * from "./core/types";