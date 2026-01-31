import React, { useState } from "react";

export default function FinancePrequalificationForm() {
  const [form, setForm] = useState({ name: "", email: "", income: "", creditScore: "" });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    alert("Prequalification submitted!");
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">🧾 Finance App Prequalification</h1>
      <form className="bg-white rounded shadow p-4 mb-4" onSubmit={handleSubmit}>
        <div className="mb-2">
          <label className="font-bold">Name</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} className="border rounded px-2 py-1 ml-2 w-full" required />
        </div>
        <div className="mb-2">
          <label className="font-bold">Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} className="border rounded px-2 py-1 ml-2 w-full" required />
        </div>
        <div className="mb-2">
          <label className="font-bold">Income</label>
          <input type="text" name="income" value={form.income} onChange={handleChange} className="border rounded px-2 py-1 ml-2 w-full" required />
        </div>
        <div className="mb-2">
          <label className="font-bold">Credit Score</label>
          <input type="text" name="creditScore" value={form.creditScore} onChange={handleChange} className="border rounded px-2 py-1 ml-2 w-full" required />
        </div>
        <button className="px-2 py-1 bg-green-500 text-white rounded" type="submit">Submit</button>
        {submitted && <div className="text-xs text-green-700 mt-2">Prequalification submitted!</div>}
      </form>
    </div>
  );
}
