"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserSettingsModal } from "@/components/modals/UserSettingsModal";
import { useI18n } from "@/components/utils/I18nProvider";

export function UserProfileDropdown() {
  const router = useRouter();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [showUserSettingsModal, setShowUserSettingsModal] = useState(false);
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

  const handleUserSettingsClick = () => {
    console.log('Opening user settings modal');
    setOpen(false);
    setShowUserSettingsModal(true);
  };

  const handleLogout = async () => {
    console.log('Logout clicked');
    setOpen(false);
    if (window.confirm(t('Are you sure you want to logout?', 'ui'))) {
      console.log('Logout confirmed');
      
      try {
        // Call logout API to clear server-side cookies
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        // Clear client-side auth state
        if (typeof window !== 'undefined') {
          // Clear localStorage
          localStorage.removeItem('ghostcrm_user');
          localStorage.removeItem('ghostcrm_session_time');
          localStorage.removeItem('ghostcrm_demo_mode');
          localStorage.removeItem('ghostcrm_trial_mode');
          localStorage.removeItem('ghostcrm_auth_token');
          localStorage.removeItem('ghostcrm_auth_state');
          localStorage.clear(); // Clear everything to be safe
          
          // Clear sessionStorage - THIS IS THE KEY FIX!
          sessionStorage.removeItem('ghost_auth_state');
          sessionStorage.removeItem('ghost_auth_backup');
          sessionStorage.clear(); // Clear everything to be safe
          
          // Clear cookies on client side
          const cookiesToClear = ['ghostcrm_jwt'];
          const domains = ['', window.location.hostname, `.${window.location.hostname}`];
          const paths = ['/', '/login'];
          
          cookiesToClear.forEach(cookieName => {
            domains.forEach(domain => {
              paths.forEach(path => {
                // Clear cookie with different domain/path combinations
                const cookieString = domain 
                  ? `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain};`
                  : `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
                document.cookie = cookieString;
              });
            });
          });
        }
        
        console.log('✅ Logout completed successfully');
        
        // Force a hard redirect to ensure clean state
        window.location.href = '/login';
        
      } catch (error) {
        console.error('Logout error:', error);
        // Still redirect even if API call fails
        window.location.href = '/login';
      }
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
        <div 
          className="fixed top-16 right-2 w-72 max-w-[calc(100vw-1rem)] bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden backdrop-blur-sm" 
          role="menu" 
          aria-label={t("user_menu", "accessibility")}
          ref={dropdownRef}
        >
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <button 
                className="relative w-12 h-12 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-xl flex items-center justify-center hover:from-blue-300 hover:to-indigo-300 transition-all duration-200 shadow-md group" 
                onClick={() => fileInputRef.current?.click()} 
                aria-label={t("upload_avatar", "accessibility")}
              >
                {avatar ? (
                  <img src={avatar} alt={t("avatar", "accessibility")} className="w-12 h-12 rounded-xl object-cover" />
                ) : (
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-200">👤</span>
                )}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs shadow-lg">
                  📷
                </div>
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
              <div>
                <div className="font-semibold text-gray-900">{role}</div>
                <div className="text-sm text-gray-600">{org}</div>
              </div>
            </div>
          </div>
          
          {/* Menu Items */}
          <div className="p-3 space-y-1">
            <button
              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-all duration-200 flex items-center gap-3 group"
              onClick={handleUserSettingsClick}
            >
              <span className="text-base group-hover:scale-110 transition-transform duration-200">⚙️</span>
              <span className="font-medium">{t("user_settings", "navigation") || "User Settings"}</span>
            </button>
            <div className="h-px bg-gray-200 my-2"></div>
            <button
              className="w-full text-left px-4 py-3 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer transition-all duration-200 flex items-center gap-3 group"
              onClick={handleLogout}
            >
              <span className="text-base group-hover:scale-110 transition-transform duration-200">🚪</span>
              <span className="font-medium">{t("logout", "common")}</span>
            </button>
          </div>
        </div>
      )}
      
      <UserSettingsModal 
        open={showUserSettingsModal} 
        onClose={() => setShowUserSettingsModal(false)} 
      />
    </div>
  );
}
