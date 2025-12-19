"use client";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Search,
  Bell,
  Settings,
  ChevronDown,
} from "lucide-react";
import { UserProfileDropdown } from "./UserProfileDropdown";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { QuickLanguageSelector } from "@/components/global/LanguageSelector";
import { useI18n } from "@/components/utils/I18nProvider";
import { getOnlineUsers } from "@/lib/api";

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
  
  // Close AI dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showAIDropdown && !(event.target as Element)?.closest('.relative')) {
        setShowAIDropdown(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showAIDropdown]);

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
      { id: "File", label: t("file", "navigation"), controls: CONTROLS_FILE },
      { id: "Edit", label: t("edit", "navigation"), controls: CONTROLS_EDIT },
    ];

    // Always include AI tab with dropdown functionality (no controls, just dropdown)
    tabs.push({ 
      id: "AI", 
      label: "AI", 
      controls: [] 
    });

    // Add Leads-specific tab when on leads page
    if (pathname.includes("/leads")) {
      tabs.push({
        id: "Leads",
        label: "Quick Actions",
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
      });
    }
    if (pathname.includes("/collaboration")) {
      tabs.push({
        id: "Collaboration",
        label: t("collaboration", "navigation"),
        controls: CONTROLS_COLLABORATION,
      });
    }
    if (pathname.includes("/reports") || pathname.includes("/bi/")) {
      tabs.push({ id: "Reports", label: t("reports", "navigation"), controls: CONTROLS_REPORTS });
    }
    if (pathname.includes("/data")) {
      tabs.push({ id: "Data", label: t("data", "navigation"), controls: CONTROLS_DATA });
    }

    tabs.push(
      { id: "Settings", label: t("settings", "navigation"), controls: CONTROLS_SETTINGS }
    );
    
    // Only show Developer tab for software owner
    if (isSoftwareOwner) {
      tabs.push({ id: "Developer", label: t("developer", "navigation"), controls: CONTROLS_DEVELOPER });
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
              <ChevronDown className="w-3 h-3 group-hover:scale-110 transition-transform duration-200" />
            </div>
          </button>
          {/* TODO: add dropdown panel if needed */}
        </div>
      );
    }

    return null;
  };

  return (
    <header className="unified-toolbar bg-white border-b border-gray-200 shadow-sm">
      <div className="toolbar-container flex items-center h-16">
        {/* Logo Section */}
        <div className="flex items-center gap-3 px-6 border-r border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 h-full">
          <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-xl shadow-lg transform transition-transform hover:scale-105">
            🚗
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent whitespace-nowrap">
            GHOST AUTO CRM
          </span>
        </div>

        {/* Ribbon Tabs */}
        <div className="flex border-r border-gray-200 h-full">
          {tabs.map((tab) => (
            <div key={tab.id} className="relative">
              <button
                onClick={() => {
                  if (tab.id === 'AI') {
                    setShowAIDropdown(!showAIDropdown);
                    setActiveTab(tab.id);
                  } else {
                    setShowAIDropdown(false);
                    setActiveTab(tab.id);
                  }
                }}
                className={[
                  "px-6 py-3 text-sm font-semibold border-b-3 transition-all duration-200 h-full flex items-center relative overflow-hidden group",
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 bg-white shadow-sm"
                    : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-white hover:border-gray-200"
                ].join(" ")}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {tab.label}
                  {tab.id === 'AI' && (
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showAIDropdown ? 'rotate-180' : ''}`} />
                  )}
                </span>
                {activeTab === tab.id && (
                  <div className="absolute inset-0 bg-white opacity-90" />
                )}
                <div className="absolute inset-0 bg-gray-50 opacity-0 group-hover:opacity-50 transition-opacity duration-200" />
              </button>
              
              {/* AI Dropdown Menu */}
              {tab.id === 'AI' && showAIDropdown && (
                <div className="absolute top-full left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px]">
                  <div className="py-2">
                    <button
                      onClick={() => {
                        openAssistantWithPrompt(
                          t("Give me smart suggestions to improve my CRM workflow and productivity on this page.", "ai")
                        );
                        setShowAIDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-3"
                    >
                      <span className="text-base">💡</span>
                      {t("smart_suggestions", "actions")}
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
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-3"
                    >
                      <span className="text-base">🧹</span>
                      {t("data_cleanup", "ai")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Active Controls */}
        <div className="flex-1 flex items-center gap-3 px-6 overflow-x-auto min-h-0">
          {activeControls.map((control: any, i: number) => renderControl(control, i))}

          {/* Dashboard extras */}
          {isDashboardPage && (
            <>
              <div className="w-px h-10 bg-gradient-to-b from-transparent via-gray-300 to-transparent mx-3" />
              {onAddChart && (
                <button
                  onClick={onAddChart}
                  className="group flex flex-col items-center gap-1 px-4 py-3 rounded-xl transition-all duration-200 text-xs text-white bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <span className="text-base group-hover:scale-110 transition-transform duration-200">📊</span>
                  <span className="font-medium">Add Chart</span>
                </button>
              )}
              {onAddTable && (
                <button
                  onClick={onAddTable}
                  className="group flex flex-col items-center gap-1 px-4 py-3 rounded-xl transition-all duration-200 text-xs text-white bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <span className="text-base group-hover:scale-110 transition-transform duration-200">📋</span>
                  <span className="font-medium">Add Table</span>
                </button>
              )}
              {onShowTemplates && (
                <button
                  onClick={onShowTemplates}
                  className="group flex flex-col items-center gap-1 px-4 py-3 rounded-xl transition-all duration-200 text-xs text-white bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <span className="text-base group-hover:scale-110 transition-transform duration-200">📄</span>
                  <span className="font-medium">Templates</span>
                </button>
              )}
              {onSaveLayout && (
                <button
                  onClick={onSaveLayout}
                  className="group flex flex-col items-center gap-1 px-4 py-3 rounded-xl transition-all duration-200 text-xs text-white bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <span className="text-base group-hover:scale-110 transition-transform duration-200">💾</span>
                  <span className="font-medium">Save Layout</span>
                </button>
              )}
              {onShare && (
                <button
                  onClick={onShare}
                  className="group flex flex-col items-center gap-1 px-4 py-3 rounded-xl transition-all duration-200 text-xs text-white bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <span className="text-base group-hover:scale-110 transition-transform duration-200">🔗</span>
                  <span className="font-medium">Share</span>
                </button>
              )}
              <div className="w-px h-10 bg-gradient-to-b from-transparent via-gray-300 to-transparent mx-3" />
              {onUndo && (
                <button
                  onClick={onUndo}
                  className="group flex flex-col items-center gap-1 px-4 py-3 rounded-xl transition-all duration-200 text-xs text-white bg-gradient-to-br from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <span className="text-base group-hover:scale-110 transition-transform duration-200">↶</span>
                  <span className="font-medium">{t("undo", "actions")}</span>
                </button>
              )}
              {onRedo && (
                <button
                  onClick={onRedo}
                  className="group flex flex-col items-center gap-1 px-4 py-3 rounded-xl transition-all duration-200 text-xs text-white bg-gradient-to-br from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <span className="text-base group-hover:scale-110 transition-transform duration-200">↷</span>
                  <span className="font-medium">{t("redo", "actions")}</span>
                </button>
              )}
              <div className="w-px h-10 bg-gradient-to-b from-transparent via-gray-300 to-transparent mx-3" />
              {setBulkMode && (
                <button
                  onClick={() => setBulkMode(!bulkMode)}
                  className={[
                    "group flex flex-col items-center gap-1 px-4 py-3 rounded-xl transition-all duration-200 text-xs shadow-lg hover:shadow-xl transform hover:-translate-y-0.5",
                    bulkMode
                      ? "text-white bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                      : "text-white bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
                  ].join(" ")}
                >
                  <span className="text-base group-hover:scale-110 transition-transform duration-200">{bulkMode ? "❌" : "☑️"}</span>
                  <span className="font-medium">{bulkMode ? t("cancel", "common") + " " + t("bulk", "common") : t("bulk", "common") + " " + t("operations", "common")}</span>
                </button>
              )}
            </>
          )}
        </div>

        {/* Search */}
        <div className="relative mx-6 flex-shrink-0">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
            <input
              type="text"
              placeholder={t("search", "placeholders")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 w-80 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200 shadow-sm"
              aria-label={t("search_placeholder", "accessibility")}
            />
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-6 px-6 border-l border-gray-200 h-full bg-gradient-to-r from-white to-gray-50">
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