"use client";
import React, { useMemo, useRef, useState } from "react";
import { useRibbon } from "./RibbonProvider";
import {
  CONTROLS,
  CONTROLS_AI,
  CONTROLS_AUTOMATION,
  CONTROLS_DATA,
  CONTROLS_DEVELOPER,
  CONTROLS_EDIT,
  CONTROLS_FILE,
  CONTROLS_REPORTS,
  CONTROLS_SETTINGS
} from "./registry";
import type { RibbonControl } from "./types";

function useOutsideClick(ref: React.RefObject<HTMLElement>, onClose: () => void) {
  React.useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onClose]);
}

export default function Ribbon() {
  // Remove all security/context logic for now, show all controls
  const allControls: RibbonControl[] = [
    ...CONTROLS,
    ...CONTROLS_AI,
    ...CONTROLS_AUTOMATION,
    ...CONTROLS_DATA,
    ...CONTROLS_DEVELOPER,
    ...CONTROLS_EDIT,
    ...CONTROLS_FILE,
    ...CONTROLS_REPORTS,
    ...CONTROLS_SETTINGS
  ];
  const groups = useMemo(() => {
    const map = new Map<string, { ctrl: RibbonControl; enabled: boolean; disabled: boolean }[]>();
    allControls.forEach(c => {
      const arr = map.get(c.group) || [];
      arr.push({ ctrl: c, enabled: true, disabled: false });
      map.set(c.group, arr);
    });
    return Array.from(map.entries());
  }, []);

  // Notifications logic (moved from Topbar)
  const [notifications, setNotifications] = useState<string[]>(["Welcome to GhostCRM!"]);
  const [unreadNotifications, setUnreadNotifications] = useState<string[]>(["Welcome to GhostCRM!"]);
  const markAsRead = (n: string) => setUnreadNotifications((x) => x.filter((v) => v !== n));
  const groupedNotifications = unreadNotifications.reduce((acc: Record<string, string[]>, n) => {
    const type = n.includes("lead") ? "Leads" : n.includes("Welcome") ? "System" : "Other";
    (acc[type] ||= []).push(n);
    return acc;
  }, {});
  React.useEffect(() => {
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
  const profileRef = useRef<HTMLDivElement>(null);
  useOutsideClick(profileRef, () => showProfile && setShowProfile(false));

  // Notification dropdown logic
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useOutsideClick(dropdownRef, () => showDropdown && setShowDropdown(false));

  return (
    <>
      <div className="w-full flex items-center gap-3">
        {/* Ribbon groups on the left */}
        {groups.map(([title, items]) => (
          <RibbonGroup key={title} title={title} items={items} />
        ))}
        {/* Spacer to push icons to the right */}
        <div className="flex-1" />
        {/* Notifications button on far right */}
        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            className="relative"
            aria-label="Notifications"
            onClick={() => setShowDropdown((s) => !s)}
          >
            <span className="w-4 h-6 flex items-center justify-center rounded-full bg-gray-100 text-blue-600 text-xl">🔔</span>
            {unreadNotifications.length > 0 && (
              <span className="absolute -top-1 -right-1 px-4 py-0.5 bg-red-500 text-white text-[10px] rounded-full">{unreadNotifications.length}</span>
            )}
          </button>
          {showDropdown && (
            <div className="absolute top-full right-0 mt-2 bg-white border rounded-xl shadow-2xl z-50 w-80">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <div className="flex items-center gap-2">
                  <span className="text-xl text-blue-600">🔔</span>
                  <span className="font-bold text-base">Notifications</span>
                </div>
                <button className="text-xs text-red-500 hover:underline" onClick={() => setUnreadNotifications([])}>Clear All</button>
              </div>
              <div className="max-h-96 overflow-y-auto p-3">
                {Object.entries(groupedNotifications).map(([type, notes]) => (
                  <div key={type} className="mb-4">
                    <div className="font-bold text-xs text-blue-700 mb-2">{type}</div>
                    <ul className="space-y-2">
                      {notes.map((n, idx) => (
                        <li key={idx} className="bg-white rounded-lg shadow-sm px-4 py-3 flex justify-between items-center border border-gray-100">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{n}</span>
                            <span className="text-xs text-gray-400 mt-1">
                              {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button className="text-xs px-2 py-1 rounded bg-green-100 text-green-700" onClick={() => markAsRead(n)}>Mark as read</button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                {unreadNotifications.length === 0 && <div className="text-center text-gray-400 py-8">No notifications</div>}
              </div>
            </div>
          )}
        </div>
        {/* Profile button on far right */}
        <div ref={profileRef} className="relative ml-2">
          <button
            type="button"
            className="ml-1"
            aria-label="Profile"
            onClick={() => setShowProfile((s) => !s)}
          >
            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 text-purple-600 text-xl">👤</span>
          </button>
          {showProfile && (
            <div className="absolute top-full right-0 mt-2 bg-white border rounded-xl shadow-2xl z-50 w-72">
              {/* Use UserProfileDropdown component here */}
              {/* @ts-ignore */}
              {require("../UserProfileDropdown").UserProfileDropdown()}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function RibbonGroup({ title, items }: { title: string; items: { ctrl: RibbonControl; disabled: boolean }[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  // Only show group button if at least one item is visible for this role/context
  const hasVisible = items.some(({ ctrl, disabled }) => !disabled);
  return (
    <div
      ref={ref}
      className="relative group"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className={`px-3 h-9 text-xs font-medium transition-colors outline-none ${open ? "bg-blue-100" : ""} group-hover:bg-blue-100 ${!hasVisible ? "opacity-50 cursor-allowed" : ""}`}
        disabled={!hasVisible}
      >
        {title}
      </button>
      {open && (
        <div className="absolute z-50 mt-1 left-0 w-25 bg-blue-500 border rounded shadow-xl">
          <ul className="py-1 max-h-80 overflow-y-auto">
            {hasVisible ? (
              items.filter(({ ctrl, disabled }) => !disabled).map(({ ctrl }) => (
                <li key={ctrl.id} className="px-1">
                  {ctrl.render
                    ? ctrl.render({
                        disabled: false,
                        onClick: ctrl.onClick,
                        state: {} as any,
                      })
                    : (
                      <button
                        type="button"
                        onClick={ctrl.onClick}
                        className="w-full text-center px-3 py-2 text-sm rounded hover:bg-blue-50"
                      >
                        {ctrl.label}
                      </button>
                    )}
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-sm text-gray-400">No actions available</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

const defaultButton = (label: string, disabled: boolean) => () =>
  <button disabled={disabled}
          className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-blue-50 ${disabled ? "text-gray-400 cursor-not-allowed" : ""}`}>
    {label}
  </button>;
