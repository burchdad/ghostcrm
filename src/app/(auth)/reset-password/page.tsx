"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";

function ResetPasswordForm() {
  const sp = useSearchParams();
  const router = useRouter();
  const [email] = useState(sp.get("email") ?? "");
  const [token] = useState(sp.get("token") ?? "");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pw !== pw2) return setMsg("Passwords do not match.");
    setLoading(true);
    setMsg("");
    const res = await fetch("/api/auth/request-reset", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token, newPassword: pw }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) return setMsg(data?.error || "Reset failed.");
    setMsg("Password updated. Redirecting to login…");
    setTimeout(() => router.push("/login"), 1200);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={submit} className="bg-white p-6 rounded shadow w-full max-w-sm">
        <h1 className="text-xl font-bold mb-4">Reset Password</h1>
        <input className="hidden" value={email} readOnly />
        <input className="hidden" value={token} readOnly />
        <label className="block text-sm font-semibold mb-1">New password</label>
        <input type="password" className="border rounded px-3 py-2 w-full mb-3" value={pw} onChange={e=>setPw(e.target.value)} required />
        <label className="block text-sm font-semibold mb-1">Confirm new password</label>
        <input type="password" className="border rounded px-3 py-2 w-full mb-3" value={pw2} onChange={e=>setPw2(e.target.value)} required />
        {msg && <div className="text-sm mb-2">{msg}</div>}
        <button className="w-full py-2 bg-blue-600 text-white rounded font-bold" disabled={loading}>
          {loading ? "Saving…" : "Save"}
        </button>
      </form>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
