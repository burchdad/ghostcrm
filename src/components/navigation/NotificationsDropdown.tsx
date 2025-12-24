"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, X, Settings, Trash2 } from "lucide-react";
import { useI18n } from "@/components/utils/I18nProvider";
import styles from './NotificationsDropdown.module.css';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
}

export function NotificationsDropdown() {
  const router = useRouter();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([
    // No mock notifications - start with clean state
    // Real notifications will be loaded from API when implemented
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

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

  return (
    <div className={styles.container} ref={dropdownRef}>
      <button 
        ref={buttonRef}
        className={styles.triggerButton}
        onClick={() => setOpen(!open)}
        aria-label={t("notifications", "accessibility")}
      >
        <Bell className={styles.bellIcon} />
        {unreadCount > 0 && (
          <span className={styles.badge}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className={styles.dropdown}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <div className={styles.headerIcon}>
                <Bell className={styles.headerBellIcon} />
              </div>
              <div className={styles.headerText}>
                <h3 className={styles.headerTitle}>{t("notifications", "features")}</h3>
                {unreadCount > 0 && (
                  <span className={styles.headerBadge}>
                    {unreadCount} {t("new", "common")}
                  </span>
                )}
              </div>
            </div>
            <div className={styles.headerActions}>
              {unreadCount > 0 && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    markAllAsRead();
                  }}
                  className={styles.markAllButton}
                >
                  {t("mark_all_read", "actions")}
                </button>
              )}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setOpen(false);
                  router.push('/settings/notifications');
                }}
                className={styles.settingsButton}
                title={t("notification_settings", "accessibility")}
              >
                <Settings className={styles.settingsIcon} />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className={styles.notificationsList}>
            {notifications.length === 0 ? (
              <div className={styles.emptyState}>
                <Bell className={styles.emptyIcon} />
                <p className={styles.emptyText}>{t("no_notifications", "notifications")}</p>
              </div>
            ) : (
              notifications.map((notification) => (
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
                    <div 
                      className={styles.notificationBody}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        markAsRead(notification.id);
                        // Here you could add navigation logic based on notification type
                        // For example: router.push(`/leads/${notification.leadId}`);
                      }}
                    >
                      <div className={styles.notificationHeader}>
                        <h4 className={`${styles.notificationTitle} ${!notification.read ? styles.unreadTitle : styles.readTitle}`}>
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className={styles.unreadDot}></div>
                        )}
                      </div>
                      <p className={styles.notificationMessage}>{notification.message}</p>
                      <p className={styles.notificationTime}>{notification.time}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className={styles.deleteButton}
                      title={t("Delete notification", "actions") || "Delete notification"}
                      aria-label={t("Delete notification", "actions") || "Delete notification"}
                    >
                      <Trash2 className={styles.deleteIcon} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <button
              onClick={() => {
                setOpen(false);
                router.push('/notifications');
              }}
              className={styles.viewAllButton}
            >
              {t("view_all_notifications", "actions")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}