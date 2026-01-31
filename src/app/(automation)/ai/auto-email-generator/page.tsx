"use client";
import React, { useState } from "react";

interface EmailTemplate {
  id: string;
  type: "welcome" | "followup" | "proposal" | "nurture" | "closing";
  subject: string;
  content: string;
  personalized: boolean;
}

export default function AutoEmailGeneratorPage() {
  const [selectedType, setSelectedType] = useState<string>("welcome");
  const [leadData, setLeadData] = useState({
    name: "",
    company: "",
    industry: "",
    stage: "new"
  });
  const [generating, setGenerating] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState<EmailTemplate | null>(null);

  const emailTypes = [
    { value: "welcome", label: "Welcome Email", description: "First contact with new leads" },
    { value: "followup", label: "Follow-up Email", description: "Continue conversation with prospects" },
    { value: "proposal", label: "Proposal Email", description: "Send proposals and quotes" },
    { value: "nurture", label: "Nurture Email", description: "Keep leads engaged over time" },
    { value: "closing", label: "Closing Email", description: "Final push to close deals" }
  ];

  const generateEmail = async () => {
    setGenerating(true);
    try {
      const response = await fetch("/api/ai/email-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType,
          leadData
        })
      });
      
      const data = await response.json();
      setGeneratedEmail(data.email);
    } catch (error) {
      console.error("Failed to generate email:", error);
    } finally {
      setGenerating(false);
    }
  };

  const saveTemplate = async () => {
    if (!generatedEmail) return;
    
    try {
      const response = await fetch("/api/ai/email-templates", {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(generatedEmail)
      });
      
      if (response.ok) {
        alert("Template saved successfully!");
      }
    } catch (error) {
      console.error("Failed to save template:", error);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Auto Email Generator</h1>
        <p className="text-gray-600">Generate personalized emails using AI for better engagement</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          {/* Email Type Selection */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Email Type</h3>
            <div className="space-y-3">
              {emailTypes.map(type => (
                <label key={type.value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="emailType"
                    value={type.value}
                    checked={selectedType === type.value}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">{type.label}</div>
                    <div className="text-sm text-gray-600">{type.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Lead Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Lead Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lead Name
                </label>
                <input
                  type="text"
                  value={leadData.name}
                  onChange={(e) => setLeadData({...leadData, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="John Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company
                </label>
                <input
                  type="text"
                  value={leadData.company}
                  onChange={(e) => setLeadData({...leadData, company: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="TechCorp Inc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Industry
                </label>
                <input
                  type="text"
                  value={leadData.industry}
                  onChange={(e) => setLeadData({...leadData, industry: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Technology"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lead Stage
                </label>
                <select
                  value={leadData.stage}
                  onChange={(e) => setLeadData({...leadData, stage: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="new">New Lead</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="proposal">Proposal</option>
                  <option value="negotiation">Negotiation</option>
                </select>
              </div>
            </div>

            <button
              onClick={generateEmail}
              disabled={generating || !leadData.name}
              className="w-full mt-6 bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {generating ? "Generating..." : "Generate Email"}
            </button>
          </div>
        </div>

        {/* Generated Email Section */}
        <div className="space-y-6">
          {generatedEmail && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Generated Email</h3>
                <div className="flex gap-2">
                  <button
                    onClick={saveTemplate}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    Save Template
                  </button>
                  <button
                    onClick={generateEmail}
                    className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                  >
                    Regenerate
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={generatedEmail.subject}
                    onChange={(e) => setGeneratedEmail({...generatedEmail, subject: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Content
                  </label>
                  <textarea
                    value={generatedEmail.content}
                    onChange={(e) => setGeneratedEmail({...generatedEmail, content: e.target.value})}
                    rows={12}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <div className="flex items-center">
                  <span className="text-blue-600 mr-2">💡</span>
                  <span className="text-sm text-blue-800">
                    {generatedEmail.personalized 
                      ? "This email is personalized based on the lead information provided."
                      : "Add more lead details for better personalization."
                    }
                  </span>
                </div>
              </div>
            </div>
          )}

          {!generatedEmail && !generating && (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
              <div className="text-4xl mb-4">✉️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Generate</h3>
              <p className="text-gray-600">Fill in the lead information and click generate to create a personalized email.</p>
            </div>
          )}

          {generating && (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Generating Email</h3>
              <p className="text-gray-600">AI is crafting a personalized email based on your inputs...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
