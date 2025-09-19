"use client";
import React, { useRef, useEffect } from "react";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  nested?: boolean;
}

export function Drawer({ open, onClose, children, header, footer, nested }: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Focus trap
  useEffect(() => {
    if (open && drawerRef.current) {
      drawerRef.current.focus();
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Swipe-to-close for mobile
  useEffect(() => {
    let startX = 0;
    function onTouchStart(e: TouchEvent) {
      startX = e.touches[0].clientX;
    }
    function onTouchEnd(e: TouchEvent) {
      const endX = e.changedTouches[0].clientX;
      if (startX - endX > 80) onClose();
    }
    if (open && drawerRef.current) {
      const el = drawerRef.current;
      el.addEventListener("touchstart", onTouchStart);
      el.addEventListener("touchend", onTouchEnd);
      return () => {
        el.removeEventListener("touchstart", onTouchStart);
        el.removeEventListener("touchend", onTouchEnd);
      };
    }
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className={`fixed inset-0 z-50 flex ${nested ? 'pl-80' : ''}`} role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black bg-opacity-40 transition-opacity duration-300" onClick={onClose} aria-label="Close Drawer" />
      <div
        ref={drawerRef}
        tabIndex={-1}
        className="relative w-80 bg-white h-full shadow-xl animate-slideInLeft flex flex-col focus:outline-none"
        aria-label="Sidebar Drawer"
      >
        {header && <div className="p-4 border-b font-bold text-lg">{header}</div>}
        <button className="absolute top-2 right-2 px-2 py-1 bg-gray-200 rounded" onClick={onClose} aria-label="Close Drawer">✕</button>
        <div className="flex-1 overflow-y-auto">{children}</div>
        {footer && <div className="p-4 border-t">{footer}</div>}
      </div>
    </div>
  );
}
