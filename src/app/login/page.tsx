"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { publicKeyCredentialToJSON } from "@/utils/webauthn";

// --- Optional helpers (branding + mini help) ---
async function fetchBranding() {
  return { colorScheme: "light", branding: "GhostCRM", logo: null };
}

function LoginAIHelp() {
  const [messages, setMessages] = useState([
    { role: "system", content: "Hi! Need help logging in? Ask about password reset or 2FA." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    const next = [...messages, { role: "user", content: input }];
    setMessages(next);
    try {
      const res = await fetch("/api/security/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      setMessages([...next, { role: "assistant", content: data.reply ?? "Thanks! Try again or contact support." }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "I hit a snag. Try again in a bit." }]);
    }
    setInput("");
    setLoading(false);
  }

  return (
    <div className="bg-white rounded shadow-lg p-4 w-80">
      <div className="font-bold mb-2 text-blue-700">AI Login Help</div>
      <div className="h-32 overflow-y-auto bg-gray-50 rounded p-2 mb-2 text-xs">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "assistant" ? "text-blue-700" : m.role === "user" ? "text-gray-800" : "text-gray-500"}>
            <b>{m.role === "assistant" ? "AI" : m.role === "user" ? "You" : "System"}:</b> {m.content}
          </div>
        ))}
      </div>
      <form onSubmit={send} className="flex gap-2">
        <input
          className="border rounded px-2 py-1 flex-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about login issues…"
          disabled={loading}
        />
        <button className="px-2 py-1 bg-blue-600 text-white rounded" disabled={loading}>Send</button>
      </form>
    </div>
  );
}

// --- Main page ---
export default function LoginPage() {
  const router = useRouter();
  const [branding, setBranding] = useState<any>({ colorScheme: "light", branding: "GhostCRM" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState(""); // optional 6-digit if user has 2FA
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
    else if (password.length > 10 && /\d/.test(password) && /[^a-zA-Z0-9]/.test(password)) setPasswordStrength("Strong");
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
    setLoading(true);
    setError("");
    try {
      // 1) Ask server for auth options
      const r1 = await fetch("/api/security/webauthn-authenticate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const options = await r1.json();
      if (!r1.ok) throw new Error(options?.error || "Biometric login unavailable");

      // 2) Get assertion from authenticator
      const cred: any = await (navigator as any).credentials.get({ publicKey: options });
      const json = publicKeyCredentialToJSON(cred);

      // 3) Verify on server, set cookie/JWT there
      const r2 = await fetch("/api/security/webauthn-authenticate", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, assertionResponse: json }),
      });
      const done = await r2.json();
      if (!r2.ok) throw new Error(done?.error || "Biometric verification failed");

      router.push("/dashboard");
    } catch (e: any) {
      setError(e.message || "Biometric login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={`min-h-screen flex items-center justify-center bg-${branding.colorScheme === "dark" ? "gray-900" : "gray-100"}`}>
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
        {branding.logo && <img src={branding.logo} alt="Logo" className="h-16 mb-4" />}
        <h1 className="text-2xl font-bold mb-2 text-center">{branding.branding} Login</h1>

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

          {/* Optional TOTP step (user types 6-digit if they have 2FA) */}
          <div className="mb-2">
            <label htmlFor="totp" className="block font-bold mb-1">TOTP (if enabled)</label>
            <input id="totp" inputMode="numeric" pattern="[0-9]*" maxLength={6}
                   className="border rounded px-3 py-2 w-full" value={totp}
                   onChange={(e) => setTotp(e.target.value)} placeholder="123456" />
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

          <button type="button" className="px-4 py-2 mt-2 bg-green-600 text-white rounded w-full font-bold hover:bg-green-700 transition"
                  disabled={loading} onClick={startWebAuthn}>
            Login with biometrics
          </button>
        </form>

        <div className="mt-4 text-xs text-gray-500 text-center">Powered by GhostCRM • White-label ready</div>
      </div>

      <div className="fixed bottom-6 right-6 z-50">
        <LoginAIHelp />
      </div>
    </main>
  );
}
