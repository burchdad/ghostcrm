import React from "react";

interface DashboardNotificationProps {
  notification: { type: "info" | "warning" | "error" | "success"; message: string } | null;
  setNotification: (msg: { type: "info" | "warning" | "error" | "success"; message: string } | null) => void;
}

const typeStyles = {
  info: "bg-blue-100 text-blue-700",
  warning: "bg-yellow-100 text-yellow-700",
  error: "bg-red-100 text-red-700",
  success: "bg-green-100 text-green-700"
};

const DashboardNotification: React.FC<DashboardNotificationProps> = ({ notification, setNotification }) => {
  if (!notification) return null;
  return (
    <div className={`fixed top-4 right-4 px-4 py-2 rounded shadow z-50 ${typeStyles[notification.type]}`}>
      {notification.message}
      <button className="ml-4 px-2 py-1 bg-black text-white rounded text-xs" onClick={() => setNotification(null)}>Dismiss</button>
    </div>
  );
};

export default DashboardNotification;
