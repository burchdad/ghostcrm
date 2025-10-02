import type { RibbonControl, ControlId } from "./types";

// Advanced Edit controls: add real undo/redo, clipboard, and selection logic
export const CONTROLS_EDIT: RibbonControl[] = [
  {
  id: "undo" as ControlId,
    group: "Edit",
    label: "Undo",
    onClick: () => {
      // Advanced undo logic (could integrate with app state)
      window.dispatchEvent(new CustomEvent("ribbon:undo"));
    }
  },
  {
  id: "redo" as ControlId,
    group: "Edit",
    label: "Redo",
    onClick: () => {
      window.dispatchEvent(new CustomEvent("ribbon:redo"));
    }
  },
  {
  id: "cut" as ControlId,
    group: "Edit",
    label: "Cut",
    onClick: () => {
      window.dispatchEvent(new CustomEvent("ribbon:cut"));
    }
  },
  {
  id: "copy" as ControlId,
    group: "Edit",
    label: "Copy",
    onClick: () => {
      window.dispatchEvent(new CustomEvent("ribbon:copy"));
    }
  },
  {
  id: "paste" as ControlId,
    group: "Edit",
    label: "Paste",
    onClick: () => {
      window.dispatchEvent(new CustomEvent("ribbon:paste"));
    }
  },
  {
  id: "duplicate" as ControlId,
    group: "Edit",
    label: "Duplicate",
    onClick: () => {
      window.dispatchEvent(new CustomEvent("ribbon:duplicate"));
    }
  },
  {
  id: "delete" as ControlId,
    group: "Edit",
    label: "Delete",
    onClick: () => {
      window.dispatchEvent(new CustomEvent("ribbon:delete"));
    }
  },
  {
  id: "rename" as ControlId,
    group: "Edit",
    label: "Rename",
    onClick: () => {
      window.dispatchEvent(new CustomEvent("ribbon:rename"));
    }
  },
  {
  id: "selectAll" as ControlId,
    group: "Edit",
    label: "Select All",
    onClick: () => {
      window.dispatchEvent(new CustomEvent("ribbon:selectAll"));
    }
  },
  {
  id: "deselect" as ControlId,
    group: "Edit",
    label: "Deselect",
    onClick: () => {
      window.dispatchEvent(new CustomEvent("ribbon:deselect"));
    }
  }
];
