import React, { useState } from "react";

const defaultSettings = {
  layout: "default",
  colorScheme: "light",
  theme: "classic",
  logo: "",
  branding: "GhostCRM",
  email: "",
  phone: "",
  calendar: "",
  openaiKey: "",
  customKeys: "",
};

export default function ClientSettingsPage() {
  const [settings, setSettings] = useState(defaultSettings);
  const [saved, setSaved] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  }
  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    alert("Settings saved!");
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">⚙️ Client Settings</h1>
      <form className="bg-white rounded shadow p-4 mb-4" onSubmit={handleSave}>
        <div className="mb-2">
          <label className="font-bold">Layout</label>
          <select name="layout" value={settings.layout} onChange={handleChange} className="border rounded px-2 py-1 ml-2">
            <option value="default">Default</option>
            <option value="compact">Compact</option>
            <option value="expanded">Expanded</option>
          </select>
        </div>
        <div className="mb-2">
          <label className="font-bold">Color Scheme</label>
          <select name="colorScheme" value={settings.colorScheme} onChange={handleChange} className="border rounded px-2 py-1 ml-2">
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        <div className="mb-2">
          <label className="font-bold">Theme</label>
          <select name="theme" value={settings.theme} onChange={handleChange} className="border rounded px-2 py-1 ml-2">
            <option value="classic">Classic</option>
            <option value="modern">Modern</option>
            <option value="minimal">Minimal</option>
          </select>
        </div>
        <div className="mb-2">
          <label className="font-bold">Logo URL</label>
          <input type="text" name="logo" value={settings.logo} onChange={handleChange} className="border rounded px-2 py-1 ml-2 w-full" placeholder="https://yourlogo.com/logo.png" />
        </div>
        <div className="mb-2">
          <label className="font-bold">Branding Name</label>
          <input type="text" name="branding" value={settings.branding} onChange={handleChange} className="border rounded px-2 py-1 ml-2 w-full" />
        </div>
        <div className="mb-2">
          <label className="font-bold">Email (Send/Reply)</label>
          <input type="email" name="email" value={settings.email} onChange={handleChange} className="border rounded px-2 py-1 ml-2 w-full" />
        </div>
        <div className="mb-2">
          <label className="font-bold">Phone Number (Routing)</label>
          <input type="text" name="phone" value={settings.phone} onChange={handleChange} className="border rounded px-2 py-1 ml-2 w-full" />
        </div>
        <div className="mb-2">
          <label className="font-bold">Calendar Integration</label>
          <input type="text" name="calendar" value={settings.calendar} onChange={handleChange} className="border rounded px-2 py-1 ml-2 w-full" placeholder="Google/Outlook/iCal URL" />
        </div>
        <div className="mb-2">
          <label className="font-bold">OpenAI API Key</label>
          <input type="text" name="openaiKey" value={settings.openaiKey} onChange={handleChange} className="border rounded px-2 py-1 ml-2 w-full" />
        </div>
        <div className="mb-2">
          <label className="font-bold">Custom API Keys/Endpoints</label>
          <input type="text" name="customKeys" value={settings.customKeys} onChange={handleChange} className="border rounded px-2 py-1 ml-2 w-full" placeholder="Comma separated or JSON" />
        </div>
        <button className="px-2 py-1 bg-green-500 text-white rounded" type="submit">Save Settings</button>
        {saved && <div className="text-xs text-green-700 mt-2">Settings saved!</div>}
      </form>
    </div>
  );
}
