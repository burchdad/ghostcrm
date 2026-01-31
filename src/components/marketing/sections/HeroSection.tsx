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
      formattedName = subdomain
        .split(/(?=[A-Z])/)
        .join(' ')
        .split(/[\s-_]+/)
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
      </section>
    );
  }

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