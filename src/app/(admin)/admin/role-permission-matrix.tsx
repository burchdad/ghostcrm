import React, { useState } from "react";

const mockRoles = [
  { id: 1, role: "Admin", permissions: ["View", "Edit", "Delete", "Approve"] },
  { id: 2, role: "Manager", permissions: ["View", "Edit", "Approve"] },
  { id: 3, role: "Rep", permissions: ["View", "Edit"] },
];

export default function RolePermissionMatrix() {
  const [roles, setRoles] = useState(mockRoles);
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [newPerm, setNewPerm] = useState("");

  function addPermission(roleId: number) {
    if (newPerm) {
      setRoles(roles.map(r => r.id === roleId ? { ...r, permissions: [...r.permissions, newPerm] } : r));
      setNewPerm("");
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">🔒 Role & Permission Matrix</h1>
      <div className="bg-white rounded shadow p-4 mb-4">
        <h2 className="font-bold mb-2">Roles</h2>
        <ul>
          {roles.map(role => (
            <li key={role.id} className="mb-2">
              <span className="font-semibold">{role.role}</span>: <span className="text-xs text-gray-500">{role.permissions.join(", ")}</span>
              <button className="ml-2 px-2 py-1 bg-blue-500 text-white rounded text-xs" onClick={() => setSelectedRole(role.id)}>Add Permission</button>
            </li>
          ))}
        </ul>
        {selectedRole !== null && (
          <div className="mt-4">
            <input
              type="text"
              value={newPerm}
              onChange={e => setNewPerm(e.target.value)}
              placeholder="New Permission"
              className="border rounded px-2 py-1 mb-2 w-full"
            />
            <button className="px-2 py-1 bg-green-500 text-white rounded" onClick={() => addPermission(selectedRole)}>Add</button>
          </div>
        )}
      </div>
    </div>
  );
}
