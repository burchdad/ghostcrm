"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pw !== pw2) { setMsg("Passwords do not match."); return; }
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pw }),
      });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const devDetail = data?.detail ? `\n${data.detail}` : "";
          throw new Error((data?.error || "Registration failed") + devDetail);
        }
      setMsg("Account created! Redirecting to login…");
      setTimeout(() => router.push("/login"), 1000);
    } catch (err: any) {
      setMsg(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={onSubmit} className="bg-white p-6 rounded shadow w-full max-w-sm">
        <h1 className="text-xl font-bold mb-4 text-center">Create your GhostCRM account</h1>

        <label className="block text-sm font-semibold mb-1" htmlFor="email">Email</label>
        <input id="email" type="email" className="border rounded px-3 py-2 w-full mb-3"
               value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email" />

        <label className="block text-sm font-semibold mb-1" htmlFor="pw">Password</label>
        <input id="pw" type="password" className="border rounded px-3 py-2 w-full mb-3"
               value={pw} onChange={e=>setPw(e.target.value)} required autoComplete="new-password" />

        <label className="block text-sm font-semibold mb-1" htmlFor="pw2">Confirm password</label>
        <input id="pw2" type="password" className="border rounded px-3 py-2 w-full mb-3"
               value={pw2} onChange={e=>setPw2(e.target.value)} required autoComplete="new-password" />

        {msg && <div className="text-sm mb-3">{msg}</div>}

        <button className="w-full py-2 bg-blue-600 text-white rounded font-bold disabled:opacity-60"
                disabled={loading}>
          {loading ? "Creating…" : "Create account"}
        </button>

        <div className="text-center mt-3 text-sm">
          Already have an account? <a href="/login" className="text-blue-600 underline">Login</a>
        </div>
      </form>
    </main>
  );
}
