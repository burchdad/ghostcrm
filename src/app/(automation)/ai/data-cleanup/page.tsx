"use client";
import React, { useState, useEffect } from "react";

interface DataIssue {
  id: string;
  type: "duplicate" | "incomplete" | "invalid" | "outdated" | "formatting";
  severity: "high" | "medium" | "low";
  table: string;
  field: string;
  description: string;
  recordCount: number;
  autoFixable: boolean;
  suggestion: string;
}

interface CleanupStats {
  totalRecords: number;
  issuesFound: number;
  autoFixable: number;
  estimatedTimeSaved: string;
}

export default function DataCleanupPage() {
  const [issues, setIssues] = useState<DataIssue[]>([]);
  const [stats, setStats] = useState<CleanupStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [selectedIssues, setSelectedIssues] = useState<Set<string>>(new Set());
  const [fixingIssues, setFixingIssues] = useState(false);

  useEffect(() => {
    scanDataIssues();
  }, []);

  const scanDataIssues = async () => {
    setLoading(true);
    setScanProgress(0);
    
    // Simulate scanning progress
    const progressInterval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);

    try {
      const response = await fetch("/api/ai/data-cleanup/scan");
      const data = await response.json();
      
      setIssues(data.issues || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error("Failed to scan data issues:", error);
    } finally {
      setLoading(false);
      setScanProgress(100);
    }
  };

  const fixSelectedIssues = async () => {
    if (selectedIssues.size === 0) return;
    
    setFixingIssues(true);
    try {
      const response = await fetch("/api/ai/data-cleanup/fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueIds: Array.from(selectedIssues) })
      });
      
      if (response.ok) {
        // Remove fixed issues from the list
        setIssues(prev => prev.filter(issue => !selectedIssues.has(issue.id)));
        setSelectedIssues(new Set());
        
        // Update stats
        if (stats) {
          setStats({
            ...stats,
            issuesFound: stats.issuesFound - selectedIssues.size
          });
        }
      }
    } catch (error) {
      console.error("Failed to fix issues:", error);
    } finally {
      setFixingIssues(false);
    }
  };

  const toggleIssueSelection = (issueId: string) => {
    setSelectedIssues(prev => {
      const newSet = new Set(prev);
      if (newSet.has(issueId)) {
        newSet.delete(issueId);
      } else {
        newSet.add(issueId);
      }
      return newSet;
    });
  };

  const selectAllAutoFixable = () => {
    const autoFixableIds = issues.filter(issue => issue.autoFixable).map(issue => issue.id);
    setSelectedIssues(new Set(autoFixableIds));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "duplicate": return "👥";
      case "incomplete": return "📝";
      case "invalid": return "❌";
      case "outdated": return "📅";
      case "formatting": return "🔧";
      default: return "⚠️";
    }
  };

  const filteredIssues = issues;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Data Cleanup</h1>
        <p className="text-gray-600">Automatically identify and fix data quality issues in your CRM</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Records</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRecords.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-600">Issues Found</p>
                <p className="text-2xl font-bold text-gray-900">{stats.issuesFound}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-600">Auto-Fixable</p>
                <p className="text-2xl font-bold text-gray-900">{stats.autoFixable}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-purple-500 mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-600">Time Saved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.estimatedTimeSaved}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scanning Progress */}
      {loading && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Scanning Data Quality</h3>
            <span className="text-sm text-gray-600">{scanProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${scanProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">Analyzing records for duplicates, missing data, and formatting issues...</p>
        </div>
      )}

      {/* Controls */}
      {!loading && issues.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={selectAllAutoFixable}
                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
              >
                Select All Auto-Fixable ({issues.filter(i => i.autoFixable).length})
              </button>
              <button
                onClick={() => setSelectedIssues(new Set())}
                className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
              >
                Clear Selection
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={scanDataIssues}
                disabled={loading}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50"
              >
                Rescan Data
              </button>
              <button
                onClick={fixSelectedIssues}
                disabled={selectedIssues.size === 0 || fixingIssues}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {fixingIssues ? "Fixing..." : `Fix Selected (${selectedIssues.size})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Issues List */}
      {!loading && (
        <div className="space-y-4">
          {filteredIssues.map(issue => (
            <div key={issue.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <input
                    type="checkbox"
                    checked={selectedIssues.has(issue.id)}
                    onChange={() => toggleIssueSelection(issue.id)}
                    disabled={!issue.autoFixable}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">{getTypeIcon(issue.type)}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(issue.severity)}`}>
                        {issue.severity.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-600">
                        {issue.table}.{issue.field}
                      </span>
                      {issue.autoFixable && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                          Auto-fixable
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{issue.description}</h3>
                    <p className="text-gray-600 text-sm mb-3">{issue.suggestion}</p>
                    <p className="text-sm text-gray-500">
                      Affects {issue.recordCount} record{issue.recordCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && issues.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="text-4xl mb-4">✨</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Your data looks great!</h3>
          <p className="text-gray-600 mb-4">No significant data quality issues were found in your CRM.</p>
          <button
            onClick={scanDataIssues}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
          >
            Run Another Scan
          </button>
        </div>
      )}
    </div>
  );
}
