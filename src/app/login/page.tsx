"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Simple AI Chatbot widget for login help
function LoginAIChatbot() {
  const [messages, setMessages] = useState([
    { role: "system", content: "Hi! I'm your AI assistant. Need help logging in? Ask me anything about password reset, account issues, or onboarding." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage(e) {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setMessages(prev => [...prev, { role: "user", content: input }]);
    // Call backend for AI response
    const res = await fetch("/api/security/ai-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [...messages, { role: "user", content: input }] }),
    });
    const data = await res.json();
    setMessages(prev => [...prev, { role: "user", content: input }, { role: "assistant", content: data.reply }]);
    setInput("");
    setLoading(false);
  }

  return (
    <div className="bg-white rounded shadow-lg p-4 w-80">
      <div className="font-bold mb-2 text-blue-700">AI Login Help</div>
      <div className="h-32 overflow-y-auto bg-gray-50 rounded p-2 mb-2 text-xs">
        {messages.map((m, idx) => (
          <div key={idx} className={m.role === "assistant" ? "text-blue-700" : m.role === "user" ? "text-gray-800" : "text-gray-500"}>
            <b>{m.role === "assistant" ? "AI" : m.role === "user" ? "You" : "System"}:</b> {m.content}
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          type="text"
          className="border rounded px-2 py-1 flex-1"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask about login issues..."
          disabled={loading}
        />
        <button type="submit" className="px-2 py-1 bg-blue-600 text-white rounded" disabled={loading}>Send</button>
      </form>
    </div>
  );
}

// Simulate fetching client branding settings (replace with real API call)
async function fetchBranding() {
  // In production, fetch from /api/settings/branding or similar
  return {
    // ...branding data...
  };
}

// Main Login Page Component
export default function LoginPage() {
  const router = useRouter();
  const [branding, setBranding] = useState<any>({ colorScheme: "light", branding: "GhostCRM" }); // Add default branding
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ai2faRequested, setAi2faRequested] = useState(false);
  const [ai2faCode, setAi2faCode] = useState("");
  const [ai2faInput, setAi2faInput] = useState("");
  const [ai2faError, setAi2faError] = useState("");

  useEffect(() => {
    // Fetch branding info on mount
    fetchBranding().then(setBranding);
  }, []);

  // ...existing code...
  // AI password strength estimation (stub, replace with OpenAI API call)
  useEffect(() => {
    if (!password) {
      setPasswordStrength(null);
      return;
    }
    // Simulate AI feedback
    if (password.length < 6) setPasswordStrength("Weak (try more characters)");
    else if (/^[a-zA-Z]+$/.test(password)) setPasswordStrength("Medium (add numbers/symbols)");
    else if (password.length > 10 && /[0-9]/.test(password) && /[^a-zA-Z0-9]/.test(password)) setPasswordStrength("Strong");
    else setPasswordStrength("Good");
  }, [password]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    // ...existing code...
    try {
      // AI-powered error feedback stub
      if (!email.includes("@")) throw new Error("AI: Please enter a valid email address.");
      if (password.length < 6) throw new Error("AI: Password too short. Try more characters.");
      // Simulate AI-based 2FA (stub)
      if (!ai2faRequested) {
        setAi2faRequested(true);
        setAi2faCode("123456"); // In production, generate and send via email/voice
        setLoading(false);
        return;
      }
      if (ai2faInput !== ai2faCode) throw new Error("AI: Invalid 2FA code. Try again.");
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error("Invalid credentials");
      const data = await res.json();
      localStorage.setItem("ghostcrm_jwt", data.token);
      localStorage.setItem("ghostcrm_role", data.role);
      // Only redirect after successful login
      setTimeout(() => {
        router.push("/dashboard");
      }, 100);
    } catch (err: any) {
      if (ai2faRequested) setAi2faError(err.message || "Login failed");
      else setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={`min-h-screen flex items-center justify-center bg-${branding.colorScheme === "dark" ? "gray-900" : "gray-100"}`}>
      {/* Password Reset Modal - now inside returned JSX */}
      {showReset && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-80 relative">
            <button className="absolute top-2 right-2 text-gray-500" onClick={() => setShowReset(false)} aria-label="Close">&times;</button>
            <h3 className="font-bold mb-2 text-lg">Reset Password</h3>
            {resetSent ? (
              <div className="text-green-600 text-sm">Check your email for a password reset link.</div>
            ) : (
              <form onSubmit={async e => {
                e.preventDefault();
                setResetError("");
                // Call backend to request password reset
                const res = await fetch("/api/auth/request-reset", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email: resetEmail }),
                });
                const data = await res.json();
                if (data.success) setResetSent(true);
                else setResetError(data.error || "Failed to send reset email.");
              }}>
                <label htmlFor="resetEmail" className="block font-bold mb-1">Email</label>
                <input id="resetEmail" type="email" className="border rounded px-3 py-2 w-full mb-2" value={resetEmail} onChange={e => setResetEmail(e.target.value)} required aria-label="Email address" />
                {resetError && <div className="text-red-600 text-xs mb-2" role="alert">{resetError}</div>}
                <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded font-semibold">Send Reset Link</button>
              </form>
            )}
          </div>
        </div>
      )}
      <div className="bg-white rounded shadow-lg p-6 w-full max-w-md flex flex-col items-center mx-2 sm:mx-auto">
        {branding.logo && (
          <img src={branding.logo} alt="Logo" className="h-16 mb-4" style={{ objectFit: "contain" }} />
        )}
        <h1 className="text-2xl font-bold mb-2 text-center">{branding.branding} Login</h1>
        <form className="w-full" onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="email" className="block font-bold mb-1">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="border rounded px-3 py-2 w-full"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              aria-label="Email address"
              autoComplete="email"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block font-bold mb-1">Password</label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                className="border rounded px-3 py-2 w-full pr-10"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                aria-label="Password"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-2 top-2 text-gray-500 text-sm"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={0}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {passwordStrength && (
              <div className={`text-xs mt-1 ${passwordStrength === "Strong" ? "text-green-600" : passwordStrength === "Weak (try more characters)" ? "text-red-600" : "text-yellow-600"}`}>{passwordStrength}</div>
            )}
          </div>
          {error && <div className="text-red-600 text-sm mt-2" role="alert">{error}</div>}
          {/* TOTP 2FA Step */}
          {ai2faRequested && (
            <div className="mt-4 w-full">
              <label htmlFor="ai2fa" className="block font-bold mb-1">Enter TOTP Code (from Authenticator App)</label>
              <input
                id="ai2fa"
                name="ai2fa"
                type="text"
                className="border rounded px-3 py-2 w-full"
                value={ai2faInput}
                onChange={e => setAi2faInput(e.target.value)}
                required
                aria-label="TOTP Code"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                autoComplete="one-time-code"
              />
              {ai2faError && <div className="text-red-600 text-sm mt-2">{ai2faError}</div>}
              {/* QR code setup for new users (stub, replace with backend logic) */}
              <div className="mt-2 text-xs text-gray-600">
                First time? Scan this QR code with Google Authenticator, Authy, or Microsoft Authenticator:<br />
                <img src="/api/security/totp-qr?email=" alt="TOTP QR" className="mt-2 mx-auto" style={{ height: 80 }} />
              </div>
            </div>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded w-full font-bold hover:bg-blue-700 transition flex items-center justify-center"
            disabled={loading}
            aria-busy={loading}
            aria-label={ai2faRequested ? "Verify 2FA" : "Login"}
          >
            {loading && (
              <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
            )}
            {loading ? (ai2faRequested ? "Verifying 2FA..." : "Logging in...") : (ai2faRequested ? "Verify 2FA" : "Login")}
          </button>
          <div className="mt-2 text-center">
            <button type="button" className="text-blue-600 underline text-sm" onClick={() => setShowReset(true)}>
              Forgot password?
            </button>
          </div>
          {/* Biometric login button */}
          <button
            type="button"
            className="px-4 py-2 mt-2 bg-green-600 text-white rounded w-full font-bold hover:bg-green-700 transition"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              setError("");
              try {
                // Call backend to get WebAuthn challenge
                const res = await fetch("/api/security/webauthn/challenge", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email }),
                });
                const challengeData = await res.json();
                // Use WebAuthn API (navigator.credentials.get)
                // This is a placeholder; full implementation requires backend support
                if (window.PublicKeyCredential) {
                  // ...WebAuthn logic here...
                  // For now, just show a message
                  alert("Biometric login is not yet fully implemented. Backend integration required.");
                } else {
                  setError("Biometric login not supported on this device/browser.");
                }
              } catch (err) {
                setError("Biometric login failed.");
              }
              setLoading(false);
            }}
          >Login with biometrics</button>
        </form>
        <div className="mt-4 text-xs text-gray-500 text-center">
          Powered by GhostCRM &bull; White-label ready
        </div>
      </div>
      {/* AI Chatbot Widget for Login Help */}
      <div className="fixed bottom-6 right-6 z-50">
        <LoginAIChatbot />
      </div>
    </main>
  );
}
