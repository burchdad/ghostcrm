"use client";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
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
  const [activeTab, setActiveTab] = useState<string>("AI");
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getOnlineUsers()
      .then((result) => (Array.isArray(result) ? setOnlineUsers(result) : setOnlineUsers([])))
      .catch(() => setOnlineUsers([]));
  }, []);

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

    const aiControls = getDynamicAIControls();
    if (aiControls.length) {
      tabs.push({ id: "AI", label: "AI", controls: aiControls });
    }

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
            onClick: () => window.location.href = "/leads/create"
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
      { id: "Settings", label: t("settings", "navigation"), controls: CONTROLS_SETTINGS },
      { id: "Developer", label: t("developer", "navigation"), controls: CONTROLS_DEVELOPER }
    );

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
          className="flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-colors text-xs text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          title={control.label}
        >
          <span className="text-sm">{icon}</span>
          <span className="truncate max-w-[50px]">{control.label}</span>
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
            "flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-colors text-xs",
            control.disabled
              ? "text-gray-400 cursor-not-allowed"
              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
          ].join(" ")}
          title={control.tooltip}
        >
          {Icon ? <Icon className="w-3 h-3" /> : <span>•</span>}
          <span className="truncate max-w-[50px]">{control.label}</span>
        </button>
      );
    }

    if (control?.type === "dropdown") {
      return (
        <div key={`${control.id}-${index}`} className="relative">
          <button
            className="flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-colors text-xs text-gray-700 hover:bg-gray-100"
            title={control.tooltip}
          >
            {Icon ? <Icon className="w-3 h-3" /> : <span>•</span>}
            <span className="truncate max-w-[50px]">{control.label}</span>
            <ChevronDown className="w-3 h-3" />
          </button>
          {/* TODO: add dropdown panel if needed */}
        </div>
      );
    }

    return null;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center h-16">
        {/* Logo Section */}
        <div className="flex items-center gap-3 px-4 border-r border-gray-200 bg-gray-50">
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white text-xl">
            🚗
          </div>
          <span className="font-bold text-lg text-blue-700 whitespace-nowrap">GHOST AUTO CRM</span>
        </div>

        {/* Ribbon Tabs */}
        <div className="flex border-r border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={[
                "px-4 py-2 text-sm font-medium border-b-2 transition-colors h-16 flex items-center",
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600 bg-blue-50"
                  : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Active Controls */}
        <div className="flex-1 flex items-center gap-2 px-4 overflow-x-auto">
          {activeControls.map((control: any, i: number) => renderControl(control, i))}

          {/* Dashboard extras */}
          {isDashboardPage && (
            <>
              <div className="w-px h-8 bg-gray-300 mx-2" />
              {onAddChart && (
                <button
                  onClick={onAddChart}
                  className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors text-xs text-white bg-blue-500 hover:bg-blue-600"
                >
                  <span>📊</span>
                  <span>Add Chart</span>
                </button>
              )}
              {onAddTable && (
                <button
                  onClick={onAddTable}
                  className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors text-xs text-white bg-green-500 hover:bg-green-600"
                >
                  <span>📋</span>
                  <span>Add Table</span>
                </button>
              )}
              {onShowTemplates && (
                <button
                  onClick={onShowTemplates}
                  className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors text-xs text-white bg-purple-500 hover:bg-purple-600"
                >
                  <span>📄</span>
                  <span>Templates</span>
                </button>
              )}
              {onSaveLayout && (
                <button
                  onClick={onSaveLayout}
                  className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors text-xs text-white bg-gray-800 hover:bg-gray-900"
                >
                  <span>💾</span>
                  <span>Save Layout</span>
                </button>
              )}
              {onShare && (
                <button
                  onClick={onShare}
                  className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors text-xs text-white bg-indigo-500 hover:bg-indigo-600"
                >
                  <span>🔗</span>
                  <span>Share</span>
                </button>
              )}
              <div className="w-px h-8 bg-gray-300 mx-2" />
              {onUndo && (
                <button
                  onClick={onUndo}
                  className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors text-xs text-white bg-yellow-500 hover:bg-yellow-600"
                >
                  <span>↶</span>
                  <span>{t("undo", "actions")}</span>
                </button>
              )}
              {onRedo && (
                <button
                  onClick={onRedo}
                  className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors text-xs text-white bg-yellow-600 hover:bg-yellow-700"
                >
                  <span>↷</span>
                  <span>{t("redo", "actions")}</span>
                </button>
              )}
              <div className="w-px h-8 bg-gray-300 mx-2" />
              {setBulkMode && (
                <button
                  onClick={() => setBulkMode(!bulkMode)}
                  className={[
                    "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors text-xs",
                    bulkMode
                      ? "text-white bg-red-500 hover:bg-red-600"
                      : "text-white bg-purple-500 hover:bg-purple-600",
                  ].join(" ")}
                >
                  <span>{bulkMode ? "❌" : "☑️"}</span>
                  <span>{bulkMode ? t("cancel", "common") + " " + t("bulk", "common") : t("bulk", "common") + " " + t("operations", "common")}</span>
                </button>
              )}
            </>
          )}
        </div>

        {/* Search */}
        <div className="relative mx-4">
          <input
            type="text"
            placeholder={t("search", "placeholders")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 w-64 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label={t("search_placeholder", "accessibility")}
          />
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-4 px-4 border-l border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span>{onlineUsers.length} {t("online", "common")}</span>
          </div>

          {/* Bulk mode quick toggle (mirror) */}
          {setBulkMode && (
            <button
              onClick={() => setBulkMode(!bulkMode)}
              className={[
                "px-3 py-1 rounded text-xs font-medium transition-colors",
                bulkMode
                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                  : "bg-purple-100 text-purple-700 hover:bg-purple-200",
              ].join(" ")}
            >
              {bulkMode ? t("cancel", "common") + " " + t("bulk", "common") : t("bulk", "common") + " " + t("mode", "common")}
            </button>
          )}

          <NotificationsDropdown />

          <QuickLanguageSelector />

          <UserProfileDropdown />
        </div>
      </div>
    </header>
  );
}