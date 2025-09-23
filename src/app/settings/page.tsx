"use client";
import React from "react";
import OrgSettingsTable from "./OrgSettingsTable";
import TemplateLibrary from "./TemplateLibrary";

export default function SettingsPage() {

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <p className="mb-2">This is the advanced settings page. Here you can manage your profile, organization, preferences, integrations, and more.</p>
      <ul className="list-disc pl-6 mb-4">
        <li>Profile & Security</li>
        <li>Organization & Roles</li>
        <li>Integrations</li>
        <li>Notifications</li>
        <li>Accessibility & Language</li>
      </ul>
      <div className="bg-blue-50 p-4 rounded shadow text-blue-700 mb-6">Advanced settings and customization coming soon!</div>

  <OrgSettingsTable orgId="1" />
  <TemplateLibrary orgId="1" />
    </div>
  );
}
