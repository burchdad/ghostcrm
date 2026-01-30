'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Mail, RefreshCw, CheckCircle } from 'lucide-react';

interface VerificationCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  onVerificationSuccess: () => void;
}

export function VerificationCodeModal({ 
  isOpen, 
  onClose, 
  userEmail, 
  onVerificationSuccess 
}: VerificationCodeModalProps) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen && inputRefs.current[0]) {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen]);

  // Handle input change
  const handleInputChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return; // Only allow digits

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError(null);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (newCode.every(digit => digit !== '') && !isVerifying) {
      handleVerifyCode(newCode.join(''));
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = pastedData.split('').concat(['', '', '', '', '', '']).slice(0, 6);
    setCode(newCode);
    
    // Focus last filled input or first empty
    const lastFilledIndex = newCode.findIndex(digit => digit === '');
    const focusIndex = lastFilledIndex === -1 ? 5 : Math.max(0, lastFilledIndex - 1);
    inputRefs.current[focusIndex]?.focus();

    // Auto-verify if complete
    if (pastedData.length === 6) {
      handleVerifyCode(pastedData);
    }
  };

  // Verify code
  const handleVerifyCode = async (verificationCode: string) => {
    setIsVerifying(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: userEmail, 
          code: verificationCode 
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          onVerificationSuccess();
          onClose();
        }, 1500);
      } else {
        setError(data.error || 'Invalid verification code');
        // Clear code and focus first input
        setCode(['', '', '', '', '', '']);
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Verification error:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  // Resend verification code
  const handleResendCode = async () => {
    setIsResending(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/resend-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      });

      const data = await response.json();

      if (data.success) {
        // Clear current code
        setCode(['', '', '', '', '', '']);
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      } else {
        setError(data.error || 'Failed to resend code');
      }
    } catch (error) {
      setError('Failed to resend code. Please try again.');
      console.error('Resend error:', error);
    } finally {
      setIsResending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-in fade-in duration-300">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          disabled={isVerifying}
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            {success ? (
              <CheckCircle className="w-8 h-8 text-green-600" />
            ) : (
              <Mail className="w-8 h-8 text-blue-600" />
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {success ? 'Email Verified!' : 'Check your email'}
          </h2>
          
          <p className="text-gray-600 text-sm leading-relaxed">
            {success ? (
              'Your email has been verified successfully. Redirecting...'
            ) : (
              <>
                We sent a 6-digit verification code to<br />
                <span className="font-semibold text-gray-900">{userEmail}</span>
              </>
            )}
          </p>
        </div>

        {!success && (
          <>
            {/* Code inputs */}
            <div className="mb-6">
              <div className="flex justify-center gap-3 mb-4">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleInputChange(index, e.target.value)}
                    onKeyDown={e => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className={`w-12 h-14 text-center text-xl font-bold border-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      error 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-200 focus:border-blue-500'
                    }`}
                    disabled={isVerifying}
                  />
                ))}
              </div>

              {/* Loading state */}
              {isVerifying && (
                <div className="flex items-center justify-center text-blue-600 text-sm">
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  Verifying code...
                </div>
              )}

              {/* Error state */}
              {error && (
                <div className="text-red-600 text-sm text-center bg-red-50 border border-red-200 rounded-lg p-3">
                  {error}
                </div>
              )}
            </div>

            {/* Resend button */}
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-3">
                Didn't receive the code?
              </p>
              
              <button
                onClick={handleResendCode}
                disabled={isResending || isVerifying}
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors disabled:opacity-50"
              >
                {isResending ? (
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Mail className="w-4 h-4 mr-2" />
                )}
                {isResending ? 'Sending...' : 'Resend verification code'}
              </button>
            </div>
          </>
        )}

        {success && (
          <div className="flex items-center justify-center">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-600 mr-2" />
            <span className="text-blue-600 font-medium">Redirecting...</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerificationCodeModal;