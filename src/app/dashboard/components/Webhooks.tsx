
import React from "react";

interface Webhook {
  url: string;
  type: string;
}

interface WebhooksProps {
  webhooks: Webhook[];
  setWebhooks: (webhooks: Webhook[]) => void;
  showWebhookModal: boolean;
  setShowWebhookModal: (show: boolean) => void;
  newWebhookUrl: string;
  setNewWebhookUrl: (url: string) => void;
  newWebhookType: string;
  setNewWebhookType: (type: string) => void;
  addWebhook: () => void;
  removeWebhook: (idx: number) => void;
}

const Webhooks: React.FC<WebhooksProps> = ({
  webhooks,
  setWebhooks,
  showWebhookModal,
  setShowWebhookModal,
  newWebhookUrl,
  setNewWebhookUrl,
  newWebhookType,
  setNewWebhookType,
  addWebhook,
  removeWebhook
}) => {
  if (!showWebhookModal) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
        <h3 className="font-bold mb-2">Manage Webhooks</h3>
        <div className="mb-2 text-sm text-gray-600">Configure webhooks for lead, deal, and custom events.</div>
        <ul className="text-sm mb-2">
          {webhooks.map((webhook, idx) => (
            <li key={idx} className="mb-1 flex items-center justify-between">
              <span>{webhook.url} <span className="text-xs text-gray-500">({webhook.type})</span></span>
              <button className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs" onClick={() => removeWebhook(idx)}>Delete</button>
            </li>
          ))}
        </ul>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newWebhookUrl}
            onChange={e => setNewWebhookUrl(e.target.value)}
            placeholder="Webhook URL"
            className="border rounded px-2 py-1"
          />
          <select value={newWebhookType} onChange={e => setNewWebhookType(e.target.value)} className="border rounded px-2 py-1">
            <option value="lead">Lead</option>
            <option value="deal">Deal</option>
            <option value="custom">Custom</option>
          </select>
          <button className="px-2 py-1 bg-green-500 text-white rounded" onClick={addWebhook}>Add Webhook</button>
        </div>
        <button className="px-2 py-1 bg-gray-200 text-gray-700 rounded" onClick={() => setShowWebhookModal(false)}>Close</button>
      </div>
    </div>
  );
};

export default Webhooks;
