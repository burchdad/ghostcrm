"use client";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import {
  Search,
  Bell,
  Settings,
} from "lucide-react";
import { UserProfileDropdown } from "./UserProfileDropdown";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { QuickLanguageSelector } from "@/components/global/LanguageSelector";
import { useI18n } from "@/components/utils/I18nProvider";
import { getOnlineUsers } from "@/lib/api";
import styles from "./UnifiedToolbar.module.css";
import "./unified-toolbar-mobile.css";

// Ribbon registries
import {
  CONTROLS_FILE,
  CONTROLS_EDIT,
  CONTROLS_AUTOMATION,
  CONTROLS_COLLABORATION,
  CONTROLS_REPORTS,
  CONTROLS_DATA,
  CONTROLS_SETTINGS,
  CONTROLS_DEVELOPER,
} from "@/components/ribbon";

// Types
import type { RibbonControl, ControlId } from "@/components/ribbon";

interface UnifiedToolbarProps {
  onAddChart?: () => void;
  onAddTable?: () => void;
  onShowTemplates?: () => void;
  onSaveLayout?: () => void;
  onShare?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  bulkMode?: boolean;
  setBulkMode?: (mode: boolean) => void;
}

export default function UnifiedToolbar({
  onAddChart,
  onAddTable,
  onShowTemplates,
  onSaveLayout,
  onShare,
  onUndo,
  onRedo,
  bulkMode = false,
  setBulkMode,
}: UnifiedToolbarProps) {
  const pathname = usePathname() || "/";
  const { t } = useI18n();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("AI");
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAIDropdown, setShowAIDropdown] = useState(false);
  const [showFileDropdown, setShowFileDropdown] = useState(false);
  const [showEditDropdown, setShowEditDropdown] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  
  // Check if user is software owner (only they should see Developer button)
  const isSoftwareOwner = user?.email === 'burchdad@gmail.com';

  // Helper function to get tenant-aware route based on user role
  const getTenantRoute = (basePath: string): string => {
    if (!user || !user.role) return basePath;
    
    const roleMapping: Record<string, string> = {
      'owner': 'tenant-owner',
      'admin': 'tenant-owner', // Admin can access owner routes
      'manager': 'tenant-salesmanager',
      'sales_rep': 'tenant-salesrep',
      'user': 'tenant-salesrep' // Default users to sales rep level
    };
    
    const tenantPrefix = roleMapping[user.role] || 'tenant-salesrep';
    return `/${tenantPrefix}${basePath}`;
  };

  useEffect(() => {
    getOnlineUsers()
      .then((result) => (Array.isArray(result) ? setOnlineUsers(result) : setOnlineUsers([])))
      .catch(() => setOnlineUsers([]));
  }, []);
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isDropdownClick = (event.target as Element)?.closest('.relative');
      if (!isDropdownClick) {
        setShowAIDropdown(false);
        setShowFileDropdown(false);
        setShowEditDropdown(false);
        setShowSettingsDropdown(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showAIDropdown, showFileDropdown, showEditDropdown, showSettingsDropdown]);

  // Auto-select appropriate tab based on current page
  useEffect(() => {
    if (pathname.includes("/leads")) {
      setActiveTab("Leads");
    } else if (pathname.includes("/automation")) {
      setActiveTab("Automation");
    } else if (pathname.includes("/collaboration")) {
      setActiveTab("Collaboration");
    } else if (pathname.includes("/reports") || pathname.includes("/bi/")) {
      setActiveTab("Reports");
    } else if (pathname.includes("/data")) {
      setActiveTab("Data");
    } else {
      setActiveTab("AI");
    }
  }, [pathname]);

  const isDashboardPage =
    pathname.includes("/dashboard") || pathname.includes("/bi/");

  /** Open the global AI assistant and pre-fill a prompt */
  const openAssistantWithPrompt = async (prompt: string) => {
    if (typeof window === "undefined") return;

    // Try to open the assistant
    const aiButton = document.querySelector(".ai-assistant-fab") as HTMLButtonElement | null;
    aiButton?.click();

    // Wait for modal/input to render
    await new Promise((r) => setTimeout(r, 250));

    const aiInput = document.querySelector(
      '[placeholder*="Ask me anything"]'
    ) as HTMLTextAreaElement | HTMLInputElement | null;

    if (aiInput) {
      // Set value and dispatch input so React updates state
      const nativeSetter = Object.getOwnPropertyDescriptor(
        Object.getPrototypeOf(aiInput),
        "value"
      )?.set;
      nativeSetter ? nativeSetter.call(aiInput, prompt) : (aiInput.value = prompt);

      aiInput.dispatchEvent(new Event("input", { bubbles: true }));
      aiInput.focus();
      return;
    }

    // Fallback: broadcast event so other layers can handle it
    window.dispatchEvent(
      new CustomEvent("ribbon:assistantPrompt", { detail: { prompt } })
    );
  };

  /** Dynamic AI controls, page-aware */
  const getDynamicAIControls = (): RibbonControl[] => {
    const controls: RibbonControl[] = [];

    // Smart Suggestions — dashboard/leads/deals
    if (
      pathname.includes("/dashboard") ||
      pathname.includes("/leads") ||
      pathname.includes("/deals")
    ) {
      controls.push({
        id: "smartSuggestions" as ControlId,
        group: "AI",
        label: t("smart_suggestions", "actions"),
        onClick: () =>
          openAssistantWithPrompt(
            t("Give me smart suggestions to improve my CRM workflow and productivity on this page.", "ai")
          ),
      });
    }

    // Lead Scoring — leads-only
    if (pathname.includes("/leads")) {
      controls.push({
        id: "predictiveLeadScoring" as ControlId,
        group: "AI",
        label: t("lead_scoring", "ai"),
        onClick: () =>
          window.dispatchEvent(new CustomEvent("ribbon:leadScoring")),
      });
    }

    // Email Generator — leads/deals
    if (pathname.includes("/leads") || pathname.includes("/deals")) {
      controls.push({
        id: "autoEmailGenerator" as ControlId,
        group: "AI",
        label: t("email_generator", "ai"),
        onClick: () =>
          window.dispatchEvent(new CustomEvent("ribbon:emailGenerator")),
      });
    }

    // Data Cleanup — data-heavy pages (dashboard/leads/deals/contacts/data)
    if (
      pathname.includes("/dashboard") ||
      pathname.includes("/leads") ||
      pathname.includes("/deals") ||
      pathname.includes("/contacts") ||
      pathname.includes("/data")
    ) {
      controls.push({
        id: "dataCleanup" as ControlId,
        group: "AI",
        label: t("data_cleanup", "ai"),
        onClick: () => {
          const currentPage = pathname.includes("/leads")
            ? "leads"
            : pathname.includes("/deals")
            ? "deals"
            : pathname.includes("/contacts")
            ? "contacts"
            : pathname.includes("/dashboard")
            ? "dashboard"
            : "data";
          openAssistantWithPrompt(
            t(`Help me clean up and optimize my ${currentPage} data. Identify duplicates, incomplete records, and suggest improvements.`, "ai")
          );
        },
      });
    }

    return controls;
  };

  /** Contextual tabs */
  const getContextualTabs = () => {
    const tabs = [
      { id: "File", label: t("file", "navigation"), controls: CONTROLS_FILE, dropdown: true },
      { id: "Edit", label: t("edit", "navigation"), controls: CONTROLS_EDIT, dropdown: true },
      { id: "Settings", label: t("settings", "navigation"), controls: CONTROLS_SETTINGS, dropdown: true },
    ];

    // Always include AI tab with dropdown functionality (no controls, just dropdown)
    tabs.push({ 
      id: "AI", 
      label: "AI", 
      controls: [],
      dropdown: true
    });

    // Add Leads-specific tab when on leads page
    if (pathname.includes("/leads")) {
      tabs.push({
        id: "Leads",
        label: "Quick Actions",
        dropdown: false,
        controls: [
          {
            id: "newLead" as ControlId,
            group: "Leads",
            label: "New Lead",
            onClick: () => {
              const newLeadRoute = getTenantRoute("/new-lead");
              window.location.href = newLeadRoute;
            }
          },
          {
            id: "importLeads" as ControlId,
            group: "Leads", 
            label: "Import",
            onClick: () => console.log("Import Leads")
          },
          {
            id: "exportLeads" as ControlId,
            group: "Leads",
            label: "Export", 
            onClick: () => console.log("Export Leads")
          },
          {
            id: "bulkEmail" as ControlId,
            group: "Leads",
            label: "Bulk Email",
            onClick: () => console.log("Bulk Email")
          },
          {
            id: "bulkSMS" as ControlId,
            group: "Leads", 
            label: "Bulk SMS",
            onClick: () => console.log("Bulk SMS")
          },
          {
            id: "refreshLeads" as ControlId,
            group: "Leads",
            label: "Refresh",
            onClick: () => window.location.reload()
          }
        ]
      });
    }

    if (pathname.includes("/automation")) {
      tabs.push({
        id: "Automation",
        label: t("automation", "navigation"),
        controls: CONTROLS_AUTOMATION,
        dropdown: false,
      });
    }
    if (pathname.includes("/collaboration")) {
      tabs.push({
        id: "Collaboration",
        label: t("collaboration", "navigation"),
        controls: CONTROLS_COLLABORATION,
        dropdown: false,
      });
    }
    if (pathname.includes("/reports") || pathname.includes("/bi/")) {
      tabs.push({ id: "Reports", label: t("reports", "navigation"), controls: CONTROLS_REPORTS, dropdown: false });
    }
    if (pathname.includes("/data")) {
      tabs.push({ id: "Data", label: t("data", "navigation"), controls: CONTROLS_DATA, dropdown: false });
    }
    
    // Only show Developer tab for software owner
    if (isSoftwareOwner) {
      tabs.push({ id: "Developer", label: t("developer", "navigation"), controls: CONTROLS_DEVELOPER, dropdown: false });
    }

    return tabs;
  };

  const tabs = getContextualTabs();
  const activeControls = tabs.find((t) => t.id === activeTab)?.controls ?? [];

  /** Icon mapper for simple registry items */
  const getControlIcon = (controlId: string, group: string) => {
    const iconMap: Record<string, string> = {
      // File
      newProject: "📁",
      save: "💾",
      saveAsTemplate: "📋",
      importExport: "🔄",
      printDownload: "🖨️",
      closeExit: "❌",
      // Edit
      undo: "↶",
      redo: "↷",
      cut: "✂️",
      copy: "📋",
      paste: "📌",
      duplicate: "📑",
      selectAll: "☑️",
      find: "🔍",
      replace: "🔀",
      // AI
      smartSuggestions: "💡",
      predictiveLeadScoring: "🎯",
      autoEmailGenerator: "✉️",
      aiChatAssistant: "🤖",
      dataCleanup: "🧹",
      // Leads
      newLead: "➕",
      importLeads: "📥",
      exportLeads: "📤",
      bulkEmail: "✉️",
      bulkSMS: "💬",
      refreshLeads: "🔄",
      // Defaults by group
      File: "📄",
      Edit: "✏️",
      AI: "🤖",
      Settings: "⚙️",
      Developer: "💻",
      Data: "📊",
      Automation: "⚡",
      Collaboration: "👥",
      Reports: "📈",
      Leads: "👤",
    };
    return iconMap[controlId] || iconMap[group] || "📄";
  };

  const renderControl = (control: any, index: number) => {
    // Lightweight registry item { id, group, label, onClick }
    if (typeof control?.onClick === "function") {
      const icon = getControlIcon(control.id, control.group ?? "");
      return (
        <button
          key={`${control.id}-${index}`}
          onClick={control.onClick}
          className="group flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl transition-all duration-200 text-xs text-gray-700 hover:text-blue-600 hover:bg-white hover:shadow-md transform hover:-translate-y-0.5 border border-gray-100 hover:border-blue-200 bg-white"
          title={control.label}
        >
          <span className="text-base group-hover:scale-110 transition-transform duration-200">{icon}</span>
          <span className="truncate max-w-[60px] font-medium">{control.label}</span>
        </button>
      );
    }

    // Rich control from registry (with .type, .icon, .action)
    const Icon = control?.icon;
    if (control?.type === "button") {
      return (
        <button
          key={`${control.id}-${index}`}
          onClick={control.action}
          disabled={control.disabled}
          className={[
            "group flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl transition-all duration-200 text-xs transform hover:-translate-y-0.5 border",
            control.disabled
              ? "text-gray-400 cursor-not-allowed border-gray-200 bg-gray-50"
              : "text-gray-700 hover:text-blue-600 hover:bg-white hover:shadow-md bg-white border-gray-100 hover:border-blue-200",
          ].join(" ")}
          title={control.tooltip}
        >
          {Icon ? (
            <Icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
          ) : (
            <span className="text-base group-hover:scale-110 transition-transform duration-200">•</span>
          )}
          <span className="truncate max-w-[60px] font-medium">{control.label}</span>
        </button>
      );
    }

    if (control?.type === "dropdown") {
      return (
        <div key={`${control.id}-${index}`} className="relative">
          <button
            className="group flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl transition-all duration-200 text-xs text-gray-700 hover:text-blue-600 hover:bg-white hover:shadow-md transform hover:-translate-y-0.5 border border-gray-100 hover:border-blue-200 bg-white"
            title={control.tooltip}
          >
            {Icon ? (
              <Icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
            ) : (
              <span className="text-base group-hover:scale-110 transition-transform duration-200">•</span>
            )}
            <div className="flex items-center gap-1">
              <span className="truncate max-w-[50px] font-medium">{control.label}</span>
            </div>
          </button>
          {/* TODO: add dropdown panel if needed */}
        </div>
      );
    }

    return null;
  };

  return (
    <header className={styles.unifiedToolbar}>
      <div className={styles.toolbarContainer}>
        {/* Logo Section */}
        <div className={styles.logoSection}>
          <div className={styles.logoIcon}>
            🚗
          </div>
          <span className={styles.logoText}>
            GHOST AUTO CRM
          </span>
        </div>

        {/* Ribbon Tabs */}
        <div className={styles.tabsContainer}>
          {tabs.map((tab) => (
            <div key={tab.id} className="relative">
              <button
                onClick={() => {
                  // Close all dropdowns first
                  setShowAIDropdown(false);
                  setShowFileDropdown(false);
                  setShowEditDropdown(false);
                  setShowSettingsDropdown(false);
                  
                  // Handle dropdown tabs
                  if (tab.dropdown) {
                    setActiveTab(tab.id);
                    switch (tab.id) {
                      case 'AI':
                        setShowAIDropdown(true);
                        break;
                      case 'File':
                        setShowFileDropdown(true);
                        break;
                      case 'Edit':
                        setShowEditDropdown(true);
                        break;
                      case 'Settings':
                        setShowSettingsDropdown(true);
                        break;
                    }
                  } else {
                    // Regular tab behavior
                    setActiveTab(tab.id);
                  }
                }}
                className={`${styles.tabButton} ${
                  activeTab === tab.id ? styles.active : ''
                }`}
              >
                <span className="relative z-10 flex items-center">
                  {tab.label}
                </span>
                {activeTab === tab.id && (
                  <div className="absolute inset-0 bg-white opacity-90" />
                )}
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-50 transition-opacity duration-200" />
              </button>
              
              {/* AI Dropdown Menu */}
              {tab.id === 'AI' && showAIDropdown && (
                <div className={styles.dropdown}>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        openAssistantWithPrompt(
                          t("Give me smart suggestions to improve my CRM workflow and productivity on this page.", "ai")
                        );
                        setShowAIDropdown(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors duration-150 flex items-center gap-3"
                      style={{ border: 'none', borderBottom: 'none', backgroundColor: 'transparent', outline: 'none' }}
                    >
                      <span className="text-lg">💡</span>
                      <span className="text-sm font-medium text-gray-700">{t("smart_suggestions", "actions")}</span>
                    </button>
                    <button
                      onClick={() => {
                        const currentPage = pathname.includes("/leads")
                          ? "leads"
                          : pathname.includes("/deals")
                          ? "deals"
                          : pathname.includes("/contacts")
                          ? "contacts"
                          : pathname.includes("/dashboard")
                          ? "dashboard"
                          : "data";
                        openAssistantWithPrompt(
                          t(`Help me clean up and optimize my ${currentPage} data. Identify duplicates, incomplete records, and suggest improvements.`, "ai")
                        );
                        setShowAIDropdown(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors duration-150 flex items-center gap-3"
                    >
                      <span className="text-lg">🧹</span>
                      <span className="text-sm font-medium text-gray-700">{t("data_cleanup", "ai")}</span>
                    </button>
                  </div>
                </div>
              )}
              
              {/* File Dropdown Menu */}
              {tab.id === 'File' && showFileDropdown && (
                <div className={styles.dropdown}>
                  <div className="py-1">
                    {CONTROLS_FILE.map((control, index) => {
                      const Icon = getControlIcon(control.id, control.group ?? "");
                      return (
                        <button
                          key={index}
                          onClick={() => {
                            if (control.onClick) control.onClick();
                            setShowFileDropdown(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors duration-150 flex items-center gap-3"
                        >
                          {typeof Icon === 'string' ? (
                            <span className="text-lg">{Icon}</span>
                          ) : Icon && React.isValidElement(Icon) ? (
                            Icon
                          ) : Icon ? (
                            React.createElement(Icon as any, { className: "w-5 h-5 text-blue-600" })
                          ) : (
                            <span className="text-lg">📄</span>
                          )}
                          <span className="text-sm font-medium text-gray-700">{control.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Edit Dropdown Menu */}
              {tab.id === 'Edit' && showEditDropdown && (
                <div className={styles.dropdown}>
                  <div className="py-1">
                    {CONTROLS_EDIT.map((control, index) => {
                      const Icon = getControlIcon(control.id, control.group ?? "");
                      return (
                        <button
                          key={index}
                          onClick={() => {
                            if (control.onClick) control.onClick();
                            setShowEditDropdown(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors duration-150 flex items-center gap-3"
                          style={{ border: 'none', borderBottom: 'none', backgroundColor: 'transparent', outline: 'none' }}
                        >
                          {typeof Icon === 'string' ? (
                            <span className="text-lg">{Icon}</span>
                          ) : Icon && React.isValidElement(Icon) ? (
                            Icon
                          ) : Icon ? (
                            React.createElement(Icon as any, { className: "w-5 h-5 text-blue-600" })
                          ) : (
                            <span className="text-lg">✏️</span>
                          )}
                          <span className="text-sm font-medium text-gray-700">{control.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Settings Dropdown Menu */}
              {tab.id === 'Settings' && showSettingsDropdown && (
                <div className={styles.dropdown}>
                  <div className="py-1">
                    {CONTROLS_SETTINGS.map((control, index) => {
                      const Icon = getControlIcon(control.id, control.group ?? "");
                      return (
                        <button
                          key={index}
                          onClick={() => {
                            if (control.onClick) control.onClick();
                            setShowSettingsDropdown(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors duration-150 flex items-center gap-3"
                          style={{ border: 'none', borderBottom: 'none', backgroundColor: 'transparent', outline: 'none' }}
                        >
                          {typeof Icon === 'string' ? (
                            <span className="text-lg">{Icon}</span>
                          ) : Icon && React.isValidElement(Icon) ? (
                            Icon
                          ) : Icon ? (
                            React.createElement(Icon as any, { className: "w-5 h-5 text-blue-600" })
                          ) : (
                            <span className="text-lg">⚙️</span>
                          )}
                          <span className="text-sm font-medium text-gray-700">{control.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Search */}
        <div className={styles.searchContainer}>
          <div className="relative group">
            <Search className={styles.searchIcon} />
            <input
              type="text"
              placeholder={t("search", "placeholders")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
              aria-label={t("search_placeholder", "accessibility")}
            />
          </div>
        </div>

        {/* Right Controls */}
        <div className={styles.rightSection}>
          {/* Online Users */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="relative">
              <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-sm" />
              <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-75" />
            </div>
            <span className="font-medium">
              {onlineUsers.length} {t("online", "common")}
            </span>
          </div>

          {/* Bulk mode quick toggle (mirror) */}
          {setBulkMode && (
            <button
              onClick={() => setBulkMode(!bulkMode)}
              className={[
                "px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 shadow-sm",
                bulkMode
                  ? "bg-red-100 text-red-700 hover:bg-red-200 border border-red-200"
                  : "bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-200",
              ].join(" ")}
            >
              {bulkMode ? t("cancel", "common") + " " + t("bulk", "common") : t("bulk", "common") + " " + t("mode", "common")}
            </button>
          )}

          {/* Enhanced Notifications */}
          <div className="relative">
            <NotificationsDropdown />
          </div>

          {/* Enhanced Language Selector */}
          <div className="relative">
            <QuickLanguageSelector />
          </div>

          {/* Enhanced Profile */}
          <div className="relative">
            <UserProfileDropdown />
          </div>
        </div>
      </div>
    </header>
  );
}