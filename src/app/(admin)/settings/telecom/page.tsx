"use client";
import { useEffect, useState } from "react";

type Provider = { id: string; slug: string; name: string };

export default function TelecomSettings() {
  const [step, setStep] = useState<1|2|3>(1);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [providerId, setProviderId] = useState<string>("");
  const [label, setLabel] = useState("");
  const [meta, setMeta] = useState<any>({});
  const [secrets, setSecrets] = useState<any>({});
  const [e164, setE164] = useState("+1");

  useEffect(() => {
    fetch("/api/telecom/providers").then(r=>r.json()).then(setProviders);
  }, []);

  async function connectAccount() {
    const res = await fetch("/api/telecom/providers/accounts", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider_id: providerId, label, meta, secrets })
    });
    if (!res.ok) return alert("Failed to connect provider");
    setStep(3);
  }

  async function addNumber() {
    const res = await fetch("/api/telecom/phone-numbers", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ e164, provider_account_id: null })
    });
    if (!res.ok) return alert("Failed to add number");
    alert("Number verified & saved. Send a test from Messages!");
  }

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Telecom Setup</h1>

      {step === 1 && (
        <section className="space-y-3">
          <h2 className="font-semibold">1) Choose your provider</h2>
          <select className="border rounded px-3 py-2" value={providerId} onChange={e=>setProviderId(e.target.value)}>
            <option value="">Select provider…</option>
            {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button disabled={!providerId} className="bg-blue-600 text-white px-4 py-2 rounded" onClick={()=>setStep(2)}>Continue</button>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-3">
          <h2 className="font-semibold">2) Connect account</h2>
          <input className="border rounded px-3 py-2 w-full" placeholder="Label (optional)" value={label} onChange={e=>setLabel(e.target.value)} />
          {/* Render minimal per-provider fields; example: Twilio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input className="border rounded px-3 py-2 w-full" placeholder="Account SID / API key" onChange={e=>setSecrets((s:any)=>({ ...s, accountSid:e.target.value, apiKey:e.target.value }))}/>
            <input className="border rounded px-3 py-2 w-full" placeholder="Auth Token / Secret" onChange={e=>setSecrets((s:any)=>({ ...s, authToken:e.target.value, apiSecret:e.target.value }))}/>
            <input className="border rounded px-3 py-2 w-full" placeholder="Default From (+1…)" onChange={e=>setMeta((m:any)=>({ ...m, defaultFrom:e.target.value }))}/>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-2 rounded border" onClick={()=>setStep(1)}>Back</button>
            <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={connectAccount}>Save & Continue</button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="space-y-3">
          <h2 className="font-semibold">3) Add your phone number</h2>
          <input className="border rounded px-3 py-2 w-full" value={e164} onChange={e=>setE164(e.target.value)} />
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={addNumber}>Verify & Save</button>
        </section>
      )}
    </main>
  );
}
