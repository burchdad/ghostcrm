// @ts-nocheck
import React, { useState } from "react";
import Modal from "@/components/ui/Modal";
import { Tooltip } from "@/components/utils/Tooltip";
import { EmptyState } from "@/components/feedback/EmptyState";

const industryTemplates = {
  auto: [
    { id: 1, name: "Sales Pipeline", description: "Track leads, deals, and inventory." },
    { id: 2, name: "Service Appointments", description: "Manage service bookings and reminders." },
    { id: 3, name: "Inventory Analytics", description: "Monitor vehicle stock and trends." },
  ],
  realestate: [
    { id: 4, name: "Listings Overview", description: "Track property listings and status." },
    { id: 5, name: "Agent Performance", description: "Analyze agent sales and activity." },
    { id: 6, name: "Lead Conversion", description: "Monitor buyer/seller lead conversion." },
  ],
  insurance: [
    { id: 7, name: "Policy Pipeline", description: "Track applications, renewals, and claims." },
    { id: 8, name: "Agent Leaderboard", description: "Compare agent performance and quotas." },
    { id: 9, name: "Claims Analytics", description: "Analyze claims volume and resolution." },
  ],
};

const allTemplates = Object.values(industryTemplates).flat();

type IndustryAIRecommendDashboardProps = {
  onImport?: (dashboards: any[]) => void;
};

export default function IndustryAIRecommendDashboard({ onImport }: IndustryAIRecommendDashboardProps) {
  const [industry, setIndustry] = useState("auto");
  const [recommended, setRecommended] = useState(industryTemplates["auto"]);
  const [marketplace, setMarketplace] = useState(allTemplates);
  const [selected, setSelected] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleIndustryChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setIndustry(e.target.value);
    setRecommended(industryTemplates[e.target.value]);
  }
  function handleSelect(id: number) {
    setSelected(selected.includes(id) ? selected.filter(i => i !== id) : [...selected, id]);
  }
  function handleImport() {
    setShowModal(true);
  }
  function confirmImport() {
    setLoading(true);
    setTimeout(() => {
      try {
        const selectedTemplates = allTemplates.filter(tpl => selected.includes(tpl.id));
        if (selectedTemplates.length === 0) throw new Error("No dashboards selected");
        if (onImport) onImport(selectedTemplates);
        setSelected([]);
        setShowModal(false);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, 800);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {loading && <Skeleton className="h-10 w-full mb-4" />}
      {error && <ErrorState title="Error" description={error} />}
      <h1 className="text-2xl font-bold mb-4">🧠 AI Dashboard Recommendations & Marketplace</h1>
      <div className="bg-white rounded shadow p-4 mb-4">
        <label className="font-bold mb-2 block">Select Industry</label>
        <select value={industry} onChange={handleIndustryChange} className="border rounded px-2 py-1 mb-4" aria-label="Select Industry">
          <option value="auto">Auto Dealership</option>
          <option value="realestate">Real Estate</option>
          <option value="insurance">Insurance</option>
        </select>
        <h2 className="font-bold mb-2">AI Recommended Dashboards</h2>
        {recommended.length === 0 ? (
          <EmptyState title="No Recommendations" description="No dashboards available for this industry." />
        ) : (
          <ul>
            {recommended.map(tpl => (
              <li key={tpl.id} className="mb-2 flex items-center gap-2">
                <Tooltip text="Select dashboard">
                  <input type="checkbox" checked={selected.includes(tpl.id)} onChange={() => handleSelect(tpl.id)} aria-label={`Select ${tpl.name}`} />
                </Tooltip>
                <span className="font-semibold">{tpl.name}</span>
                <span className="text-xs text-gray-500">{tpl.description}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="bg-white rounded shadow p-4 mb-4">
        <h2 className="font-bold mb-2">Dashboard Marketplace</h2>
        {marketplace.length === 0 ? (
          <EmptyState title="No Marketplace Dashboards" description="No dashboards available in the marketplace." />
        ) : (
          <ul>
            {marketplace.map(tpl => (
              <li key={tpl.id} className="mb-2 flex items-center gap-2">
                <Tooltip text="Select dashboard">
                  <input type="checkbox" checked={selected.includes(tpl.id)} onChange={() => handleSelect(tpl.id)} aria-label={`Select ${tpl.name}`} />
                </Tooltip>
                <span className="font-semibold">{tpl.name}</span>
                <span className="text-xs text-gray-500">{tpl.description}</span>
              </li>
            ))}
          </ul>
        )}
        <Tooltip text="Add selected dashboards">
          <button className="px-2 py-1 bg-green-500 text-white rounded mt-4" onClick={handleImport} aria-label="Add Selected Dashboards">Add Selected Dashboards</button>
        </Tooltip>
      </div>
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Confirm Add Dashboards">
        <div className="mb-4">Are you sure you want to add the selected dashboards?</div>
        <div className="flex gap-2">
          <button className="px-2 py-1 bg-green-500 text-white rounded" onClick={confirmImport} aria-label="Confirm Add">Confirm</button>
          <button className="px-2 py-1 bg-gray-300 text-gray-700 rounded" onClick={() => setShowModal(false)} aria-label="Cancel Add">Cancel</button>
        </div>
      </Modal>
    </div>
  );
}
