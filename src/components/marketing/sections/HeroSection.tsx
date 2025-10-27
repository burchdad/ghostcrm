import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle, TrendingUp, BarChart3, Calendar } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-container">
        <h1 className="hero-title">
          Transform Your{" "}
          <span className="hero-gradient-text">
            Automotive Sales
          </span>
          <div className="hero-subtitle">
            Streamline your dealership operations, boost sales by 40%, and deliver exceptional customer experiences with Ghost Auto CRM.
          </div>
        </h1>

        <div className="hero-cta-group">
          <Link
            href="/register"
            className="hero-cta-primary"
          >
            Start Free Trial
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>

          <a
            href="#demo"
            className="hero-cta-secondary"
          >
            Watch Demo
            <ArrowRight className="w-5 h-5 ml-2" />
          </a>
        </div>

        <div className="hero-features-list">
          <div className="hero-feature-item">
            <CheckCircle className="w-4 h-4 text-green-500" />
            14-day free trial
          </div>
          <div className="hero-feature-item">
            <CheckCircle className="w-4 h-4 text-green-500" />
            No setup fees
          </div>
          <div className="hero-feature-item">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Cancel anytime
          </div>
        </div>
      </div>

      {/* Interactive Dashboard Preview */}
      <div className="mt-16 relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="dashboard-mockup">
          <div className="browser-header">
            <div className="browser-controls">
              <div className="browser-dot bg-red-500" />
              <div className="browser-dot bg-yellow-500" />
              <div className="browser-dot bg-green-500" />
            </div>
            <div className="browser-url">
              <span className="url-text">app.ghostautocrm.com</span>
            </div>
          </div>

          <div className="dashboard-content">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="dashboard-card">
                <div className="dashboard-card-header">
                  <h3 className="dashboard-card-title">Active Leads</h3>
                  <div className="dashboard-card-icon bg-green-100">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <div className="dashboard-card-value">247</div>
                <div className="dashboard-card-trend text-green-600">+12% this month</div>
              </div>

              <div className="dashboard-card">
                <div className="dashboard-card-header">
                  <h3 className="dashboard-card-title">Sales Pipeline</h3>
                  <div className="dashboard-card-icon bg-blue-100">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="dashboard-card-value">$2.4M</div>
                <div className="dashboard-card-trend text-blue-600">85% close rate</div>
              </div>

              <div className="dashboard-card">
                <div className="dashboard-card-header">
                  <h3 className="dashboard-card-title">Follow-ups Due</h3>
                  <div className="dashboard-card-icon bg-purple-100">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                <div className="dashboard-card-value">18</div>
                <div className="dashboard-card-trend text-purple-600">Today</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="scroll-indicator">
        <div className="flex flex-col items-center">
          <span className="text-white/70 text-sm mb-2">Scroll to explore</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white/70">
            <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </section>
  );
}