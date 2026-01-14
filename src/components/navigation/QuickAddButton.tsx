"use client";
import React, { useState } from "react";
import { Plus } from "lucide-react";
import QuickAddModal from "@/components/modals/QuickAddModal";
import { useI18n } from "@/components/utils/I18nProvider";
import { useRouter, usePathname } from "next/navigation";
import "./QuickAddButton.css";

export default function QuickAddButton() {
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname(); // Use Next.js hook for pathname

  // Simplified logic: show for most pages except marketing/auth/billing
  const shouldShowButton = React.useMemo(() => {
    if (typeof window === 'undefined') return false; // SSR
    
    // Use pathname from hook instead of window.location.pathname
    console.log('🔍 [QuickAddButton] Checking pathname:', pathname);
    
    // Don't show on marketing pages, auth pages, or billing pages
    if (pathname === '/' || 
        pathname === '/login' || 
        pathname === '/register' || 
        pathname === '/billing' ||
        pathname.startsWith('/billing/') ||  // <- Include all billing subpages
        pathname === '/reset-password' ||
        pathname === '/unauthorized' ||
        pathname.includes('/marketing')) {
      console.log('🔍 [QuickAddButton] Should NOT show on:', pathname);
      return false;
    }
    
    // Show on all other pages (leads, dashboard, etc.)
    console.log('🔍 [QuickAddButton] Should show on:', pathname);
    return true;
  }, [pathname]); // Add pathname as dependency

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