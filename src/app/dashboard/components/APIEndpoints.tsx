import React from "react";

interface APIEndpoint {
  url: string;
  type: string;
}

interface APIEndpointsProps {
  apiEndpoints: APIEndpoint[];
  setApiEndpoints: (endpoints: APIEndpoint[]) => void;
  showApiModal: boolean;
  setShowApiModal: (show: boolean) => void;
  newApiUrl: string;
  setNewApiUrl: (url: string) => void;
  newApiType: string;
  setNewApiType: (type: string) => void;
  addApiEndpoint: () => void;
  removeApiEndpoint: (idx: number) => void;
}

const APIEndpoints: React.FC<APIEndpointsProps> = ({
  apiEndpoints,
  setApiEndpoints,
  showApiModal,
  setShowApiModal,
  newApiUrl,
  setNewApiUrl,
  newApiType,
  setNewApiType,
  addApiEndpoint,
  removeApiEndpoint
}) => {
  return (
    <>
      <button className="px-2 py-1 bg-blue-500 text-white rounded mb-2" onClick={() => setShowApiModal(true)}>
        Register API Endpoint
      </button>
      {showApiModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
            <h3 className="font-bold mb-2">Register Custom API Endpoint</h3>
            <div className="mb-2 text-sm text-gray-600">Add new API endpoints for integrations or automation.</div>
            <ul className="text-sm mb-2">
              {apiEndpoints.map((ep, idx) => (
                <li key={idx} className="mb-1 flex items-center justify-between">
                  <span>{ep.url} <span className="text-xs text-gray-500">({ep.type})</span></span>
                  <button className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs" onClick={() => removeApiEndpoint(idx)}>Remove</button>
                </li>
              ))}
            </ul>
            <div className="mb-2 flex gap-2">
              <input type="text" placeholder="API Endpoint URL" value={newApiUrl} onChange={e => setNewApiUrl(e.target.value)} className="border rounded px-2 py-1" />
              <select value={newApiType} onChange={e => setNewApiType(e.target.value)} className="border rounded px-2 py-1">
                <option value="custom">Custom</option>
                <option value="automation">Automation</option>
                <option value="integration">Integration</option>
              </select>
              <button className="px-2 py-1 bg-green-500 text-white rounded" onClick={addApiEndpoint}>Add</button>
            </div>
            <button className="px-2 py-1 bg-gray-200 text-gray-700 rounded" onClick={() => setShowApiModal(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
};

export default APIEndpoints;
