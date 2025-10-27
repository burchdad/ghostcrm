import React, { useState } from "react";

const PROVIDERS = [
  { slug: "twilio", name: "Twilio" },
  { slug: "telnyx", name: "Telnyx" },
  { slug: "ringcentral", name: "RingCentral" }
];

export default function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const [provider, setProvider] = useState<string>("");
  const [meta, setMeta] = useState<any>({});
  const [number, setNumber] = useState("");
  const [verified, setVerified] = useState(false);
  const [testResult, setTestResult] = useState<string>("");

  // Step 1: Pick provider
  if (step === 1) {
    return (
      <div>
        <h2>Pick Provider</h2>
        {PROVIDERS.map(p => (
          <button key={p.slug} onClick={() => { setProvider(p.slug); setStep(2); }}>{p.name}</button>
        ))}
      </div>
    );
  }

  // Step 2: Connect account
  if (step === 2) {
    return (
      <div>
        <h2>Connect {provider} Account</h2>
        {/* Render provider-specific fields */}
        {provider === "twilio" && (
          <div>
            <input placeholder="Account SID" onChange={e => setMeta({ ...meta, accountSid: e.target.value })} />
            <input placeholder="Auth Token" onChange={e => setMeta({ ...meta, authToken: e.target.value })} />
            <input placeholder="Default From" onChange={e => setMeta({ ...meta, defaultFrom: e.target.value })} />
          </div>
        )}
        {provider === "telnyx" && (
          <div>
            <input placeholder="API Key" onChange={e => setMeta({ ...meta, apiKey: e.target.value })} />
            <input placeholder="Messaging Profile ID" onChange={e => setMeta({ ...meta, messagingProfileId: e.target.value })} />
            <input placeholder="Default From" onChange={e => setMeta({ ...meta, defaultFrom: e.target.value })} />
          </div>
        )}
        {/* Add RingCentral fields as needed */}
        <button onClick={() => setStep(3)}>Next: Add Number</button>
      </div>
    );
  }

  // Step 3: Add/verify number
  if (step === 3) {
    return (
      <div>
        <h2>Add/Verify Number</h2>
        <input placeholder="E.164 Number" value={number} onChange={e => setNumber(e.target.value)} />
        <button onClick={async () => {
          // Call /api/telecom/phone-numbers to verify and save
          const resp = await fetch("/api/telecom/phone-numbers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ e164: number, provider_account_id: "demo" })
          });
          const data = await resp.json();
          setVerified(!!data.verified);
          setStep(4);
        }}>Verify & Save</button>
      </div>
    );
  }

  // Step 4: Test send
  if (step === 4) {
    return (
      <div>
        <h2>Send Test SMS</h2>
        <button onClick={async () => {
          const resp = await fetch("/api/messages/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ to: number, body: "Test from GhostCRM!" })
          });
          const data = await resp.json();
          setTestResult(data.ok ? "Success!" : `Error: ${data.error}`);
        }}>Send Test</button>
        {testResult && <div>{testResult}</div>}
      </div>
    );
  }

  return null;
}
