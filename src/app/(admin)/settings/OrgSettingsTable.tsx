import { useEffect, useState } from "react";

export default function OrgSettingsTable({ orgId = "1" }) {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    fetch(`/api/orgs/settings?orgId=${orgId}`)
      .then(res => res.json())
      .then(data => {
        setSettings(data.settings);
        setForm(data.settings);
        setLoading(false);
      })
      .catch(err => {
        setError(String(err));
        setLoading(false);
      });
  }, [orgId]);

  function handleChange(e: any) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }
  async function handleSave(e: any) {
    e.preventDefault();
    setLoading(true);
    await fetch(`/api/orgs/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orgId, ...form })
    });
    setEdit(false);
    setLoading(false);
    setSettings(form);
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  return (
    <div className="bg-white rounded shadow p-6 max-w-lg">
      <h2 className="text-xl font-bold mb-4">Organization Settings</h2>
      {!edit ? (
        <table className="w-full text-sm mb-4">
          <tbody>
            <tr><td className="font-bold">Quiet Hours Start</td><td>{settings.quiet_hours_start}</td></tr>
            <tr><td className="font-bold">Quiet Hours End</td><td>{settings.quiet_hours_end}</td></tr>
            <tr><td className="font-bold">Default Provider</td><td>{settings.default_provider}</td></tr>
            <tr><td className="font-bold">Default Number</td><td>{settings.default_number}</td></tr>
          </tbody>
        </table>
      ) : (
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="font-bold mr-2">Quiet Hours Start</label>
            <input type="time" name="quiet_hours_start" value={form.quiet_hours_start || ""} onChange={handleChange} className="border rounded px-2 py-1" />
          </div>
          <div>
            <label className="font-bold mr-2">Quiet Hours End</label>
            <input type="time" name="quiet_hours_end" value={form.quiet_hours_end || ""} onChange={handleChange} className="border rounded px-2 py-1" />
          </div>
          <div>
            <label className="font-bold mr-2">Default Provider</label>
            <input type="text" name="default_provider" value={form.default_provider || ""} onChange={handleChange} className="border rounded px-2 py-1" />
          </div>
          <div>
            <label className="font-bold mr-2">Default Number</label>
            <input type="text" name="default_number" value={form.default_number || ""} onChange={handleChange} className="border rounded px-2 py-1" />
          </div>
          <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">Save</button>
        </form>
      )}
      <button className="mt-2 px-3 py-1 bg-gray-200 rounded" onClick={() => setEdit(e => !e)}>{edit ? "Cancel" : "Edit"}</button>
    </div>
  );
}
