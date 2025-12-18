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
        className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center focus:ring-2 focus:ring-blue-500 hover:shadow-lg transition-all duration-200 transform hover:scale-105 group border border-blue-200" 
        aria-label={t("user_profile", "accessibility")} 
        onClick={() => setOpen(!open)}
      >
        {avatar ? (
          <img src={avatar} alt={t("avatar", "accessibility")} className="w-10 h-10 rounded-xl object-cover" />
        ) : (
          <span className="text-xl group-hover:scale-110 transition-transform duration-200">👤</span>
        )}
      </button>
      
      {open && (
        <div className="absolute top-14 right-0 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-sm" role="menu" aria-label={t("user_menu", "accessibility")} style={{
          transform: 'translateX(-50%)',
          right: '50%'
        }}>
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <button 
                className="relative w-16 h-16 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-2xl flex items-center justify-center hover:from-blue-300 hover:to-indigo-300 transition-all duration-200 shadow-lg group" 
                onClick={() => fileInputRef.current?.click()} 
                aria-label={t("upload_avatar", "accessibility")}
              >
                {avatar ? (
                  <img src={avatar} alt={t("avatar", "accessibility")} className="w-16 h-16 rounded-2xl object-cover" />
                ) : (
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-200">👤</span>
                )}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs shadow-lg">
                  📷
                </div>
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
              <div>
                <div className="font-bold text-lg text-gray-900">{role}</div>
                <div className="text-sm text-gray-500">{org}</div>
              </div>
            </div>
          </div>
          {/* Menu Items */}
          <div className="p-4 space-y-1">
            <button
              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl cursor-pointer transition-all duration-200 flex items-center gap-3 group"
              onClick={handleSettingsClick}
            >
              <span className="text-base group-hover:scale-110 transition-transform duration-200">⚙️</span>
              <span className="font-medium">{t("settings", "navigation")}</span>
            </button>
            <button
              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl cursor-pointer transition-all duration-200 flex items-center gap-3 group"
              onClick={handleProfileClick}
            >
              <span className="text-base group-hover:scale-110 transition-transform duration-200">👤</span>
              <span className="font-medium">{t("profile", "common")}</span>
            </button>
            <div className="h-px bg-gray-200 my-2"></div>
            <button
              className="w-full text-left px-4 py-3 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl cursor-pointer transition-all duration-200 flex items-center gap-3 group"
              onClick={handleLogout}
            >
              <span className="text-base group-hover:scale-110 transition-transform duration-200">🚪</span>
              <span className="font-medium">{t("logout", "common")}</span>
            </button>
          </div>
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
