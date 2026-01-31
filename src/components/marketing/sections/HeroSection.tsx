"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle, TrendingUp, BarChart3, Calendar, LogIn } from "lucide-react";
import { isSubdomain, extractSubdomain } from '@/lib/utils/environment';

export default function HeroSection() {
  const [isOnSubdomain, setIsOnSubdomain] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const onSubdomain = isSubdomain();
    const subdomain = extractSubdomain();
    let formattedName = '';
    
    setIsOnSubdomain(onSubdomain);
    
    if (onSubdomain && subdomain) {
      // Convert subdomain to company name (e.g., "burchmotors" -> "Burch Motors")
      formattedName = subdomain
        .split(/(?=[A-Z])/) // Split on capital letters
        .join(' ')
        .split(/[\s-_]+/) // Split on spaces, hyphens, underscores
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      
      setCompanyName(formattedName);
    }

    console.log('🏠 [HeroSection] Domain check:', {
      hostname: typeof window !== 'undefined' ? window.location.hostname : 'server',
      isSubdomain: onSubdomain,
      subdomain,
      companyName: formattedName
    });
  }, []);

  // Subdomain (tenant) version
  if (isOnSubdomain) {
    return (
      <section className="hero-section">
        <div className="hero-container">
          <h1 className="hero-title">
            Welcome to{" "}
            <span className="hero-gradient-text">
              {companyName}
            </span>
          </h1>
          <div className="hero-subtitle">
            Access your dealership's CRM dashboard to manage leads, track sales, and connect with customers.
          </div>

          <div className="hero-cta-group">
            <Link
              href="/login"
              className="hero-cta-primary"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '1rem',
                textDecoration: 'none',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
                border: 'none',
                fontSize: '1.1rem'
              }}
            >
              <LogIn className="w-5 h-5" />
              Login to Your CRM
            </Link>
          </div>

          <div className="hero-features-list">
            <div className="hero-feature-item">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Secure access to your dealership data
            </div>
            <div className="hero-feature-item">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Manage leads and customers
            </div>
          </div>
        </div>

        {/* Simplified dashboard preview for tenants */}
        {isMounted && (
          <div className="dashboard-preview-container">
            <div className="dashboard-mockup">
              <div className="browser-header">
                <div className="browser-controls">
                  <div className="browser-dot bg-red-500" />
                  <div className="browser-dot bg-yellow-500" />
                  <div className="browser-dot bg-green-500" />
                </div>
                <div className="browser-url">
                  <span className="url-text">{companyName.toLowerCase().replace(/\s+/g, '')}.ghostcrm.com</span>
                </div>
              </div>

            <div className="dashboard-content">
              <div className="dashboard-grid">
                <div className="dashboard-card">
                  <div className="dashboard-card-header">
                    <h3 className="dashboard-card-title">Your Active Leads</h3>
                    <div className="dashboard-card-icon bg-green-100">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                  <div className="dashboard-card-value">Ready</div>
                  <div className="dashboard-card-trend text-green-600">Login to view</div>
                </div>

                <div className="dashboard-card">
                  <div className="dashboard-card-header">
                    <h3 className="dashboard-card-title">Sales Pipeline</h3>
                    <div className="dashboard-card-icon bg-blue-100">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="dashboard-card-value">Waiting</div>
                  <div className="dashboard-card-trend text-blue-600">Login to access</div>
                </div>

                <div className="dashboard-card">
                  <div className="dashboard-card-header">
                    <h3 className="dashboard-card-title">Today's Schedule</h3>
                    <div className="dashboard-card-icon bg-purple-100">
                      <Calendar className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                  <div className="dashboard-card-value">Available</div>
                  <div className="dashboard-card-trend text-purple-600">Login to see</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    );
  }

  // Main domain (marketing) version
  return (
    <section className="hero-section">
      <div className="hero-container">
        <h1 className="hero-title">
          Transform Your{" "}
          <span className="hero-gradient-text">
            Automotive Sales
          </span>
        </h1>
        <div className="hero-subtitle">
          Streamline your dealership operations, boost sales by 40%, and deliver exceptional customer experiences with Ghost CRM.
        </div>

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
      {isMounted && (
        <div className="dashboard-preview-container">
          <div className="dashboard-mockup">
          <div className="browser-header">
            <div className="browser-controls">
              <div className="browser-dot bg-red-500" />
              <div className="browser-dot bg-yellow-500" />
              <div className="browser-dot bg-green-500" />
            </div>
            <div className="browser-url">
              <span className="url-text">app.ghostcrm.com</span>
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
        )}
        
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