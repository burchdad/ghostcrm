"use client";
import React, { useRef, useEffect } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  stackIndex?: number;
}

export function Modal({ open, onClose, title, children, footer, stackIndex = 0 }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus trap and keyboard navigation
  useEffect(() => {
    if (open) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      if (modalRef.current) {
        modalRef.current.focus();
      }
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = 'unset';
    }
    
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    
    // Cleanup function
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = 'unset';
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className={`fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 animate-fadeIn p-4`} role="dialog" aria-modal="true" style={{ zIndex: 50 + stackIndex }}>
      <div
        ref={modalRef}
        tabIndex={-1}
        className="bg-white rounded-xl shadow-lg p-6 w-full relative animate-slideUp focus:outline-none flex flex-col max-h-full overflow-hidden"
        style={{ maxWidth: children ? 'none' : '28rem' }} // Allow custom sizing if children need it
        aria-label="Modal Dialog"
      >
        {title && <h3 className="font-bold text-lg mb-2">{title}</h3>}
        <button className="absolute top-2 right-2 px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors" onClick={onClose} aria-label="Close Modal">✕</button>
        <div className="flex-1 overflow-auto">{children}</div>
        {footer && <div className="mt-4 flex-shrink-0">{footer}</div>}
      </div>
    </div>
  );
}
