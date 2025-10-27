"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import ContactSalesModal from "@/components/modals/ContactSalesModal";
import { loginSchema, LoginFormData } from "./schemas";

interface AuthFormProps {
  // No props needed - this is now a login-only form
}

export default function AuthForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showContactSales, setShowContactSales] = useState(false);
  const { login, isLoading } = useAuth();

  // Login form setup
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      // Redirect handled by useEffect in parent component
    } catch (error: any) {
      loginForm.setError("root", {
        type: "manual",
        message: error.message || "An error occurred. Please try again.",
      });
    }
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '28rem',
      position: 'relative'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '2rem',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '3rem',
        position: 'relative',
        overflow: 'hidden',
        animation: 'slideInUp 0.8s ease-out'
      }}>
        {/* Gradient Header Line */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)',
          borderRadius: '2rem 2rem 0 0'
        }}></div>

        {/* Floating Elements */}
        <div style={{
          position: 'absolute',
          top: '10%',
          right: '10%',
          width: '20px',
          height: '20px',
          background: 'linear-gradient(45deg, #8b5cf6, #ec4899)',
          borderRadius: '50%',
          opacity: 0.3,
          animation: 'float 6s ease-in-out infinite'
        }}></div>

        <div style={{
          position: 'absolute',
          bottom: '15%',
          left: '15%',
          width: '15px',
          height: '15px',
          background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
          borderRadius: '50%',
          opacity: 0.25,
          animation: 'float 8s ease-in-out infinite reverse'
        }}></div>

        <div style={{
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #1f2937 0%, #4f46e5 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '0.5rem',
            lineHeight: '1.1',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            Welcome Back
          </h2>
          <p style={{
            color: '#6b7280',
            fontSize: '1rem',
            lineHeight: '1.4',
            fontWeight: '500'
          }}>
            Sign in to your Ghost Auto CRM account
          </p>
        </div>

        {/* Login Form */}
        <LoginForm 
          form={loginForm}
          onSubmit={onLoginSubmit}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          isLoading={isLoading}
        />

        {/* Sign Up Link */}
        <div style={{
          marginTop: '1.5rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid rgba(229, 231, 235, 0.5)',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            marginBottom: '0.75rem'
          }}>
            Don't have an account?{' '}
            <Link
              href="/register"
              style={{
                color: '#3b82f6',
                fontWeight: '600',
                textDecoration: 'none'
              }}
            >
              Sign up here
            </Link>
          </p>
        </div>

        {/* Contact Info */}
        <div style={{
          marginTop: '1.5rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid rgba(229, 231, 235, 0.5)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              marginBottom: '0.75rem',
              fontWeight: '500'
            }}>
              Need help getting started?
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem'
            }}>
              <a
                href="mailto:support@ghostautocrm.com"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  fontSize: '0.875rem',
                  color: '#8b5cf6',
                  textDecoration: 'none',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#7c3aed'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#8b5cf6'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <Mail style={{ width: '1rem', height: '1rem', marginRight: '0.25rem' }} />
                Email Support
              </a>
              <button
                onClick={() => setShowContactSales(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  fontSize: '0.875rem',
                  color: '#8b5cf6',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#7c3aed'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#8b5cf6'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <Phone style={{ width: '1rem', height: '1rem', marginRight: '0.25rem' }} />
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Sales Modal */}
      <ContactSalesModal 
        isOpen={showContactSales}
        onClose={() => setShowContactSales(false)}
      />
    </div>
  );
}

// Login Form Component
interface LoginFormProps {
  form: ReturnType<typeof useForm<LoginFormData>>;
  onSubmit: (data: LoginFormData) => Promise<void>;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  isLoading: boolean;
}

function LoginForm({ form, onSubmit, showPassword, setShowPassword, isLoading }: LoginFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = form;

  return (
    <>
      {/* Root error display */}
      {errors.root && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
          {errors.root.message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
        <div className="auth-field-group">
          <label className="auth-label">
            Email Address
          </label>
          <input
            type="email"
            {...register("email")}
            className={`auth-input ${errors.email ? "border-red-300" : ""}`}
            placeholder="john@premierauto.com"
            autoComplete="email"
          />
          {errors.email && (
            <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="auth-field-group">
          <label className="auth-label">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              className={`auth-input pr-10 ${errors.password ? "border-red-300" : ""}`}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover-text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              {...register("remember")}
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus-ring-blue-500 border-gray-300 rounded"
            />
            Remember me
          </label>
          <Link href="/reset-password" className="text-sm text-blue-600 hover-text-blue-500 font-medium">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="auth-submit-btn"
        >
          {isSubmitting || isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Signing In...
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>
      
      {/* Owner Login Link */}
      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderRadius: '0.75rem',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        textAlign: 'center'
      }}>
        <p style={{
          fontSize: '0.875rem',
          color: '#6b7280',
          marginBottom: '0.5rem'
        }}>
          Software Owner Access
        </p>
        <a
          href="/owner/login"
          style={{
            fontSize: '0.875rem',
            color: '#8b5cf6',
            textDecoration: 'none',
            fontWeight: '500',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = '#7c3aed';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = '#8b5cf6';
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5 16L3 14l5.5-5.5L14 14l-2 2-5.5-5.5L5 16zm0 0"/>
            <path d="M12 2L22 12l-1.41 1.41L12 4.83L3.41 13.41L2 12L12 2z"/>
          </svg>
          Owner Portal Access
        </a>
      </div>
    </>
  );
}

