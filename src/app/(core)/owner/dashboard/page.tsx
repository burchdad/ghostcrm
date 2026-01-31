"use client";

import { I18nProvider } from "@/components/utils/I18nProvider";
import { ToastProvider } from "@/components/utils/ToastProvider";
import SoftwareOwnerDashboard from "@/components/owner/SoftwareOwnerDashboard";

export default function OwnerDashboardPage() {
  return (
    <I18nProvider>
      <ToastProvider>
        <SoftwareOwnerDashboard />
      </ToastProvider>
    </I18nProvider>
  );
}