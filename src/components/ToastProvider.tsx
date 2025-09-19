"use client";
import React, { createContext, useContext, useState } from "react";

interface Toast {
  msg: string;
  type: "success" | "error" | "info";
  icon?: React.ReactNode;
  action?: { label: string; onClick: () => void };
}

const ToastContext = createContext({
  show: (msg: string, type?: "success" | "error" | "info", icon?: React.ReactNode, action?: { label: string; onClick: () => void }) => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children, position = "bottom-right" }: { children: React.ReactNode; position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const show = (msg: string, type: "success" | "error" | "info" = "info", icon?: React.ReactNode, action?: { label: string; onClick: () => void }) => {
    setToasts(t => [...t, { msg, type, icon, action }]);
    setTimeout(() => setToasts(t => t.slice(1)), 3000);
  };
  const posClass = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
  }[position];
  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className={`fixed ${posClass} z-50 flex flex-col gap-2`} aria-live="polite" aria-atomic="true">
        {toasts.map((t, i) => (
          <div key={i} className={`px-4 py-2 rounded shadow text-white flex items-center gap-2 ${t.type === "success" ? "bg-green-500" : t.type === "error" ? "bg-red-500" : "bg-blue-500"}`}>
            {t.icon && <span>{t.icon}</span>}
            <span>{t.msg}</span>
            {t.action && <button className="ml-2 px-2 py-1 bg-white text-xs text-blue-700 rounded" onClick={t.action.onClick}>{t.action.label}</button>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
