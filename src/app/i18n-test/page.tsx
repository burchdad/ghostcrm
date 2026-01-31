"use client";
import React from "react";
import { useI18n } from "@/components/utils/I18nProvider";
import LanguageSelector from "@/components/global/LanguageSelector";

export default function I18nTestPage() {
  const { t, lang } = useI18n();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          🌐 Multi-Language System Test
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Language Selector */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Language Selector</h2>
            <LanguageSelector />
            <p className="text-sm text-gray-400 mt-2">
              Current language: <span className="text-blue-400">{lang}</span>
            </p>
          </div>

          {/* Translation Tests */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Translation Tests</h2>
            <div className="space-y-3">
              <div>
                <span className="text-gray-400">Welcome:</span>{" "}
                <span className="text-green-400">{t("welcome")}</span>
              </div>
              <div>
                <span className="text-gray-400">Loading:</span>{" "}
                <span className="text-green-400">{t("loading")}</span>
              </div>
              <div>
                <span className="text-gray-400">Save:</span>{" "}
                <span className="text-green-400">{t("save")}</span>
              </div>
              <div>
                <span className="text-gray-400">Cancel:</span>{" "}
                <span className="text-green-400">{t("cancel")}</span>
              </div>
            </div>
          </div>

          {/* Navigation Translations */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Navigation</h2>
            <div className="space-y-2">
              <div>{t("dashboard", "navigation")}</div>
              <div>{t("leads", "navigation")}</div>
              <div>{t("deals", "navigation")}</div>
              <div>{t("contacts", "navigation")}</div>
              <div>{t("calendar", "navigation")}</div>
            </div>
          </div>

          {/* Dashboard Translations */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Dashboard Elements</h2>
            <div className="space-y-2">
              <div>{t("title", "dashboard")}</div>
              <div>{t("welcome", "dashboard")}</div>
              <div>{t("quick_stats", "dashboard")}</div>
              <div>{t("recent_activity", "dashboard")}</div>
              <div>{t("pipeline", "dashboard")}</div>
            </div>
          </div>

          {/* Form Validations */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Form Validations</h2>
            <div className="space-y-2 text-red-400">
              <div>{t("required", "forms")}</div>
              <div>{t("invalid_email", "forms")}</div>
              <div>{t("password_too_short", "forms")}</div>
            </div>
          </div>

          {/* Language Options */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Language Options</h2>
            <div className="space-y-2">
              <div>{t("select", "language")}</div>
              <div>{t("english", "language")}</div>
              <div>{t("spanish", "language")}</div>
              <div>{t("french", "language")}</div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-400">
            Switch languages using the selector above to see translations in action!
          </p>
        </div>
      </div>
    </div>
  );
}