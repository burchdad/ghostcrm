"use client";

import { useAuth } from "@/context/SupabaseAuthContext";
import { useState } from "react";

export default function QuickDebugPage() {
  const { user } = useAuth();
  const [cleanupResult, setCleanupResult] = useState<any>(null);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [orgFixResult, setOrgFixResult] = useState<any>(null);
  const [isFixingOrg, setIsFixingOrg] = useState(false);

  const cleanupDuplicateUsers = async () => {
    if (!user?.email) return;
    
    setIsCleaningUp(true);
    try {
      const response = await fetch("/api/admin/cleanup-users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: user.email }),
      });
      
      const result = await response.json();
      setCleanupResult(result);
      
      if (response.ok && result.removedUsers > 0) {
        // Refresh the page to get updated user data
        setTimeout(() => window.location.reload(), 2000);
      }
    } catch (error) {
      console.error("Error cleaning up users:", error);
      setCleanupResult({ error: "Failed to cleanup users" });
    } finally {
      setIsCleaningUp(false);
    }
  };

  const fixOrganization = async () => {
    if (!user?.email) return;
    
    setIsFixingOrg(true);
    try {
      const response = await fetch("/api/admin/fix-organization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: user.email }),
      });
      
      const result = await response.json();
      setOrgFixResult(result);
      
      if (response.ok) {
        // Refresh the page to get updated user data
        setTimeout(() => window.location.reload(), 2000);
      }
    } catch (error) {
      console.error("Error fixing organization:", error);
      setOrgFixResult({ error: "Failed to fix organization" });
    } finally {
      setIsFixingOrg(false);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "monospace", maxWidth: "800px" }}>
      <h1>🔧 Debug - User Authentication Status</h1>
      
      <div style={{ background: "#f0f0f0", padding: "15px", margin: "10px 0", borderRadius: "5px" }}>
        <h2>🔍 Current User Data:</h2>
        <pre style={{ fontSize: "12px", overflow: "auto" }}>
          {user ? JSON.stringify(user, null, 2) : "No user data"}
        </pre>
      </div>
      
      <div style={{ background: "#e8f5e8", padding: "15px", margin: "10px 0", borderRadius: "5px" }}>
        <h2>📊 Authentication Analysis:</h2>
        <p><strong>User Email:</strong> {user?.email || "Not available"}</p>
        <p><strong>User Role:</strong> {user?.role || "No role"}</p>
        <p><strong>Is Owner:</strong> {user?.role === "owner" ? "YES ✅" : "NO ❌"}</p>
        <p><strong>Should Access Billing:</strong> {user?.role === "owner" ? "YES ✅" : "NO ❌"}</p>
        <p><strong>Tenant ID:</strong> {user?.tenantId || "No tenant"}</p>
        <p><strong>User ID:</strong> {user?.id || "No ID"}</p>
      </div>

      <div style={{ background: "#fff3cd", padding: "15px", margin: "10px 0", borderRadius: "5px" }}>
        <h2>🔧 Actions:</h2>
        <div style={{ marginBottom: "10px" }}>
          <button
            onClick={fixOrganization}
            disabled={isFixingOrg || !user?.email}
            style={{
              padding: "10px 15px",
              marginRight: "10px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: isFixingOrg ? "not-allowed" : "pointer"
            }}
          >
            {isFixingOrg ? "Fixing..." : "🏢 Fix Organization Setup"}
          </button>
          
          <button
            onClick={cleanupDuplicateUsers}
            disabled={isCleaningUp || !user?.email}
            style={{
              padding: "10px 15px",
              marginRight: "10px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: isCleaningUp ? "not-allowed" : "pointer"
            }}
          >
            {isCleaningUp ? "Cleaning Up..." : "🗑️ Cleanup Duplicate Users"}
          </button>
          
          <a href="/billing" style={{ 
            padding: "10px 15px", 
            marginRight: "10px",
            backgroundColor: "#007bff", 
            color: "white", 
            textDecoration: "none",
            borderRadius: "5px"
          }}>
            🧾 Test Billing Access
          </a>
          
          <a href="/dashboard" style={{ 
            padding: "10px 15px", 
            backgroundColor: "#6c757d", 
            color: "white", 
            textDecoration: "none",
            borderRadius: "5px"
          }}>
            📊 Go to Dashboard
          </a>
        </div>
      </div>

      {cleanupResult && (
        <div style={{ 
          background: cleanupResult.error ? "#f8d7da" : "#d4edda", 
          padding: "15px", 
          margin: "10px 0",
          borderRadius: "5px",
          border: `1px solid ${cleanupResult.error ? "#f5c6cb" : "#c3e6cb"}`
        }}>
          <h3>🔧 Cleanup Result:</h3>
          <pre style={{ fontSize: "12px", overflow: "auto" }}>
            {JSON.stringify(cleanupResult, null, 2)}
          </pre>
        </div>
      )}

      {orgFixResult && (
        <div style={{ 
          background: orgFixResult.error ? "#f8d7da" : "#d4edda", 
          padding: "15px", 
          margin: "10px 0",
          borderRadius: "5px",
          border: `1px solid ${orgFixResult.error ? "#f5c6cb" : "#c3e6cb"}`
        }}>
          <h3>🏢 Organization Fix Result:</h3>
          <pre style={{ fontSize: "12px", overflow: "auto" }}>
            {JSON.stringify(orgFixResult, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ background: "#e2e3e5", padding: "15px", margin: "10px 0", borderRadius: "5px" }}>
        <h2>📋 Expected Behavior:</h2>
        <ul>
          <li>✅ User should have "owner" role</li>
          <li>✅ Billing page should be accessible</li>
          <li>✅ No duplicate users in database</li>
          <li>✅ Clean authentication flow</li>
        </ul>
      </div>
    </div>
  );
}