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
    <>
      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlideIn {
          from { opacity: 0; transform: translateY(-20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .modal-container-wide {
          max-width: 98vw !important;
          width: 98% !important;
        }
      `}</style>
      <div 
        role="dialog" 
        aria-modal="true" 
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          zIndex: 50 + stackIndex,
          animation: 'modalFadeIn 0.2s ease-out',
          padding: '2rem 1rem',
          boxSizing: 'border-box',
          paddingTop: '10vh'
        }}
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
          className={size === 'max' ? 'modal-container-wide' : ''}
          style={{ 
            background: 'white',
            borderRadius: '1.5rem',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
            maxWidth: sizeStyles.maxWidth,
            width: sizeStyles.width,
            maxHeight: '80vh',
            overflow: 'auto',
            animation: 'modalSlideIn 0.3s ease-out',
            position: 'relative',
            margin: '0 auto'
          }}
          aria-label="Modal Dialog"
          onClick={(e) => {
            // Prevent closing when clicking inside the modal content
            e.stopPropagation();
          }}
        >
          {title && <h3 style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '8px' }}>{title}</h3>}
          <button 
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              color: '#666',
              zIndex: 10
            }}
            onClick={onClose} 
            aria-label="Close Modal"
          >✕</button>
          <div style={{ padding: '0' }}>{children}</div>
          {footer && <div style={{ padding: '1rem', paddingTop: 0 }}>{footer}</div>}
        </div>
      </div>
    </>)
  );
}

export { Modal };
export default Modal;
