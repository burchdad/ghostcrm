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
            Cancel anytime
          </div>
        </div>
      </div>

      {/* Interactive Dashboard Preview */}
      <div className="dashboard-preview-container">
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
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <div className="dashboard-card-header">
                  <h3 className="dashboard-card-title">Active Leads</h3>
                  <div className="dashboard-card-icon bg-green-100">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <div className="dashboard-card-value">1,247</div>
                <div className="dashboard-card-trend text-green-600">+23% this month</div>
              </div>

              <div className="dashboard-card">
                <div className="dashboard-card-header">
                  <h3 className="dashboard-card-title">Monthly Revenue</h3>
                  <div className="dashboard-card-icon bg-blue-100">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="dashboard-card-value">$847K</div>
                <div className="dashboard-card-trend text-blue-600">92% close rate</div>
              </div>

              <div className="dashboard-card">
                <div className="dashboard-card-header">
                  <h3 className="dashboard-card-title">Appointments Today</h3>
                  <div className="dashboard-card-icon bg-purple-100">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                <div className="dashboard-card-value">34</div>
                <div className="dashboard-card-trend text-purple-600">8 confirmed</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="scroll-indicator">
        <div className="scroll-indicator-content">
          <span className="scroll-text">Scroll to explore</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="scroll-icon">
            <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </section>
  );
}