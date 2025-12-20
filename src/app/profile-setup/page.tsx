'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, CheckCircle, User, Lock, Building } from 'lucide-react';

// Profile setup form schema
const profileSetupSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  newPassword: z.string().min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ProfileSetupData = z.infer<typeof profileSetupSchema>;

interface UserData {
  email: string;
  role: string;
  organizationName?: string;
}

export default function ProfileSetupPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const token = searchParams.get('token');
  const userId = searchParams.get('userId');

  const form = useForm<ProfileSetupData>({
    resolver: zodResolver(profileSetupSchema),
    mode: "onBlur",
  });

  const { register, handleSubmit, formState: { errors }, setError: setFieldError } = form;

  useEffect(() => {
    const verifyAccess = async () => {
      if (!token || !userId) {
        setError('Missing required parameters. Please use the link from your invitation email.');
        setLoading(false);
        return;
      }

      try {
        // Verify the invite token is still valid
        const response = await fetch(`/api/team/invite/verify?token=${token}`);
        const data = await response.json();

        if (!data.success) {
          setError(data.message || 'Invalid or expired invitation');
          setLoading(false);
          return;
        }

        setUserData(data.invite);
        setLoading(false);
      } catch (error) {
        console.error('Failed to verify access:', error);
        setError('Failed to verify invitation. Please try again.');
        setLoading(false);
      }
    };

    verifyAccess();
  }, [token, userId]);

  const onSubmit = async (data: ProfileSetupData) => {
    setSubmitting(true);
    setError(null);

    try {
      console.log('🔧 [PROFILE-SETUP] Completing profile setup:', { userId, email: userData?.email });

      const response = await fetch('/api/team/invite/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          userId,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          newPassword: data.newPassword,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.message || 'Failed to complete profile setup');
        setSubmitting(false);
        return;
      }

      console.log('✅ [PROFILE-SETUP] Profile setup completed successfully');

      // Redirect to appropriate dashboard based on role
      const redirectUrl = getRoleBasedRedirect(userData?.role || 'sales_representative');
      router.push(redirectUrl);

    } catch (error) {
      console.error('❌ [PROFILE-SETUP] Setup error:', error);
      setError('An error occurred while completing your profile. Please try again.');
      setSubmitting(false);
    }
  };

  const getRoleBasedRedirect = (role: string): string => {
    switch (role) {
      case 'owner':
        return '/owner/dashboard';
      case 'sales_manager':
        return '/sales-manager/dashboard';
      case 'sales_representative':
      default:
        return '/sales-rep/dashboard';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying your invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Welcome to the Team!</h1>
          <p className="text-indigo-100 text-sm">Complete your profile to get started</p>
        </div>

        {/* User Info */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{userData?.email}</p>
              <p className="text-sm text-gray-500 capitalize">
                {userData?.role?.replace('_', ' ')} • {userData?.organizationName}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                {...register("firstName")}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.firstName ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="John"
              />
              {errors.firstName && (
                <p className="text-red-600 text-xs mt-1">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                {...register("lastName")}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.lastName ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Smith"
              />
              {errors.lastName && (
                <p className="text-red-600 text-xs mt-1">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              {...register("phone")}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.phone ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="(555) 123-4567"
            />
            {errors.phone && (
              <p className="text-red-600 text-xs mt-1">{errors.phone.message}</p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register("newPassword")}
                className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.newPassword ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Create a secure password"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-red-600 text-xs mt-1">{errors.newPassword.message}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              Must be at least 8 characters with uppercase, lowercase, and number
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword")}
                className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.confirmPassword ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Confirm your password"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-600 text-xs mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Completing Setup...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Complete Profile Setup
              </>
            )}
          </button>

          <div className="text-center pt-4">
            <p className="text-xs text-gray-500">
              By completing your profile, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}