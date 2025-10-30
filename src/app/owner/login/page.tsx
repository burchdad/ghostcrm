"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Crown, Shield, Eye, EyeOff, AlertTriangle, Lock, CheckCircle, Key } from 'lucide-react';
import Link from 'next/link';

export default function OwnerLogin() {
  const [credentials, setCredentials] = useState({
    masterKey: '',
    accessCode: '',
    verificationPin: ''
  });
  const [showMasterKey, setShowMasterKey] = useState(false);
  const [showAccessCode, setShowAccessCode] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1); // Multi-step authentication
  const router = useRouter();

  const handleInputChange = (field: string, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/owner/auth/verify-master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ masterKey: credentials.masterKey })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setStep(2);
      } else {
        setError(result.error || 'Invalid master key');
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/owner/auth/verify-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          masterKey: credentials.masterKey,
          accessCode: credentials.accessCode 
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setStep(3);
      } else {
        setError(result.error || 'Invalid access code');
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/owner/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Store owner session
        localStorage.setItem('ownerSession', JSON.stringify({
          token: result.token,
          expires: result.expires,
          level: 'OWNER',
          timestamp: new Date().toISOString()
        }));

        // Redirect to owner dashboard
        router.push('/owner/dashboard');
      } else {
        setError(result.error || 'Authentication failed');
        setStep(1); // Reset to beginning on final failure
        setCredentials({ masterKey: '', accessCode: '', verificationPin: '' });
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .glassmorphism-input {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(32px);
          border: 2px solid rgba(255, 255, 255, 0.2);
          color: white;
          transition: all 0.5s ease;
        }
        .glassmorphism-input:focus {
          outline: none;
          border-color: rgba(96, 165, 250, 0.5);
          background: rgba(255, 255, 255, 0.1);
          box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.3);
        }
        .glassmorphism-input::placeholder {
          color: rgba(191, 219, 254, 0.6);
        }
        .glassmorphism-button {
          background: linear-gradient(to right, #f59e0b, #ea580c);
          border: 2px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(8px);
          box-shadow: 0 25px 50px -12px rgba(245, 158, 11, 0.3);
          transition: all 0.5s ease;
        }
        .glassmorphism-button:hover:not(:disabled) {
          transform: scale(1.02);
          box-shadow: 0 25px 50px -12px rgba(245, 158, 11, 0.5);
        }
        .glassmorphism-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
      
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e3a8a, #312e81, #7c3aed)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Dramatic Background Elements */}
        <div style={{ position: 'absolute', inset: 0 }}>
          {/* Large animated gradient orbs */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '384px',
            height: '384px',
            background: 'linear-gradient(to right, rgba(96, 165, 250, 0.3), rgba(147, 51, 234, 0.3))',
            borderRadius: '50%',
            mixBlendMode: 'multiply',
            filter: 'blur(48px)',
            animation: 'pulse 2s infinite'
          }}></div>
          <div style={{
            position: 'absolute',
            top: '33%',
            right: 0,
            width: '320px',
            height: '320px',
            background: 'linear-gradient(to right, rgba(168, 85, 247, 0.4), rgba(236, 72, 153, 0.4))',
            borderRadius: '50%',
            mixBlendMode: 'multiply',
            filter: 'blur(48px)',
            animation: 'pulse 2s infinite',
            animationDelay: '1s'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: '33%',
            width: '288px',
            height: '288px',
            background: 'linear-gradient(to right, rgba(129, 140, 248, 0.35), rgba(37, 99, 235, 0.35))',
            borderRadius: '50%',
            mixBlendMode: 'multiply',
            filter: 'blur(48px)',
            animation: 'pulse 2s infinite',
            animationDelay: '2s'
          }}></div>
          
          {/* Floating glass particles */}
          <div style={{
            position: 'absolute',
            top: '25%',
            left: '25%',
            width: '16px',
            height: '16px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            backdropFilter: 'blur(8px)',
            animation: 'bounce 1s infinite',
            animationDelay: '0.3s'
          }}></div>
          <div style={{
            position: 'absolute',
            top: '50%',
            right: '25%',
            width: '24px',
            height: '24px',
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '50%',
            backdropFilter: 'blur(8px)',
            animation: 'bounce 1s infinite',
            animationDelay: '0.7s'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '25%',
            left: '50%',
            width: '12px',
            height: '12px',
            background: 'rgba(255, 255, 255, 0.25)',
            borderRadius: '50%',
            backdropFilter: 'blur(8px)',
            animation: 'bounce 1s infinite',
            animationDelay: '1.2s'
          }}></div>
          
          {/* Subtle geometric patterns */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            opacity: 0.3
          }}></div>
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            opacity: 0.2
          }}></div>
          
          {/* Main backdrop blur overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(1px)'
          }}></div>
        </div>
        
        <div style={{
          position: 'relative',
          zIndex: 10,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{ width: '100%', maxWidth: '512px' }}>
            {/* Dramatically Enhanced Header */}
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: '32px' }}>
                {/* Multiple glowing layers for crown */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to right, rgba(251, 191, 36, 0.4), rgba(249, 115, 22, 0.4))',
                  borderRadius: '50%',
                  filter: 'blur(48px)',
                  transform: 'scale(1.5)',
                  animation: 'pulse 2s infinite'
                }}></div>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to right, rgba(252, 211, 77, 0.3), rgba(251, 146, 60, 0.3))',
                  borderRadius: '50%',
                  filter: 'blur(32px)',
                  transform: 'scale(1.25)'
                }}></div>
                <div style={{
                  position: 'relative',
                  width: '112px',
                  height: '112px',
                  background: 'linear-gradient(to right, #f59e0b, #ea580c)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(24px)'
                }}>
                  <Crown size={56} color="white" style={{filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.25))'}} />
                  {/* Inner glow */}
                  <div style={{
                    position: 'absolute',
                    inset: '8px',
                    background: 'linear-gradient(to right, rgba(252, 211, 77, 0.2), rgba(251, 146, 60, 0.2))',
                    borderRadius: '50%',
                    backdropFilter: 'blur(8px)'
                  }}></div>
                </div>
              </div>
              <h1 style={{
                fontSize: '48px',
                fontWeight: 'bold',
                marginBottom: '16px',
                background: 'linear-gradient(to right, #ffffff, #dbeafe, #e9d5ff)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 10px 8px rgb(0 0 0 / 0.04))'
              }}>
                Owner Access Portal
              </h1>
              <p style={{
                color: 'rgba(191, 219, 254, 0.9)',
                fontSize: '20px',
                fontWeight: 500
              }}>
                Maximum security authentication required
              </p>
            </div>

            {/* Dramatically Enhanced Security Warning */}
            <div style={{ position: 'relative', marginBottom: '40px' }}>
              {/* Glowing border effect */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to right, rgba(248, 113, 113, 0.3), rgba(251, 146, 60, 0.3))',
                borderRadius: '24px',
                filter: 'blur(24px)',
                transition: 'all 0.5s ease'
              }}></div>
              <div style={{
                position: 'relative',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '24px',
                padding: '32px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(248, 113, 113, 0.3)',
                      borderRadius: '16px',
                      filter: 'blur(16px)'
                    }}></div>
                    <div style={{
                      position: 'relative',
                      padding: '12px',
                      background: 'linear-gradient(to right, rgba(248, 113, 113, 0.2), rgba(251, 146, 60, 0.2))',
                      borderRadius: '16px',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(252, 165, 165, 0.3)'
                    }}>
                      <Shield size={32} color="rgba(254, 202, 202, 1)" />
                    </div>
                  </div>
                  <span style={{
                    color: 'rgba(254, 202, 202, 1)',
                    fontWeight: 'bold',
                    fontSize: '20px'
                  }}>Maximum Security Protocol</span>
                </div>
                <p style={{
                  color: 'rgba(254, 226, 226, 0.9)',
                  lineHeight: 1.75,
                  fontSize: '18px'
                }}>
                  This portal grants complete system access. All authentication attempts are monitored, logged, and subject to advanced security protocols.
                </p>
              </div>
            </div>

            {/* Main Form Card with Dramatic Glassmorphism */}
            <div style={{ position: 'relative' }}>
              {/* Multiple layered glow effects */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.2), rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2))',
                borderRadius: '24px',
                filter: 'blur(32px)',
                transition: 'all 0.7s ease'
              }}></div>
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.1))',
                borderRadius: '24px',
                filter: 'blur(24px)'
              }}></div>
              
              <div style={{
                position: 'relative',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(32px)',
                borderRadius: '24px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '40px',
                overflow: 'hidden'
              }}>
                {/* Inner gradient overlays */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(147, 51, 234, 0.05), rgba(236, 72, 153, 0.05))',
                  borderRadius: '24px'
                }}></div>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '4px',
                  background: 'linear-gradient(to right, #60a5fa, #a855f7, #ec4899)',
                  opacity: 0.5
                }}></div>
                
                {/* Dramatically Enhanced Progress Indicator */}
                <div style={{
                  position: 'relative',
                  zIndex: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '40px'
                }}>
                  {[1, 2, 3].map((num) => (
                    <React.Fragment key={num}>
                      <div style={{ position: 'relative' }}>
                        <div style={{
                          position: 'relative',
                          width: '64px',
                          height: '64px',
                          borderRadius: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px',
                          fontWeight: 'bold',
                          transition: 'all 0.7s ease',
                          ...(step >= num ? {
                            background: 'linear-gradient(to right, #f59e0b, #ea580c)',
                            color: 'white',
                            boxShadow: '0 25px 50px -12px rgba(245, 158, 11, 0.5)',
                            transform: 'scale(1.1)',
                            border: '2px solid rgba(255, 255, 255, 0.3)'
                          } : {
                            background: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(24px)',
                            color: '#d1d5db',
                            border: '2px solid rgba(255, 255, 255, 0.2)'
                          })
                        }}>
                          {step > num ? (
                            <CheckCircle size={32} />
                          ) : (
                            <span style={{ fontSize: '20px' }}>{num}</span>
                          )}
                          {step >= num && (
                            <>
                              <div style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'linear-gradient(to right, rgba(251, 191, 36, 0.3), rgba(249, 115, 22, 0.3))',
                                borderRadius: '16px',
                                filter: 'blur(16px)',
                                transform: 'scale(1.5)',
                                animation: 'pulse 2s infinite'
                              }}></div>
                              <div style={{
                                position: 'absolute',
                                inset: '4px',
                                background: 'linear-gradient(to right, rgba(252, 211, 77, 0.1), rgba(251, 146, 60, 0.1))',
                                borderRadius: '12px',
                                backdropFilter: 'blur(8px)'
                              }}></div>
                            </>
                          )}
                        </div>
                      </div>
                      {num < 3 && (
                        <div style={{
                          width: '64px',
                          height: '8px',
                          margin: '0 16px',
                          borderRadius: '4px',
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'all 0.7s ease',
                          ...(step > num ? {
                            background: 'linear-gradient(to right, #f59e0b, #ea580c)',
                            boxShadow: '0 4px 6px -1px rgba(245, 158, 11, 0.3)'
                          } : {
                            background: 'rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(8px)'
                          })
                        }}>
                          {step > num && (
                            <div style={{
                              position: 'absolute',
                              inset: 0,
                              background: 'linear-gradient(to right, rgba(252, 211, 77, 0.5), rgba(251, 146, 60, 0.5))',
                              borderRadius: '4px',
                              filter: 'blur(8px)'
                            }}></div>
                          )}
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Error Display */}
                {error && (
                  <div style={{ position: 'relative', zIndex: 10, marginBottom: '40px' }}>
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to right, rgba(248, 113, 113, 0.3), rgba(236, 72, 153, 0.3))',
                      borderRadius: '16px',
                      filter: 'blur(24px)'
                    }}></div>
                    <div style={{
                      position: 'relative',
                      padding: '24px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(32px)',
                      border: '1px solid rgba(248, 113, 113, 0.4)',
                      borderRadius: '16px',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ position: 'relative' }}>
                          <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(248, 113, 113, 0.3)',
                            borderRadius: '12px',
                            filter: 'blur(16px)'
                          }}></div>
                          <div style={{
                            position: 'relative',
                            padding: '12px',
                            background: 'linear-gradient(to right, rgba(248, 113, 113, 0.2), rgba(236, 72, 153, 0.2))',
                            borderRadius: '12px',
                            backdropFilter: 'blur(8px)'
                          }}>
                            <AlertTriangle size={24} color="rgba(254, 202, 202, 1)" />
                          </div>
                        </div>
                        <p style={{ color: 'rgba(254, 226, 226, 1)', fontWeight: 600, fontSize: '18px' }}>{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 1: Master Key */}
                {step === 1 && (
                  <form onSubmit={handleStep1Submit} style={{ position: 'relative', zIndex: 10 }}>
                    <div style={{ marginBottom: '40px' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: 'rgba(219, 234, 254, 1)',
                        marginBottom: '16px'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        }}>
                          <div style={{
                            padding: '8px',
                            background: 'linear-gradient(to right, rgba(251, 191, 36, 0.2), rgba(251, 146, 60, 0.2))',
                            borderRadius: '8px',
                            backdropFilter: 'blur(8px)'
                          }}>
                            <Lock size={20} color="rgba(252, 211, 77, 1)" />
                          </div>
                          Master Authentication Key
                        </div>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(to right, rgba(96, 165, 250, 0.2), rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2))',
                          borderRadius: '16px',
                          filter: 'blur(24px)',
                          transition: 'all 0.5s ease'
                        }}></div>
                        
                        <input
                          type={showMasterKey ? 'text' : 'password'}
                          value={credentials.masterKey}
                          onChange={(e) => handleInputChange('masterKey', e.target.value)}
                          className="glassmorphism-input"
                          style={{
                            position: 'relative',
                            width: '100%',
                            padding: '24px 32px',
                            borderRadius: '16px',
                            fontSize: '20px',
                            fontWeight: 500
                          }}
                          placeholder="Enter master authentication key"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowMasterKey(!showMasterKey)}
                          style={{
                            position: 'absolute',
                            right: '24px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            padding: '12px',
                            color: 'rgba(191, 219, 254, 1)',
                            background: 'transparent',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {showMasterKey ? <EyeOff size={24} /> : <Eye size={24} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !credentials.masterKey}
                      className="glassmorphism-button"
                      style={{
                        position: 'relative',
                        width: '100%',
                        padding: '24px',
                        color: 'white',
                        fontWeight: 'bold',
                        borderRadius: '16px',
                        fontSize: '20px',
                        cursor: loading || !credentials.masterKey ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <span style={{ position: 'relative', zIndex: 10 }}>
                        {loading ? 'Verifying Master Key...' : 'Verify Master Key'}
                      </span>
                      <div style={{
                        position: 'absolute',
                        inset: '4px',
                        background: 'linear-gradient(to right, rgba(252, 211, 77, 0.2), rgba(251, 146, 60, 0.2))',
                        borderRadius: '12px'
                      }}></div>
                    </button>
                  </form>
                )}

                {/* Step 2: Access Code */}
                {step === 2 && (
                  <form onSubmit={handleStep2Submit} style={{ position: 'relative', zIndex: 10 }}>
                    <div style={{ marginBottom: '40px' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: 'rgba(219, 234, 254, 1)',
                        marginBottom: '16px'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        }}>
                          <div style={{
                            padding: '8px',
                            background: 'linear-gradient(to right, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.2))',
                            borderRadius: '8px',
                            backdropFilter: 'blur(8px)'
                          }}>
                            <Key size={20} color="rgba(34, 197, 94, 1)" />
                          </div>
                          Access Code
                        </div>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(to right, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2))',
                          borderRadius: '16px',
                          filter: 'blur(24px)',
                          transition: 'all 0.5s ease'
                        }}></div>
                        
                        <input
                          type={showAccessCode ? 'text' : 'password'}
                          value={credentials.accessCode}
                          onChange={(e) => handleInputChange('accessCode', e.target.value)}
                          className="glassmorphism-input"
                          style={{
                            position: 'relative',
                            width: '100%',
                            padding: '24px 32px',
                            borderRadius: '16px',
                            fontSize: '20px',
                            fontWeight: 500
                          }}
                          placeholder="Enter access code"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowAccessCode(!showAccessCode)}
                          style={{
                            position: 'absolute',
                            right: '24px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            padding: '12px',
                            color: 'rgba(191, 219, 254, 1)',
                            background: 'transparent',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {showAccessCode ? <EyeOff size={24} /> : <Eye size={24} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !credentials.accessCode}
                      className="glassmorphism-button"
                      style={{
                        position: 'relative',
                        width: '100%',
                        padding: '24px',
                        color: 'white',
                        fontWeight: 'bold',
                        borderRadius: '16px',
                        fontSize: '20px',
                        cursor: loading || !credentials.accessCode ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <span style={{ position: 'relative', zIndex: 10 }}>
                        {loading ? 'Verifying Access Code...' : 'Verify Access Code'}
                      </span>
                      <div style={{
                        position: 'absolute',
                        inset: '4px',
                        background: 'linear-gradient(to right, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.2))',
                        borderRadius: '12px'
                      }}></div>
                    </button>
                  </form>
                )}

                {/* Step 3: PIN Verification */}
                {step === 3 && (
                  <form onSubmit={handleStep3Submit} style={{ position: 'relative', zIndex: 10 }}>
                    <div style={{ marginBottom: '40px' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: 'rgba(219, 234, 254, 1)',
                        marginBottom: '16px'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        }}>
                          <div style={{
                            padding: '8px',
                            background: 'linear-gradient(to right, rgba(139, 92, 246, 0.2), rgba(168, 85, 247, 0.2))',
                            borderRadius: '8px',
                            backdropFilter: 'blur(8px)'
                          }}>
                            <Shield size={20} color="rgba(139, 92, 246, 1)" />
                          </div>
                          Verification PIN
                        </div>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(to right, rgba(139, 92, 246, 0.2), rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2))',
                          borderRadius: '16px',
                          filter: 'blur(24px)',
                          transition: 'all 0.5s ease'
                        }}></div>
                        
                        <input
                          type={showPin ? 'text' : 'password'}
                          value={credentials.verificationPin}
                          onChange={(e) => handleInputChange('verificationPin', e.target.value)}
                          className="glassmorphism-input"
                          style={{
                            position: 'relative',
                            width: '100%',
                            padding: '24px 32px',
                            borderRadius: '16px',
                            fontSize: '20px',
                            fontWeight: 500,
                            letterSpacing: '8px',
                            textAlign: 'center'
                          }}
                          placeholder="••••••"
                          maxLength={6}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPin(!showPin)}
                          style={{
                            position: 'absolute',
                            right: '24px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            padding: '12px',
                            color: 'rgba(191, 219, 254, 1)',
                            background: 'transparent',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {showPin ? <EyeOff size={24} /> : <Eye size={24} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !credentials.verificationPin}
                      className="glassmorphism-button"
                      style={{
                        position: 'relative',
                        width: '100%',
                        padding: '24px',
                        color: 'white',
                        fontWeight: 'bold',
                        borderRadius: '16px',
                        fontSize: '20px',
                        cursor: loading || !credentials.verificationPin ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <span style={{ position: 'relative', zIndex: 10 }}>
                        {loading ? 'Completing Authentication...' : 'Complete Authentication'}
                      </span>
                      <div style={{
                        position: 'absolute',
                        inset: '4px',
                        background: 'linear-gradient(to right, rgba(139, 92, 246, 0.2), rgba(168, 85, 247, 0.2))',
                        borderRadius: '12px'
                      }}></div>
                    </button>
                  </form>
                )}

                {/* Enhanced Back to Regular Login */}
                <div style={{ position: 'relative', zIndex: 10, marginTop: '48px', textAlign: 'center' }}>
                  <Link 
                    href="/login"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '16px 32px',
                      color: 'rgba(191, 219, 254, 1)',
                      fontSize: '18px',
                      fontWeight: 500,
                      textDecoration: 'none',
                      borderRadius: '16px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(24px)',
                      transition: 'all 0.5s ease'
                    }}
                  >
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Regular Login
                  </Link>
                </div>
              </div>
            </div>

            {/* Dramatically Enhanced Footer */}
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '12px 24px',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(24px)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  background: 'linear-gradient(to right, #f59e0b, #ea580c)',
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite'
                }}></div>
                <p style={{
                  color: 'rgba(191, 219, 254, 0.9)',
                  fontSize: '18px',
                  fontWeight: 500,
                  margin: 0
                }}>
                  Owner access portal • All sessions logged and monitored
                </p>
                <div style={{
                  width: '12px',
                  height: '12px',
                  background: 'linear-gradient(to right, #60a5fa, #a855f7)',
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite',
                  animationDelay: '1s'
                }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}