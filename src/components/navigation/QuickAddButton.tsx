"use client";
import React, { useState } from "react";
import { Plus } from "lucide-react";
import QuickAddModal from "@/components/modals/QuickAddModal";
import { useI18n } from "@/components/utils/I18nProvider";
import "./QuickAddButton.css";

export default function QuickAddButton() {
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const { t } = useI18n();

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+N or Cmd+N to toggle
      if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault();
        setShowQuickAdd(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* Quick Add Button - floating button */}
      <button 
        onClick={() => setShowQuickAdd(true)}
        className="quick-add-button"
        title={t("Quick Add (Ctrl+N)", "actions")}
        aria-label="Quick Add - Create new records (Ctrl+N)"
      >
        <Plus />
        <span className="sr-only">Quick Add</span>
      </button>

      {/* Quick Add Modal */}
      <QuickAddModal 
        isOpen={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
      />
    </>
  );
}