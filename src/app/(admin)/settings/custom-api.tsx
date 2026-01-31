import React, { useState } from "react";

const defaultIntegrations = {
  emailAPI: "",
  smsAPI: "",
  phoneRoutingAPI: "",
  calendarAPI: "",
  openaiAPI: "",
  otherAPIs: "",
};

export default function CustomAPIIntegrations() {
  const [integrations, setIntegrations] = useState(defaultIntegrations);
  const [saved, setSaved] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setIntegrations({ ...integrations, [e.target.name]: e.target.value });
  }
  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    alert("API integrations saved!");
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">🔗 Custom API Integrations</h1>
      <form className="bg-white rounded shadow p-4 mb-4" onSubmit={handleSave}>
        <div className="mb-2">
          <label className="font-bold">Email API Endpoint</label>
          <input type="text" name="emailAPI" value={integrations.emailAPI} onChange={handleChange} className="border rounded px-2 py-1 ml-2 w-full" placeholder="https://api.emailprovider.com/send" />
        </div>
        <div className="mb-2">
          <label className="font-bold">SMS API Endpoint</label>
          <input type="text" name="smsAPI" value={integrations.smsAPI} onChange={handleChange} className="border rounded px-2 py-1 ml-2 w-full" placeholder="https://api.smsprovider.com/send" />
        </div>
        <div className="mb-2">
          <label className="font-bold">Phone Routing API</label>
          <input type="text" name="phoneRoutingAPI" value={integrations.phoneRoutingAPI} onChange={handleChange} className="border rounded px-2 py-1 ml-2 w-full" placeholder="https://api.phoneprovider.com/route" />
        </div>
        <div className="mb-2">
          <label className="font-bold">Calendar API Endpoint</label>
          <input type="text" name="calendarAPI" value={integrations.calendarAPI} onChange={handleChange} className="border rounded px-2 py-1 ml-2 w-full" placeholder="https://api.calendarprovider.com/sync" />
        </div>
        <div className="mb-2">
          <label className="font-bold">OpenAI API Key</label>
          <input type="text" name="openaiAPI" value={integrations.openaiAPI} onChange={handleChange} className="border rounded px-2 py-1 ml-2 w-full" placeholder="sk-..." />
        </div>
        <div className="mb-2">
          <label className="font-bold">Other API Endpoints/Keys</label>
          <input type="text" name="otherAPIs" value={integrations.otherAPIs} onChange={handleChange} className="border rounded px-2 py-1 ml-2 w-full" placeholder="Comma separated or JSON" />
        </div>
        <button className="px-2 py-1 bg-green-500 text-white rounded" type="submit">Save Integrations</button>
        {saved && <div className="text-xs text-green-700 mt-2">Integrations saved!</div>}
      </form>
    </div>
  );
}
