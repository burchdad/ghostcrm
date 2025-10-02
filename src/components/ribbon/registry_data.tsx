import type { RibbonControl, ControlId } from "./types";

// Advanced Data controls: add real navigation and feature logic
export const CONTROLS_DATA: RibbonControl[] = [
  {
    id: "viewAllRecords" as ControlId,
    group: "Data",
    label: "View All Records",
    onClick: () => {
      window.location.href = "/data/view-all-records";
    }
  },
  {
    id: "leadImportExport" as ControlId,
    group: "Data",
    label: "Lead Import / Export",
    onClick: () => {
      window.location.href = "/data/lead-import-export";
    }
  },
  {
    id: "dataMapping" as ControlId,
    group: "Data",
    label: "Data Mapping",
    onClick: () => {
      window.location.href = "/data/mapping";
    }
  },
  {
    id: "dataValidation" as ControlId,
    group: "Data",
    label: "Data Validation",
    onClick: () => {
      window.location.href = "/data/validation";
    }
  },
  {
    id: "backupsSync" as ControlId,
    group: "Data",
    label: "Backups & Sync",
    onClick: () => {
      window.location.href = "/data/backups-sync";
    }
  },
  {
    id: "dataDeduplication" as ControlId,
    group: "Data",
    label: "Data Deduplication",
    onClick: () => {
      window.location.href = "/data/deduplication";
    }
  }
];
