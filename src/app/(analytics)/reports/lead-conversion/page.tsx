"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LeadConversionReportsPage() {
  const router = useRouter();
  const [selectedTimeframe, setSelectedTimeframe] = useState("last-30-days");
  const [selectedSource, setSelectedSource] = useState("all");
  const [selectedTeamMember, setSelectedTeamMember] = useState("all");

  const timeframes = [
    { value: "last-7-days", label: "Last 7 Days" },
    { value: "last-30-days", label: "Last 30 Days" },
    { value: "last-quarter", label: "Last Quarter" },
    { value: "last-year", label: "Last Year" },
    { value: "custom", label: "Custom Range" }
  ];

  const sources = [
    { value: "all", label: "All Sources" },
    { value: "website", label: "Website" },
    { value: "email", label: "Email Campaign" },
    { value: "social", label: "Social Media" },
    { value: "referral", label: "Referral" },
    { value: "cold-call", label: "Cold Call" },
    { value: "trade-show", label: "Trade Show" }
  ];

  const teamMembers = [
    { value: "all", label: "All Team Members" },
    { value: "john-smith", label: "John Smith" },
    { value: "sarah-johnson", label: "Sarah Johnson" },
    { value: "mike-wilson", label: "Mike Wilson" },
    { value: "lisa-chen", label: "Lisa Chen" }
  ];

  const conversionData = {
    overall: {
      leadsGenerated: 1247,
      leadsContacted: 923,
      leadsQualified: 456,
      dealsCreated: 187,
      dealsWon: 45,
      conversionRate: 3.6,
      averageConversionTime: 14.5
    },
    byStage: [
      { stage: "Generated", count: 1247, percentage: 100, color: "blue" },
      { stage: "Contacted", count: 923, percentage: 74.0, color: "indigo" },
      { stage: "Qualified", count: 456, percentage: 36.6, color: "purple" },
      { stage: "Proposal", count: 187, percentage: 15.0, color: "pink" },
      { stage: "Won", count: 45, percentage: 3.6, color: "green" }
    ],
    bySource: [
      { source: "Website", leads: 387, converted: 18, rate: 4.6, color: "blue" },
      { source: "Email Campaign", leads: 245, converted: 12, rate: 4.9, color: "green" },
      { source: "Social Media", leads: 198, converted: 6, rate: 3.0, color: "purple" },
      { source: "Referral", leads: 156, converted: 5, rate: 3.2, color: "orange" },
      { source: "Cold Call", leads: 143, converted: 3, rate: 2.1, color: "red" },
      { source: "Trade Show", leads: 118, converted: 1, rate: 0.8, color: "teal" }
    ],
    byTeamMember: [
      { name: "Sarah Johnson", leads: 287, converted: 15, rate: 5.2, deals: "$234K" },
      { name: "John Smith", leads: 245, converted: 12, rate: 4.9, deals: "$189K" },
      { name: "Mike Wilson", leads: 198, converted: 9, rate: 4.5, deals: "$156K" },
      { name: "Lisa Chen", leads: 176, converted: 6, rate: 3.4, deals: "$98K" }
    ],
    conversionFunnel: [
      { stage: "Lead Generated", count: 1247, percentage: 100 },
      { stage: "Initial Contact", count: 923, percentage: 74 },
      { stage: "Needs Assessment", count: 654, percentage: 52 },
      { stage: "Qualified Lead", count: 456, percentage: 37 },
      { stage: "Proposal Sent", count: 187, percentage: 15 },
      { stage: "Negotiation", count: 89, percentage: 7 },
      { stage: "Closed Won", count: 45, percentage: 4 }
    ]
  };

  const handleExport = () => {
    console.log("Exporting lead conversion report...");
  };

  const handleScheduleReport = () => {
    console.log("Scheduling report...");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                <span className="text-4xl">📈</span>
                Lead Conversion Reports
              </h1>
              <p className="text-slate-600 mt-2">Analyze your lead conversion performance and identify optimization opportunities</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleScheduleReport}
                className="px-4 py-2 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <span>⏰</span>
                Schedule
              </button>
              <button
                onClick={handleExport}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <span>📤</span>
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <span>🔍</span>
            Report Filters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Time Period</label>
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {timeframes.map(timeframe => (
                  <option key={timeframe.value} value={timeframe.value}>
                    {timeframe.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Lead Source</label>
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {sources.map(source => (
                  <option key={source.value} value={source.value}>
                    {source.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Team Member</label>
              <select
                value={selectedTeamMember}
                onChange={(e) => setSelectedTeamMember(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {teamMembers.map(member => (
                  <option key={member.value} value={member.value}>
                    {member.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Overall Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">🎯</span>
              <span className="text-sm font-medium text-green-600">+8.3%</span>
            </div>
            <div className="text-3xl font-bold text-slate-800">{conversionData.overall.conversionRate}%</div>
            <div className="text-sm text-slate-600">Overall Conversion Rate</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">👥</span>
              <span className="text-sm font-medium text-blue-600">+12.1%</span>
            </div>
            <div className="text-3xl font-bold text-slate-800">{conversionData.overall.leadsGenerated.toLocaleString()}</div>
            <div className="text-sm text-slate-600">Leads Generated</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">💰</span>
              <span className="text-sm font-medium text-purple-600">+15.7%</span>
            </div>
            <div className="text-3xl font-bold text-slate-800">{conversionData.overall.dealsWon}</div>
            <div className="text-sm text-slate-600">Deals Won</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">⏱️</span>
              <span className="text-sm font-medium text-orange-600">-2.3 days</span>
            </div>
            <div className="text-3xl font-bold text-slate-800">{conversionData.overall.averageConversionTime}</div>
            <div className="text-sm text-slate-600">Avg. Conversion Time (days)</div>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <span>🔄</span>
            Conversion Funnel
          </h2>
          <div className="space-y-4">
            {conversionData.conversionFunnel.map((stage, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-32 text-sm font-medium text-slate-700">{stage.stage}</div>
                <div className="flex-1 bg-slate-100 rounded-full h-8 relative">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    style={{ width: `${stage.percentage}%` }}
                  >
                    {stage.count.toLocaleString()}
                  </div>
                </div>
                <div className="w-16 text-sm font-medium text-slate-600">{stage.percentage}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Conversion by Source */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <span>📊</span>
            Conversion by Source
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {conversionData.bySource.map((item, index) => (
              <div key={index} className="p-4 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-medium text-slate-800">{item.source}</div>
                  <div className={`text-sm font-medium text-${item.color}-600`}>{item.rate}%</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Leads:</span>
                    <span className="font-medium">{item.leads}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Converted:</span>
                    <span className="font-medium">{item.converted}</span>
                  </div>
                </div>
                <div className="mt-3 h-2 bg-slate-100 rounded-full">
                  <div
                    className={`h-2 bg-${item.color}-500 rounded-full`}
                    style={{ width: `${item.rate * 10}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Performance */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <span>👥</span>
            Team Performance
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Team Member</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Leads Handled</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Converted</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Conversion Rate</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Deal Value</th>
                </tr>
              </thead>
              <tbody>
                {conversionData.byTeamMember.map((member, index) => (
                  <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-800">{member.name}</td>
                    <td className="py-3 px-4 text-slate-600">{member.leads}</td>
                    <td className="py-3 px-4 text-slate-600">{member.converted}</td>
                    <td className="py-3 px-4">
                      <span className={`font-medium ${
                        member.rate >= 5 ? "text-green-600" : 
                        member.rate >= 4 ? "text-yellow-600" : "text-red-600"
                      }`}>
                        {member.rate}%
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">{member.deals}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Insights & Recommendations */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <span>💡</span>
            Insights & Recommendations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-lg font-medium text-green-800 mb-2">🎯 Top Performing Source</div>
              <div className="text-sm text-green-700 mb-3">
                Email campaigns show the highest conversion rate at 4.9%. Consider increasing investment in email marketing.
              </div>
              <button className="text-sm text-green-600 hover:text-green-800 font-medium">
                View Email Campaign Details →
              </button>
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-lg font-medium text-yellow-800 mb-2">⚠️ Improvement Opportunity</div>
              <div className="text-sm text-yellow-700 mb-3">
                Cold call conversions are below average. Consider reviewing scripts or providing additional training.
              </div>
              <button className="text-sm text-yellow-600 hover:text-yellow-800 font-medium">
                Analyze Cold Call Performance →
              </button>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-lg font-medium text-blue-800 mb-2">📈 Trending Up</div>
              <div className="text-sm text-blue-700 mb-3">
                Sarah Johnson leads the team with a 5.2% conversion rate. Consider adopting her best practices.
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                Request Best Practices →
              </button>
            </div>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="text-lg font-medium text-purple-800 mb-2">🔮 Forecast</div>
              <div className="text-sm text-purple-700 mb-3">
                Based on current trends, projected conversions for next month: 52 deals worth $340K.
              </div>
              <button className="text-sm text-purple-600 hover:text-purple-800 font-medium">
                View Full Forecast →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
