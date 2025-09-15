
import React, { useState, useMemo } from "react";
// Simple localization function (stub)
const t = (s: string) => s;
// If you see a missing module error for react-icons/fa, run: npm install react-icons
import { FaSearch, FaSort, FaStar, FaEye, FaShareAlt, FaDownload, FaUserShield, FaHistory, FaPalette } from "react-icons/fa";

interface MarketplaceCard {
  key: string;
  label: string;
  description: string;
  author?: string;
  roles: string[];
  recommended?: boolean;
  rating?: number;
  version?: string;
  changelog?: string;
  previewUrl?: string;
  installCount?: number;
  apiDocsUrl?: string;
  theme?: string;
  lastUpdated?: string;
  auditHistory?: Array<{ action: string; timestamp: string; user: string }>;
}

interface MarketplaceProps {
  showMarketplace: boolean;
  setShowMarketplace: (show: boolean) => void;
  marketplaceCards: MarketplaceCard[];
  cardOrder: string[];
  setCardOrder: (order: string[]) => void;
  saveCustomCards: (cards: { key: string }[]) => void;
  rateCard: (key: string, rating: number) => void;
}

const Marketplace: React.FC<MarketplaceProps> = ({
  showMarketplace,
  setShowMarketplace,
  marketplaceCards,
  cardOrder,
  setCardOrder,
  saveCustomCards,
  rateCard
}) => {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("rating");
  const [filterRole, setFilterRole] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<MarketplaceCard | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [theme, setTheme] = useState("light");
  // Language selector
  const [language, setLanguage] = useState("en");
  // Bulk operations
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  // Compliance logging
  const logAction = async (action: string, details: any) => {
    await fetch("/api/auditlog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, details, timestamp: new Date().toISOString() })
    });
  };
  // Multi-tenant org selector
  const [selectedOrg, setSelectedOrg] = useState("");

  // AI recommendations stub (replace with real AI logic)
  const aiRecommendedKeys = useMemo(() => marketplaceCards.filter(c => c.recommended).map(c => c.key), [marketplaceCards]);

  // Filter, search, sort logic
  const filteredCards = useMemo(() => {
    let cards = [...marketplaceCards];
    if (search) {
      cards = cards.filter(card => card.label.toLowerCase().includes(search.toLowerCase()) || card.description.toLowerCase().includes(search.toLowerCase()));
    }
    if (filterRole) {
      cards = cards.filter(card => card.roles.includes(filterRole));
    }
    if (sortBy === "rating") {
      cards.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === "newest") {
      cards.sort((a, b) => (b.lastUpdated || "").localeCompare(a.lastUpdated || ""));
    } else if (sortBy === "recommended") {
      cards.sort((a, b) => (b.recommended ? 1 : 0) - (a.recommended ? 1 : 0));
    }
    return cards;
  }, [marketplaceCards, search, sortBy, filterRole]);

  if (!showMarketplace) return null;
  return (
    <div className={`fixed inset-0 ${theme === "dark" ? "bg-gray-900" : "bg-black bg-opacity-30"} flex items-center justify-center z-50`}>
      <div className={`bg-white ${theme === "dark" ? "dark:bg-gray-800 dark:text-white" : ""} p-6 rounded shadow-lg w-full max-w-3xl`} role="dialog" aria-modal="true">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-xl">{t("Dashboard Card Marketplace")}</h3>
          <button className="ml-2 px-2 py-1 rounded bg-gray-200 text-gray-700" onClick={() => setShowMarketplace(false)} aria-label={t("Close Marketplace")}>{t("Close")}</button>
        </div>
        {/* Language Selector */}
        <div className="mb-2 flex gap-2 items-center">
          <label className="text-sm text-blue-800">{t("Language")}</label>
          <select value={language} onChange={e => setLanguage(e.target.value)} className="border rounded px-2 py-1">
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
          </select>
        </div>
        {/* Multi-tenant Organization Selector */}
        <div className="mb-2 flex gap-2 items-center">
          <label className="text-sm text-blue-800">{t("Organization")}</label>
          <select value={selectedOrg} onChange={e => setSelectedOrg(e.target.value)} className="border rounded px-2 py-1">
            <option value="">All</option>
            <option value="org1">Org 1</option>
            <option value="org2">Org 2</option>
          </select>
          <button className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs" onClick={() => setBulkMode(!bulkMode)}>{bulkMode ? t("Cancel Bulk") : t("Bulk Ops")}</button>
        </div>
        <div className="flex gap-2 mb-4">
          <div className="flex items-center bg-gray-100 rounded px-2">
            <FaSearch className="mr-1" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t("Search cards...")} className="bg-transparent outline-none py-1" aria-label={t("Search cards")}/>
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-2 py-1 rounded bg-gray-100 text-xs" aria-label="Sort cards">
            <option value="rating">{t("Sort by Rating")}</option>
            <option value="newest">{t("Sort by Newest")}</option>
            <option value="recommended">{t("Sort by Recommended")}</option>
          </select>
          <select value={filterRole || ""} onChange={e => setFilterRole(e.target.value || null)} className="px-2 py-1 rounded bg-gray-100 text-xs" aria-label="Filter by Role">
            <option value="">{t("All Roles")}</option>
            {[...new Set(marketplaceCards.flatMap(card => card.roles))].map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
            <button className="px-2 py-1 rounded bg-gray-100 text-xs" onClick={() => setTheme(theme === "light" ? "dark" : "light")} aria-label={t("Toggle Theme")}><FaPalette /></button>
        </div>
        {/* Bulk Operations UI */}
        {bulkMode && (
          <div className="mb-2 flex gap-2">
            <button className="px-2 py-1 bg-blue-500 text-white rounded text-xs" aria-label={t("Bulk Install")} onClick={async () => {
              try {
                setCardOrder([...cardOrder, ...selectedKeys.filter(k => !cardOrder.includes(k))]);
                saveCustomCards([...cardOrder, ...selectedKeys.filter(k => !cardOrder.includes(k))].map(key => ({ key })));
                await logAction("bulk_install", { keys: selectedKeys });
                setSelectedKeys([]);
                setBulkMode(false);
                alert(t("Bulk install successful."));
              } catch (err) {
                alert(t("Bulk install failed."));
              }
            }}>{t("Install Selected")}</button>
            <button className="px-2 py-1 bg-red-500 text-white rounded text-xs" aria-label={t("Bulk Uninstall")} onClick={async () => {
              try {
                setCardOrder(cardOrder.filter(k => !selectedKeys.includes(k)));
                saveCustomCards(cardOrder.filter(k => !selectedKeys.includes(k)).map(key => ({ key })));
                await logAction("bulk_uninstall", { keys: selectedKeys });
                setSelectedKeys([]);
                setBulkMode(false);
                alert(t("Bulk uninstall successful."));
              } catch (err) {
                alert(t("Bulk uninstall failed."));
              }
            }}>{t("Uninstall Selected")}</button>
            <button className="px-2 py-1 bg-yellow-500 text-white rounded text-xs" aria-label={t("Bulk Export")} onClick={async () => {
              try {
                selectedKeys.forEach(k => {/* TODO: Implement real export logic (CSV, PDF, etc.) */});
                await logAction("bulk_export", { keys: selectedKeys });
                setBulkMode(false);
                alert(t("Bulk export successful."));
              } catch (err) {
                alert(t("Bulk export failed."));
              }
            }}>{t("Export Selected")}</button>
            <button className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs" aria-label={t("Cancel Bulk")} onClick={() => setBulkMode(false)}>{t("Cancel")}</button>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4" role="list">
          {filteredCards.map(card => {
            const isActive = cardOrder.includes(card.key);
            const isAIRecommended = aiRecommendedKeys.includes(card.key);
            // Filter by organization (scaffolded)
            if (selectedOrg && card.author && card.author !== selectedOrg) return null;
            return (
              <div key={card.key} className={`border rounded p-3 flex flex-col relative ${isAIRecommended ? "ring-2 ring-blue-400" : ""}`} tabIndex={0} aria-label={card.label} draggable onDragStart={e => e.dataTransfer.setData("cardKey", card.key)}>
                <div className="flex justify-between items-center mb-1">
                  {bulkMode && (
                    <input type="checkbox" checked={selectedKeys.includes(card.key)} aria-label={`Select ${card.label}`} onChange={e => {
                      setSelectedKeys(e.target.checked ? [...selectedKeys, card.key] : selectedKeys.filter(k => k !== card.key));
                    }} />
                  )}
                  <span className="font-bold text-lg">{card.label}</span>
                  {isAIRecommended && <span className="px-2 py-0.5 bg-blue-100 rounded text-xs">AI Recommended</span>}
                </div>
                <div className="text-xs text-gray-500 mb-1">{card.description}</div>
                <div className="text-xs text-gray-400 mb-1">By: {card.author || "System"}</div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-green-700">{card.roles.join(", ")}</span>
                  {card.recommended && <span className="px-2 py-0.5 bg-green-100 rounded text-xs">Recommended</span>}
                  {/* Compliance badges */}
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">GDPR</span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">SOC2</span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">CCPA</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Encrypted</span>
                </div>
                <div className="flex gap-2 mb-2">
                  <button className={`px-2 py-1 rounded text-xs ${isActive ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`} aria-label={isActive ? `Remove ${card.label}` : `Install ${card.label}`} onClick={async () => {
                    if (isActive) {
                      setCardOrder(cardOrder.filter(k => k !== card.key));
                      saveCustomCards(cardOrder.filter(k => k !== card.key).map(key => ({ key })));
                      await logAction("uninstall", { key: card.key });
                    } else {
                      setCardOrder([...cardOrder, card.key]);
                      saveCustomCards([...cardOrder, card.key].map(key => ({ key })));
                      await logAction("install", { key: card.key });
                    }
                  }}>{isActive ? 'Remove' : 'Install'}</button>
                  <button className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs flex items-center gap-1" aria-label={`Rate ${card.label} 5 stars`} onClick={() => rateCard(card.key, 5)}><FaStar /> Rate</button>
                  <button className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs flex items-center gap-1" aria-label={`Preview ${card.label}`} onClick={() => { setSelectedCard(card); setShowPreview(true); }}><FaEye /> Preview</button>
                  <button className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs flex items-center gap-1" aria-label={`Export ${card.label}`} onClick={async () => { /* TODO: Implement export logic */ await logAction("export", { key: card.key }); }}><FaDownload /> Export</button>
                  <button className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs flex items-center gap-1" aria-label={`Share ${card.label}`} onClick={async () => { /* TODO: Implement share logic */ await logAction("share", { key: card.key }); }}><FaShareAlt /> Share</button>
                </div>
                <div className="flex gap-2 text-xs text-gray-500 mb-1">
                  <span>Rating: {card.rating || 0} / 5</span>
                  {card.version && <span>v{card.version}</span>}
                  {card.installCount && <span>{card.installCount} installs</span>}
                </div>
                {card.apiDocsUrl && <a href={card.apiDocsUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline">API Docs</a>}
                <div className="flex gap-2 mt-2">
                  <button className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs flex items-center gap-1" aria-label={`View details for ${card.label}`} onClick={() => setSelectedCard(card)}><FaHistory /> Details</button>
                  <button className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs flex items-center gap-1" aria-label={`Role actions for ${card.label}`} onClick={() => { /* TODO: Implement role-based logic */ }}><FaUserShield /> Role</button>
                </div>
              </div>
            );
          })}
        </div>
        {/* Card Details Modal */}
        {selectedCard && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60" role="dialog" aria-modal="true">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative">
              <button className="absolute top-2 right-2 px-2 py-1 bg-gray-200 rounded" onClick={() => setSelectedCard(null)} aria-label="Close Details">Close</button>
              <h4 className="font-bold text-lg mb-2">{selectedCard.label}</h4>
              <div className="mb-2 text-xs text-gray-500">{selectedCard.description}</div>
              <div className="mb-2 text-xs text-gray-400">By: {selectedCard.author || "System"}</div>
              <div className="mb-2 text-xs text-green-700">Roles: {selectedCard.roles.join(", ")}</div>
              <div className="mb-2 text-xs">Version: {selectedCard.version || "N/A"}</div>
              <div className="mb-2 text-xs">Last Updated: {selectedCard.lastUpdated || "N/A"}</div>
              <div className="mb-2 text-xs">Rating: {selectedCard.rating || 0} / 5</div>
              <div className="mb-2 text-xs">Installs: {selectedCard.installCount || 0}</div>
              {selectedCard.changelog && <div className="mb-2 text-xs">Changelog: {selectedCard.changelog}</div>}
              {selectedCard.auditHistory && (
                <div className="mb-2 text-xs">
                  <div className="font-bold">Audit History:</div>
                  <ul>
                    {selectedCard.auditHistory.map((audit, idx) => (
                      <li key={idx}>{audit.action} by {audit.user} at {audit.timestamp}</li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedCard.apiDocsUrl && <a href={selectedCard.apiDocsUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline">API Docs</a>}
              <div className="flex gap-2 mt-2">
                <button className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs flex items-center gap-1" onClick={() => setShowPreview(true)} aria-label="Live Preview"><FaEye /> Live Preview</button>
                <button className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs flex items-center gap-1" onClick={() => { /* Export logic */ }} aria-label="Export Card"><FaDownload /> Export</button>
                <button className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs flex items-center gap-1" onClick={() => { /* Share logic */ }} aria-label="Share Card"><FaShareAlt /> Share</button>
              </div>
            </div>
          </div>
        )}
        {/* Live Preview Modal */}
        {showPreview && selectedCard && selectedCard.previewUrl && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-70" role="dialog" aria-modal="true">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-2xl relative">
              <button className="absolute top-2 right-2 px-2 py-1 bg-gray-200 rounded" onClick={() => setShowPreview(false)} aria-label="Close Preview">Close</button>
              <h4 className="font-bold text-lg mb-2">Live Preview: {selectedCard.label}</h4>
              <iframe src={selectedCard.previewUrl} title="Live Preview" className="w-full h-64 border rounded" onError={(e) => { e.currentTarget.src = ''; e.currentTarget.title = 'Preview failed to load.'; }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
