// Root page - serves marketing content via middleware rewrite
// The middleware rewrites "/" to "/marketing" so this acts as a fallback
import HeroSection from '@/components/marketing/sections/HeroSection';
import FeaturesGrid from '@/components/marketing/sections/FeaturesGrid';
import StatsSection from '@/components/marketing/sections/StatsSection';
import TestimonialsSection from '@/components/marketing/sections/TestimonialsSection';
import CTASection from '@/components/marketing/sections/CTASection';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <HeroSection />
      <FeaturesGrid />
      <StatsSection />
      <TestimonialsSection />
      <CTASection />
    </main>
  );
}
