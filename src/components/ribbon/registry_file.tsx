import type { RibbonControl, ControlId } from "./types";

// Advanced File controls: add real navigation, file actions, and export logic
export const CONTROLS_FILE: RibbonControl[] = [
  {
  id: "newProject" as ControlId,
    group: "File",
    label: "New Project / Campaign / Deal",
    onClick: () => {
      window.location.href = "/file/new";
    }
  },
  {
  id: "save" as ControlId,
    group: "File",
    label: "Save",
    onClick: () => {
      window.dispatchEvent(new CustomEvent("ribbon:save"));
    }
  },
  {
  id: "saveAsTemplate" as ControlId,
    group: "File",
    label: "Save As Template",
    onClick: () => {
      window.dispatchEvent(new CustomEvent("ribbon:saveAsTemplate"));
    }
  },
  {
  id: "importExport" as ControlId,
    group: "File",
    label: "Import / Export Data",
    onClick: () => {
      window.location.href = "/file/import-export";
    }
  },
  {
  id: "printDownload" as ControlId,
    group: "File",
    label: "Print / Download PDF",
    onClick: () => {
      window.dispatchEvent(new CustomEvent("ribbon:printDownloadPDF"));
    }
  },
  {
  id: "closeExit" as ControlId,
    group: "File",
    label: "Close / Exit",
    onClick: () => {
      window.dispatchEvent(new CustomEvent("ribbon:closeExit"));
    }
  }
];
