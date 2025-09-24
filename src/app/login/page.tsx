"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { publicKeyCredentialToJSON } from "@/utils/webauthn";

// --- Optional helpers (branding + mini help) ---
async function fetchBranding() {
  return { colorScheme: "light", branding: "", logo: null };
}

function LoginAIHelp() {
  return null;
}

// --- Main page ---
export default function LoginPage() {
  const router = useRouter();
  const [branding, setBranding] = useState<any>({ colorScheme: "light", branding: "GhostCRM" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => { fetchBranding().then(setBranding); }, []);

  useEffect(() => {
  if (!password) return setPasswordStrength(null);
  if (password.length < 6) setPasswordStrength("Weak (try more characters)");
  else if (/^[a-zA-Z]+$/.test(password)) setPasswordStrength("Medium (add numbers/symbols)");
  else if (password.length > 10 && /\d/.test(password)) setPasswordStrength("Strong");
  else setPasswordStrength("Good");
  }, [password]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Invalid credentials");
      }
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function startWebAuthn() {
    // Biometrics removed
  }

  return (
  <main className={`min-h-screen flex items-center justify-center bg-gray-100`}>
      {/* Reset modal */}
      {showReset && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-80 relative">
            <button className="absolute top-2 right-2 text-gray-500" onClick={() => setShowReset(false)} aria-label="Close">&times;</button>
            <h3 className="font-bold mb-2 text-lg">Reset Password</h3>
            {resetSent ? (
              <div className="text-green-600 text-sm">Check your email for a password reset link.</div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setResetError("");
                  const res = await fetch("/api/auth/request-reset", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: resetEmail }),
                  });
                  const data = await res.json();
                  if (data.success) setResetSent(true);
                  else setResetError(data.error || "Failed to send reset email.");
                }}
              >
                <label htmlFor="resetEmail" className="block font-bold mb-1">Email</label>
                <input
                  id="resetEmail"
                  type="email"
                  className="border rounded px-3 py-2 w-full mb-2"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
                {resetError && <div className="text-red-600 text-xs mb-2" role="alert">{resetError}</div>}
                <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded font-semibold">Send Reset Link</button>
              </form>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded shadow-lg p-6 w-full max-w-md flex flex-col items-center mx-2 sm:mx-auto">
  <h1 className="text-2xl font-bold mb-2 text-center">Login</h1>

        <form className="w-full" onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="email" className="block font-bold mb-1">Email</label>
            <input id="email" type="email" className="border rounded px-3 py-2 w-full" value={email}
                   onChange={(e) => setEmail(e.target.value)} required autoComplete="email" autoFocus />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block font-bold mb-1">Password</label>
            <div className="relative">
              <input id="password" type={showPassword ? "text" : "password"} className="border rounded px-3 py-2 w-full pr-10"
                     value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
              <button type="button" className="absolute right-2 top-2 text-gray-500 text-sm"
                      onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {passwordStrength && (
              <div className={`text-xs mt-1 ${
                passwordStrength === "Strong" ? "text-green-600"
                : passwordStrength.includes("Weak") ? "text-red-600"
                : "text-yellow-600"}`}>
                {passwordStrength}
              </div>
            )}
          </div>


          <div className="mb-2 flex items-center">
            <input
              id="rememberMe"
              name="rememberMe"
              type="checkbox"
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="rememberMe" className="text-sm">Remember me</label>
          </div>

          {error && <div className="text-red-600 text-sm mt-2" role="alert">{error}</div>}

          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded w-full font-bold hover:bg-blue-700 transition mt-2" disabled={loading} aria-busy={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="mt-2 text-center">
            <button type="button" className="text-blue-600 underline text-sm" onClick={() => setShowReset(true)}>Forgot password?</button>
          </div>
          <div className="mt-2 text-center">
            <a href="/register" className="text-blue-600 underline text-sm">Create an account</a>
          </div>

        </form>

        <div className="mt-4 text-xs text-gray-500 text-center">Powered by GhostCRM • White-label ready</div>
  {/* Branding and white-label removed */}
      </div>

      <div className="fixed bottom-6 right-6 z-50">
  {/* AI help removed */}
      </div>
    </main>
  );
}
