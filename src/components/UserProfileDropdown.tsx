"use client";
import React, { useState, useRef } from "react";

export function UserProfileDropdown() {
  const [open, setOpen] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [role, setRole] = useState("Admin");
  const [org, setOrg] = useState("Org 1");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };
  return (
    <div className="relative" tabIndex={0} onBlur={() => setOpen(false)}>
      <button className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center focus:ring-2" aria-label="User Profile" onClick={() => setOpen(!open)}>
        {avatar ? <img src={avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover" /> : <span className="text-lg">👤</span>}
      </button>
      {open && (
        <div className="fixed top-16 right-8 w-64 bg-white border rounded shadow-lg z-50 p-4" role="menu" aria-label="User Menu">
          <div className="flex items-center gap-2 mb-2">
            <button className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center" onClick={() => fileInputRef.current?.click()} aria-label="Upload Avatar">
              {avatar ? <img src={avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover" /> : <span className="text-2xl">👤</span>}
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
            <div>
              <div className="font-bold text-sm">{role}</div>
              <div className="text-xs text-gray-500">{org}</div>
            </div>
          </div>          
          <ul className="text-xs p-2">
            <li className="mb-1 px-2 py-1 hover:bg-gray-100 rounded cursor-pointer">Settings</li>
            <li className="mb-1 px-2 py-1 hover:bg-gray-100 rounded cursor-pointer">Profile</li>
            <li className="mb-1 px-2 py-1 hover:bg-gray-100 rounded cursor-pointer" onClick={() => window.confirm('Are you sure you want to logout?') && window.location.reload()}>Logout</li>
          </ul>
        </div>
      )}
    </div>
  );
}
