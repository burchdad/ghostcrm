import React, { useState } from "react";

export default function CustomBrandingWhiteLabeling() {
  const [theme, setTheme] = useState("light");
  const [logo, setLogo] = useState("");
  const [domain, setDomain] = useState("");

  function handleSave() {
    alert("Branding settings saved!");
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">🎨 Custom Branding & White-labeling</h1>
      <div className="bg-white rounded shadow p-4 mb-4">
        <div className="mb-2">
          <label className="font-bold">Theme</label>
          <select value={theme} onChange={e => setTheme(e.target.value)} className="border rounded px-2 py-1 ml-2">
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        <div className="mb-2">
          <label className="font-bold">Logo URL</label>
          <input type="text" value={logo} onChange={e => setLogo(e.target.value)} className="border rounded px-2 py-1 ml-2" placeholder="https://yourlogo.com/logo.png" />
        </div>
        <div className="mb-2">
          <label className="font-bold">Custom Domain</label>
          <input type="text" value={domain} onChange={e => setDomain(e.target.value)} className="border rounded px-2 py-1 ml-2" placeholder="crm.yourdomain.com" />
        </div>
        <button className="px-2 py-1 bg-green-500 text-white rounded" onClick={handleSave}>Save Branding</button>
      </div>
    </div>
  );
}
