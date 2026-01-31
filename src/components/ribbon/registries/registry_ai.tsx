import type { RibbonControl, ControlId } from "../core/types";

// Advanced AI controls: add real navigation and feature logic
// Create contextual AI controls based on current page
const getContextualAIControls = (): RibbonControl[] => {
  // Check if we're on the client side
  if (typeof window === 'undefined') {
    return [];
  }
  
  const currentPath = window.location.pathname;
  const controls: RibbonControl[] = [];

  // Smart Suggestions - available on dashboard and main pages
  if (currentPath.includes('/dashboard') || currentPath.includes('/deals') || currentPath.includes('/leads')) {
    controls.push({
      id: "smartSuggestions" as ControlId,
      group: "AI",
      label: "Smart Suggestions",
      onClick: () => {
        window.dispatchEvent(new CustomEvent("ribbon:aiSuggestions"));
      }
    });
  }

  // Lead Scoring - ONLY on leads page
  if (currentPath.includes('/leads')) {
    controls.push({
      id: "predictiveLeadScoring" as ControlId,
      group: "AI", 
      label: "Lead Scoring",
      onClick: () => {
        window.dispatchEvent(new CustomEvent("ribbon:leadScoring"));
      }
    });
  }

  // Email Generator - available where it makes sense
  if (currentPath.includes('/leads') || currentPath.includes('/deals')) {
    controls.push({
      id: "autoEmailGenerator" as ControlId,
      group: "AI",
      label: "Email Generator", 
      onClick: () => {
        window.dispatchEvent(new CustomEvent("ribbon:emailGenerator"));
      }
    });
  }

  // Data Cleanup - available on data-heavy pages
  if (currentPath.includes('/dashboard') || currentPath.includes('/leads') || currentPath.includes('/deals')) {
    controls.push({
      id: "dataCleanup" as ControlId,
      group: "AI",
      label: "Data Cleanup",
      onClick: () => {
        window.dispatchEvent(new CustomEvent("ribbon:dataCleanup"));
      }
    });
  }

  return controls;
};

// Export as a function to be called when needed on client side
export const getAIControls = (): RibbonControl[] => getContextualAIControls();

// For backward compatibility, provide empty array for server-side
export const CONTROLS_AI: RibbonControl[] = [];
