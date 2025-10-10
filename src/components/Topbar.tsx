"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faUser } from "@fortawesome/free-solid-svg-icons";

function useOutsideClick(ref: React.RefObject<HTMLDivElement>, handler: () => void) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

export default function Topbar() {
  // Notifications logic
  const [notifications, setNotifications] = useState<string[]>(["Welcome to GhostCRM!"]);
  const [unreadNotifications, setUnreadNotifications] = useState<string[]>(["Welcome to GhostCRM!"]);
  const markAsRead = (n: string) => setUnreadNotifications((x) => x.filter((v) => v !== n));
  const groupedNotifications = unreadNotifications.reduce((acc: Record<string, string[]>, n) => {
    const type = n.includes("lead") ? "Leads" : n.includes("Welcome") ? "System" : "Other";
    (acc[type] ||= []).push(n);
    return acc;
  }, {});
  
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/leads");
        const data = await res.json();
        if (data.records) {
          const notes = ["Welcome to GhostCRM!", `You have ${data.records.length} leads.`];
          setNotifications(notes);
          setUnreadNotifications(notes);
        } else {
          const notes = ["Welcome to GhostCRM!", "Unable to fetch leads."];
          setNotifications(notes);
          setUnreadNotifications(notes);
        }
      } catch {
        const notes = ["Welcome to GhostCRM!", "Unable to fetch leads."];
        setNotifications(notes);
        setUnreadNotifications(notes);
      }
    })();
  }, []);

  // Profile dropdown logic
  const [showProfile, setShowProfile] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [role, setRole] = useState("Admin");
  const [org, setOrg] = useState("Org 1");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  useOutsideClick(profileRef, () => showProfile && setShowProfile(false));

  // Notification dropdown logic
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useOutsideClick(dropdownRef, () => showDropdown && setShowDropdown(false));

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };
  
  return (
    <div className="topbar">
      <div className="topbar-content">
        <Image 
          src="/images/ghost crm logo.png" 
          alt="Ghost CRM Logo" 
          width={150} 
          height={40}
          priority
          className="topbar-logo"
        />
      </div>
      
      {/* Right side icons */}
      <div className="topbar-actions">
        {/* Notifications button */}
        <div ref={dropdownRef} className="topbar-icon-wrapper">
          <button
            type="button"
            className="topbar-icon-btn"
            aria-label="Notifications"
            onClick={() => setShowDropdown((s) => !s)}
          >
            <FontAwesomeIcon icon={faBell} />
            {unreadNotifications.length > 0 && (
              <span className="notification-badge">{unreadNotifications.length}</span>
            )}
          </button>
          {showDropdown && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <div className="notification-title">
                  <FontAwesomeIcon icon={faBell} />
                  <span>Notifications</span>
                </div>
                <button className="notification-clear-btn" onClick={() => setUnreadNotifications([])}>
                  Clear All
                </button>
              </div>
              <div className="notification-body">
                {Object.entries(groupedNotifications).map(([type, notes]) => (
                  <div key={type} className="notification-group">
                    <div className="notification-group-title">{type}</div>
                    <ul className="notification-list">
                      {notes.map((n, idx) => (
                        <li key={idx} className="notification-item">
                          <div className="notification-content">
                            <span className="notification-text">{n}</span>
                            <span className="notification-time">
                              {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <button className="notification-mark-btn" onClick={() => markAsRead(n)}>
                            Mark as read
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                {unreadNotifications.length === 0 && (
                  <div className="notification-empty">No notifications</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile button */}
        <div ref={profileRef} className="topbar-icon-wrapper">
          <button
            type="button"
            className="topbar-icon-btn profile-btn"
            aria-label="User Profile"
            onClick={() => setShowProfile((s) => !s)}
          >
            {avatar ? (
              <img src={avatar} alt="Avatar" className="profile-avatar" />
            ) : (
              <FontAwesomeIcon icon={faUser} />
            )}
          </button>
          {showProfile && (
            <div className="profile-dropdown">
              <div className="profile-header">
                <button 
                  className="profile-avatar-large" 
                  onClick={() => fileInputRef.current?.click()} 
                  aria-label="Upload Avatar"
                >
                  {avatar ? (
                    <img src={avatar} alt="Avatar" className="profile-avatar-img" />
                  ) : (
                    <FontAwesomeIcon icon={faUser} />
                  )}
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleAvatarUpload} 
                />
                <div className="profile-info">
                  <div className="profile-role">{role}</div>
                  <div className="profile-org">{org}</div>
                </div>
              </div>
              <ul className="profile-menu">
                <li className="profile-menu-item">Settings</li>
                <li className="profile-menu-item">Profile</li>
                <li 
                  className="profile-menu-item" 
                  onClick={() => window.confirm('Are you sure you want to logout?') && window.location.reload()}
                >
                  Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
