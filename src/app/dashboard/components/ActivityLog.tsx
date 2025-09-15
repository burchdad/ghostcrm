
import React, { useState, useEffect, useRef } from "react";

interface ActivityLogItem {
  id: string;
  action: string;
  user: string;
  avatarUrl?: string;
  target?: string;
  source?: string;
  item_type?: string;
  item_id?: string;
  created_at: string;
  notes?: string;
}

interface ActivityLogProps {
  collabActivity: ActivityLogItem[];
  setCollabActivity: React.Dispatch<React.SetStateAction<ActivityLogItem[]>>;
  activityLogFilter: string;
  setActivityLogFilter: (filter: string) => void;
}

const PAGE_SIZE = 20;


const columnOptions = [
  { key: 'user', label: 'User' },
  { key: 'action', label: 'Action' },
  { key: 'target', label: 'Target' },
  { key: 'item_type', label: 'Type' },
  { key: 'item_id', label: 'ID' },
  { key: 'created_at', label: 'Date' },
  { key: 'notes', label: 'Notes' },
];

const ActivityLog: React.FC<ActivityLogProps> = ({
  collabActivity,
  setCollabActivity,
  activityLogFilter,
  setActivityLogFilter
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'date' | 'action' | 'user'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [selected, setSelected] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalItem, setModalItem] = useState<ActivityLogItem | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(columnOptions.map(c => c.key));
  const [tagInput, setTagInput] = useState('');
  const [viewArchive, setViewArchive] = useState<'none' | 'warm' | 'cold'>('none');
  const [archiveLogs, setArchiveLogs] = useState<ActivityLogItem[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  // View archived logs (warm/cold)
  useEffect(() => {
    if (viewArchive === 'none') return;
    setLoading(true);
    fetch(`/api/collab/archive/${viewArchive}`)
      .then(res => res.json())
      .then(data => {
        setArchiveLogs(data.records || []);
        setLoading(false);
      })
      .catch(err => {
        setError(String(err));
        setLoading(false);
      });
  }, [viewArchive]);

  // Real-time updates (WebSocket mock)
  useEffect(() => {
    wsRef.current = new WebSocket('wss://example.com/activity');
    wsRef.current.onmessage = (event) => {
      const newItem: ActivityLogItem = JSON.parse(event.data);
      setCollabActivity(prev => [newItem, ...prev]);
    };
    return () => wsRef.current?.close();
  }, [setCollabActivity]);

  // Fetch paginated, filtered, sorted data and archive old items
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/collab/activity?page=${page}&size=${PAGE_SIZE}&filter=${encodeURIComponent(activityLogFilter)}&sortBy=${sortBy}&sortOrder=${sortOrder}&start=${dateRange.start}&end=${dateRange.end}`)
      .then(res => res.json())
      .then(data => {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        // Separate items by age
        const active = [];
        const warm = [];
        const cold = [];
        (data.records || []).forEach((item: ActivityLogItem) => {
          const itemDate = new Date(item.created_at);
          if (itemDate < thirtyDaysAgo) {
            cold.push(item);
          } else if (itemDate < sevenDaysAgo) {
            warm.push(item);
          } else {
            active.push(item);
          }
        });
        setCollabActivity(active);
        // Archive warm/cold items
        if (warm.length > 0) {
          fetch('/api/collab/archive/warm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ records: warm })
          });
        }
        if (cold.length > 0) {
          fetch('/api/collab/archive/cold', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ records: cold })
          });
        }
        setLoading(false);
      })
      .catch(err => {
        setError(String(err));
        setLoading(false);
      });
  }, [page, activityLogFilter, sortBy, sortOrder, dateRange, setCollabActivity]);
  // Manual archive trigger (for demo/testing)
  const handleManualArchive = () => {
    archiveOldLogs();
  };

  // Automated archiving every 6 hours
  useEffect(() => {
    const interval = setInterval(() => {
      archiveOldLogs();
    }, 6 * 60 * 60 * 1000); // 6 hours
    return () => clearInterval(interval);
  }, [collabActivity]);

  // Archive function
  const archiveOldLogs = () => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const warm = collabActivity.filter(a => {
      const d = new Date(a.created_at);
      return d < sevenDaysAgo && d >= thirtyDaysAgo;
    });
    const cold = collabActivity.filter(a => {
      const d = new Date(a.created_at);
      return d < thirtyDaysAgo;
    });
    if (warm.length > 0) {
      fetch('/api/collab/archive/warm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: warm })
      });
    }
    if (cold.length > 0) {
      fetch('/api/collab/archive/cold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: cold })
      });
    }
    // Remove archived from active list
    setCollabActivity(prev => prev.filter(a => {
      const d = new Date(a.created_at);
      return d >= sevenDaysAgo;
    }));
  };

  // Sorting handler
  const handleSort = (field: 'date' | 'action' | 'user') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Bulk selection
  const handleSelect = (id: string) => {
    setSelected(sel => sel.includes(id) ? sel.filter(s => s !== id) : [...sel, id]);
  };
  const handleSelectAll = () => {
    setSelected(collabActivity.map(a => a.id));
  };
  const handleDeselectAll = () => {
    setSelected([]);
  };

  // Bulk actions
  const handleBulkExport = (type: 'csv' | 'pdf' | 'excel') => {
    // Export only selected
    // For demo, just call handleExport
    handleExport(type);
  };
  const handleBulkDelete = () => {
    setCollabActivity(prev => prev.filter(a => !selected.includes(a.id)));
    setSelected([]);
  };

  // Details modal
  const openModal = (item: ActivityLogItem) => {
    setModalItem(item);
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setModalItem(null);
  };

  // Customizable columns
  const handleColumnToggle = (key: string) => {
    setVisibleColumns(cols => cols.includes(key) ? cols.filter(c => c !== key) : [...cols, key]);
  };

  // Tagging/notes
  const handleAddTag = (id: string) => {
    setCollabActivity(prev => prev.map(a => a.id === id ? { ...a, notes: tagInput } : a));
    setTagInput('');
  };

  // Advanced export (CSV, PDF, Excel)
  const handleExport = (type: 'csv' | 'pdf' | 'excel') => {
    fetch(`/api/collab/export?user_id=demo&dashboard_id=main&filter=${encodeURIComponent(activityLogFilter)}&type=${type}`)
      .then(res => res.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `activity_log.${type}`;
        a.click();
        URL.revokeObjectURL(url);
      });
  };

  // Compliance logging
  const logAction = async (action: string, details: any) => {
    await fetch("/api/auditlog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, details, timestamp: new Date().toISOString() })
    });
  };

  // Multi-tenant org selector
  const [selectedOrg, setSelectedOrg] = React.useState("");

  // Date range filter UI
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateRange({ ...dateRange, [e.target.name]: e.target.value });
  };

  // Mobile-friendly UI: Responsive tweaks (className changes)

  // Accessibility: Add ARIA labels, keyboard navigation

  // Calculate totalPages before return
  const totalPages = Math.max(1, Math.ceil(collabActivity.length / PAGE_SIZE));
  // Render
  return (
    <div className="mb-4 p-2 border rounded bg-gray-50" aria-label="Activity Log">
      {/* Organization/Tenant Selector */}
      <div className="mb-2 flex gap-2 items-center">
        <label className="text-sm text-blue-800">Organization</label>
        <select value={selectedOrg} onChange={e => setSelectedOrg(e.target.value)} className="border rounded px-2 py-1">
          <option value="">All</option>
          <option value="org1">Org 1</option>
          <option value="org2">Org 2</option>
        </select>
      </div>
      <div className="font-semibold mb-2 flex items-center gap-2">Activity Log
  <button className="ml-auto px-2 py-1 bg-green-500 text-white rounded" onClick={async () => { await logAction('export_csv', { org: selectedOrg }); handleExport('csv'); }} aria-label="Export CSV">Export CSV</button>
  <button className="px-2 py-1 bg-blue-500 text-white rounded" onClick={async () => { await logAction('export_pdf', { org: selectedOrg }); handleExport('pdf'); }} aria-label="Export PDF">Export PDF</button>
  <button className="px-2 py-1 bg-yellow-500 text-white rounded" onClick={async () => { await logAction('export_excel', { org: selectedOrg }); handleExport('excel'); }} aria-label="Export Excel">Export Excel</button>
      </div>
      <div className="flex flex-wrap gap-2 mb-2">
        <input type="text" placeholder="Filter by action/user..." value={activityLogFilter} onChange={e => setActivityLogFilter(e.target.value)} className="border rounded px-2 py-1" aria-label="Filter" />
        <input type="date" name="start" value={dateRange.start} onChange={handleDateChange} className="border rounded px-2 py-1" aria-label="Start date" />
        <input type="date" name="end" value={dateRange.end} onChange={handleDateChange} className="border rounded px-2 py-1" aria-label="End date" />
        <select value={sortBy} onChange={e => handleSort(e.target.value as any)} className="border rounded px-2 py-1" aria-label="Sort by">
          <option value="date">Date</option>
          <option value="action">Action</option>
          <option value="user">User</option>
        </select>
        <select onChange={e => handleColumnToggle(e.target.value)} className="border rounded px-2 py-1" aria-label="Columns">
          {columnOptions.map(col => (
            <option key={col.key} value={col.key}>{visibleColumns.includes(col.key) ? `Hide ${col.label}` : `Show ${col.label}`}</option>
          ))}
        </select>
        <button className="px-2 py-1 bg-gray-200 text-gray-700 rounded" onClick={handleSelectAll} aria-label="Select all">Select All</button>
        <button className="px-2 py-1 bg-gray-200 text-gray-700 rounded" onClick={handleDeselectAll} aria-label="Deselect all">Deselect All</button>
  <button className="px-2 py-1 bg-purple-500 text-white rounded" onClick={async () => { await logAction('bulk_export', { org: selectedOrg }); handleBulkExport('csv'); }} aria-label="Bulk Export">Bulk Export</button>
  <button className="px-2 py-1 bg-red-500 text-white rounded" onClick={async () => { await logAction('bulk_delete', { org: selectedOrg }); handleBulkDelete(); }} aria-label="Bulk Delete">Bulk Delete</button>
        <button className="px-2 py-1 bg-gray-200 text-gray-700 rounded" onClick={() => setPage(1)} aria-label="Reset">Reset</button>
      </div>
      {loading && <div className="text-xs text-blue-500">Loading...</div>}
      {error && <div className="text-xs text-red-500">Error: {error}</div>}
      <ul className="text-xs mt-2" role="list">
        {collabActivity.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((a, idx) => (
          <li key={a.id || idx} className="mb-1 flex items-center gap-2" role="listitem" tabIndex={0} aria-label={`Activity log entry ${a.id}`}
              onClick={() => openModal(a)} style={{ cursor: 'pointer', background: selected.includes(a.id) ? '#f3f4f6' : undefined }}>
            <input type="checkbox" checked={selected.includes(a.id)} onChange={() => handleSelect(a.id)} aria-label={`Select ${a.id}`} />
            {a.avatarUrl && <img src={a.avatarUrl} alt={a.user} className="w-5 h-5 rounded-full" />}
            {visibleColumns.includes('user') && <span className="font-bold">{a.user}</span>}
            {visibleColumns.includes('action') && <span>{a.action}</span>}
            {visibleColumns.includes('target') && <span className="text-gray-500">{a.target || a.source || a.item_type}</span>}
            {visibleColumns.includes('item_type') && <span className="text-gray-400">{a.item_type}</span>}
            {visibleColumns.includes('item_id') && a.item_id && <span className="text-gray-400">({a.item_id})</span>}
            {visibleColumns.includes('created_at') && <span className="text-gray-400">@ {a.created_at}</span>}
            {visibleColumns.includes('notes') && <span className="text-green-700">{a.notes}</span>}
            {/* Inline notification/alert example */}
            {a.action === 'alert' && <span className="text-red-500 ml-2">⚠️ Alert</span>}
          </li>
        ))}
      </ul>
      <div className="flex gap-2 mt-2">
        <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-2 py-1 bg-gray-200 rounded" aria-label="Previous page">Prev</button>
        <span className="text-xs">Page {page} of {totalPages}</span>
        <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-2 py-1 bg-gray-200 rounded" aria-label="Next page">Next</button>
      </div>
      {/* Details modal */}
      {showModal && modalItem && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50" role="dialog" aria-modal="true">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
            <h3 className="font-bold mb-2">Log Entry Details</h3>
            <div className="mb-2">User: {modalItem.user}</div>
            <div className="mb-2">Action: {modalItem.action}</div>
            <div className="mb-2">Target: {modalItem.target}</div>
            <div className="mb-2">Type: {modalItem.item_type}</div>
            <div className="mb-2">ID: {modalItem.item_id}</div>
            <div className="mb-2">Date: {modalItem.created_at}</div>
            <div className="mb-2">Notes: {modalItem.notes}</div>
            <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="Add note/tag..." className="border rounded px-2 py-1 mb-2" />
            <button className="px-2 py-1 bg-green-500 text-white rounded" onClick={() => handleAddTag(modalItem.id)}>Save Note/Tag</button>
            <button className="px-2 py-1 bg-gray-200 text-gray-700 rounded ml-2" onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
      {/* Audit trail download */}
      <div className="mt-2 flex gap-2">
  <button className="px-2 py-1 bg-indigo-500 text-white rounded" onClick={async () => { await logAction('download_audit_trail', { org: selectedOrg }); handleExport('csv'); }} aria-label="Download audit trail">Download Audit Trail</button>
  <button className="px-2 py-1 bg-orange-500 text-white rounded" onClick={async () => { try { await logAction('archive_logs', { org: selectedOrg }); handleManualArchive(); alert('Logs archived successfully.'); } catch (err) { alert('Archive failed.'); } }} aria-label="Archive old logs">Archive Old Logs</button>
        <button className="px-2 py-1 bg-gray-500 text-white rounded" onClick={() => setViewArchive(viewArchive === 'warm' ? 'none' : 'warm')} aria-label="View warm archive">{viewArchive === 'warm' ? 'Hide Warm Archive' : 'View Warm Archive'}</button>
        <button className="px-2 py-1 bg-blue-900 text-white rounded" onClick={() => setViewArchive(viewArchive === 'cold' ? 'none' : 'cold')} aria-label="View cold archive">{viewArchive === 'cold' ? 'Hide Cold Archive' : 'View Cold Archive'}</button>
      </div>
      {/* Archive logs view */}
      {viewArchive !== 'none' && (
        <div className="mt-4 p-2 border rounded bg-gray-100">
          <div className="font-semibold mb-2">{viewArchive === 'warm' ? 'Warm Storage Logs (7-30 days old)' : 'Cold Storage Logs (30+ days old)'}</div>
          {loading && <div className="text-xs text-blue-500">Loading archive...</div>}
          <ul className="text-xs mt-2" role="list">
            {archiveLogs.map((a, idx) => (
              <li key={a.id || idx} className="mb-1 flex items-center gap-2" role="listitem" tabIndex={0} aria-label={`Archived log entry ${a.id}`}
                  style={{ background: '#e5e7eb' }}>
                {a.avatarUrl && <img src={a.avatarUrl} alt={a.user} className="w-5 h-5 rounded-full" />}
                {visibleColumns.includes('user') && <span className="font-bold">{a.user}</span>}
                {visibleColumns.includes('action') && <span>{a.action}</span>}
                {visibleColumns.includes('target') && <span className="text-gray-500">{a.target || a.source || a.item_type}</span>}
                {visibleColumns.includes('item_type') && <span className="text-gray-400">{a.item_type}</span>}
                {visibleColumns.includes('item_id') && a.item_id && <span className="text-gray-400">({a.item_id})</span>}
                {visibleColumns.includes('created_at') && <span className="text-gray-400">@ {a.created_at}</span>}
                {visibleColumns.includes('notes') && <span className="text-green-700">{a.notes}</span>}
                {a.action === 'alert' && <span className="text-red-500 ml-2">⚠️ Alert</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
