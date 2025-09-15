import React, { useState } from "react";

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

export default function ClientOnboardingPage() {
  const [form, setForm] = useState(defaultOnboarding);
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    alert("Onboarding complete! Your demo and integrations are now personalized.");
    // Here, you would trigger backend logic to:
    // - Generate API keys
    // - Create dedicated Supabase DB
    // - Set up integrations
    // - Store logo and settings
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">🚀 Client Onboarding</h1>
      <form className="bg-white rounded shadow p-4 mb-4" onSubmit={handleSubmit}>
        <div className="mb-2">
          <label className="font-bold">Company Name</label>
          <input type="text" name="companyName" value={form.companyName} onChange={handleChange} className="border rounded px-2 py-1 ml-2 w-full" required />
        </div>
        <div className="mb-2">
          <label className="font-bold">Contact Name</label>
          <input type="text" name="contactName" value={form.contactName} onChange={handleChange} className="border rounded px-2 py-1 ml-2 w-full" required />
        </div>
        <div className="mb-2">
          <label className="font-bold">Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} className="border rounded px-2 py-1 ml-2 w-full" required />
        </div>
        <div className="mb-2">
          <label className="font-bold">Phone</label>
          <input type="text" name="phone" value={form.phone} onChange={handleChange} className="border rounded px-2 py-1 ml-2 w-full" required />
        </div>
        <div className="mb-2">
          <label className="font-bold">Logo URL</label>
          <input type="text" name="logo" value={form.logo} onChange={handleChange} className="border rounded px-2 py-1 ml-2 w-full" placeholder="https://yourlogo.com/logo.png" />
        </div>
        <div className="mb-2">
          <label className="font-bold">Role</label>
          <select name="role" value={form.role} onChange={handleChange} className="border rounded px-2 py-1 ml-2">
            <option value="manager">Manager</option>
            <option value="sales">Sales Representative</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="mb-2">
          <label className="font-bold">OpenAI API Key</label>
          <input type="text" name="openaiKey" value={form.openaiKey} onChange={handleChange} className="border rounded px-2 py-1 ml-2 w-full" placeholder="sk-..." />
        </div>
        <div className="mb-2">
          <label className="font-bold">Supabase DB Name</label>
          <input type="text" name="supabaseDb" value={form.supabaseDb} onChange={handleChange} className="border rounded px-2 py-1 ml-2 w-full" placeholder="client-db-name" />
        </div>
        <div className="mb-2">
          <label className="font-bold">Inventory Integration</label>
          <select name="inventoryIntegration" value={form.inventoryIntegration} onChange={handleChange} className="border rounded px-2 py-1 ml-2">
            <option value="csv">CSV Upload</option>
            <option value="external">Connect External Tracker</option>
          </select>
        </div>
        <button className="px-2 py-1 bg-green-500 text-white rounded" type="submit">Complete Onboarding</button>
        {submitted && <div className="text-xs text-green-700 mt-2">Onboarding complete! Your demo and integrations are now personalized.</div>}
      </form>
    </div>
  );
}
