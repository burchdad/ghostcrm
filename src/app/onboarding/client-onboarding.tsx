import React, { useState } from "react";
import { Tooltip } from "@/components/Tooltip";

const defaultOnboarding = {
  companyName: "",
  contactName: "",
  email: "",
  phone: "",
  logo: "",
  role: "manager",
  openaiKey: "",
  supabaseDb: "",
  inventoryIntegration: "csv",
};

const onboardingTips = [
  "Welcome! Let's get your company set up. Fill in your business details to personalize your CRM experience.",
  "Branding matters! Upload your logo and select your role for tailored features.",
  "Integrate your tools for automation and AI-powered insights. Connect your inventory and enable AI features.",
];

export default function ClientOnboardingPage() {
  const [form, setForm] = useState(defaultOnboarding);
  const [submitted, setSubmitted] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [step, setStep] = useState(0);
  const router = require('next/navigation').useRouter?.() ?? null;

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }
  function nextStep() {
    setStep(s => Math.min(s + 1, steps.length - 1));
  }
  function prevStep() {
    setStep(s => Math.max(s - 1, 0));
  }
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setRedirecting(true);
      if (router) router.push("/login");
    }, 1500);
    // Here, you would trigger backend logic to:
    // - Generate API keys
    // - Create dedicated Supabase DB
    // - Set up integrations
    // - Store logo and settings
  }

  const steps = [
    {
      label: "Company Info",
      content: (
        <>
          <div className="mb-2">
            <label className="font-bold">
              Company Name
              <Tooltip text="Your business or organization name.">
                <span className="ml-1 cursor-pointer" aria-label="Info">ℹ️</span>
              </Tooltip>
            </label>
            <input type="text" name="companyName" value={form.companyName} onChange={handleChange} className="border rounded px-2 py-1 ml-2 w-full" required />
          </div>
          <div className="mb-2">
            <label className="font-bold">
              Contact Name
              <Tooltip text="Primary contact for onboarding.">
                <span className="ml-1 cursor-pointer" aria-label="Info">ℹ️</span>
              </Tooltip>
            </label>
            <input type="text" name="contactName" value={form.contactName} onChange={handleChange} className="border rounded px-2 py-1 ml-2 w-full" required />
          </div>
          <div className="mb-2">
            <label className="font-bold">
              Email
              <Tooltip text="Contact email for notifications.">
                <span className="ml-1 cursor-pointer" aria-label="Info">ℹ️</span>
              </Tooltip>
            </label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className="border rounded px-2 py-1 ml-2 w-full" required />
          </div>
          <div className="mb-2">
            <label className="font-bold">
              Phone
              <Tooltip text="Contact phone number.">
                <span className="ml-1 cursor-pointer" aria-label="Info">ℹ️</span>
              </Tooltip>
            </label>
            <input type="text" name="phone" value={form.phone} onChange={handleChange} className="border rounded px-2 py-1 ml-2 w-full" required />
          </div>
        </>
      )
    },
    {
      label: "Brand & Role",
      content: (
        <>
          <div className="mb-2">
            <label className="font-bold">
              Logo URL
              <Tooltip text="Paste a link to your company logo.">
                <span className="ml-1 cursor-pointer" aria-label="Info">ℹ️</span>
              </Tooltip>
            </label>
            <input type="text" name="logo" value={form.logo} onChange={handleChange} className="border rounded px-2 py-1 ml-2 w-full" placeholder="https://yourlogo.com/logo.png" />
          </div>
          <div className="mb-2">
            <label className="font-bold">
              Role
              <Tooltip text="Select your primary role.">
                <span className="ml-1 cursor-pointer" aria-label="Info">ℹ️</span>
              </Tooltip>
            </label>
            <select name="role" value={form.role} onChange={handleChange} className="border rounded px-2 py-1 ml-2">
              <option value="manager">Manager</option>
              <option value="sales">Sales Representative</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </>
      )
    },
    {
      label: "Integrations",
      content: (
        <>
          <div className="mb-2">
            <label className="font-bold">
              OpenAI API Key
              <Tooltip text="Paste your OpenAI API key for AI features.">
                <span className="ml-1 cursor-pointer" aria-label="Info">ℹ️</span>
              </Tooltip>
            </label>
            <input type="text" name="openaiKey" value={form.openaiKey} onChange={handleChange} className="border rounded px-2 py-1 ml-2 w-full" placeholder="sk-..." />
          </div>
          <div className="mb-2">
            <label className="font-bold">
              Supabase DB Name
              <Tooltip text="Name for your dedicated Supabase database.">
                <span className="ml-1 cursor-pointer" aria-label="Info">ℹ️</span>
              </Tooltip>
            </label>
            <input type="text" name="supabaseDb" value={form.supabaseDb} onChange={handleChange} className="border rounded px-2 py-1 ml-2 w-full" placeholder="client-db-name" />
          </div>
          <div className="mb-2">
            <label className="font-bold">
              Inventory Integration
              <Tooltip text="Choose how to sync your inventory.">
                <span className="ml-1 cursor-pointer" aria-label="Info">ℹ️</span>
              </Tooltip>
            </label>
            <select name="inventoryIntegration" value={form.inventoryIntegration} onChange={handleChange} className="border rounded px-2 py-1 ml-2">
              <option value="csv">CSV Upload</option>
              <option value="external">Connect External Tracker</option>
            </select>
          </div>
        </>
      )
    }
  ];
  return (
    <div
      className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6 bg-white rounded shadow"
      role="main"
      aria-label="Client Onboarding"
      tabIndex={0}
      style={{ outline: 'none' }}
    >
      <h1 className="text-2xl font-bold mb-4">🚀 Client Onboarding</h1>
      {/* Persistent onboarding banner */}
      <div className="mb-4 px-4 py-3 bg-blue-50 border-l-4 border-blue-400 text-blue-900 rounded" role="status" aria-live="polite">
        <span className="font-semibold">Tip:</span> {onboardingTips[step]}
      </div>
      <div className="flex flex-wrap items-center mb-6" aria-label="Onboarding Steps" role="list">
        {steps.map((s, i) => (
          <div
            key={i}
            className={`flex items-center mb-2 ${i < step ? 'text-green-600' : i === step ? 'text-blue-600' : 'text-gray-400'}`}
            role="listitem"
            tabIndex={0}
            aria-current={i === step ? 'step' : undefined}
            style={{ outline: 'none' }}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') setStep(i);
            }}
          >
            <div className={`rounded-full w-8 h-8 flex items-center justify-center font-bold border-2 ${i === step ? 'border-blue-600' : 'border-gray-300'}`}>{i + 1}</div>
            <span className="ml-2 mr-4 font-semibold">{s.label}</span>
            {i < steps.length - 1 && <span className="mx-2">→</span>}
          </div>
        ))}
      </div>
      <form
        className="bg-white rounded shadow p-4 mb-4"
        onSubmit={handleSubmit}
        aria-label={`Onboarding Step: ${steps[step].label}`}
        tabIndex={0}
        style={{ outline: 'none' }}
      >
        {/* Step-specific contextual help */}
        <div className="mb-4">
          <span className="text-xs text-gray-500">{onboardingTips[step]}</span>
        </div>
        {steps[step].content}
        <div className="flex gap-2 mt-4">
          {step > 0 && <button type="button" className="px-2 py-1 bg-gray-200 rounded" onClick={prevStep}>Back</button>}
          {step < steps.length - 1 && <button type="button" className="px-2 py-1 bg-blue-500 text-white rounded" onClick={nextStep}>Next</button>}
          {step === steps.length - 1 && <button className="px-2 py-1 bg-green-500 text-white rounded" type="submit">Complete Onboarding</button>}
        </div>
        {submitted && (
          <div className="text-xs text-green-700 mt-2" aria-live="polite">
            Onboarding complete! Your demo and integrations are now personalized.<br />
            {redirecting ? "Redirecting to login..." : "You will be redirected to login."}
          </div>
        )}
      </form>
    </div>
  );
}
