import React from "react";

interface ActivityLogProps {
  collabActivity: any[];
  setCollabActivity: (activity: any[]) => void;
  activityLogFilter: string;
  setActivityLogFilter: (filter: string) => void;
}

const ActivityLog: React.FC<ActivityLogProps> = ({
  collabActivity,
  setCollabActivity,
  activityLogFilter,
  setActivityLogFilter
}) => {
  return (
    <div className="mb-4 p-2 border rounded bg-gray-50">
      <div className="font-semibold mb-2">Activity Log Filter & Export</div>
      <input type="text" placeholder="Filter by action/user..." value={activityLogFilter} onChange={e => setActivityLogFilter(e.target.value)} className="border rounded px-2 py-1 mr-2" />
      <button className="px-2 py-1 bg-green-500 text-white rounded mr-2" onClick={() => {
        fetch(`/api/collab/export?user_id=demo&dashboard_id=main&filter=${encodeURIComponent(activityLogFilter)}`)
          .then(res => res.blob())
          .then(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "activity_log.csv";
            a.click();
            URL.revokeObjectURL(url);
          });
      }}>Export CSV</button>
      <ul className="text-xs mt-2">
        {collabActivity.map((a, idx) => (
          <li key={idx} className="mb-1">{a.action} {a.target || a.source || a.item_type} {a.item_id ? `(${a.item_id})` : ""} @ {a.created_at}</li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityLog;
