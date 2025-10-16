"use client";
import React, { useState, useEffect } from "react";

interface Suggestion {
  id: string;
  type: "lead" | "followup" | "email" | "upsell" | "optimization";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  action: string;
  data?: any;
}

export default function SmartSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/ai/suggestions");
      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (suggestion: Suggestion) => {
    try {
      const response = await fetch("/api/ai/suggestions/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suggestionId: suggestion.id, action: suggestion.action })
      });
      
      if (response.ok) {
        // Remove suggestion after action
        setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
      }
    } catch (error) {
      console.error("Failed to execute action:", error);
    }
  };

  const filteredSuggestions = suggestions.filter(s => 
    filter === "all" || s.type === filter
  );

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "lead": return "👥";
      case "followup": return "📅";
      case "email": return "✉️";
      case "upsell": return "💰";
      case "optimization": return "⚡";
      default: return "💡";
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Smart Suggestions</h1>
        <p className="text-gray-600">AI-powered recommendations to optimize your sales process</p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: "all", label: "All Suggestions" },
            { key: "lead", label: "Lead Opportunities" },
            { key: "followup", label: "Follow-ups" },
            { key: "email", label: "Email Content" },
            { key: "upsell", label: "Cross-sell/Upsell" },
            { key: "optimization", label: "Optimization" }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                filter === tab.key
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Generating suggestions...</span>
        </div>
      )}

      {/* Suggestions Grid */}
      {!loading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSuggestions.map(suggestion => (
            <div key={suggestion.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getTypeIcon(suggestion.type)}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(suggestion.impact)}`}>
                    {suggestion.impact.toUpperCase()} IMPACT
                  </span>
                </div>
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-2">{suggestion.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{suggestion.description}</p>
              
              <button
                onClick={() => handleAction(suggestion)}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                {suggestion.action}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredSuggestions.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No suggestions available</h3>
          <p className="text-gray-600 mb-4">
            {filter === "all" 
              ? "All caught up! Check back later for new AI-powered suggestions."
              : `No ${filter} suggestions at the moment.`
            }
          </p>
          <button
            onClick={fetchSuggestions}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
          >
            Refresh Suggestions
          </button>
        </div>
      )}
    </div>
  );
}