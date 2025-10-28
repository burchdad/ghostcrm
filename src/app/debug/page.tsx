"use client";

import { useAuth } from "@/context/AuthContext";

export default function QuickDebugPage() {
  const { user } = useAuth();

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>Quick Debug - User Role Check</h1>
      <div style={{ background: "#f0f0f0", padding: "10px", margin: "10px 0" }}>
        <h2>Current User:</h2>
        <pre>{JSON.stringify(user, null, 2)}</pre>
      </div>
      
      <div style={{ background: "#e8f5e8", padding: "10px", margin: "10px 0" }}>
        <h2>Role Analysis:</h2>
        <p>User Role: <strong>{user?.role || "No role"}</strong></p>
        <p>Is Owner: <strong>{user?.role === "owner" ? "YES ✅" : "NO ❌"}</strong></p>
        <p>Should Access Billing: <strong>{user?.role === "owner" ? "YES ✅" : "NO ❌"}</strong></p>
      </div>

      <div style={{ background: "#fff3cd", padding: "10px", margin: "10px 0" }}>
        <h2>Test Links:</h2>
        <p><a href="/billing" style={{ color: "blue" }}>Try Billing Page</a></p>
        <p><a href="/dashboard" style={{ color: "blue" }}>Try Dashboard</a></p>
        <p><a href="/admin/debug-role" style={{ color: "blue" }}>Full Debug Page</a></p>
      </div>
    </div>
  );
}