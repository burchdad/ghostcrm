"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { LogIn, Home, Play, CreditCard, Crown } from "lucide-react";
import { usePathname } from 'next/navigation';
import ContactSalesModal from "@/components/modals/ContactSalesModal";
import { isSubdomain } from '@/lib/utils/environment';
import EnhancedLogo from './EnhancedLogo';

export default function DesktopHeader() {
  const [showContactSales, setShowContactSales] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showStaffLogin, setShowStaffLogin] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const isOnSubdomain = isSubdomain();
    setShowStaffLogin(!isOnSubdomain);
  }, []);

  return (
    <>
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: isScrolled 
          ? 'rgba(255, 255, 255, 0.85)' 
          : 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderBottom: isScrolled 
          ? '1px solid rgba(139, 92, 246, 0.2)' 
          : '1px solid rgba(255, 255, 255, 0.1)',
        transition: 'all 0.3s ease'
      }}>
        <div style={{
          maxWidth: '80rem',
          margin: '0 auto',
          padding: '0 0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '4rem',
          gap: '0.5rem'
        }}>
          {/* Enhanced Desktop Logo */}
          <EnhancedLogo isScrolled={isScrolled} isMobile={false} />

          {/* Desktop Navigation */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            {/* Home Link (show on other pages) */}
            {pathname !== '/' && (
              <Link href="/" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                borderRadius: '1rem',
                fontSize: '0.925rem',
                fontWeight: '600',
                textDecoration: 'none',
                color: isScrolled ? '#6b7280' : 'rgba(255, 255, 255, 0.9)',
                background: isScrolled 
                  ? 'rgba(59, 130, 246, 0.08)' 
                  : 'rgba(255, 255, 255, 0.1)',
                border: `1px solid ${isScrolled 
                  ? 'rgba(59, 130, 246, 0.2)' 
                  : 'rgba(255, 255, 255, 0.2)'}`,
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}>
                <Home style={{ width: '1rem', height: '1rem' }} />
                Home
              </Link>
            )}

            {/* Features Link */}
            <Link href="/marketing/features" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              borderRadius: '1rem',
              fontSize: '0.925rem',
              fontWeight: '600',
              textDecoration: 'none',
              color: isScrolled ? '#6b7280' : 'rgba(255, 255, 255, 0.9)',
              background: isScrolled 
                ? 'rgba(236, 72, 153, 0.08)' 
                : 'rgba(255, 255, 255, 0.1)',
              border: `1px solid ${isScrolled 
                ? 'rgba(236, 72, 153, 0.2)' 
                : 'rgba(255, 255, 255, 0.2)'}`,
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)'
            }}>
              <Crown style={{ width: '1rem', height: '1rem' }} />
              Features
            </Link>

            {/* Pricing Link (show on home and other pages, but not pricing) */}
            {pathname !== '/pricing' && pathname !== '/marketing/pricing' && (
              <Link href="/marketing/pricing" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                borderRadius: '1rem',
                fontSize: '0.925rem',
                fontWeight: '600',
                textDecoration: 'none',
                color: isScrolled ? '#6b7280' : 'rgba(255, 255, 255, 0.9)',
                background: isScrolled 
                  ? 'rgba(139, 92, 246, 0.08)' 
                  : 'rgba(255, 255, 255, 0.1)',
                border: `1px solid ${isScrolled 
                  ? 'rgba(139, 92, 246, 0.2)' 
                  : 'rgba(255, 255, 255, 0.2)'}`,
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}>
                <CreditCard style={{ width: '1rem', height: '1rem' }} />
                Pricing
              </Link>
            )}

            {/* Demo Link (show on all pages except demo) */}
            {pathname !== '/demo' && (
              <Link href="/demo" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                borderRadius: '1rem',
                fontSize: '0.925rem',
                fontWeight: '600',
                textDecoration: 'none',
                color: isScrolled ? '#6b7280' : 'rgba(255, 255, 255, 0.9)',
                background: isScrolled 
                  ? 'rgba(236, 72, 153, 0.08)' 
                  : 'rgba(255, 255, 255, 0.1)',
                border: `1px solid ${isScrolled 
                  ? 'rgba(236, 72, 153, 0.2)' 
                  : 'rgba(255, 255, 255, 0.2)'}`,
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}>
                <Play style={{ width: '1rem', height: '1rem' }} />
                Demo
              </Link>
            )}

            {/* Contact Sales Button */}
            <button
              onClick={() => setShowContactSales(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                borderRadius: '1rem',
                fontSize: '0.925rem',
                fontWeight: '600',
                background: isScrolled 
                  ? 'rgba(34, 197, 94, 0.08)' 
                  : 'rgba(255, 255, 255, 0.1)',
                border: `1px solid ${isScrolled 
                  ? 'rgba(34, 197, 94, 0.2)' 
                  : 'rgba(255, 255, 255, 0.2)'}`,
                color: isScrolled ? '#6b7280' : 'rgba(255, 255, 255, 0.9)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
            >
              Contact Sales
            </button>

            {/* Staff Login Button - Only show on main domain */}
            {showStaffLogin && (
              <Link href="/login" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                borderRadius: '1rem',
                fontSize: '0.925rem',
                fontWeight: '700',
                textDecoration: 'none',
                color: '#ffffff',
                background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                border: 'none',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <LogIn style={{ width: '1rem', height: '1rem', position: 'relative', zIndex: 10 }} />
                <span style={{ position: 'relative', zIndex: 10 }}>Staff Login</span>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {showContactSales && (
        <ContactSalesModal 
          isOpen={showContactSales}
          onClose={() => setShowContactSales(false)}
        />
      )}
    </>
  );
}