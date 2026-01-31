"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Car, Menu, X, Crown, LogIn, CreditCard, Home, Play } from "lucide-react";
import { usePathname } from 'next/navigation';
import ContactSalesModal from "@/components/modals/ContactSalesModal";
import { isSubdomain } from '@/lib/utils/environment';

export default function MarketingHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showContactSales, setShowContactSales] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showStaffLogin, setShowStaffLogin] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Determine if Staff Login should be shown (only on main domain, not subdomains)
  useEffect(() => {
    const isOnSubdomain = isSubdomain();
    setShowStaffLogin(!isOnSubdomain);
    
    console.log('🏠 [MarketingHeader] Domain check:', {
      hostname: typeof window !== 'undefined' ? window.location.hostname : 'server',
      isSubdomain: isOnSubdomain,
      showStaffLogin: !isOnSubdomain
    });
  }, []);

  return (
    <>
      <nav
        data-mounted={isMounted}
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
          transition: 'all 0.3s ease',
          animation: isMounted ? 'slideDown 0.4s ease-out' : 'none',
          opacity: isMounted ? 1 : 0,
          transform: isMounted ? 'translateY(0)' : 'translateY(-20px)'
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
          {/* Logo/Brand */}
          <Link href="/" style={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            gap: '0.5rem',
            transition: 'all 0.3s ease',
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
          }}>
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Car style={{
                width: '1.75rem',
                height: '1.75rem',
                color: isScrolled ? '#8b5cf6' : '#ffffff',
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
                transition: 'color 0.3s ease'
              }} />
              <Crown style={{
                position: 'absolute',
                top: '-4px',
                right: '-6px',
                width: '0.625rem',
                height: '0.625rem',
                color: '#fbbf24',
                animation: 'pulse 2s infinite'
              }} />
            </div>
            {/* Desktop: Full text, Mobile: Abbreviated */}
            <span className="hidden sm:inline" style={{
              fontSize: '1.5rem',
              fontWeight: '800',
              color: isScrolled ? '#8b5cf6' : '#ffffff',
              background: isScrolled 
                ? 'linear-gradient(135deg, #8b5cf6, #3b82f6)'
                : 'linear-gradient(135deg, #ffffff, #e2e8f0)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              transition: 'all 0.3s ease',
              letterSpacing: '-0.5px'
            }}>
              Ghost CRM
            </span>
            {/* Mobile: Abbreviated text */}
            <span className="sm:hidden" style={{
              fontSize: '1.25rem',
              fontWeight: '800',
              color: isScrolled ? '#8b5cf6' : '#ffffff',
              background: isScrolled 
                ? 'linear-gradient(135deg, #8b5cf6, #3b82f6)'
                : 'linear-gradient(135deg, #ffffff, #e2e8f0)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              transition: 'all 0.3s ease',
              letterSpacing: '-0.25px'
            }}>
              GhostCRM
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }} className="hidden lg:flex">
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
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.background = isScrolled 
                  ? 'rgba(59, 130, 246, 0.15)' 
                  : 'rgba(255, 255, 255, 0.2)'
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.25)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.background = isScrolled 
                  ? 'rgba(59, 130, 246, 0.08)' 
                  : 'rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.boxShadow = 'none'
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
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.background = isScrolled 
                ? 'rgba(236, 72, 153, 0.15)' 
                : 'rgba(255, 255, 255, 0.2)'
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(236, 72, 153, 0.25)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.background = isScrolled 
                ? 'rgba(236, 72, 153, 0.08)' 
                : 'rgba(255, 255, 255, 0.1)'
              e.currentTarget.style.boxShadow = 'none'
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
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.background = isScrolled 
                  ? 'rgba(139, 92, 246, 0.15)' 
                  : 'rgba(255, 255, 255, 0.2)'
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.25)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.background = isScrolled 
                  ? 'rgba(139, 92, 246, 0.08)' 
                  : 'rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.boxShadow = 'none'
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
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.background = isScrolled 
                  ? 'rgba(236, 72, 153, 0.15)' 
                  : 'rgba(255, 255, 255, 0.2)'
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(236, 72, 153, 0.25)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.background = isScrolled 
                  ? 'rgba(236, 72, 153, 0.08)' 
                  : 'rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.boxShadow = 'none'
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
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.background = isScrolled 
                  ? 'rgba(34, 197, 94, 0.15)' 
                  : 'rgba(255, 255, 255, 0.2)'
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(34, 197, 94, 0.25)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.background = isScrolled 
                  ? 'rgba(34, 197, 94, 0.08)' 
                  : 'rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.boxShadow = 'none'
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
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)'
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(139, 92, 246, 0.6)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(139, 92, 246, 0.4)'
              }}>
                {/* Animated gradient overlay */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                  transition: 'left 0.6s ease'
                }} className="shine-effect"></div>
                
                <LogIn style={{ width: '1rem', height: '1rem', position: 'relative', zIndex: 10 }} />
                <span style={{ position: 'relative', zIndex: 10 }}>Staff Login</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden"
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
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isScrolled 
                ? 'rgba(139, 92, 246, 0.15)' 
                : 'rgba(255, 255, 255, 0.15)'
              e.currentTarget.style.transform = 'scale(1.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isScrolled 
                ? 'rgba(139, 92, 246, 0.1)' 
                : 'rgba(255, 255, 255, 0.1)'
              e.currentTarget.style.transform = 'scale(1)'
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

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden" style={{
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
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            animation: 'slideDown 0.3s ease-out'
          }}>
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
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
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'
                  e.currentTarget.style.transform = 'translateX(4px)'
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)'
                  e.currentTarget.style.transform = 'translateX(0)'
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.1)'
                }}
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
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)'
                  e.currentTarget.style.transform = 'translateX(4px)'
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(139, 92, 246, 0.05)'
                  e.currentTarget.style.transform = 'translateX(0)'
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.1)'
                }}
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
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(236, 72, 153, 0.1)'
                  e.currentTarget.style.transform = 'translateX(4px)'
                  e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(236, 72, 153, 0.05)'
                  e.currentTarget.style.transform = 'translateX(0)'
                  e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.1)'
                }}
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
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(34, 197, 94, 0.1)'
                  e.currentTarget.style.transform = 'translateX(4px)'
                  e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(34, 197, 94, 0.05)'
                  e.currentTarget.style.transform = 'translateX(0)'
                  e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.1)'
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
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.4)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(139, 92, 246, 0.3)'
                    }}
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