
import React from "react";

interface OAuthConnection {
  platform: string;
  status: string;
}

interface OAuthProps {
  oauthConnections: OAuthConnection[];
  setOAuthConnections: (connections: OAuthConnection[]) => void;
  showOAuthModal: boolean;
  setShowOAuthModal: (show: boolean) => void;
  newOAuthPlatform: string;
  setNewOAuthPlatform: (platform: string) => void;
  addOAuthConnection: () => void;
  removeOAuthConnection: (idx: number) => void;
}

const OAuth: React.FC<OAuthProps> = ({
  oauthConnections,
  setOAuthConnections,
  showOAuthModal,
  setShowOAuthModal,
  newOAuthPlatform,
  setNewOAuthPlatform,
  addOAuthConnection,
  removeOAuthConnection
}) => {
  if (!showOAuthModal) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
        <h3 className="font-bold mb-2">OAuth/Connect Integrations</h3>
        <div className="mb-2 text-sm text-gray-600">Connect to supported platforms (Google, Microsoft, Slack, etc.).</div>
        <ul className="text-sm mb-2">
          {oauthConnections.map((c, idx) => (
            <li key={idx} className="mb-1 flex items-center justify-between">
              <span>{c.platform} <span className="text-xs text-gray-500">({c.status})</span></span>
              <button className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs" onClick={() => removeOAuthConnection(idx)}>Remove</button>
            </li>
          ))}
        </ul>
        <div className="flex gap-2 mb-2">
          <select value={newOAuthPlatform} onChange={e => setNewOAuthPlatform(e.target.value)} className="border rounded px-2 py-1">
            <option value="google">Google</option>
            <option value="microsoft">Microsoft</option>
            <option value="slack">Slack</option>
          </select>
          <button className="px-2 py-1 bg-green-500 text-white rounded" onClick={addOAuthConnection}>Connect</button>
        </div>
        <button className="px-2 py-1 bg-gray-200 text-gray-700 rounded" onClick={() => setShowOAuthModal(false)}>Close</button>
      </div>
    </div>
  );
};

export default OAuth;
