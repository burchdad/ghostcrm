import React, { useState } from "react";

const mockAppointments = [
  { id: 1, name: "John Doe", time: "2025-09-16 10:00", status: "upcoming" },
  { id: 2, name: "Jane Smith", time: "2025-09-16 11:00", status: "no-show" },
  { id: 3, name: "Acme Corp", time: "2025-09-16 13:00", status: "completed" },
];

export default function SmartAppointmentFlow() {
  const [appointments, setAppointments] = useState(mockAppointments);
  const [conflict, setConflict] = useState<string>("");
  const [rebookStatus, setRebookStatus] = useState<string>("");
  const [noShowDetected, setNoShowDetected] = useState<string>("");

  function rebookAppointment(id: number) {
    setRebookStatus(`Appointment ${id} rebooked!`);
    alert("Rebooking logic executed.");
  }
  function detectNoShow(id: number) {
    setNoShowDetected(`No-show detected for appointment ${id}`);
    alert("No-show AI detection triggered.");
  }
  function resolveTimeConflict(id: number) {
    setConflict(`Time conflict resolved for appointment ${id}`);
    alert("Time conflict resolved.");
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">📅 Smart Appointment Flow</h1>
      <div className="bg-white rounded shadow p-4 mb-4">
        <h2 className="font-bold mb-2">Appointments</h2>
        <ul>
          {appointments.map(app => (
            <li key={app.id} className="flex items-center gap-2 mb-2">
              <span>{app.name} ({app.time})</span>
              <span className={`px-2 py-1 rounded text-xs ${app.status === "completed" ? "bg-green-100 text-green-700" : app.status === "no-show" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>{app.status}</span>
              <button className="px-2 py-1 bg-yellow-500 text-white rounded text-xs" onClick={() => rebookAppointment(app.id)}>Rebook</button>
              <button className="px-2 py-1 bg-red-500 text-white rounded text-xs" onClick={() => detectNoShow(app.id)}>Detect No-Show</button>
              <button className="px-2 py-1 bg-blue-500 text-white rounded text-xs" onClick={() => resolveTimeConflict(app.id)}>Resolve Conflict</button>
            </li>
          ))}
        </ul>
        {rebookStatus && <div className="text-xs text-green-700 mt-2">{rebookStatus}</div>}
        {noShowDetected && <div className="text-xs text-red-700 mt-2">{noShowDetected}</div>}
        {conflict && <div className="text-xs text-blue-700 mt-2">{conflict}</div>}
      </div>
    </div>
  );
}
