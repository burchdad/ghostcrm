
import React from "react";
import { Zap } from "lucide-react";

interface SmartAlert {
  type: string;
  message: string;
  created_at: string;
}

interface SmartAlertsProps {
  smartAlertsEnabled: boolean;
  setSmartAlertsEnabled: (enabled: boolean) => void;
  smartAlerts: SmartAlert[];
  smartAlertType: string;
  setSmartAlertType: (type: string) => void;
  smartAlertSensitivity: string;
  setSmartAlertSensitivity: (sensitivity: string) => void;
}

const SmartAlerts: React.FC<SmartAlertsProps> = ({
  smartAlertsEnabled,
  setSmartAlertsEnabled,
  smartAlerts,
  smartAlertType,
  setSmartAlertType,
  smartAlertSensitivity,
  setSmartAlertSensitivity
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 mb-2 bg-white rounded shadow">
        <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan-500" /> AI Smart Alerts
        </h2>
        <div className="mb-2 flex gap-2 items-center">
          <label className="text-sm text-cyan-800">Enable Smart Alerts</label>
          <input type="checkbox" checked={smartAlertsEnabled} onChange={e => setSmartAlertsEnabled(e.target.checked)} />
          <select value={smartAlertType} onChange={e => setSmartAlertType(e.target.value)} className="border rounded px-2 py-1 ml-2">
            <option value="all">All</option>
            <option value="risk">Risk</option>
            <option value="opportunity">Opportunity</option>
            <option value="followup">Follow-Up</option>
          </select>
          <select value={smartAlertSensitivity} onChange={e => setSmartAlertSensitivity(e.target.value)} className="border rounded px-2 py-1 ml-2">
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="mb-2 text-xs text-gray-500">AI analyzes leads, deals, and activity to generate smart alerts for risks, opportunities, and follow-ups.</div>
        <ul className="text-sm mb-2">
          {smartAlertsEnabled && smartAlerts.length === 0 && <li className="text-gray-400">No smart alerts.</li>}
          {smartAlertsEnabled && smartAlerts.map((alert, idx) => (
            <li key={idx} className={`mb-1 ${alert.type === "risk" ? "text-red-700" : alert.type === "opportunity" ? "text-green-700" : "text-blue-700"}`}>
              <span className="font-bold">{alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}:</span> {alert.message}
              <span className="text-xs text-gray-400 ml-2">@ {alert.created_at}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SmartAlerts;
