// components/ui/Modal.tsx
"use client";
import React, { useEffect, useRef } from "react";

/**
 * Accessible, focus-trapped modal with ESC-to-close and click-outside.
 * No Tailwind. Use modal.css provided below.
 */
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  ariaLabel?: string;      // alternative to title for screen readers
  children: React.ReactNode;
  width?: number | string; // e.g. 960 or "72rem"
  maxHeight?: number | string; // e.g. "90vh"
  initialFocusSelector?: string; // optional CSS selector to focus on open
}

export default function Modal({
  isOpen,
  onClose,
  title,
  ariaLabel,
  children,
  width = "min(1024px, 92vw)",
  maxHeight = "90vh",
  initialFocusSelector
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Lock scroll while open
  useEffect(() => {
    if (!isOpen) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [isOpen]);

  // Focus management
  useEffect(() => {
    if (!isOpen) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;

    // focus the first interactive element
    const root = panelRef.current!;
    const first =
      (initialFocusSelector && root.querySelector(initialFocusSelector)) ||
      root.querySelector<HTMLElement>(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
      );
    if (first) (first as HTMLElement).focus();

    return () => {
      previouslyFocused.current?.focus?.();
    };
  }, [isOpen, initialFocusSelector]);

  // ESC to close
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") trapFocus(e);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Focus trap
  const trapFocus = (e: KeyboardEvent) => {
    const root = panelRef.current!;
    const focusables = Array.from(
      root.querySelectorAll<HTMLElement>(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
      )
    ).filter(el => !el.hasAttribute("disabled"));
    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement as HTMLElement;

    if (e.shiftKey && active === first) {
      last.focus();
      e.preventDefault();
    } else if (!e.shiftKey && active === last) {
      first.focus();
      e.preventDefault();
    }
  };

  // click outside
  const onOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      onMouseDown={onOverlayClick}
    >
      <div
        ref={panelRef}
        className="modal-panel"
        style={{ width, maxHeight }}
        aria-label={ariaLabel}
        aria-labelledby={title ? "modal-title" : undefined}
      >
        {title && (
          <div className="modal-header">
            <h2 id="modal-title" className="modal-title">{title}</h2>
            <button
              type="button"
              className="modal-close"
              aria-label="Close"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
        )}
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}