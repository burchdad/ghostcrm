import React from "react";

interface AuditHistoryBarProps {
	onExportCSV: () => void;
	onExportLog: () => void;
	onResetDashboard?: () => void;
	isAdmin?: boolean;
}

const AuditHistoryBar: React.FC<AuditHistoryBarProps> = ({
	onExportCSV,
	onExportLog,
	onResetDashboard,
	isAdmin
}) => (
	<div className="flex flex-wrap gap-2 items-center py-2 px-4 bg-white border-b sticky top-0 z-40">
		<span className="font-bold text-lg mr-4">Audit History</span>
		<button className="px-3 py-1 bg-blue-500 text-white rounded font-semibold" onClick={onExportCSV}>Export CSV</button>
		<button className="px-3 py-1 bg-blue-700 text-white rounded font-semibold" onClick={onExportLog}>Export Audit Log</button>
		{isAdmin && onResetDashboard && (
			<button className="px-3 py-1 bg-red-600 text-white rounded font-semibold" onClick={onResetDashboard}>Admin: Reset Dashboard Data</button>
		)}
	</div>
);

export default AuditHistoryBar;
// ...existing code from dashboard/components/AuditHistoryBar.tsx
