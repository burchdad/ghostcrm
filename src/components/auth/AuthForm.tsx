"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Car, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import ContactSalesModal from "@/components/ContactSalesModal";
import AuthToggle from "./AuthToggle";
import { loginSchema, registerSchema, LoginFormData, RegisterFormData } from "./schemas";

interface AuthFormProps {
  isLogin: boolean;
  onToggle: (isLogin: boolean) => void;
}

export default function AuthForm({ isLogin, onToggle }: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showContactSales, setShowContactSales] = useState(false);
  const router = useRouter();
  const { login, register: authRegister, isLoading } = useAuth();

  // Conditional form setup based on mode
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });
  
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
  });

  // Reset form when switching between login/register
  React.useEffect(() => {
    if (isLogin) {
      loginForm.reset();
    } else {
      registerForm.reset();
    }
  }, [isLogin, loginForm, registerForm]);

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

  const onRegisterSubmit = async (data: RegisterFormData) => {
    try {
      await authRegister({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        dealership: data.dealership,
        phone: data.phone,
      });
      router.push("/billing");
    } catch (error: any) {
      registerForm.setError("root", {
        type: "manual",
        message: error.message || "An error occurred. Please try again.",
      });
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Mobile Logo */}
      <div className="lg:hidden flex items-center justify-center mb-8">
        <Car className="w-8 h-8 mr-2 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Ghost Auto CRM</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {isLogin ? "Welcome Back" : "Get Started"}
          </h2>
          <p className="text-gray-600">
            {isLogin 
              ? "Sign in to your Ghost Auto CRM account" 
              : "Create your Ghost Auto CRM account"
            }
          </p>
        </div>

        {/* Auth Toggle */}
        <AuthToggle isLogin={isLogin} onToggle={onToggle} />

        {/* Conditional Form Rendering */}
        {isLogin ? (
          <LoginForm 
            form={loginForm}
            onSubmit={onLoginSubmit}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            isLoading={isLoading}
          />
        ) : (
          <RegisterForm 
            form={registerForm}
            onSubmit={onRegisterSubmit}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            isLoading={isLoading}
          />
        )}

        {/* Demo Access */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Want to try it out first?
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <Car className="w-4 h-4 mr-2" />
              View Demo Dashboard
            </Link>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">Need help getting started?</p>
            <div className="flex justify-center space-x-4">
              <a
                href="mailto:support@ghostautocrm.com"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
              >
                <Mail className="w-4 h-4 mr-1" />
                Email Support
              </a>
              <button
                onClick={() => setShowContactSales(true)}
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 transition-colors"
              >
                <Phone className="w-4 h-4 mr-1" />
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            {...register("email")}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.email ? "border-red-300" : "border-gray-300"
            }`}
            placeholder="john@premierauto.com"
            autoComplete="email"
          />
          {errors.email && (
            <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pr-10 ${
                errors.password ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            Remember me
          </label>
          <Link href="/reset-password" className="text-sm text-blue-600 hover:text-blue-500 font-medium">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
    </>
  );
}

// Register Form Component
interface RegisterFormProps {
  form: ReturnType<typeof useForm<RegisterFormData>>;
  onSubmit: (data: RegisterFormData) => Promise<void>;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  isLoading: boolean;
}

function RegisterForm({ form, onSubmit, showPassword, setShowPassword, isLoading }: RegisterFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = form;

  return (
    <>
      {/* Root error display */}
      {errors.root && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
          {errors.root.message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              {...register("firstName")}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.firstName ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="John"
            />
            {errors.firstName && (
              <p className="text-red-600 text-xs mt-1">{errors.firstName.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              {...register("lastName")}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.lastName ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Smith"
            />
            {errors.lastName && (
              <p className="text-red-600 text-xs mt-1">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dealership Name
          </label>
          <input
            type="text"
            {...register("dealership")}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.dealership ? "border-red-300" : "border-gray-300"
            }`}
            placeholder="Premier Auto Sales"
          />
          {errors.dealership && (
            <p className="text-red-600 text-xs mt-1">{errors.dealership.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            {...register("phone")}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.phone ? "border-red-300" : "border-gray-300"
            }`}
            placeholder="(555) 123-4567"
          />
          {errors.phone && (
            <p className="text-red-600 text-xs mt-1">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            {...register("email")}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.email ? "border-red-300" : "border-gray-300"
            }`}
            placeholder="john@premierauto.com"
            autoComplete="email"
          />
          {errors.email && (
            <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pr-10 ${
                errors.password ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Create a strong password"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            {...register("confirmPassword")}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.confirmPassword ? "border-red-300" : "border-gray-300"
            }`}
            placeholder="Confirm your password"
            autoComplete="new-password"
          />
          {errors.confirmPassword && (
            <p className="text-red-600 text-xs mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
              Creating Account...
            </>
          ) : (
            "Create Account"
          )}
        </button>

        <div className="text-xs text-gray-500 text-center">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="text-blue-600 hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-blue-600 hover:underline">
            Privacy Policy
          </Link>
        </div>
      </form>
    </>
  );
}