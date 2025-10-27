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
    <div className="modal-overlay" role="dialog" aria-modal="true" style={{ zIndex: 50 + stackIndex }}>
      <div
        ref={modalRef}
        tabIndex={-1}
        className="modal-content"
        style={{ maxWidth: '600px' }} // Constrain modal width for better UX
        aria-label="Modal Dialog"
      >
        {title && <h3 className="font-bold text-lg mb-2">{title}</h3>}
        <button className="modal-close-btn" onClick={onClose} aria-label="Close Modal">✕</button>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
