import React, { useState } from "react";

const mockTickets = [
  { id: 1, subject: "Lead follow-up overdue", status: "escalated", due: "2025-09-14", assigned: "Alice" },
  { id: 2, subject: "Contract review", status: "pending", due: "2025-09-16", assigned: "Bob" },
  { id: 3, subject: "Demo request", status: "completed", due: "2025-09-13", assigned: "Carol" },
];

export default function SLAEscalationManagement() {
  const [tickets, setTickets] = useState(mockTickets);
  const [escalateStatus, setEscalateStatus] = useState("");

  function handleEscalate(id: number) {
    setTickets(tickets.map(t => t.id === id ? { ...t, status: "escalated" } : t));
    setEscalateStatus(`Ticket ${id} escalated!`);
    alert("Escalation logic executed.");
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">⏰ SLA & Escalation Management</h1>
      <div className="bg-white rounded shadow p-4 mb-4">
        <h2 className="font-bold mb-2">Tickets</h2>
        <ul>
          {tickets.map(ticket => (
            <li key={ticket.id} className="flex items-center gap-2 mb-2">
              <span className="font-semibold">{ticket.subject}</span>
              <span className={`text-xs ${ticket.status === "escalated" ? "text-red-700" : ticket.status === "completed" ? "text-green-700" : "text-yellow-700"}`}>{ticket.status}</span>
              <span className="text-xs text-gray-500">Due: {ticket.due}</span>
              <span className="text-xs text-blue-700">Assigned: {ticket.assigned}</span>
              {ticket.status !== "escalated" && ticket.status !== "completed" && (
                <button className="px-2 py-1 bg-red-500 text-white rounded text-xs" onClick={() => handleEscalate(ticket.id)}>Escalate</button>
              )}
            </li>
          ))}
        </ul>
        {escalateStatus && <div className="text-xs text-red-700 mt-2">{escalateStatus}</div>}
      </div>
    </div>
  );
}
