import React, { useState, useEffect } from "react";
import { UserProfileDropdown } from "@/components/navigation/UserProfileDropdown";
import { FaUsers } from "react-icons/fa";
import { Tooltip } from "@/components/utils/Tooltip";
import { getOnlineUsers } from "@/lib/api";

interface DashboardTopbarProps {
	bulkMode: boolean;
	setBulkMode: (mode: boolean) => void;
	t: (key: string) => React.ReactNode;
}

const DashboardTopbar: React.FC<DashboardTopbarProps> = ({ bulkMode, setBulkMode, t }) => {
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);	useEffect(() => {
		getOnlineUsers().then(result => {
			if (Array.isArray(result)) {
				setOnlineUsers(result);
			} else {
				setOnlineUsers([]);
			}
		});
	}, []);

	return (
		<nav
			className="flex flex-wrap justify-between items-center mb-4 px-2 py-2 bg-white dark:bg-gray-900 shadow rounded-lg"
			aria-label="Dashboard topbar"
		>
			<div className="flex items-center gap-2">
				<UserProfileDropdown />
				<Tooltip text={t("Online Users") as string}>
					<div className="flex items-center gap-1" aria-label="Online users">
						<FaUsers className="text-green-500" />
						<span className="text-xs font-semibold" aria-live="polite">{onlineUsers.length}</span>
					</div>
				</Tooltip>
			</div>
			<div className="flex gap-4 items-center flex-wrap">
				<Tooltip text={bulkMode ? t("Cancel Bulk") as string : t("Bulk Ops") as string}>
					<button
						className={`px-2 py-1 rounded text-xs ${bulkMode ? "bg-red-100 text-red-700" : "bg-purple-100 text-purple-700"}`}
						onClick={() => setBulkMode(!bulkMode)}
						aria-pressed={bulkMode}
						aria-label={bulkMode ? t("Cancel Bulk") as string : t("Bulk Ops") as string}
					>
						{bulkMode ? t("Cancel Bulk") : t("Bulk Ops")}
					</button>
				</Tooltip>
				{/* Role-based quick actions (if dashboard-specific) */}
				<Tooltip text={t("Quick Actions") as string}>
					<button className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs" aria-label="Quick Actions">
						{t("Quick Actions")}
					</button>
				</Tooltip>
			</div>
		</nav>
	);
};

export default DashboardTopbar;
// (Move the full contents of DashboardTopbar.tsx here)
