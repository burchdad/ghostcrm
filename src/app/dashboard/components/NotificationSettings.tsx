
import React from "react";

interface NotificationRule {
  trigger: string;
  action: string;
  channel: string;
}

interface NotificationPrefs {
  lead: boolean;
  deal: boolean;
  system: boolean;
  channel: string;
  rules: NotificationRule[];
}

interface NotificationSettingsProps {
  notificationPrefs: NotificationPrefs;
  setNotificationPrefs: (prefs: NotificationPrefs | ((prev: NotificationPrefs) => NotificationPrefs)) => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ notificationPrefs, setNotificationPrefs }) => {
  return (
    <div className="p-4 rounded bg-blue-50 border border-blue-200 mb-4 max-w-md">
      <div className="font-semibold text-blue-900 mb-2">Notification Settings</div>
      <div className="flex items-center gap-2 mb-2">
        <label className="text-sm text-blue-800">Lead Alerts</label>
        <input type="checkbox" checked={notificationPrefs.lead} onChange={e => setNotificationPrefs(p => ({ ...p, lead: e.target.checked }))} />
      </div>
      <div className="flex items-center gap-2 mb-2">
        <label className="text-sm text-blue-800">Deal Alerts</label>
        <input type="checkbox" checked={notificationPrefs.deal} onChange={e => setNotificationPrefs(p => ({ ...p, deal: e.target.checked }))} />
      </div>
      <div className="flex items-center gap-2 mb-2">
        <label className="text-sm text-blue-800">System Alerts</label>
        <input type="checkbox" checked={notificationPrefs.system} onChange={e => setNotificationPrefs(p => ({ ...p, system: e.target.checked }))} />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm text-blue-800">Channel</label>
        <select value={notificationPrefs.channel} onChange={e => setNotificationPrefs(p => ({ ...p, channel: e.target.value }))} className="border rounded px-2 py-1">
          <option value="in-app">In-App</option>
          <option value="slack">Slack</option>
          <option value="email">Email</option>
        </select>
      </div>
      <div className="mt-4">
        <div className="font-semibold mb-2">Advanced Notification Rules</div>
        <ul className="text-sm mb-2">
          {notificationPrefs.rules?.map((rule, idx) => (
            <li key={idx} className="mb-1 flex items-center">
              <span>{rule.trigger} → {rule.action} ({rule.channel})</span>
              <button className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs" onClick={() => {
                setNotificationPrefs(p => ({ ...p, rules: p.rules.filter((_, i) => i !== idx) }));
              }}>Delete</button>
            </li>
          ))}
        </ul>
        <div className="flex gap-2 mb-2">
          <select id="notif-trigger" className="border rounded px-2 py-1">
            <option value="lead_status_change">Lead Status Change</option>
            <option value="deal_milestone">Deal Milestone</option>
            <option value="new_comment">New Comment</option>
            <option value="dashboard_shared">Dashboard Shared</option>
          </select>
          <select id="notif-action" className="border rounded px-2 py-1">
            <option value="notify">Notify</option>
            <option value="email">Send Email</option>
            <option value="slack">Send Slack Message</option>
          </select>
          <select id="notif-channel" className="border rounded px-2 py-1">
            <option value="in-app">In-App</option>
            <option value="email">Email</option>
            <option value="slack">Slack</option>
          </select>
          <button className="px-2 py-1 bg-green-500 text-white rounded" onClick={() => {
            const trigger = (document.getElementById('notif-trigger') as HTMLSelectElement).value;
            const action = (document.getElementById('notif-action') as HTMLSelectElement).value;
            const channel = (document.getElementById('notif-channel') as HTMLSelectElement).value;
            setNotificationPrefs(p => ({ ...p, rules: [...(p.rules || []), { trigger, action, channel }] }));
          }}>Add Rule</button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
