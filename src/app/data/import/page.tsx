import React from "react";
import ComingSoonWrapper from "@/components/ComingSoonWrapper";

export default function DataImportPage() {
  return (
    <ComingSoonWrapper
      feature="Data Import"
      enabled={false}
      comingSoonDate="January 2026"
      description="Import data from various sources with validation and deduplication."
    >
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Data Import Features:</h2>
        <ul className="space-y-2">
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            Multiple file format support
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            Data validation and cleaning
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            Duplicate detection and merging
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            Import preview and rollback
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            Scheduled bulk imports
          </li>
        </ul>
      </div>
    </ComingSoonWrapper>
  );
}