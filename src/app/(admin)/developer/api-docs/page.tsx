"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function ApiDocsPage() {
  const router = useRouter();
  const [selectedEndpoint, setSelectedEndpoint] = useState("leads");
  const [selectedMethod, setSelectedMethod] = useState("GET");
  const [showResponse, setShowResponse] = useState(false);

  const apiEndpoints = {
    leads: {
      name: "Leads",
      description: "Manage lead data and interactions",
      endpoints: [
        {
          method: "GET",
          path: "/api/v1/leads",
          description: "Retrieve all leads",
          parameters: [
            { name: "page", type: "integer", required: false, description: "Page number for pagination" },
            { name: "limit", type: "integer", required: false, description: "Number of records per page" },
            { name: "status", type: "string", required: false, description: "Filter by lead status" },
            { name: "source", type: "string", required: false, description: "Filter by lead source" }
          ],
          response: {
            "200": {
              "data": [
                {
                  "id": "lead_123",
                  "firstName": "John",
                  "lastName": "Smith",
                  "email": "john@example.com",
                  "phone": "+1-555-123-4567",
                  "company": "Acme Corp",
                  "status": "qualified",
                  "source": "website",
                  "score": 85,
                  "createdAt": "2024-12-19T10:00:00Z",
                  "updatedAt": "2024-12-19T14:30:00Z"
                }
              ],
              "pagination": {
                "page": 1,
                "limit": 50,
                "total": 1250,
                "pages": 25
              }
            }
          }
        },
        {
          method: "POST",
          path: "/api/v1/leads",
          description: "Create a new lead",
          parameters: [
            { name: "firstName", type: "string", required: true, description: "Lead's first name" },
            { name: "lastName", type: "string", required: true, description: "Lead's last name" },
            { name: "email", type: "string", required: true, description: "Lead's email address" },
            { name: "phone", type: "string", required: false, description: "Lead's phone number" },
            { name: "company", type: "string", required: false, description: "Lead's company" },
            { name: "source", type: "string", required: false, description: "How the lead was acquired" }
          ],
          response: {
            "201": {
              "data": {
                "id": "lead_124",
                "firstName": "Jane",
                "lastName": "Doe",
                "email": "jane@example.com",
                "status": "new",
                "createdAt": "2024-12-19T15:00:00Z"
              }
            }
          }
        }
      ]
    },
    contacts: {
      name: "Contacts",
      description: "Manage contact information",
      endpoints: [
        {
          method: "GET",
          path: "/api/v1/contacts",
          description: "Retrieve all contacts",
          parameters: [
            { name: "page", type: "integer", required: false, description: "Page number" },
            { name: "search", type: "string", required: false, description: "Search contacts" }
          ],
          response: {
            "200": {
              "data": [
                {
                  "id": "contact_456",
                  "firstName": "Alice",
                  "lastName": "Johnson",
                  "email": "alice@company.com",
                  "phone": "+1-555-987-6543",
                  "company": "Tech Solutions"
                }
              ]
            }
          }
        }
      ]
    },
    deals: {
      name: "Deals",
      description: "Manage sales opportunities",
      endpoints: [
        {
          method: "GET",
          path: "/api/v1/deals",
          description: "Retrieve all deals",
          parameters: [
            { name: "stage", type: "string", required: false, description: "Filter by deal stage" },
            { name: "value_min", type: "number", required: false, description: "Minimum deal value" }
          ],
          response: {
            "200": {
              "data": [
                {
                  "id": "deal_789",
                  "name": "Enterprise License",
                  "value": 50000,
                  "stage": "negotiation",
                  "probability": 75,
                  "closeDate": "2024-12-30"
                }
              ]
            }
          }
        }
      ]
    }
  };

  const authMethods = [
    {
      name: "API Key",
      description: "Use your API key in the Authorization header",
      example: "Authorization: Bearer your_api_key_here",
      security: "🔒 High - Keys don't expire but can be revoked"
    },
    {
      name: "OAuth 2.0",
      description: "Standard OAuth 2.0 authorization flow",
      example: "Authorization: Bearer oauth_access_token",
      security: "🔒 High - Tokens expire and can be refreshed"
    },
    {
      name: "JWT Tokens",
      description: "JSON Web Tokens for session-based auth",
      example: "Authorization: Bearer jwt_token_here",
      security: "🔒 Medium - Tokens expire after set time"
    }
  ];

  const codeExamples = {
    javascript: `
// Using fetch API
const response = await fetch('https://api.ghostcrm.com/v1/leads', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
console.log(data);
    `,
    python: `
# Using requests library
import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}

response = requests.get('https://api.ghostcrm.com/v1/leads', headers=headers)
data = response.json()
print(data)
    `,
    curl: `
# Using cURL
curl -X GET "https://api.ghostcrm.com/v1/leads" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"
    `,
    php: `
// Using PHP with cURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://api.ghostcrm.com/v1/leads');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer YOUR_API_KEY',
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);
$data = json_decode($response, true);
    `
  };

  const [selectedLanguage, setSelectedLanguage] = useState("javascript");

  const currentEndpoints = apiEndpoints[selectedEndpoint as keyof typeof apiEndpoints]?.endpoints || [];
  const currentEndpoint = currentEndpoints.find(ep => ep.method === selectedMethod) || currentEndpoints[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <span className="text-4xl">📚</span>
            API Documentation
          </h1>
          <p className="text-slate-600 mt-2">Complete reference for the GhostCRM REST API</p>
        </div>

        {/* Quick Start Banner */}
        <div className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-lg font-semibold mb-2">🚀 Quick Start</div>
              <div className="text-blue-100">Get your API key and start building in minutes</div>
            </div>
            <div>
              <div className="text-lg font-semibold mb-2">📊 Rate Limits</div>
              <div className="text-blue-100">1000 requests per hour on free plan</div>
            </div>
            <div>
              <div className="text-lg font-semibold mb-2">🔗 Base URL</div>
              <div className="text-blue-100 font-mono text-sm">https://api.ghostcrm.com/v1</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h3 className="font-semibold text-slate-800 mb-4">API Resources</h3>
              <nav className="space-y-2">
                {Object.entries(apiEndpoints).map(([key, resource]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedEndpoint(key)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedEndpoint === key
                        ? "bg-indigo-100 text-indigo-800"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {resource.name}
                  </button>
                ))}
              </nav>

              <div className="mt-8 pt-6 border-t border-slate-200">
                <h4 className="font-medium text-slate-800 mb-3">Authentication</h4>
                <div className="space-y-3">
                  {authMethods.map((method, index) => (
                    <div key={index} className="p-3 border border-slate-200 rounded-lg">
                      <div className="font-medium text-slate-800 text-sm">{method.name}</div>
                      <div className="text-xs text-slate-600 mt-1">{method.security}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Resource Overview */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                {apiEndpoints[selectedEndpoint as keyof typeof apiEndpoints]?.name}
              </h2>
              <p className="text-slate-600 mb-6">
                {apiEndpoints[selectedEndpoint as keyof typeof apiEndpoints]?.description}
              </p>

              {/* Method Tabs */}
              <div className="border-b border-slate-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                  {currentEndpoints.map(endpoint => (
                    <button
                      key={endpoint.method}
                      onClick={() => setSelectedMethod(endpoint.method)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        selectedMethod === endpoint.method
                          ? "border-indigo-500 text-indigo-600"
                          : "border-transparent text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      <span className={`px-2 py-1 rounded text-xs font-mono mr-2 ${
                        endpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
                        endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                        endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {endpoint.method}
                      </span>
                      {endpoint.path}
                    </button>
                  ))}
                </nav>
              </div>

              {currentEndpoint && (
                <div className="space-y-6">
                  {/* Endpoint Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-3">Description</h3>
                    <p className="text-slate-600">{currentEndpoint.description}</p>
                  </div>

                  {/* Parameters */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-3">Parameters</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border border-slate-200 rounded-lg">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="text-left py-3 px-4 font-medium text-slate-700">Name</th>
                            <th className="text-left py-3 px-4 font-medium text-slate-700">Type</th>
                            <th className="text-left py-3 px-4 font-medium text-slate-700">Required</th>
                            <th className="text-left py-3 px-4 font-medium text-slate-700">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentEndpoint.parameters.map((param, index) => (
                            <tr key={index} className="border-t border-slate-100">
                              <td className="py-3 px-4 font-mono text-sm text-slate-800">{param.name}</td>
                              <td className="py-3 px-4 text-sm text-slate-600">{param.type}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  param.required ? "bg-red-100 text-red-800" : "bg-slate-100 text-slate-600"
                                }`}>
                                  {param.required ? "Required" : "Optional"}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-sm text-slate-600">{param.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Response Examples */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-slate-800">Response Example</h3>
                      <button
                        onClick={() => setShowResponse(!showResponse)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                      >
                        {showResponse ? "Hide" : "Show"} Response
                      </button>
                    </div>
                    {showResponse && (
                      <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                        <pre className="text-green-400 text-sm">
                          <code>{JSON.stringify(currentEndpoint.response["200"], null, 2)}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Code Examples */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">Code Examples</h3>
              
              {/* Language Selector */}
              <div className="flex gap-2 mb-4">
                {Object.keys(codeExamples).map(lang => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLanguage(lang)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedLanguage === lang
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                    }`}
                  >
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </button>
                ))}
              </div>

              {/* Code Block */}
              <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-green-400 text-sm">
                  <code>{codeExamples[selectedLanguage as keyof typeof codeExamples]}</code>
                </pre>
              </div>
            </div>

            {/* Error Codes */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">Common Error Codes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { code: "400", message: "Bad Request", description: "Invalid request parameters" },
                  { code: "401", message: "Unauthorized", description: "Invalid or missing API key" },
                  { code: "403", message: "Forbidden", description: "Insufficient permissions" },
                  { code: "404", message: "Not Found", description: "Resource does not exist" },
                  { code: "429", message: "Rate Limited", description: "Too many requests" },
                  { code: "500", message: "Server Error", description: "Internal server error" }
                ].map((error, index) => (
                  <div key={index} className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded font-mono text-sm">
                        {error.code}
                      </span>
                      <span className="font-medium text-slate-800">{error.message}</span>
                    </div>
                    <div className="text-sm text-slate-600">{error.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* SDKs and Libraries */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">Official SDKs & Libraries</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: "JavaScript SDK", lang: "JavaScript", icon: "📜", status: "Stable" },
                  { name: "Python SDK", lang: "Python", icon: "🐍", status: "Stable" },
                  { name: "PHP SDK", lang: "PHP", icon: "🐘", status: "Beta" },
                  { name: "Ruby Gem", lang: "Ruby", icon: "💎", status: "Beta" },
                  { name: "Go Package", lang: "Go", icon: "🔷", status: "Coming Soon" },
                  { name: ".NET Library", lang: "C#", icon: "🔷", status: "Coming Soon" }
                ].map((sdk, index) => (
                  <div key={index} className="p-4 border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all cursor-pointer">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{sdk.icon}</span>
                      <div>
                        <div className="font-medium text-slate-800">{sdk.name}</div>
                        <div className="text-sm text-slate-600">{sdk.lang}</div>
                      </div>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded ${
                      sdk.status === "Stable" ? "bg-green-100 text-green-800" :
                      sdk.status === "Beta" ? "bg-yellow-100 text-yellow-800" :
                      "bg-slate-100 text-slate-600"
                    }`}>
                      {sdk.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
