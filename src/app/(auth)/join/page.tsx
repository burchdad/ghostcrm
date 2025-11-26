"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

const supa = createClient();

export default function JoinPage({ searchParams }: any) {
  const token = String(searchParams?.token || "");
  const [email, setEmail] = useState(""); const [pw, setPw] = useState(""); const [msg,setMsg]=useState("");

  async function accept(e: any) {
    e.preventDefault();
    setMsg("");
    // fetch invite to get org_id & role
    const res = await fetch(`/api/invites/resolve?token=${token}`);
    const inv = await res.json();
    if (!res.ok) return setMsg(inv.error || "Invite invalid/expired.");

    const { error } = await supa.auth.signUp({
      email, password: pw,
      options: { data: { join_org_id: inv.org_id, role: inv.role } }
    });
    if (error) return setMsg(error.message);
    setMsg("Check your email to confirm your account.");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={accept} className="bg-white p-6 rounded shadow w-full max-w-sm">
        <h1 className="text-xl font-bold mb-4 text-center">Join GhostCRM</h1>
        <input className="border rounded px-3 py-2 w-full mb-3" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="border rounded px-3 py-2 w-full mb-3" placeholder="Password" type="password" value={pw} onChange={e=>setPw(e.target.value)} />
        {msg && <div className="text-sm mb-3">{msg}</div>}
        <button className="w-full py-2 bg-blue-600 text-white rounded font-bold">Create account</button>
      </form>
    </main>
  );
}
