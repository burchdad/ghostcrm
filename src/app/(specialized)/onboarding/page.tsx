import React from "react";
import ClientOnboardingPage from "./client-onboarding";
import OnboardingGuard from "@/components/onboarding/OnboardingGuard";

export default function OnboardingPage() {
  return (
    <OnboardingGuard requireCompleted={false}>
      <ClientOnboardingPage />
    </OnboardingGuard>
  );
}
