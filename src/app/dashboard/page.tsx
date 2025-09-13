import React from "react";
import DashboardCard from "./components/DashboardCard";
import { useDashboardData } from "./hooks/useDashboardData";

export default function DashboardPage() {
  const { messages, auditLog, aiAlerts } = useDashboardData();
  return (
    <div className="dashboard-main grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      <DashboardCard title="Messages">
        <ul>
          {messages.map((msg, idx) => (
            <li key={idx}>{msg.text || msg.subject}</li>
          ))}
        </ul>
      </DashboardCard>
      <DashboardCard title="AI Alerts">
        <ul>
          {aiAlerts.map((alert, idx) => (
            <li key={idx}>{alert.summary || alert.text}</li>
          ))}
        </ul>
      </DashboardCard>
      <DashboardCard title="Audit Log">
        <ul>
          {auditLog.map((log, idx) => (
            <li key={idx}>{log.event || log.action}</li>
          ))}
        </ul>
      </DashboardCard>
    </div>
  );
}
// Note: The above is a simplified structure. You would expand it to include
// the full dashboard functionality as per your requirements.