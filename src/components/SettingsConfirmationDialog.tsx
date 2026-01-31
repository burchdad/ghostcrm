import React from 'react';
import { X, AlertCircle, Database, Settings } from 'lucide-react';

interface Change {
  field: string;
  from: string;
  to: string;
  table: string;
}

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  changes: Change[];
  loading?: boolean;
}

export default function SettingsConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  changes,
  loading = false
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  const organizationChanges = changes.filter(c => c.table === 'organizations');
  const settingsChanges = changes.filter(c => c.table === 'organization_settings');

  return (
    <div className="confirmation-overlay">
      <div className="confirmation-dialog">
        <div className="confirmation-header">
          <div className="confirmation-header-content">
            <AlertCircle size={24} className="confirmation-icon" />
            <div>
              <h3 className="confirmation-title">Confirm Settings Changes</h3>
              <p className="confirmation-subtitle">
                {changes.length} setting(s) will be updated in your database
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="confirmation-close"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        <div className="confirmation-content">
          {organizationChanges.length > 0 && (
            <div className="changes-section">
              <div className="changes-section-header">
                <Database size={18} />
                <h4>Organization Table Changes</h4>
              </div>
              <div className="changes-list">
                {organizationChanges.map((change, index) => (
                  <div key={index} className="change-item">
                    <div className="change-field">{change.field}</div>
                    <div className="change-values">
                      <span className="change-from">"{change.from}"</span>
                      <span className="change-arrow">→</span>
                      <span className="change-to">"{change.to}"</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {settingsChanges.length > 0 && (
            <div className="changes-section">
              <div className="changes-section-header">
                <Settings size={18} />
                <h4>Settings Table Changes</h4>
              </div>
              <div className="changes-list">
                {settingsChanges.map((change, index) => (
                  <div key={index} className="change-item">
                    <div className="change-field">{change.field}</div>
                    <div className="change-values">
                      <span className="change-from">{change.from}</span>
                      <span className="change-arrow">→</span>
                      <span className="change-to">{change.to}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {changes.length === 0 && (
            <div className="no-changes">
              <p>No changes detected in your settings.</p>
            </div>
          )}
        </div>

        <div className="confirmation-actions">
          <button
            onClick={onClose}
            className="btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="btn-primary"
            disabled={loading || changes.length === 0}
          >
            {loading ? 'Saving...' : `Confirm ${changes.length} Change${changes.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}