"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserSettingsModal } from "@/components/modals/UserSettingsModal";
import { useI18n } from "@/components/utils/I18nProvider";
import styles from "./UserProfileDropdown.module.css";

export function UserProfileDropdown() {
  const router = useRouter();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [showUserSettingsModal, setShowUserSettingsModal] = useState(false);
  const [modalInitialTab, setModalInitialTab] = useState<'profile' | 'settings' | 'help' | 'support'>('profile');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [role, setRole] = useState("Admin");
  const [org, setOrg] = useState("Org 1");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Adjust dropdown positioning to prevent overflow
  useEffect(() => {
    if (open && dropdownRef.current) {
      const dropdown = dropdownRef.current.querySelector(`.${styles.dropdownMenu}`) as HTMLElement;
      if (dropdown) {
        // Reset position first
        dropdown.style.right = '0';
        dropdown.style.left = 'auto';
        dropdown.style.transform = 'none';
        
        // Check if dropdown extends beyond viewport
        const rect = dropdown.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        
        if (rect.right > viewportWidth - 8) {
          // Calculate how much to shift left
          const overflow = rect.right - viewportWidth + 16;
          dropdown.style.transform = `translateX(-${overflow}px)`;
        }
      }
    }
  }, [open]);

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
    setModalInitialTab('settings');
    setShowUserSettingsModal(true);
  };

  const handleProfileClick = () => {
    console.log('Opening profile tab in modal');
    setOpen(false);
    setModalInitialTab('profile');
    setShowUserSettingsModal(true);
  };

  const handleHelpClick = () => {
    console.log('Opening help tab in modal');
    setOpen(false);
    setModalInitialTab('help');
    setShowUserSettingsModal(true);
  };

  const handleLogout = async () => {
    console.log('Logout clicked');
    setOpen(false);
    console.log('Logout proceeding without confirmation');
    
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
  };

  return (
    <div className={styles.dropdownContainer} ref={dropdownRef}>
      <button 
        className={styles.dropdownTrigger}
        aria-label={t("user_profile", "accessibility")} 
        onClick={() => setOpen(!open)}
      >
        {avatar ? (
          <img src={avatar} alt={t("avatar", "accessibility")} className={styles.avatarImage} />
        ) : (
          <span className={styles.avatarEmoji}>👤</span>
        )}
      </button>
      
      {open && (
        <div 
          className={styles.dropdownMenu}
          role="menu" 
          aria-label={t("user_menu", "accessibility")}
        >
          {/* Profile Header */}
          <div className={styles.profileHeader}>
            <div className={styles.profileHeaderContent}>
              <button 
                className={styles.avatarButton}
                onClick={() => fileInputRef.current?.click()} 
                aria-label={t("upload_avatar", "accessibility")}
              >
                {avatar ? (
                  <img src={avatar} alt={t("avatar", "accessibility")} className={styles.avatarImage} />
                ) : (
                  <span className={styles.avatarEmoji}>👤</span>
                )}
                <div className={styles.cameraIcon}>
                  📷
                </div>
              </button>
              <input type="file" ref={fileInputRef} className={styles.hiddenInput} accept="image/*" onChange={handleAvatarUpload} />
              <div className={styles.userInfo}>
                <div className={styles.userName}>{role}</div>
                <div className={styles.userOrg}>{org}</div>
              </div>
            </div>
          </div>
          
          {/* Menu Items */}
          <div className={styles.menuItems}>
            <button
              className={styles.menuItem}
              onClick={handleProfileClick}
            >
              <span className={styles.menuIcon}>👤</span>
              <span className={styles.menuText}>My Profile</span>
            </button>
            <button
              className={styles.menuItem}
              onClick={handleUserSettingsClick}
            >
              <span className={styles.menuIcon}>⚙️</span>
              <span className={styles.menuText}>Settings</span>
            </button>
            <button
              className={styles.menuItem}
              onClick={handleHelpClick}
            >
              <span className={styles.menuIcon}>❓</span>
              <span className={styles.menuText}>Help & Support</span>
            </button>
            <div className={styles.divider}></div>
            <button
              className={`${styles.menuItem} ${styles.logout}`}
              onClick={handleLogout}
            >
              <span className={styles.menuIcon}>🚪</span>
              <span className={styles.menuText}>{t("logout", "common")}</span>
            </button>
          </div>
        </div>
      )}
      
      <UserSettingsModal 
        open={showUserSettingsModal} 
        onClose={() => setShowUserSettingsModal(false)}
        initialTab={modalInitialTab}
      />
    </div>
  );
}
