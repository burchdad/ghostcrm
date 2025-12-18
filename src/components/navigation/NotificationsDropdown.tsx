"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, X, Settings, Trash2 } from "lucide-react";
import { useI18n } from "@/components/utils/I18nProvider";

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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-blue-600 bg-blue-50';
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
    <div className="relative">
      <button 
        className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 transform hover:scale-105 group"
        onClick={() => setOpen(!open)}
        aria-label={t("notifications", "accessibility")}
      >
        <Bell className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-red-600 rounded-full text-xs text-white flex items-center justify-center font-medium shadow-lg animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop to close dropdown when clicking outside */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setOpen(false)}
          />
          <div className="fixed top-16 right-8 w-96 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 max-h-96 overflow-hidden backdrop-blur-sm">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Bell className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{t("notifications", "features")}</h3>
                  {unreadCount > 0 && (
                    <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-red-100 to-red-200 text-red-700 rounded-full text-xs font-medium mt-1 shadow-sm">
                      {unreadCount} {t("new", "common")}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      markAllAsRead();
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:bg-blue-100 px-3 py-1 rounded-lg transition-colors duration-200"
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
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  title={t("notification_settings", "accessibility")}
                >
                  <Settings className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>{t("no_notifications", "notifications")}</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${getTypeColor(notification.type)}`}>
                      {getTypeIcon(notification.type)}
                    </div>
                    <div 
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        markAsRead(notification.id);
                        // Here you could add navigation logic based on notification type
                        // For example: router.push(`/leads/${notification.leadId}`);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <h4 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
                    </div>
                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors group"
                      title={t("Delete notification", "actions") || "Delete notification"}
                      aria-label={t("Delete notification", "actions") || "Delete notification"}
                    >
                      <Trash2 className="w-4 h-4 transition-transform group-hover:scale-110" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => {
                setOpen(false);
                router.push('/notifications');
              }}
              className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {t("view_all_notifications", "actions")}
            </button>
          </div>
        </div>
        </>
      )}
    </div>
  );
}