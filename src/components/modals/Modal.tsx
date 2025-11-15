"use client";
import React, { useRef, useEffect } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  stackIndex?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'max' | 'ultra';
}

export function Modal({ open, onClose, title, children, footer, stackIndex = 0, size = 'md' }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Define modal sizes
  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm':
        return { maxWidth: '400px', width: '90%' };
      case 'md':
        return { maxWidth: '600px', width: '90%' };
      case 'lg':
        return { maxWidth: '900px', width: '95%' };
      case 'xl':
        return { maxWidth: '1200px', width: '95%' };
      case '2xl':
        return { maxWidth: '1400px', width: '95%' };
      case 'full':
        return { maxWidth: '95vw', width: '95%' };
      case 'max':
        return { maxWidth: '98vw', width: '98%' };
      case 'ultra':
        return { maxWidth: 'calc(100vw - 40px)', width: 'calc(100% - 40px)' };
      default:
        return { maxWidth: '600px', width: '90%' };
    }
  };

  const sizeStyles = getSizeClasses(size);

  // Focus trap and keyboard navigation
  useEffect(() => {
    if (open) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      if (modalRef.current) {
        modalRef.current.focus();
      }
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    
    // Cleanup function
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div 
      className="modal-overlay" 
      role="dialog" 
      aria-modal="true" 
      style={{ zIndex: 50 + stackIndex }}
      onClick={(e) => {
        // Close modal when clicking on the overlay (background)
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="modal-container"
        style={{ 
          maxWidth: sizeStyles.maxWidth,
          width: sizeStyles.width,
          maxHeight: '90vh',
          margin: 'auto'
        }}
        aria-label="Modal Dialog"
        onClick={(e) => {
          // Prevent closing when clicking inside the modal content
          e.stopPropagation();
        }}
      >
        {title && <h3 className="font-bold text-lg mb-2">{title}</h3>}
        <button className="modal-close-btn" onClick={onClose} aria-label="Close Modal">✕</button>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
