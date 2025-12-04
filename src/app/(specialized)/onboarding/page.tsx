'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import OnboardingGuard from "@/components/onboarding/OnboardingGuard";
import OnboardingModal from "@/components/onboarding/OnboardingModal";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoading, authReady } = useAuth();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Wait for auth to be ready before making any decisions
    if (!authReady) {
      return;
    }

    // If auth is ready but no user, they need to login
    if (!user) {
      router.replace('/login');
      return;
    }

    // Show modal after user is authenticated
    const timer = setTimeout(() => {
      setShowModal(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [user, router, authReady]);

  const handleModalClose = () => {
    setShowModal(false);
    router.push('/dashboard');
  };

  const handleOnboardingComplete = () => {
    setShowModal(false);
    router.push('/dashboard');
  };

  // Show loading spinner while auth is initializing
  if (!authReady || isLoading) {
    return <OnboardingGuard />;
  }

  return (
    <OnboardingGuard requireCompleted={false}>
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        {/* Blank dashboard background */}
        <div style={{
          background: 'white',
          borderRadius: '1rem',
          padding: '3rem',
          textAlign: 'center',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          maxWidth: '600px',
          width: '100%'
        }}>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            color: '#111827', 
            marginBottom: '1rem' 
          }}>
            Welcome to Ghost CRM
          </h1>
          <p style={{ 
            color: '#6b7280', 
            fontSize: '1.125rem', 
            marginBottom: '2rem' 
          }}>
            Your dashboard is ready. Let's get you set up!
          </p>
          
          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: '1rem 2rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1.125rem',
              fontWeight: '500',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          >
            Start Setup
          </button>
        </div>

        {/* Onboarding Modal */}
        <OnboardingModal 
          isOpen={showModal}
          onClose={handleModalClose}
          onComplete={handleOnboardingComplete}
        />
      </div>
    </OnboardingGuard>
  );
}
