"use client";
import React, { useState } from "react";
import { Plus } from "lucide-react";
import QuickAddModal from "@/components/modals/QuickAddModal";
import { useI18n } from "@/components/utils/I18nProvider";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function QuickAddButton() {
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const { t } = useI18n();
  const { user } = useAuth();
  const router = useRouter();

  // Simplified logic: show for most pages except marketing/auth
  const shouldShowButton = React.useMemo(() => {
    if (typeof window === 'undefined') return false; // SSR
    
    const pathname = window.location.pathname;
    
    // Don't show on marketing pages or auth pages
    if (pathname === '/' || pathname === '/login' || pathname === '/register' || pathname.includes('/marketing')) {
      return false;
    }
    
    // Show on all other pages (leads, dashboard, etc.)
    return true;
  }, []);

  // Don't render if shouldn't show
  if (!shouldShowButton) {
    return null;
  }

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
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Quick Add Modal */}
      <QuickAddModal 
        isOpen={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
      />
    </>
  );
}