import React, { useState } from "react";

interface DashboardImportedListProps {
  importedDashboards: any[];
  t: (key: string) => React.ReactNode;
}

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<null | Error>(null);
  if (error) return <div className="text-red-500">Error: {error.message}</div>;
  return children;
}

const DashboardImportedList: React.FC<DashboardImportedListProps> = ({ importedDashboards, t }) => {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [selected, setSelected] = useState<number[]>([]);

  // Filter and sort logic
  const filtered = importedDashboards
    .filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || (d.description && d.description.toLowerCase().includes(search.toLowerCase())))
    .sort((a, b) => {
      if (a[sortKey] < b[sortKey]) return sortAsc ? -1 : 1;
      if (a[sortKey] > b[sortKey]) return sortAsc ? 1 : -1;
      return 0;
    });

  // Bulk actions
  function handleSelect(id: number) {
    setSelected(sel => sel.includes(id) ? sel.filter(i => i !== id) : [...sel, id]);
  }
  function handleSelectAll() {
    setSelected(filtered.map(d => d.id));
  }
  function handleClearSelection() {
    setSelected([]);
  }
  function handleExportSelected() {
    // Export logic (e.g., CSV)
    const rows = filtered.filter(d => selected.includes(d.id));
    const csv = rows.map(d => `${d.name},${d.description}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "imported_dashboards.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!importedDashboards.length) return null;

  return (
    <ErrorBoundary>
      <div className="mt-8">
        <h2 className="font-bold mb-2">{t("Imported Dashboards")}</h2>
        <div className="flex flex-wrap gap-2 mb-2 items-center">
          <input
            type="text"
            className="border rounded px-2 py-1"
            placeholder={String(t("Search dashboards..."))}
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search imported dashboards"
          />
          <button className="px-2 py-1 bg-gray-200 rounded text-xs" onClick={handleSelectAll}>Select All</button>
          <button className="px-2 py-1 bg-gray-200 rounded text-xs" onClick={handleClearSelection}>Clear Selection</button>
          <button className="px-2 py-1 bg-blue-500 text-white rounded text-xs" onClick={handleExportSelected} disabled={!selected.length}>Export Selected</button>
          <label className="ml-2 text-xs">Sort by:</label>
          <select value={sortKey} onChange={e => setSortKey(e.target.value)} className="border rounded px-2 py-1 text-xs">
            <option value="name">Name</option>
            <option value="description">Description</option>
          </select>
          <button className="px-2 py-1 bg-gray-200 rounded text-xs" onClick={() => setSortAsc(a => !a)}>{sortAsc ? t("Asc") : t("Desc")}</button>
        </div>
        <ul className="divide-y divide-gray-100">
          {filtered.map((tpl, idx) => (
            <li key={tpl.id} className="py-2 flex items-center gap-2 hover:bg-gray-50 transition">
              <input
                type="checkbox"
                checked={selected.includes(tpl.id)}
                onChange={() => handleSelect(tpl.id)}
                aria-label={`Select dashboard ${tpl.name}`}
              />
              <span className="font-semibold">{tpl.name}</span>
              <span className="text-xs text-gray-500">{t(tpl.description)}</span>
            </li>
          ))}
        </ul>
      </div>
    </ErrorBoundary>
  );
};

export default DashboardImportedList;
