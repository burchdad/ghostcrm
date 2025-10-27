import React, { useState } from 'react';
import { Loader2, Play, User, Lock } from 'lucide-react';
import { DEMO_CREDENTIALS } from '@/lib/demo/demo-data-provider';

interface DemoLoginFormProps {
  onLogin?: (result: any) => void;
  onError?: (error: string) => void;
}

export default function DemoLoginForm({ onLogin, onError }: DemoLoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Login failed');
      }

      if (result.demo_mode) {
        setMessage('🎬 Demo environment loaded with sample data!');
      } else {
        setMessage('✅ Login successful!');
      }

      onLogin?.(result);
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred during login';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsDemoLoading(true);
    setError('');
    setMessage('🎬 Loading demo environment...');

    try {
      const response = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: DEMO_CREDENTIALS.email,
          password: DEMO_CREDENTIALS.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Demo login failed');
      }

      setMessage('🎬 Demo environment loaded successfully!');
      onLogin?.(result);
    } catch (err: any) {
      const errorMessage = err.message || 'Demo initialization failed';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome to GhostCRM
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account or try our demo
          </p>
        </div>

        {/* Demo Button - Prominent placement */}
        <div className="border border-blue-200 bg-blue-50 rounded-lg p-6">
          <div className="text-center mb-4">
            <h3 className="text-blue-900 flex items-center justify-center gap-2 text-lg font-semibold">
              <Play className="w-5 h-5" />
              Try Our Demo
            </h3>
            <p className="text-blue-700 text-sm mt-2">
              Experience GhostCRM with pre-loaded sample data from Premier Auto Sales
            </p>
          </div>
          <button
            onClick={handleDemoLogin}
            disabled={isDemoLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isDemoLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                Initializing Demo...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4 inline" />
                Launch Demo
              </>
            )}
          </button>
        </div>

        {/* Regular Login Form */}
        <div className="border border-gray-200 rounded-lg p-6 bg-white">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Sign In</h3>
            <p className="text-sm text-gray-600">
              Enter your credentials to access your account
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        {/* Demo Credentials Helper */}
        <div className="border border-gray-200 bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 text-center">
            <strong>Demo Credentials:</strong><br />
            Email: <code className="bg-gray-200 px-1 rounded text-xs">{DEMO_CREDENTIALS.email}</code><br />
            Password: <code className="bg-gray-200 px-1 rounded text-xs">{DEMO_CREDENTIALS.password}</code>
          </p>
        </div>

        {/* Messages */}
        {message && (
          <div className="border border-green-200 bg-green-50 rounded-lg p-4">
            <p className="text-green-800 text-sm">{message}</p>
          </div>
        )}

        {error && (
          <div className="border border-red-200 bg-red-50 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Demo Features List */}
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Demo Features</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>✓ Sample leads and customer data</li>
            <li>✓ Active deals pipeline</li>
            <li>✓ Vehicle inventory</li>
            <li>✓ Team performance metrics</li>
            <li>✓ Calendar appointments</li>
            <li>✓ Activity tracking</li>
            <li>✓ Marketing campaigns</li>
            <li>✓ Real-time notifications</li>
          </ul>
        </div>
      </div>
    </div>
  );
}