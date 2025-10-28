'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BrandPanel from '@/components/auth/BrandPanel';
import { ArrowRight, User, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('sales_rep'); // Default to sales_rep
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }
    if (!agreeToTerms) {
      setMessage('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, companyName, email, password, role }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const devDetail = data?.detail ? `\n${data.detail}` : '';
        throw new Error((data?.error || 'Registration failed') + devDetail);
      }

      localStorage.setItem('userEmail', email);
      setMessage('Account created! Verifying authentication...');
      
      // Wait a moment for cookies to be set, then verify auth before redirecting
      setTimeout(async () => {
        try {
          // Verify authentication is working
          const authCheck = await fetch('/api/auth/me', {
            method: 'GET',
            credentials: 'include'
          });
          
          if (authCheck.ok) {
            const authData = await authCheck.json();
            if (authData.user) {
              setMessage('Authentication verified! Redirecting to billing...');
              setTimeout(() => router.push('/billing'), 500);
            } else {
              setMessage('Authentication verification failed. Please login manually.');
              setTimeout(() => router.push('/login'), 2000);
            }
          } else {
            setMessage('Authentication verification failed. Please login manually.');
            setTimeout(() => router.push('/login'), 2000);
          }
        } catch (error) {
          console.error('Auth verification error:', error);
          setMessage('Authentication verification failed. Please login manually.');
          setTimeout(() => router.push('/login'), 2000);
        }
      }, 1000);
    } catch (err: any) {
      setMessage(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0c0c1e 0%, #1a1a2e 35%, #16213e 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Floating Orbs */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          right: '15%',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4), rgba(139, 92, 246, 0.1))',
          borderRadius: '50%',
          filter: 'blur(40px)',
          animation: 'float 6s ease-in-out infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '20%',
          left: '10%',
          width: '150px',
          height: '150px',
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.4), rgba(236, 72, 153, 0.1))',
          borderRadius: '50%',
          filter: 'blur(35px)',
          animation: 'float 8s ease-in-out infinite reverse',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '60%',
          right: '5%',
          width: '120px',
          height: '120px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4), rgba(59, 130, 246, 0.1))',
          borderRadius: '50%',
          filter: 'blur(30px)',
          animation: 'float 7s ease-in-out infinite',
        }}
      />

      {/* Particle Grid Background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(236, 72, 153, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 25% 75%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)
          `,
          opacity: 0.6,
        }}
      />

      <div
        style={{
          display: 'flex',
          minHeight: '100vh',
          position: 'relative',
          zIndex: 10,
          flexDirection: 'row',
        }}
        className="register-page-mobile"
      >
        {/* Left: Brand Panel */}
        <BrandPanel />

        {/* Right: Registration Form */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            position: 'relative',
            height: '100vh',
            overflow: 'hidden',
          }}
          className="register-form-mobile"
        >
          {/* Glassmorphism backdrop */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'min(380px, 90vw)',
              height: 'min(90vh, 800px)',
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              borderRadius: '1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              zIndex: 1,
            }}
          />

          {/* Registration Form */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              width: '100%',
              maxWidth: '350px',
              padding: '0.75rem',
              height: 'min(90vh, 800px)',
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '0.5rem', flexShrink: 0 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  marginBottom: '0.25rem',
                }}
              >
                <User className="w-6 h-6 text-white" />
              </div>

              <h1
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: 'white',
                  marginBottom: '0.1rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Create Account
              </h1>

              <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                Join thousands of successful dealerships
              </p>
            </div>

            <form onSubmit={onSubmit} style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ flex: 1 }}>
              {/* First Name */}
              <div style={{ marginBottom: '0.45rem' }}>
                <label
                  style={{
                    display: 'block',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    marginBottom: '0.5rem',
                  }}
                >
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  autoComplete="given-name"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '0.75rem',
                    color: 'white',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.2s',
                  }}
                  placeholder="Enter your first name"
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)')}
                />
              </div>

              {/* Last Name */}
              <div style={{ marginBottom: '0.5rem' }}>
                <label
                  style={{
                    display: 'block',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    marginBottom: '0.5rem',
                  }}
                >
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  autoComplete="family-name"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '0.75rem',
                    color: 'white',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.2s',
                  }}
                  placeholder="Enter your last name"
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)')}
                />
              </div>

              {/* Company Name */}
              <div style={{ marginBottom: '0.5rem' }}>
                <label
                  style={{
                    display: 'block',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    marginBottom: '0.5rem',
                  }}
                >
                  Company Name
                </label>
                <input
                  id="companyName"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  autoComplete="organization"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '0.75rem',
                    color: 'white',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.2s',
                  }}
                  placeholder="Enter your company name"
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)')}
                />
              </div>

              {/* Role Selection */}
              <div style={{ marginBottom: '0.5rem' }}>
                <label
                  style={{
                    display: 'block',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    marginBottom: '0.5rem',
                  }}
                >
                  Role
                </label>
                <p style={{ 
                  fontSize: '0.75rem', 
                  color: 'rgba(255, 255, 255, 0.6)', 
                  marginBottom: '0.5rem',
                  fontStyle: 'italic' 
                }}>
                  Select "Company Owner" for full access including billing and admin features
                </p>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '0.75rem',
                    color: 'white',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.2s',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)')}
                >
                  <option value="sales_rep" style={{ background: '#1a1a2e', color: 'white' }}>Sales Representative</option>
                  <option value="manager" style={{ background: '#1a1a2e', color: 'white' }}>Manager</option>
                  <option value="admin" style={{ background: '#1a1a2e', color: 'white' }}>Dealership Admin</option>
                  <option value="owner" style={{ background: '#1a1a2e', color: 'white' }}>🏢 Company Owner (Full Access)</option>
                </select>
              </div>

              {/* Email */}
              <div style={{ marginBottom: '0.5rem' }}>
                <label
                  style={{
                    display: 'block',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    marginBottom: '0.5rem',
                  }}
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '0.75rem',
                    color: 'white',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.2s',
                  }}
                  placeholder="Enter your email"
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)')}
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom: '0.5rem' }}>
                <label
                  style={{
                    display: 'block',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    marginBottom: '0.5rem',
                  }}
                >
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    style={{
                      width: '100%',
                      padding: '0.5rem 2.75rem 0.5rem 0.5rem',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '0.75rem',
                      color: 'white',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'all 0.2s',
                    }}
                    placeholder="Create a password"
                    onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255, 255, 255, 0.6)',
                      cursor: 'pointer',
                    }}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div style={{ marginBottom: '0.5rem' }}>
                <label
                  style={{
                    display: 'block',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    marginBottom: '0.5rem',
                  }}
                >
                  Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    style={{
                      width: '100%',
                      padding: '0.5rem 2.75rem 0.5rem 0.5rem',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '0.75rem',
                      color: 'white',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'all 0.2s',
                    }}
                    placeholder="Confirm your password"
                    onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((s) => !s)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255, 255, 255, 0.6)',
                      cursor: 'pointer',
                    }}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Terms */}
              <div style={{ marginBottom: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', cursor: 'pointer', gap: '0.75rem' }}>
                  <input
                    type="checkbox"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    required
                    style={{ marginTop: '0.125rem', width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', lineHeight: 1.4 }}>
                    I agree to the{' '}
                    <a href="/terms" target="_blank" style={{ color: '#8b5cf6', textDecoration: 'underline' }}>
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" target="_blank" style={{ color: '#8b5cf6', textDecoration: 'underline' }}>
                      Privacy Policy
                    </a>
                  </span>
                </label>
              </div>

              {/* Message */}
              {message && (
                <div
                  style={{
                    padding: '0.5rem',
                    marginBottom: '0.5rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    background: message.includes('created') ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: message.includes('created') ? '#22c55e' : '#ef4444',
                    border: `1px solid ${
                      message.includes('created') ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'
                    }`,
                  }}
                >
                  {message}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  background: loading
                    ? 'rgba(139, 92, 246, 0.5)'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.75rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {loading ? (
                  <>
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                      }}
                    />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @media (max-width: 1024px) {
          .register-page-mobile {
            flex-direction: column !important;
          }
          .register-form-mobile {
            padding: 1rem !important;
          }
        }
        @media (max-width: 768px) {
          .register-form-mobile {
            padding: 0.5rem !important;
          }
        }
        @media (max-height: 800px) {
          .register-form-mobile > div:nth-child(2) {
            padding: 1rem !important;
            max-height: 85vh !important;
          }
        }
      `}</style>
    </div>
  );
}
