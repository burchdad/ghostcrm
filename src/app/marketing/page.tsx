// app/marketing/page.tsx
import React from "react";
import HeroSection from "@/components/marketing/sections/HeroSection";
import FeaturesGrid from "@/components/marketing/sections/FeaturesGrid";
import StatsSection from "@/components/marketing/sections/StatsSection";
import TestimonialsSection from "@/components/marketing/sections/TestimonialsSection";
import CTASection from "@/components/marketing/sections/CTASection";

export const runtime = "nodejs";

export default function MarketingHomePage() {
  return (
    <div className="bg-white">
      <HeroSection />
      <FeaturesGrid />
      <StatsSection />
      <TestimonialsSection />
      <CTASection />
    </div>
  );
}
