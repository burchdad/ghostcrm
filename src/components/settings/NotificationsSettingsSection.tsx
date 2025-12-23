import React, { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, Smartphone, TestTube, Check, X, AlertCircle, Send } from 'lucide-react';

interface NotificationPreferences {
  emailNotifications: {
    enabled: boolean;
    newLeads: boolean;
    leadUpdates: boolean;
    dealClosed: boolean;
    taskReminders: boolean;
    systemAlerts: boolean;
    dailyDigest: boolean;
    weeklyReports: boolean;
  };
  smsNotifications: {
    enabled: boolean;
    phoneNumber: string;
    urgentAlertsOnly: boolean;
  };
  pushNotifications: {
    enabled: boolean;
    browser: boolean;
    mobile: boolean;
  };
}

interface TestNotification {
  type: string;
  name: string;
  description: string;
  channels: string[];
  priority: string;
}

const NotificationsSettingsSection: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testNotifications, setTestNotifications] = useState<TestNotification[]>([]);
  const [sendingTest, setSendingTest] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Load notification preferences
  useEffect(() => {
    loadPreferences();
    loadTestNotifications();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/notification-preferences', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setPreferences(data.preferences);
      } else {
        console.error('Failed to load preferences');
        showMessage('error', 'Failed to load notification preferences');
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      showMessage('error', 'Error loading notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const loadTestNotifications = async () => {
    try {
      const response = await fetch('/api/notifications/test', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setTestNotifications(data.availableTests);
      }
    } catch (error) {
      console.error('Error loading test notifications:', error);
    }
  };

  const savePreferences = async () => {
    if (!preferences || !hasChanges) return;

    try {
      setSaving(true);
      const response = await fetch('/api/user/notification-preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ preferences })
      });

      if (response.ok) {
        const data = await response.json();
        showMessage('success', 'Notification preferences saved successfully!');
        setHasChanges(false);
      } else {
        const error = await response.json();
        showMessage('error', error.message || 'Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      showMessage('error', 'Error saving notification preferences');
    } finally {
      setSaving(false);
    }
  };

  const sendTestNotification = async (notificationType: string) => {
    try {
      setSendingTest(notificationType);
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ notificationType })
      });

      const data = await response.json();
      
      if (response.ok) {
        showMessage('success', data.message || 'Test notification sent successfully!');
      } else {
        showMessage('error', data.message || 'Failed to send test notification');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      showMessage('error', 'Error sending test notification');
    } finally {
      setSendingTest(null);
    }
  };

  const updatePreferences = (section: keyof NotificationPreferences, field: string, value: any) => {
    if (!preferences) return;

    setPreferences(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      };
    });
    setHasChanges(true);
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  if (loading) {
    return (
      <div className="settings-section">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading notification preferences...</p>
        </div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="settings-section">
        <div className="error-container">
          <AlertCircle size={48} />
          <h3>Unable to Load Preferences</h3>
          <p>There was an error loading your notification preferences. Please try refreshing the page.</p>
          <button onClick={loadPreferences} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-section">
      <div className="section-header">
        <h3 className="section-title">
          <Bell size={24} />
          Notification Preferences
        </h3>
        <p className="section-description">
          Control how and when you receive notifications from GhostCRM. Changes are saved automatically.
        </p>
        
        {hasChanges && (
          <div className="changes-indicator">
            <button 
              onClick={savePreferences} 
              disabled={saving}
              className="save-changes-btn"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          {message.type === 'success' ? <Check size={16} /> : <X size={16} />}
          {message.text}
        </div>
      )}

      {/* Email Notifications */}
      <div className="notification-category">
        <div className="category-header">
          <Mail size={20} />
          <h4>Email Notifications</h4>
        </div>
        
        <div className="notification-item master-toggle">
          <div className="notification-info">
            <span className="notification-title">Enable Email Notifications</span>
            <p className="notification-description">Master control for all email notifications</p>
          </div>
          <label className="toggle-container">
            <input
              type="checkbox"
              checked={preferences.emailNotifications.enabled}
              onChange={(e) => updatePreferences('emailNotifications', 'enabled', e.target.checked)}
              className="toggle-input"
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        {preferences.emailNotifications.enabled && (
          <div className="sub-options">
            {Object.entries(preferences.emailNotifications).filter(([key]) => key !== 'enabled').map(([key, value]) => (
              <div key={key} className="notification-item">
                <div className="notification-info">
                  <span className="notification-title">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </span>
                  <p className="notification-description">
                    {key === 'newLeads' && 'Get notified when new leads are assigned to you'}
                    {key === 'leadUpdates' && 'Receive updates when lead status changes'}
                    {key === 'dealClosed' && 'Celebrate when deals are successfully closed'}
                    {key === 'taskReminders' && 'Reminders for upcoming tasks and appointments'}
                    {key === 'systemAlerts' && 'Important system updates and security alerts'}
                    {key === 'dailyDigest' && 'Daily summary of your activities and performance'}
                    {key === 'weeklyReports' && 'Weekly performance reports and analytics'}
                  </p>
                </div>
                <label className="toggle-container">
                  <input
                    type="checkbox"
                    checked={value as boolean}
                    onChange={(e) => updatePreferences('emailNotifications', key, e.target.checked)}
                    className="toggle-input"
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SMS Notifications */}
      <div className="notification-category">
        <div className="category-header">
          <MessageSquare size={20} />
          <h4>SMS Notifications</h4>
        </div>
        
        <div className="notification-item master-toggle">
          <div className="notification-info">
            <span className="notification-title">Enable SMS Notifications</span>
            <p className="notification-description">Receive text messages for urgent notifications</p>
          </div>
          <label className="toggle-container">
            <input
              type="checkbox"
              checked={preferences.smsNotifications.enabled}
              onChange={(e) => updatePreferences('smsNotifications', 'enabled', e.target.checked)}
              className="toggle-input"
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        {preferences.smsNotifications.enabled && (
          <div className="sub-options">
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                value={preferences.smsNotifications.phoneNumber}
                onChange={(e) => updatePreferences('smsNotifications', 'phoneNumber', e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="form-input"
              />
              <small className="form-hint">Include country code for international numbers</small>
            </div>
            
            <div className="notification-item">
              <div className="notification-info">
                <span className="notification-title">Urgent Alerts Only</span>
                <p className="notification-description">Only send SMS for high-priority and critical notifications</p>
              </div>
              <label className="toggle-container">
                <input
                  type="checkbox"
                  checked={preferences.smsNotifications.urgentAlertsOnly}
                  onChange={(e) => updatePreferences('smsNotifications', 'urgentAlertsOnly', e.target.checked)}
                  className="toggle-input"
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Push Notifications */}
      <div className="notification-category">
        <div className="category-header">
          <Smartphone size={20} />
          <h4>Push Notifications</h4>
        </div>
        
        <div className="notification-item master-toggle">
          <div className="notification-info">
            <span className="notification-title">Enable Push Notifications</span>
            <p className="notification-description">Real-time browser and mobile notifications</p>
          </div>
          <label className="toggle-container">
            <input
              type="checkbox"
              checked={preferences.pushNotifications.enabled}
              onChange={(e) => updatePreferences('pushNotifications', 'enabled', e.target.checked)}
              className="toggle-input"
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        {preferences.pushNotifications.enabled && (
          <div className="sub-options">
            <div className="notification-item">
              <div className="notification-info">
                <span className="notification-title">Browser Notifications</span>
                <p className="notification-description">Desktop notifications in your web browser</p>
              </div>
              <label className="toggle-container">
                <input
                  type="checkbox"
                  checked={preferences.pushNotifications.browser}
                  onChange={(e) => updatePreferences('pushNotifications', 'browser', e.target.checked)}
                  className="toggle-input"
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            
            <div className="notification-item">
              <div className="notification-info">
                <span className="notification-title">Mobile Notifications</span>
                <p className="notification-description">Push notifications to your mobile device</p>
              </div>
              <label className="toggle-container">
                <input
                  type="checkbox"
                  checked={preferences.pushNotifications.mobile}
                  onChange={(e) => updatePreferences('pushNotifications', 'mobile', e.target.checked)}
                  className="toggle-input"
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Test Notifications */}
      <div className="notification-category">
        <div className="category-header">
          <TestTube size={20} />
          <h4>Test Notifications</h4>
        </div>
        <p className="category-description">
          Send test notifications to verify your settings are working correctly.
        </p>
        
        <div className="test-notifications-grid">
          {testNotifications.map((test) => (
            <div key={test.type} className="test-notification-card">
              <div className="test-info">
                <h5>{test.name}</h5>
                <p>{test.description}</p>
                <div className="test-channels">
                  <span className="channels-label">Channels:</span>
                  {test.channels.map((channel) => (
                    <span key={channel} className={`channel-tag ${channel}`}>
                      {channel}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => sendTestNotification(test.type)}
                disabled={sendingTest === test.type}
                className="test-btn"
              >
                {sendingTest === test.type ? (
                  <div className="spinner"></div>
                ) : (
                  <Send size={16} />
                )}
                {sendingTest === test.type ? 'Sending...' : 'Send Test'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationsSettingsSection;