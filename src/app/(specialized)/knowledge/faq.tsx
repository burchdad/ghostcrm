import React, { useState } from "react";

const mockFAQ = [
  { id: 1, question: "How do I add a new lead?", answer: "Go to the Leads module and click 'Add Lead'." },
  { id: 2, question: "How do I schedule a demo?", answer: "Use the Appointments module and select 'Schedule Demo'." },
  { id: 3, question: "How do I export my data?", answer: "Use the Bulk Ops feature in Dashboard or Analytics." },
];

export default function KnowledgeBaseFAQ() {
  const [faq] = useState(mockFAQ);
  const [search, setSearch] = useState("");

  const filteredFAQ = faq.filter(f => f.question.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">📚 Knowledge Base & FAQ</h1>
      <div className="bg-white rounded shadow p-4 mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search FAQ..."
          className="border rounded px-2 py-1 mb-4 w-full"
        />
        <ul>
          {filteredFAQ.map(item => (
            <li key={item.id} className="mb-2">
              <div className="font-semibold">Q: {item.question}</div>
              <div className="text-xs text-gray-700">A: {item.answer}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
