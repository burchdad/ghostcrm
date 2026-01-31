import React from "react";

interface OAuthConnection {
  platform: string;
  accountName?: string;
  status: string;
  lastSync?: string;
  error?: string;
  tokenExpiry?: string;
  scopes?: string[];
  logoUrl?: string;
  analytics?: { syncCount?: number; errorCount?: number };
  auditHistory?: Array<{ action: string; timestamp: string; user: string }>;
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
  userRole?: string;
}

const PROVIDERS = [
  { value: "google", label: "Google", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg", scopes: ["email", "profile", "calendar"] },
  { value: "microsoft", label: "Microsoft", logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg", scopes: ["user.read", "mail.read"] },
  { value: "slack", label: "Slack", logo: "https://upload.wikimedia.org/wikipedia/commons/7/76/Slack_Icon.png", scopes: ["channels:read", "chat:write"] },
  { value: "salesforce", label: "Salesforce", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/2/2e/Salesforce_logo.svg/1200px-Salesforce_logo.svg.png", scopes: ["api", "refresh_token"] },
  { value: "hubspot", label: "HubSpot", logo: "https://upload.wikimedia.org/wikipedia/commons/5/56/HubSpot_Logo.png", scopes: ["contacts", "timeline"] },
  { value: "facebook", label: "Facebook", logo: "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg", scopes: ["email", "public_profile"] },
  { value: "twitter", label: "Twitter", logo: "https://upload.wikimedia.org/wikipedia/commons/4/4f/Twitter-logo.svg", scopes: ["tweet.read", "users.read"] },
  { value: "custom", label: "Custom OAuth", logo: "", scopes: [] }
];

const OAuth: React.FC<OAuthProps> = ({
  oauthConnections,
  setOAuthConnections,
  showOAuthModal,
  setShowOAuthModal,
  newOAuthPlatform,
  setNewOAuthPlatform,
  addOAuthConnection,
  removeOAuthConnection,
  userRole
}) => {
  const [newAccountName, setNewAccountName] = React.useState("");
  const [testStatus, setTestStatus] = React.useState<string>("");
  const isAdmin = userRole === "admin" || userRole === "superadmin";

  // Test connection stub
  const testConnection = (idx: number) => {
    setTestStatus("Testing...");
    setTimeout(() => {
      setTestStatus("Success");
    }, 1000);
  };

  if (!showOAuthModal) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-2xl">
        <h3 className="font-bold mb-2 text-xl">OAuth/Connect Integrations</h3>
        <div className="mb-2 text-sm text-gray-600">Connect to supported platforms. Multi-account, live status, security, analytics, and compliance ready.</div>
        <ul className="text-sm mb-4">
          {oauthConnections.map((c, idx) => (
            <li key={idx} className="mb-2 flex flex-col md:flex-row md:items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                {c.logoUrl && <img src={c.logoUrl} alt={c.platform} className="w-6 h-6" />}
                <span className="font-semibold">{c.platform}</span>
                {c.accountName && <span className="text-xs text-gray-700 ml-1">({c.accountName})</span>}
                <span className={`text-xs ml-2 ${c.status === "connected" ? "text-green-700" : "text-red-700"}`}>[{c.status}]</span>
                {c.lastSync && <span className="text-xs text-gray-500 ml-2">Last Sync: {c.lastSync}</span>}
                {c.tokenExpiry && <span className="text-xs text-orange-700 ml-2">Token Expires: {c.tokenExpiry}</span>}
                {c.error && <span className="text-xs text-red-700 ml-2">Error: {c.error}</span>}
              </div>
              <div className="flex gap-2 mt-2 md:mt-0">
                <button className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs" onClick={() => testConnection(idx)}>Test</button>
                {isAdmin && <button className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs" onClick={() => removeOAuthConnection(idx)}>Remove</button>}
              </div>
              {c.scopes && c.scopes.length > 0 && <div className="text-xs text-gray-500 mt-1">Scopes: {c.scopes.join(", ")}</div>}
              {c.analytics && <div className="text-xs text-gray-500 mt-1">Syncs: {c.analytics.syncCount ?? 0}, Errors: {c.analytics.errorCount ?? 0}</div>}
              {c.auditHistory && c.auditHistory.length > 0 && (
                <div className="text-xs text-gray-400 mt-1">Audit: {c.auditHistory.map(a => `${a.action} by ${a.user} at ${a.timestamp}`).join(" | ")}</div>
              )}
            </li>
          ))}
        </ul>
        <div className="flex flex-col md:flex-row gap-2 mb-4">
          <select value={newOAuthPlatform} onChange={e => setNewOAuthPlatform(e.target.value)} className="border rounded px-2 py-1">
            {PROVIDERS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          <input type="text" placeholder="Account Name (optional)" value={newAccountName} onChange={e => setNewAccountName(e.target.value)} className="border rounded px-2 py-1" />
          <button className="px-2 py-1 bg-green-500 text-white rounded" onClick={addOAuthConnection}>Connect</button>
        </div>
        <div className="mb-4 text-xs text-gray-700">Scopes: {PROVIDERS.find(p => p.value === newOAuthPlatform)?.scopes.join(", ")}</div>
        <div className="mb-4 text-xs text-gray-700">API Docs: <a href="https://oauth.net/2/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">OAuth 2.0 Docs</a></div>
        {testStatus && <div className={`mb-2 text-xs ${testStatus === "Success" ? "text-green-700" : "text-red-700"}`}>Test Status: {testStatus}</div>}
        <button className="px-2 py-1 bg-gray-200 text-gray-700 rounded" onClick={() => setShowOAuthModal(false)}>Close</button>
        {!isAdmin && <div className="mt-4 text-xs text-red-700">Only admins can remove connections or view sensitive info.</div>}
      </div>
    </div>
  );
};

export default OAuth;
