import React from "react";
import SidebarAIAssistant from "./SidebarAIAssistant";

interface SidebarProps {
  selectedOrg: string;
  setSelectedOrg: (org: string) => void;
  userRole: string;
  t: (key: string) => React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedOrg, setSelectedOrg, userRole, t }) => (
  <aside className="w-64 bg-white border-r flex flex-col min-h-screen p-4">
    <div className="mb-6">
      <h1 className="font-bold text-xl text-blue-700 mb-2">Ghost Auto CRM</h1>
      <div className="flex gap-2 mb-2">
        <select value={selectedOrg} onChange={e => setSelectedOrg(e.target.value)} className="border rounded px-2 py-1 text-xs">
          <option value="">{t("All Orgs")}</option>
          <option value="org1">{t("Org 1")}</option>
          <option value="org2">{t("Org 2")}</option>
        </select>
        <span className="text-xs bg-blue-100 text-blue-700 rounded px-2 py-1">{userRole}</span>
      </div>
      <input className="border rounded px-2 py-1 w-full text-xs mb-2" placeholder={t("Quick search...") as string} />
    </div>
    <nav className="flex-1">
      <ul className="space-y-2">
        <li>
          <a href="/dashboard" className="flex items-center gap-2 px-2 py-2 rounded bg-blue-50 text-blue-700 font-semibold">
            <span>🏠</span> {t("Dashboard")}
          </a>
        </li>
        <li>
          <a href="/appointments" className="flex items-center gap-2 px-2 py-2 rounded hover:bg-gray-100">
            <span>📅</span> {t("Appointments")}
            <span className="ml-auto bg-red-500 text-white rounded px-2 text-xs">3</span>
          </a>
        </li>
      </ul>
      <div className="mt-6">
        <div className="font-bold text-xs mb-2">{t("Quick Filters")}</div>
        <div className="flex gap-2 flex-wrap">
          <button className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">{t("All")}</button>
          <button className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">{t("Leads")}</button>
          <button className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">{t("Deals")}</button>
          <button className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">{t("Inventory")}</button>
        </div>
      </div>
      {/* AI Assistant for recommendations, Q&A, build, analyze */}
      <SidebarAIAssistant org={selectedOrg} t={t} />
    </nav>
    <div className="mt-auto pt-6">
      <button className="w-full px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs mb-2">{t("Collapse")}</button>
      <div className="text-xs text-gray-400">Tip: Drag icons to reorder, use filters for quick access, and collapse sidebar for more space!</div>
    </div>
  </aside>
);

export default Sidebar;
