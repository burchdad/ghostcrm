import React, { useState } from "react";

const defaultProfiles = [
  { id: 1, name: "Manager", email: "manager@company.com", role: "manager", security: "admin, approve, edit, view" },
  { id: 2, name: "Tech Guy", email: "tech@company.com", role: "tech", security: "admin, edit, view" },
  { id: 3, name: "Sales Rep", email: "sales@company.com", role: "sales", security: "view, edit" },
];

const roleSecurityPresets: Record<string, string> = {
  manager: "admin, approve, edit, view",
  tech: "admin, edit, view",
  sales: "view, edit",
  admin: "admin, approve, edit, view, delete",
};

export default function UserProfilesSettings() {
  const [profiles, setProfiles] = useState(defaultProfiles);
  const [newProfile, setNewProfile] = useState({ name: "", email: "", role: "sales" });
  const [saved, setSaved] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setNewProfile({ ...newProfile, [e.target.name]: e.target.value });
  }
  function handleAddProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfiles([
      ...profiles,
      {
        id: profiles.length + 1,
        name: newProfile.name,
        email: newProfile.email,
        role: newProfile.role,
        security: roleSecurityPresets[newProfile.role] || "view",
      },
    ]);
    setNewProfile({ name: "", email: "", role: "sales" });
    setSaved(true);
    alert("User profile added with security protocols!");
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">👥 User Profiles & Role-Based Security</h1>
      <div className="bg-white rounded shadow p-4 mb-4">
        <h2 className="font-bold mb-2">Team Members</h2>
        <ul>
          {profiles.map(profile => (
            <li key={profile.id} className="mb-2">
              <span className="font-semibold">{profile.name}</span> ({profile.email}) - <span className="text-xs text-blue-700">{profile.role}</span>
              <span className="text-xs text-gray-500 ml-2">Security: {profile.security}</span>
            </li>
          ))}
        </ul>
        <form className="mt-4" onSubmit={handleAddProfile}>
          <div className="mb-2">
            <label className="font-bold">Name</label>
            <input type="text" name="name" value={newProfile.name} onChange={handleChange} className="border rounded px-2 py-1 ml-2 w-full" required />
          </div>
          <div className="mb-2">
            <label className="font-bold">Email</label>
            <input type="email" name="email" value={newProfile.email} onChange={handleChange} className="border rounded px-2 py-1 ml-2 w-full" required />
          </div>
          <div className="mb-2">
            <label className="font-bold">Role</label>
            <select name="role" value={newProfile.role} onChange={handleChange} className="border rounded px-2 py-1 ml-2">
              <option value="manager">Manager</option>
              <option value="tech">Tech Guy</option>
              <option value="sales">Sales Rep</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button className="px-2 py-1 bg-green-500 text-white rounded" type="submit">Add User Profile</button>
          {saved && <div className="text-xs text-green-700 mt-2">User profile added with security protocols!</div>}
        </form>
      </div>
    </div>
  );
}
