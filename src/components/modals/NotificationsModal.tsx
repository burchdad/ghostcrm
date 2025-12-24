"use client";
import React, { useState, useEffect } from "react";
import { Bell, X, Settings, Trash2, Check, Archive, Filter } from "lucide-react";
import { useI18n } from "@/components/utils/I18nProvider";
import styles from './NotificationsModal.module.css';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
}

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
  onClearAll: () => void;
}

export function NotificationsModal({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onClearAll
}: NotificationsModalProps) {
  const { t } = useI18n();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return styles.typeSuccess;
      case 'warning': return styles.typeWarning;
      case 'error': return styles.typeError;
      default: return styles.typeInfo;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>
              <Bell className={styles.headerBellIcon} />
            </div>
            <div className={styles.headerText}>
              <h2 className={styles.title}>
                {t("notifications", "features")}
              </h2>
              <p className={styles.subtitle}>
                {notifications.length} total, {unreadCount} unread
              </p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <button
              onClick={onClose}
              className={styles.closeButton}
              aria-label="Close notifications"
            >
              <X className={styles.closeIcon} />
            </button>
          </div>
        </div>

        {/* Filter and Actions Bar */}
        <div className={styles.actionBar}>
          <div className={styles.filterTabs}>
            <button
              onClick={() => setFilter('all')}
              className={`${styles.filterTab} ${filter === 'all' ? styles.active : ''}`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`${styles.filterTab} ${filter === 'unread' ? styles.active : ''}`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`${styles.filterTab} ${filter === 'read' ? styles.active : ''}`}
            >
              Read ({notifications.length - unreadCount})
            </button>
          </div>
          
          <div className={styles.actionButtons}>
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className={styles.actionButton}
                title="Mark all as read"
              >
                <Check className={styles.actionIcon} />
                Mark All Read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                className={`${styles.actionButton} ${styles.dangerButton}`}
                title="Clear all notifications"
              >
                <Trash2 className={styles.actionIcon} />
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className={styles.notificationsList}>
          {filteredNotifications.length === 0 ? (
            <div className={styles.emptyState}>
              <Bell className={styles.emptyIcon} />
              <h3 className={styles.emptyTitle}>
                {filter === 'all' 
                  ? "No notifications" 
                  : filter === 'unread' 
                  ? "No unread notifications" 
                  : "No read notifications"
                }
              </h3>
              <p className={styles.emptyDescription}>
                {filter === 'all' 
                  ? "You're all caught up! New notifications will appear here." 
                  : filter === 'unread' 
                  ? "All notifications have been read." 
                  : "No notifications have been read yet."
                }
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`${styles.notificationItem} ${
                  !notification.read ? styles.unread : ''
                }`}
              >
                <div className={styles.notificationContent}>
                  <div className={`${styles.typeIcon} ${getTypeColor(notification.type)}`}>
                    {getTypeIcon(notification.type)}
                  </div>
                  
                  <div className={styles.notificationBody}>
                    <div className={styles.notificationHeader}>
                      <h4 className={`${styles.notificationTitle} ${!notification.read ? styles.unreadTitle : styles.readTitle}`}>
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <div className={styles.unreadDot}></div>
                      )}
                    </div>
                    <p className={styles.notificationMessage}>
                      {notification.message}
                    </p>
                    <div className={styles.notificationFooter}>
                      <span className={styles.notificationTime}>
                        {notification.time}
                      </span>
                      <div className={styles.notificationActions}>
                        {!notification.read && (
                          <button
                            onClick={() => onMarkAsRead(notification.id)}
                            className={styles.readButton}
                            title="Mark as read"
                          >
                            <Check className={styles.readIcon} />
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteNotification(notification.id)}
                          className={styles.deleteButton}
                          title="Delete notification"
                        >
                          <Trash2 className={styles.deleteIcon} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.footerStats}>
            Showing {filteredNotifications.length} of {notifications.length} notifications
          </div>
          <button
            onClick={onClose}
            className={styles.doneButton}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}