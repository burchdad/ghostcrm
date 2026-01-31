import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
  return (
    <section className="cta-section">
      <div className="cta-container">
        <div className="cta-content">
          <h2 className="cta-title">
            Ready to Transform Your Dealership?
          </h2>
          <p className="cta-subtitle">
            Join thousands of successful dealerships using Ghost CRM. Start your free trial today - no credit card required.
          </p>
          
          <div className="cta-buttons">
            <Link href="/register" className="cta-primary">
              Start Free Trial
              <ArrowRight className="cta-icon" />
            </Link>
            <Link href="/pricing" className="cta-secondary">
              View Pricing
            </Link>
          </div>
          
          <p className="cta-features">
            14-day free trial • No setup fees • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}