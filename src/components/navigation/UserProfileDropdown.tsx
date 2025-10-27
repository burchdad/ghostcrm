"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserProfileModal } from "@/components/modals/UserProfileModal";
import { SettingsModal } from "@/components/modals/SettingsModal";
import { useI18n } from "@/components/utils/I18nProvider";

export function UserProfileDropdown() {
  const router = useRouter();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [role, setRole] = useState("Admin");
  const [org, setOrg] = useState("Org 1");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);
  
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleNavigation = (path: string) => {
    console.log('Navigating to:', path);
    setOpen(false);
    router.push(path);
  };

  const handleSettingsClick = () => {
    console.log('Opening settings modal');
    setOpen(false);
    setShowSettingsModal(true);
  };

  const handleProfileClick = () => {
    console.log('Opening profile modal');
    setOpen(false);
    setShowProfileModal(true);
  };

  const handleLogout = () => {
    console.log('Logout clicked');
    setOpen(false);
    if (window.confirm(t('Are you sure you want to logout?', 'ui'))) {
      console.log('Logout confirmed');
      // Add actual logout logic here (clear tokens, etc.)
      router.push('/login');
    }
  };
  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center focus:ring-2 focus:ring-blue-500" 
        aria-label={t("user_profile", "accessibility")} 
        onClick={() => setOpen(!open)}
      >
        {avatar ? (
          <img src={avatar} alt={t("avatar", "accessibility")} className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <span className="text-lg">👤</span>
        )}
      </button>
      
      {open && (
        <div className="absolute top-12 right-0 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4" role="menu" aria-label={t("user_menu", "accessibility")}>
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
            <button 
              className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors" 
              onClick={() => fileInputRef.current?.click()} 
              aria-label={t("upload_avatar", "accessibility")}
            >
              {avatar ? (
                <img src={avatar} alt={t("avatar", "accessibility")} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <span className="text-2xl">👤</span>
              )}
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
            <div>
              <div className="font-bold text-sm text-gray-900">{role}</div>
              <div className="text-xs text-gray-500">{org}</div>
            </div>
          </div>
          
          <ul className="space-y-1">
            <li>
              <button
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer transition-colors flex items-center gap-2"
                onClick={handleSettingsClick}
              >
                <span>⚙️</span>
                {t("settings", "navigation")}
              </button>
            </li>
            <li>
              <button
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer transition-colors flex items-center gap-2"
                onClick={handleProfileClick}
              >
                <span>👤</span>
                {t("profile", "common")}
              </button>
            </li>
            <li>
              <button
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md cursor-pointer transition-colors flex items-center gap-2"
                onClick={handleLogout}
              >
                <span>🚪</span>
                {t("logout", "common")}
              </button>
            </li>
          </ul>
        </div>
      )}
      
      <UserProfileModal 
        open={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
      />
      
      <SettingsModal 
        open={showSettingsModal} 
        onClose={() => setShowSettingsModal(false)} 
      />
    </div>
  );
}
