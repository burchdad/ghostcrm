"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Car, Menu, X, Crown, LogIn, CreditCard, Home, Play } from "lucide-react";
import { usePathname } from 'next/navigation';
import ContactSalesModal from "@/components/modals/ContactSalesModal";

export default function MarketingHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showContactSales, setShowContactSales] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
          ? 'rgba(255, 255, 255, 0.95)' 
          : 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderBottom: isScrolled 
          ? '1px solid rgba(139, 92, 246, 0.2)' 
          : '1px solid rgba(255, 255, 255, 0.1)',
        transition: 'all 0.3s ease',
        animation: 'slideDown 0.8s ease-out'
      }}>
        <div style={{
          maxWidth: '80rem',
          margin: '0 auto',
          padding: '0 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '4rem'
        }}>
          {/* Logo/Brand */}
          <Link href="/" style={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            gap: '0.75rem',
            transition: 'all 0.3s ease'
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
                width: '2rem',
                height: '2rem',
                color: isScrolled ? '#8b5cf6' : '#ffffff',
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
                transition: 'color 0.3s ease'
              }} />
              <Crown style={{
                position: 'absolute',
                top: '-6px',
                right: '-8px',
                width: '0.75rem',
                height: '0.75rem',
                color: '#fbbf24',
                animation: 'pulse 2s infinite'
              }} />
            </div>
            <span style={{
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
              Ghost Auto CRM
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

            {/* Client Login Button */}
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
              <span style={{ position: 'relative', zIndex: 10 }}>Client Login</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2"
            style={{
              background: isScrolled 
                ? 'rgba(139, 92, 246, 0.1)' 
                : 'rgba(255, 255, 255, 0.1)',
              border: `1px solid ${isScrolled 
                ? 'rgba(139, 92, 246, 0.2)' 
                : 'rgba(255, 255, 255, 0.2)'}`,
              borderRadius: '0.5rem',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease'
            }}
          >
            {isMenuOpen ? (
              <X style={{ 
                width: '1.5rem', 
                height: '1.5rem', 
                color: isScrolled ? '#8b5cf6' : '#ffffff' 
              }} />
            ) : (
              <Menu style={{ 
                width: '1.5rem', 
                height: '1.5rem', 
                color: isScrolled ? '#8b5cf6' : '#ffffff' 
              }} />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden" style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(139, 92, 246, 0.2)',
            padding: '1rem'
          }}>
            <div className="flex flex-col space-y-4">
              <Link 
                href="/" 
                className="text-gray-700 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/marketing/features" 
                className="text-gray-700 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link 
                href="/marketing/pricing" 
                className="text-gray-700 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              <button
                onClick={() => {
                  setShowContactSales(true);
                  setIsMenuOpen(false);
                }}
                className="text-left text-gray-700 hover:text-blue-600 transition-colors"
              >
                Contact Sales
              </button>
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                <Link
                  href="/login"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Client Login
                </Link>
              </div>
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