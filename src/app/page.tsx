// Root marketing page - fully functional with all sections

import MarketingHeader from '@/components/marketing/MarketingHeader'
import HeroSection from '@/components/marketing/sections/HeroSection'
import FeaturesGrid from '@/components/marketing/sections/FeaturesGrid'
import StatsSection from '@/components/marketing/sections/StatsSection'
import TestimonialsSection from '@/components/marketing/sections/TestimonialsSection'
import CTASection from '@/components/marketing/sections/CTASection'

export default function MarketingHomePage() {
  return (
    <main className="marketing-page">
      <MarketingHeader />
      <HeroSection />
      
      {/* Smooth transition to features */}
      <div className="section-transition"></div>
      
      <FeaturesGrid />
      
      {/* Elegant divider */}
      <div className="section-divider">
        <div className="divider-line"></div>
      </div>
      
      <StatsSection />
      
      {/* Elegant divider */}
      <div className="section-divider">
        <div className="divider-line"></div>
      </div>
      
      <TestimonialsSection />
      
      {/* Elegant divider */}
      <div className="section-divider">
        <div className="divider-line"></div>
      </div>
      
      <CTASection />
    </main>
  )
}
