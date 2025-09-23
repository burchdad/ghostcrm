import { useEffect, useState } from "react";
import { t } from "@/lib/i18n";

export default function TemplateLibrary({ orgId = "1" }) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [editId, setEditId] = useState<string|null>(null);
  const [form, setForm] = useState<any>({ channel: "sms", name: "", subject: "", body: "" });
  const [lang, setLang] = useState("en");

  useEffect(() => {
    fetch(`/api/templates?orgId=${orgId}`)
      .then(res => res.json())
      .then(data => {
        setTemplates(data.templates || []);
        setLoading(false);
      })
      .catch(err => {
        setError(String(err));
        setLoading(false);
      });
  }, [orgId]);

  async function handleSave(e: any) {
    e.preventDefault();
    setLoading(true);
    if (editId) {
      await fetch(`/api/templates`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editId, ...form })
      });
    } else {
      await fetch(`/api/templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ org_id: orgId, ...form })
      });
    }
    setEditId(null);
    setForm({ channel: "sms", name: "", subject: "", body: "" });
    setLoading(false);
    // Refresh
    fetch(`/api/templates?orgId=${orgId}`)
      .then(res => res.json())
      .then(data => setTemplates(data.templates || []));
  }

  async function handleDelete(id: string) {
    setLoading(true);
    await fetch(`/api/templates`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    setLoading(false);
    setTemplates(templates.filter(t => t.id !== id));
  }

  function handleEdit(template: any) {
    setEditId(template.id);
    setForm(template);
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  return (
    <div className="bg-white rounded shadow p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Template Library</h2>
      <div className="mb-4">
        <label className="font-bold mr-2">Language</label>
        <select value={lang} onChange={e => setLang(e.target.value)} className="border rounded px-2 py-1">
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
        </select>
      </div>
      <form onSubmit={handleSave} className="space-y-4 mb-6">
        <div>
          <label className="font-bold mr-2">Channel</label>
          <select name="channel" value={form.channel} onChange={e => setForm({ ...form, channel: e.target.value })} className="border rounded px-2 py-1">
            <option value="sms">SMS</option>
            <option value="email">Email</option>
            <option value="voice">Voice</option>
          </select>
        </div>
        <div>
          <label className="font-bold mr-2">Name</label>
          <input type="text" name="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="border rounded px-2 py-1 w-full" />
        </div>
        {form.channel === "email" && (
          <div>
            <label className="font-bold mr-2">Subject</label>
            <input type="text" name="subject" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="border rounded px-2 py-1 w-full" />
          </div>
        )}
        <div>
          <label className="font-bold mr-2">Body</label>
          <textarea name="body" value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} className="border rounded px-2 py-1 w-full h-24" />
          <div className="text-xs text-gray-500 mt-1">{t("greeting", lang)} / {t("followup", lang)} / {t("appointment", lang)}</div>
        </div>
        <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">{editId ? "Update" : "Add"} Template</button>
        {editId && <button type="button" className="ml-2 px-3 py-1 bg-gray-200 rounded" onClick={() => { setEditId(null); setForm({ channel: "sms", name: "", subject: "", body: "" }); }}>Cancel</button>}
      </form>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th>Channel</th>
            <th>Name</th>
            <th>Subject</th>
            <th>Body</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {templates.map(t => (
            <tr key={t.id}>
              <td>{t.channel}</td>
              <td>{t.name}</td>
              <td>{t.subject}</td>
              <td>{t.body}</td>
              <td>
                <button className="px-2 py-1 bg-yellow-200 rounded mr-2" onClick={() => handleEdit(t)}>Edit</button>
                <button className="px-2 py-1 bg-red-200 rounded" onClick={() => handleDelete(t.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
