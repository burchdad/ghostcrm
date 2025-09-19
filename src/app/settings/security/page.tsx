"use client";
import { useState } from "react";

export default function SecuritySettings() {
  const [email, setEmail] = useState("");
  const [otpauth, setOtpauth] = useState<string | null>(null);
  const [code, setCode] = useState("");

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Security</h1>

      <div className="max-w-md bg-white rounded shadow p-4 mb-6">
        <h2 className="font-semibold mb-2">TOTP (Authenticator App)</h2>
        <div className="flex gap-2 mb-2">
          <input className="border rounded px-2 py-1 flex-1" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <button className="bg-blue-600 text-white rounded px-3" onClick={async ()=>{
            const r = await fetch("/api/security/totp-setup",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email})});
            const d = await r.json(); setOtpauth(d.otpauth);
          }}>Start</button>
        </div>
        {otpauth && (
          <>
            <div className="text-xs mb-2 break-all">{otpauth}</div>
            <div className="flex gap-2">
              <input className="border rounded px-2 py-1 flex-1" placeholder="6-digit code" value={code} onChange={e=>setCode(e.target.value)} />
              <button className="bg-green-600 text-white rounded px-3" onClick={async ()=>{
                const r = await fetch("/api/security/totp-enable",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email, code})});
                if (r.ok) { alert("TOTP enabled!"); setOtpauth(null); setCode(""); }
                else alert("Invalid code");
              }}>Enable</button>
            </div>
          </>
        )}
      </div>

      <div className="max-w-md bg-white rounded shadow p-4">
        <h2 className="font-semibold mb-2">WebAuthn (Biometrics)</h2>
        <div className="flex gap-2 mb-2">
          <input className="border rounded px-2 py-1 flex-1" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <button className="bg-blue-600 text-white rounded px-3" onClick={async ()=>{
            const r = await fetch("/api/security/webauthn-register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email})});
            const options = await r.json();
            // TODO: use navigator.credentials.create with the options and then PUT to /webauthn-register
            alert("Registration options received. Complete client-side create() flow next.");
          }}>Enroll Device</button>
        </div>
      </div>
    </main>
  );
}
