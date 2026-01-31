"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { LogIn, Menu, X, Home, Play, CreditCard } from "lucide-react";
import { usePathname } from 'next/navigation';
import ContactSalesModal from "@/components/modals/ContactSalesModal";
import { isSubdomain } from '@/lib/utils/environment';
import EnhancedLogo from './EnhancedLogo';

export default function MobileHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
      <nav
        style={{
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
        }}
      >
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
          {/* Enhanced Mobile Logo */}
          <EnhancedLogo isScrolled={isScrolled} isMobile={true} />

          {/* Mobile Hamburger Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '2.5rem',
              height: '2.5rem',
              background: isScrolled 
                ? 'rgba(139, 92, 246, 0.1)' 
                : 'rgba(255, 255, 255, 0.1)',
              border: `1px solid ${isScrolled 
                ? 'rgba(139, 92, 246, 0.2)' 
                : 'rgba(255, 255, 255, 0.2)'}`,
              borderRadius: '0.75rem',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
              flexShrink: 0,
              cursor: 'pointer'
            }}
          >
            {isMenuOpen ? (
              <X style={{ 
                width: '1.25rem', 
                height: '1.25rem', 
                color: isScrolled ? '#8b5cf6' : '#ffffff' 
              }} />
            ) : (
              <Menu style={{ 
                width: '1.25rem', 
                height: '1.25rem', 
                color: isScrolled ? '#8b5cf6' : '#ffffff' 
              }} />
            )}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMenuOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95))',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(139, 92, 246, 0.2)',
            borderRadius: '0 0 1rem 1rem',
            padding: '1.5rem',
            marginTop: '1px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              {/* Home Link */}
              {pathname !== '/' && (
                <Link 
                  href="/" 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.875rem 1rem',
                    borderRadius: '0.75rem',
                    color: '#374151',
                    textDecoration: 'none',
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                    background: 'rgba(59, 130, 246, 0.05)',
                    border: '1px solid rgba(59, 130, 246, 0.1)'
                  }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div style={{
                    width: '2rem',
                    height: '2rem',
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{ color: 'white', fontSize: '0.875rem', fontWeight: '700' }}>🏠</span>
                  </div>
                  Home
                </Link>
              )}
              
              {/* Features Link */}
              <Link 
                href="/marketing/features" 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.875rem 1rem',
                  borderRadius: '0.75rem',
                  color: '#374151',
                  textDecoration: 'none',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  background: 'rgba(139, 92, 246, 0.05)',
                  border: '1px solid rgba(139, 92, 246, 0.1)'
                }}
                onClick={() => setIsMenuOpen(false)}
              >
                <div style={{
                  width: '2rem',
                  height: '2rem',
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ color: 'white', fontSize: '0.875rem', fontWeight: '700' }}>⭐</span>
                </div>
                Features
              </Link>
              
              {/* Pricing Link */}
              {pathname !== '/pricing' && pathname !== '/marketing/pricing' && (
                <Link 
                  href="/marketing/pricing" 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.875rem 1rem',
                    borderRadius: '0.75rem',
                    color: '#374151',
                    textDecoration: 'none',
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                    background: 'rgba(236, 72, 153, 0.05)',
                    border: '1px solid rgba(236, 72, 153, 0.1)'
                  }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div style={{
                    width: '2rem',
                    height: '2rem',
                    background: 'linear-gradient(135deg, #ec4899, #be185d)',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{ color: 'white', fontSize: '0.875rem', fontWeight: '700' }}>💰</span>
                  </div>
                  Pricing
                </Link>
              )}

              {/* Demo Link */}
              {pathname !== '/demo' && (
                <Link 
                  href="/demo" 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.875rem 1rem',
                    borderRadius: '0.75rem',
                    color: '#374151',
                    textDecoration: 'none',
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                    background: 'rgba(16, 185, 129, 0.05)',
                    border: '1px solid rgba(16, 185, 129, 0.1)'
                  }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div style={{
                    width: '2rem',
                    height: '2rem',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{ color: 'white', fontSize: '0.875rem', fontWeight: '700' }}>▶️</span>
                  </div>
                  Demo
                </Link>
              )}
              
              {/* Contact Sales Button */}
              <button
                onClick={() => {
                  setShowContactSales(true);
                  setIsMenuOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.875rem 1rem',
                  borderRadius: '0.75rem',
                  color: '#374151',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  background: 'rgba(34, 197, 94, 0.05)',
                  border: '1px solid rgba(34, 197, 94, 0.1)',
                  width: '100%',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '2rem',
                  height: '2rem',
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ color: 'white', fontSize: '0.875rem', fontWeight: '700' }}>📞</span>
                </div>
                Contact Sales
              </button>
              
              {/* Staff Login Button - Only show on main domain */}
              {showStaffLogin && (
                <div style={{
                  padding: '1rem 0',
                  borderTop: '1px solid rgba(139, 92, 246, 0.1)',
                  marginTop: '0.5rem'
                }}>
                  <Link
                    href="/login"
                    style={{
                      display: 'block',
                      background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                      color: 'white',
                      padding: '0.875rem 1.5rem',
                      borderRadius: '0.75rem',
                      fontWeight: '700',
                      textAlign: 'center',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)'
                    }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Staff Login
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Contact Sales Modal */}
      <ContactSalesModal
        isOpen={showContactSales}
        onClose={() => setShowContactSales(false)}
      />
    </>
  );
}