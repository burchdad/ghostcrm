"use client";

import React from "react";
import Link from "next/link";
import './enhanced-logo.css';

interface EnhancedLogoProps {
  isScrolled: boolean;
  isMobile?: boolean;
}

export default function EnhancedLogo({ isScrolled, isMobile = false }: EnhancedLogoProps) {
  return (
    <Link 
      href="/" 
      className="enhanced-logo-container"
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        textDecoration: 'none',
        gap: '0.75rem',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        flexShrink: 0,
        zIndex: 10
      }}
    >
      {/* Logo Container with Extended Boundaries */}
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        transform: 'scale(1)',
        transition: 'transform 0.3s ease'
      }}>
        
        {/* Main Logo Text */}
        <div style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start'
        }}>
          {/* Main Brand Text */}
          <span 
            className="enhanced-logo-text"
            style={{
              fontSize: isMobile ? '1.9rem' : '2.5rem',
              fontWeight: '900',
              background: isScrolled 
                ? 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 50%, #06b6d4 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #e2e8f0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.05em',
              lineHeight: '1',
              textShadow: isScrolled 
                ? '0 2px 10px rgba(139, 92, 246, 0.3)'
                : '0 2px 20px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.4s ease',
              transform: `translateY(${isMobile ? '-2px' : '-4px'})`,
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
            }}
          >
            Ghost
          </span>
          
          {/* CRM Text - Stylized */}
          <span style={{
            fontSize: isMobile ? '0.875rem' : '1.125rem',
            fontWeight: '700',
            color: isScrolled ? '#6366f1' : 'rgba(255, 255, 255, 0.9)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginTop: isMobile ? '-6px' : '-8px',
            marginLeft: isMobile ? '2px' : '4px',
            transition: 'all 0.3s ease',
            textShadow: isScrolled 
              ? '0 1px 3px rgba(99, 102, 241, 0.3)'
              : '0 1px 6px rgba(0, 0, 0, 0.4)'
          }}>
            CRM
          </span>
        </div>

        {/* Floating Accent Elements */}
        <div style={{
          position: 'absolute',
          top: isMobile ? '-10px' : '-15px',
          right: isMobile ? '-10px' : '-15px',
          display: 'flex',
          gap: '6px'
        }}>
          {/* Primary Accent Dot */}
          <div 
            className="logo-accent-dot"
            style={{
              width: isMobile ? '8px' : '10px',
              height: isMobile ? '8px' : '10px',
              borderRadius: '50%',
              background: isScrolled 
                ? 'linear-gradient(45deg, #8b5cf6, #3b82f6)'
                : 'linear-gradient(45deg, #fbbf24, #f59e0b)',
              boxShadow: isScrolled
                ? '0 2px 12px rgba(139, 92, 246, 0.5)'
                : '0 2px 16px rgba(251, 191, 36, 0.7)'
            }}
          />
          
          {/* Secondary Accent Dot */}
          <div 
            className="logo-accent-dot"
            style={{
              width: isMobile ? '5px' : '6px',
              height: isMobile ? '5px' : '6px',
              borderRadius: '50%',
              background: isScrolled 
                ? 'linear-gradient(45deg, #06b6d4, #0891b2)'
                : 'linear-gradient(45deg, #ffffff, #e2e8f0)',
              boxShadow: isScrolled
                ? '0 2px 8px rgba(6, 182, 212, 0.5)'
                : '0 2px 12px rgba(255, 255, 255, 0.4)'
            }}
          />
        </div>

        {/* Subtle Glow Effect */}
        <div 
          className="logo-glow-effect"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: isMobile ? '140px' : '180px',
            height: isMobile ? '70px' : '90px',
            background: isScrolled 
              ? 'radial-gradient(ellipse, rgba(139, 92, 246, 0.12) 0%, transparent 70%)'
              : 'radial-gradient(ellipse, rgba(255, 255, 255, 0.06) 0%, transparent 70%)',
            borderRadius: '50%',
            zIndex: -1
          }}
        />
      </div>
    </Link>
  );
}