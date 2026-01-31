'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Phone, Mail, CheckCircle, RefreshCw, ArrowRight } from 'lucide-react';

interface PostLoginSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  onSetupComplete: () => void;
}

type SetupStep = 'contact-info' | 'verification-method' | 'verify-code';

export function PostLoginSetupModal({ 
  isOpen, 
  onClose, 
  userEmail, 
  onSetupComplete 
}: PostLoginSetupModalProps) {
  const [currentStep, setCurrentStep] = useState<SetupStep>('contact-info');
  const [personalPhone, setPersonalPhone] = useState('');
  const [confirmedEmail, setConfirmedEmail] = useState(userEmail);
  const [verificationMethod, setVerificationMethod] = useState<'email' | 'phone'>('email');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('contact-info');
      setPersonalPhone('');
      setConfirmedEmail(userEmail);
      setCode(['', '', '', '', '', '']);
      setError(null);
      setSuccess(false);
      setCodeSent(false);
    }
  }, [isOpen, userEmail]);

  // Format phone number as user types
  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/\D/g, '');
    const phoneNumberLength = phoneNumber.length;
    
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPersonalPhone(formatted);
  };

  // Handle contact info confirmation
  const handleContactInfoConfirm = async () => {
    if (!personalPhone || personalPhone.replace(/\D/g, '').length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    
    if (!confirmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(confirmedEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Save contact info to user profile
      const response = await fetch('/api/auth/update-contact-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          personalPhone: personalPhone.replace(/\D/g, ''), 
          confirmedEmail 
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setCurrentStep('verification-method');
      } else {
        setError(data.error || 'Failed to update contact information');
      }
    } catch (error) {
      setError('Failed to update contact information. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle verification method selection
  const handleSendVerificationCode = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/send-verification-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          method: verificationMethod,
          email: confirmedEmail,
          phone: personalPhone.replace(/\D/g, '')
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setCodeSent(true);
        setCurrentStep('verify-code');
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      } else {
        setError(data.error || 'Failed to send verification code');
      }
    } catch (error) {
      setError('Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle code input
  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Auto-verify when all digits entered
    if (newCode.every(digit => digit !== '') && newCode.join('').length === 6) {
      handleVerifyCode(newCode.join(''));
    }
  };

  // Handle code verification
  const handleVerifyCode = async (verificationCode: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/verify-setup-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: verificationCode,
          email: confirmedEmail,
          method: verificationMethod
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          onSetupComplete();
          onClose();
        }, 1500);
      } else {
        setError(data.error || 'Invalid verification code');
        setCode(['', '', '', '', '', '']);
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Verification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend code
  const handleResendCode = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/send-verification-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          method: verificationMethod,
          email: confirmedEmail,
          phone: personalPhone.replace(/\D/g, '')
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setCode(['', '', '', '', '', '']);
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      } else {
        setError(data.error || 'Failed to resend code');
      }
    } catch (error) {
      setError('Failed to resend code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Step 1: Contact Information */}
        {currentStep === 'contact-info' && (
          <>
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Update Your Contact Info
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                Let's make sure we have your current contact information for secure access to your account.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="personalPhone" className="block text-sm font-medium text-gray-700 mb-2">
                  Personal Phone Number
                </label>
                <input
                  id="personalPhone"
                  type="tel"
                  value={personalPhone}
                  onChange={handlePhoneChange}
                  placeholder="(555) 123-4567"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={14}
                />
                <p className="text-xs text-gray-500 mt-1">
                  We'll use this for account security notifications
                </p>
              </div>

              <div>
                <label htmlFor="confirmedEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="confirmedEmail"
                  type="email"
                  value={confirmedEmail}
                  onChange={(e) => setConfirmedEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Confirm this is your preferred email address
                </p>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              onClick={handleContactInfoConfirm}
              disabled={isLoading}
              className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <ArrowRight className="w-4 h-4 mr-2" />
              )}
              Confirm Details
            </button>
          </>
        )}

        {/* Step 2: Verification Method */}
        {currentStep === 'verification-method' && (
          <>
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verify Your Identity
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                We'll send a verification code to confirm it's really you.
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div
                onClick={() => setVerificationMethod('email')}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  verificationMethod === 'email'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-600 mr-3" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-500">{confirmedEmail}</p>
                  </div>
                  {verificationMethod === 'email' && (
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  )}
                </div>
              </div>

              <div
                className="p-4 border border-gray-200 rounded-lg opacity-50 cursor-not-allowed"
              >
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-400 mr-3" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-400">SMS (Coming Soon)</p>
                    <p className="text-sm text-gray-400">{personalPhone}</p>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              onClick={handleSendVerificationCode}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <ArrowRight className="w-4 h-4 mr-2" />
              )}
              Send Verification Code
            </button>
          </>
        )}

        {/* Step 3: Verify Code */}
        {currentStep === 'verify-code' && (
          <>
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {success ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <Mail className="w-6 h-6 text-blue-600" />
                )}
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {success ? 'Verified!' : 'Enter Verification Code'}
              </h2>
              
              <p className="text-gray-600 text-sm leading-relaxed">
                {success ? (
                  'Your account has been verified successfully.'
                ) : (
                  <>
                    We sent a 6-digit code to<br />
                    <span className="font-semibold text-gray-900">{confirmedEmail}</span>
                  </>
                )}
              </p>
            </div>

            {!success && (
              <>
                {/* Code inputs */}
                <div className="flex justify-center space-x-2 mb-6">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      ref={el => { inputRefs.current[index] = el; }}
                      type="text"
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      maxLength={1}
                    />
                  ))}
                </div>

                {/* Loading state */}
                {isLoading && (
                  <div className="flex items-center justify-center text-blue-600 text-sm mb-4">
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    Verifying code...
                  </div>
                )}

                {/* Error state */}
                {error && (
                  <div className="text-red-600 text-sm text-center bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    {error}
                  </div>
                )}

                {/* Resend button */}
                <div className="text-center">
                  <p className="text-gray-500 text-sm mb-3">
                    Didn't receive the code?
                  </p>
                  
                  <button
                    onClick={handleResendCode}
                    disabled={isLoading}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Resend Code
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default PostLoginSetupModal;