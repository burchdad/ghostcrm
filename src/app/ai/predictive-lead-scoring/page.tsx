"use client";
import React, { useState, useEffect } from "react";

interface LeadScore {
  leadId: string;
  name: string;
  email: string;
  score: number;
  confidence: number;
  factors: string[];
  recommendation: string;
  stage: string;
  value?: number;
}

export default function PredictiveLeadScoringPage() {
  const [leadScores, setLeadScores] = useState<LeadScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"score" | "confidence" | "value">("score");
  const [filterBy, setFilterBy] = useState<"all" | "high" | "medium" | "low">("all");

  useEffect(() => {
    fetchLeadScores();
  }, []);

  const fetchLeadScores = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/ai/leadscore");
      const data = await response.json();
      setLeadScores(data.scores || []);
    } catch (error) {
      console.error("Failed to fetch lead scores:", error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreCategory = (score: number) => {
    if (score >= 80) return "high";
    if (score >= 60) return "medium";
    return "low";
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const sortedAndFilteredScores = leadScores
    .filter(lead => {
      if (filterBy === "all") return true;
      return getScoreCategory(lead.score) === filterBy;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "score": return b.score - a.score;
        case "confidence": return b.confidence - a.confidence;
        case "value": return (b.value || 0) - (a.value || 0);
        default: return 0;
      }
    });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Predictive Lead Scoring</h1>
        <p className="text-gray-600">AI-powered lead scoring to prioritize your sales efforts</p>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        {/* Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Filter:</label>
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="all">All Leads</option>
            <option value="high">High Score (80+)</option>
            <option value="medium">Medium Score (60-79)</option>
            <option value="low">Low Score (&lt;60)</option>
          </select>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="score">Lead Score</option>
            <option value="confidence">Confidence</option>
            <option value="value">Deal Value</option>
          </select>
        </div>

        {/* Refresh */}
        <button
          onClick={fetchLeadScores}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Scoring..." : "Refresh Scores"}
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Leads", value: leadScores.length, color: "bg-blue-500" },
          { label: "High Score", value: leadScores.filter(l => l.score >= 80).length, color: "bg-green-500" },
          { label: "Medium Score", value: leadScores.filter(l => l.score >= 60 && l.score < 80).length, color: "bg-yellow-500" },
          { label: "Low Score", value: leadScores.filter(l => l.score < 60).length, color: "bg-red-500" }
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full ${stat.color} mr-3`}></div>
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Analyzing leads...</span>
        </div>
      )}

      {/* Lead Scores Table */}
      {!loading && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key Factors</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recommendation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedAndFilteredScores.map(lead => (
                <tr key={lead.leadId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                      <div className="text-sm text-gray-500">{lead.email}</div>
                      <div className="text-xs text-gray-400">{lead.stage}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreColor(lead.score)}`}>
                      {lead.score}/100
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{width: `${lead.confidence}%`}}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{lead.confidence}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {lead.factors.slice(0, 3).map((factor, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                          {factor}
                        </span>
                      ))}
                      {lead.factors.length > 3 && (
                        <span className="text-xs text-gray-500">+{lead.factors.length - 3} more</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">{lead.recommendation}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">View Lead</button>
                    <button className="text-green-600 hover:text-green-900">Contact</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {!loading && sortedAndFilteredScores.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No leads to score</h3>
          <p className="text-gray-600 mb-4">Add some leads to see AI-powered scoring and recommendations.</p>
        </div>
      )}
    </div>
  );
}