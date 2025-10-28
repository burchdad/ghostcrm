// Debug page to test role and billing access
"use client";

import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

export default function RoleDebugPage() {
  const { user, hasPermission } = useAuth();
  const [fixResult, setFixResult] = useState<any>(null);
  const [isFixing, setIsFixing] = useState(false);

  const fixUserRole = async () => {
    if (!user?.email) return;
    
    setIsFixing(true);
    try {
      const response = await fetch("/api/admin/fix-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userEmail: user.email }),
      });
      
      const result = await response.json();
      setFixResult(result);
      
      if (response.ok) {
        // Refresh the page to get updated user data
        window.location.reload();
      }
    } catch (error) {
      console.error("Error fixing role:", error);
      setFixResult({ error: "Failed to fix role" });
    } finally {
      setIsFixing(false);
    }
  };

  const testBillingAccess = () => {
    window.location.href = "/billing";
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Role & Billing Access Debug</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="font-semibold mb-2">Current User Info:</h2>
        <pre className="text-sm overflow-auto">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>

      <div className="mb-6">
        <h2 className="font-semibold mb-2">Permissions Check:</h2>
        <p>Has billing permission: {hasPermission("billing") ? "✅ Yes" : "❌ No"}</p>
        <p>User role: {user?.role || "No role"}</p>
        <p>Organization ID: {user?.organizationId || "No organization"}</p>
      </div>

      <div className="space-y-4">
        <button
          onClick={fixUserRole}
          disabled={isFixing || !user?.email}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isFixing ? "Fixing Role..." : "Fix User Role (Admin → Owner)"}
        </button>

        <button
          onClick={testBillingAccess}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 ml-4"
        >
          Test Billing Page Access
        </button>
      </div>

      {fixResult && (
        <div className="mt-6 bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Fix Role Result:</h3>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(fixResult, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-6 text-sm text-gray-600">
        <p><strong>Expected Behavior:</strong></p>
        <ul className="list-disc ml-4">
          <li>User role should be "owner" (not "admin")</li>
          <li>Has billing permission should be "Yes"</li>
          <li>Billing page should be accessible</li>
        </ul>
      </div>
    </div>
  );
}