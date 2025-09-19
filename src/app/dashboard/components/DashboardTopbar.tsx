// Type declaration for window.ghostcrmUser
declare global {
  interface Window {
    ghostcrmUser?: { id: string; name?: string };
  }
}
import React, { useState, useEffect } from "react";
import { UserProfileDropdown } from "@/components/UserProfileDropdown";
import { FaBell, FaMoon, FaSun, FaUsers, FaGlobe, FaCheckCircle } from "react-icons/fa";
import { Tooltip } from "@/components/Tooltip";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { getOnlineUsers, getNotifications, getOrgs } from "@/lib/api";

interface DashboardTopbarProps {
  lang: string;
  setLang: (lang: string) => void;
  selectedOrg: string;
  setSelectedOrg: (org: string) => void;
  bulkMode: boolean;
  setBulkMode: (mode: boolean) => void;
  compliance: string;
  security: string;
  t: (key: string) => React.ReactNode;
}


const LANGUAGES = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
];

const THEMES = [
  { code: "light", icon: <FaSun />, label: "Light" },
  { code: "dark", icon: <FaMoon />, label: "Dark" },
  { code: "system", icon: <FaGlobe />, label: "System" },
];

const DashboardTopbar: React.FC<DashboardTopbarProps> = ({
  lang,
  setLang,
  selectedOrg,
  setSelectedOrg,
  bulkMode,
  setBulkMode,
  compliance,
  security,
  t,
}) => {
  const [theme, setTheme] = useState("system");
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [orgSearch, setOrgSearch] = useState("");
  const [userId, setUserId] = useState<string | undefined>(undefined);

  // Get userId from UserProfileDropdown if available
  useEffect(() => {
    // Example: listen for user profile changes (replace with your actual logic)
    const user = window?.ghostcrmUser || null;
    setUserId(user?.id);
  }, []);

  useEffect(() => {
    getOnlineUsers().then(result => {
      if (Array.isArray(result)) {
        setOnlineUsers(result);
      } else {
        // handle error, e.g. show a notification or set empty array
        setOnlineUsers([]);
        // Optionally: console.error(result);
      }
    });
    getOrgs().then(result => {
      if (Array.isArray(result)) {
        setOrgs(result);
      } else {
        setOrgs([]);
        // Optionally: console.error(result);
      }
    });
  }, []);

  useEffect(() => {
    if (userId) {
      getNotifications(userId).then(result => {
        if (Array.isArray(result)) {
          setNotifications(result);
        } else {
          setNotifications([]);
          // Optionally: console.error(result);
        }
      });
    }
  }, [userId]);

  const filteredOrgs = orgs.filter((org: any) => org.name.toLowerCase().includes(orgSearch.toLowerCase()));

  return (
    <ErrorBoundary>
      <nav
        className="flex flex-wrap justify-between items-center mb-4 px-2 py-2 bg-white dark:bg-gray-900 shadow rounded-lg"
        aria-label="Dashboard topbar"
      >
        <div className="flex items-center gap-2">
          <UserProfileDropdown />
          <Tooltip text={t("Online Users") as string}>
            <div className="flex items-center gap-1" aria-label="Online users">
              <FaUsers className="text-green-500" />
              <span className="text-xs font-semibold" aria-live="polite">{onlineUsers.length}</span>
            </div>
          </Tooltip>
        </div>
        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex gap-2 items-center">
            <label className="text-sm text-blue-800" htmlFor="lang-select">{t("Language")}</label>
            <select
              id="lang-select"
              value={lang}
              onChange={e => setLang(e.target.value)}
              className="border rounded px-2 py-1 focus:outline-none focus:ring"
              aria-label="Select language"
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code} aria-label={l.label}>{l.flag} {l.label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 items-center">
            <label className="text-sm text-blue-800" htmlFor="theme-select">{t("Theme")}</label>
            <select
              id="theme-select"
              value={theme}
              onChange={e => setTheme(e.target.value)}
              className="border rounded px-2 py-1 focus:outline-none focus:ring"
              aria-label="Select theme"
            >
              {THEMES.map(t => (
                <option key={t.code} value={t.code} aria-label={t.label}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 items-center">
            <label className="text-sm text-blue-800" htmlFor="org-select">{t("Organization")}</label>
            <input
              type="text"
              placeholder={t("Search org/team") as string}
              value={orgSearch}
              onChange={e => setOrgSearch(e.target.value)}
              className="border rounded px-2 py-1 text-xs"
              aria-label="Search organization"
            />
            <select
              id="org-select"
              value={selectedOrg}
              onChange={e => setSelectedOrg(e.target.value)}
              className="border rounded px-2 py-1 text-xs focus:outline-none focus:ring"
              aria-label="Select organization"
            >
              <option value="">{t("All")}</option>
              {filteredOrgs.map((org: any) => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>
          <Tooltip text={bulkMode ? t("Cancel Bulk") as string : t("Bulk Ops") as string}>
            <button
              className={`px-2 py-1 rounded text-xs ${bulkMode ? "bg-red-100 text-red-700" : "bg-purple-100 text-purple-700"}`}
              onClick={() => setBulkMode(!bulkMode)}
              aria-pressed={bulkMode}
              aria-label={bulkMode ? t("Cancel Bulk") as string : t("Bulk Ops") as string}
            >
              {bulkMode ? t("Cancel Bulk") : t("Bulk Ops")}
            </button>
          </Tooltip>
          {compliance && (
            <Tooltip text={t("Compliance") as string}>
              <span className="ml-2 text-xs bg-blue-200 text-blue-900 rounded px-1" aria-label="Compliance">{t(compliance)}</span>
            </Tooltip>
          )}
          {security && (
            <Tooltip text={t("Security") as string}>
              <span className="ml-2 text-xs bg-gray-200 text-gray-900 rounded px-1" aria-label="Security">{t(security)}</span>
            </Tooltip>
          )}
          <div className="relative">
            <Tooltip text={t("Notifications") as string}>
              <button
                className="relative px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-700"
                aria-label={t("Notifications") as string}
                onClick={() => setShowNotif(!showNotif)}
              >
                <FaBell />
                {notifications.filter((n: any) => !n.read).length > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-[10px] px-1">{notifications.filter((n: any) => !n.read).length}</span>
                )}
              </button>
            </Tooltip>
            {showNotif && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 shadow-lg rounded-lg z-50">
                <div className="p-2 border-b font-semibold">{t("Notifications")}</div>
                <ul className="max-h-60 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <li className="p-2 text-xs text-gray-500">{t("No notifications")}</li>
                  ) : notifications.map((n: any) => (
                    <li key={n.id} className={`p-2 text-xs ${n.read ? "text-gray-400" : "text-black dark:text-white"}`}>
                      {n.message}
                      {!n.read && <FaCheckCircle className="inline ml-1 text-green-500" aria-label="Unread" />}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {/* Role-based quick actions */}
          <Tooltip text={t("Quick Actions") as string}>
            <button className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs" aria-label="Quick Actions">
              {t("Quick Actions")}
            </button>
          </Tooltip>
        </div>
      </nav>
    </ErrorBoundary>
  );
};

export default DashboardTopbar;
