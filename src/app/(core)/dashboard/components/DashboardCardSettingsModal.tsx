"use client";
import React from "react";
import { Modal } from "@/components/modals/Modal";

interface DashboardCardSettingsModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  cardSettings: any;
  onSettingsChange: (setting: string, value: any) => void;
  themeColors: any;
  cardType: 'analytics' | 'outreach' | 'metrics' | 'inventory';
}

export default function DashboardCardSettingsModal({
  open,
  onClose,
  title,
  cardSettings,
  onSettingsChange,
  themeColors,
  cardType
}: DashboardCardSettingsModalProps) {

  // Common theme options for all cards
  const themeOptions = [
    { value: "orange", label: "🟠 Orange" },
    { value: "blue", label: "🔵 Blue" },
    { value: "green", label: "🟢 Green" },
    { value: "purple", label: "🟣 Purple" },
    { value: "pink", label: "🩷 Pink" },
    { value: "gray", label: "⚫ Gray" }
  ];

  const borderStyleOptions = [
    { value: "solid", label: "━ Solid" },
    { value: "dashed", label: "┅ Dashed" },
    { value: "dotted", label: "⋯ Dotted" },
    { value: "gradient", label: "🌈 Gradient" }
  ];

  // Card-specific settings configurations
  const getCardSpecificSettings = () => {
    switch (cardType) {
      case 'analytics':
        return {
          title: 'Campaign Analytics Settings',
          sections: [
            {
              id: 'campaign-display',
              title: 'Campaign Display Options',
              icon: '📊',
              settings: [
                { type: 'checkbox', key: 'showCampaignNames', label: 'Show Campaign Names', default: true },
                { type: 'checkbox', key: 'showPerformanceMetrics', label: 'Show Performance Metrics', default: true },
                { type: 'checkbox', key: 'showConversionRates', label: 'Show Conversion Rates', default: true },
                { type: 'checkbox', key: 'showErrorRates', label: 'Show Error Rates', default: false },
                { type: 'checkbox', key: 'showCampaignDates', label: 'Show Campaign Dates', default: true },
                { type: 'checkbox', key: 'showProgressBars', label: 'Show Progress Bars', default: true },
                { type: 'checkbox', key: 'showTrendIndicators', label: 'Show Trend Indicators', default: false }
              ]
            },
            {
              id: 'performance-alerts',
              title: 'Performance Alerts',
              icon: '🚨',
              settings: [
                { type: 'checkbox', key: 'enablePerformanceAlerts', label: 'Enable Performance Alerts', default: false },
                { 
                  type: 'number', 
                  key: 'lowPerformanceThreshold', 
                  label: 'Low Performance Alert (%)', 
                  min: 1, 
                  max: 50, 
                  default: 20 
                },
                { 
                  type: 'number', 
                  key: 'highErrorThreshold', 
                  label: 'High Error Rate Alert (%)', 
                  min: 1, 
                  max: 25, 
                  default: 10 
                },
                { type: 'checkbox', key: 'emailAlerts', label: 'Send Email Alerts', default: false }
              ]
            },
            {
              id: 'campaign-filters',
              title: 'Campaign Filters',
              icon: '🔍',
              settings: [
                { 
                  type: 'select', 
                  key: 'campaignStatus', 
                  label: 'Campaign Status', 
                  options: [
                    { value: 'all', label: 'All Campaigns' },
                    { value: 'active', label: 'Active Only' },
                    { value: 'paused', label: 'Paused Only' },
                    { value: 'completed', label: 'Completed Only' }
                  ],
                  default: 'all'
                },
                { 
                  type: 'select', 
                  key: 'performanceFilter', 
                  label: 'Performance Filter', 
                  options: [
                    { value: 'all', label: 'All Performance' },
                    { value: 'high', label: 'High Performing (>80%)' },
                    { value: 'medium', label: 'Medium Performing (50-80%)' },
                    { value: 'low', label: 'Low Performing (<50%)' }
                  ],
                  default: 'all'
                }
              ]
            },
            {
              id: 'campaign-columns',
              title: 'Table Columns',
              icon: '�',
              settings: [
                { type: 'checkbox', key: 'showSentColumn', label: 'Sent Count', default: true },
                { type: 'checkbox', key: 'showOpenedColumn', label: 'Opened Count', default: true },
                { type: 'checkbox', key: 'showClickedColumn', label: 'Clicked Count', default: true },
                { type: 'checkbox', key: 'showCalledColumn', label: 'Called Count', default: false },
                { type: 'checkbox', key: 'showConvertedColumn', label: 'Converted Count', default: true },
                { type: 'checkbox', key: 'showErrorColumn', label: 'Error Count', default: false }
              ]
            },
            {
              id: 'campaign-sorting',
              title: 'Sorting & Grouping',
              icon: '🔄',
              settings: [
                { 
                  type: 'select', 
                  key: 'sortBy', 
                  label: 'Sort By', 
                  options: [
                    { value: 'name', label: 'Campaign Name' },
                    { value: 'sent', label: 'Sent Count' },
                    { value: 'conversion', label: 'Conversion Rate' },
                    { value: 'date', label: 'Date Created' },
                    { value: 'performance', label: 'Performance Score' }
                  ],
                  default: 'name'
                },
                { 
                  type: 'select', 
                  key: 'sortOrder', 
                  label: 'Sort Order', 
                  options: [
                    { value: 'asc', label: 'Ascending' },
                    { value: 'desc', label: 'Descending' }
                  ],
                  default: 'asc'
                },
                { type: 'checkbox', key: 'groupByCampaignType', label: 'Group by Campaign Type', default: false },
                { type: 'checkbox', key: 'groupByStatus', label: 'Group by Status', default: false }
              ]
            },
            {
              id: 'analytics-export',
              title: 'Export & Reporting',
              icon: '📄',
              settings: [
                { type: 'checkbox', key: 'enableQuickExport', label: 'Enable Quick Export', default: true },
                { 
                  type: 'select', 
                  key: 'defaultExportFormat', 
                  label: 'Default Export Format', 
                  options: [
                    { value: 'csv', label: 'CSV Format' },
                    { value: 'excel', label: 'Excel Format' },
                    { value: 'pdf', label: 'PDF Report' }
                  ],
                  default: 'csv'
                },
                { type: 'checkbox', key: 'includeCharts', label: 'Include Charts in Reports', default: false },
                { type: 'checkbox', key: 'autoScheduleReports', label: 'Auto-Schedule Reports', default: false }
              ]
            },
            {
              id: 'advanced-analytics',
              title: 'Advanced Analytics',
              icon: '🔬',
              settings: [
                { type: 'checkbox', key: 'enablePredictiveAnalytics', label: 'Enable Predictive Analytics', default: false },
                { type: 'checkbox', key: 'showAnomalyDetection', label: 'Show Anomaly Detection', default: false },
                { type: 'checkbox', key: 'enableABTesting', label: 'Enable A/B Testing Insights', default: false },
                { 
                  type: 'select', 
                  key: 'analyticsComplexity', 
                  label: 'Analytics Complexity', 
                  options: [
                    { value: 'basic', label: 'Basic Metrics' },
                    { value: 'standard', label: 'Standard Analytics' },
                    { value: 'advanced', label: 'Advanced Analytics' },
                    { value: 'expert', label: 'Expert Mode' }
                  ],
                  default: 'standard'
                }
              ]
            }
          ]
        };
      case 'outreach':
        return {
          title: 'Outreach Feed Settings',
          sections: [
            {
              id: 'outreach-channels',
              title: 'Communication Channels',
              icon: '📡',
              settings: [
                { type: 'checkbox', key: 'showEmailEvents', label: 'Email Events', default: true },
                { type: 'checkbox', key: 'showSMSEvents', label: 'SMS Events', default: true },
                { type: 'checkbox', key: 'showLinkedInEvents', label: 'LinkedIn Events', default: false },
                { type: 'checkbox', key: 'showPhoneEvents', label: 'Phone Call Events', default: true }
              ]
            },
            {
              id: 'outreach-status',
              title: 'Event Status Filters',
              icon: '🚦',
              settings: [
                { type: 'checkbox', key: 'showSentEvents', label: 'Sent Events', default: true },
                { type: 'checkbox', key: 'showDeliveredEvents', label: 'Delivered Events', default: true },
                { type: 'checkbox', key: 'showOpenedEvents', label: 'Opened Events', default: true },
                { type: 'checkbox', key: 'showClickedEvents', label: 'Clicked Events', default: true },
                { type: 'checkbox', key: 'showRepliedEvents', label: 'Replied Events', default: true },
                { type: 'checkbox', key: 'showFailedEvents', label: 'Failed Events', default: false }
              ]
            },
            {
              id: 'outreach-limits',
              title: 'Feed Display Limits',
              icon: '📊',
              settings: [
                { 
                  type: 'select', 
                  key: 'maxEvents', 
                  label: 'Max Events to Show', 
                  options: [
                    { value: '25', label: '25 Events' },
                    { value: '50', label: '50 Events' },
                    { value: '100', label: '100 Events' },
                    { value: '250', label: '250 Events' }
                  ],
                  default: '50'
                },
                { 
                  type: 'select', 
                  key: 'timeRange', 
                  label: 'Time Range', 
                  options: [
                    { value: '1h', label: 'Last Hour' },
                    { value: '6h', label: 'Last 6 Hours' },
                    { value: '24h', label: 'Last 24 Hours' },
                    { value: '7d', label: 'Last 7 Days' }
                  ],
                  default: '24h'
                }
              ]
            },
            {
              id: 'outreach-notifications',
              title: 'Real-time Notifications',
              icon: '🔔',
              settings: [
                { type: 'checkbox', key: 'enableSoundAlerts', label: 'Sound Alerts', default: false },
                { type: 'checkbox', key: 'enablePopupNotifications', label: 'Popup Notifications', default: true },
                { type: 'checkbox', key: 'highlightNewEvents', label: 'Highlight New Events', default: true },
                { type: 'checkbox', key: 'desktopNotifications', label: 'Desktop Notifications', default: false },
                { 
                  type: 'select', 
                  key: 'notificationSound', 
                  label: 'Notification Sound', 
                  options: [
                    { value: 'gentle', label: '🔔 Gentle Chime' },
                    { value: 'standard', label: '📢 Standard Beep' },
                    { value: 'urgent', label: '🚨 Urgent Alert' },
                    { value: 'custom', label: '🎵 Custom Sound' }
                  ],
                  default: 'gentle'
                }
              ]
            },
            {
              id: 'outreach-automation',
              title: 'Automation Rules',
              icon: '🤖',
              settings: [
                { type: 'checkbox', key: 'autoMarkAsRead', label: 'Auto-mark Events as Read', default: false },
                { type: 'checkbox', key: 'autoFollowUp', label: 'Auto Follow-up Suggestions', default: true },
                { type: 'checkbox', key: 'smartPrioritization', label: 'Smart Event Prioritization', default: false },
                { 
                  type: 'number', 
                  key: 'autoArchiveAfterDays', 
                  label: 'Auto-archive Events After (days)', 
                  min: 1, 
                  max: 90, 
                  default: 30 
                }
              ]
            },
            {
              id: 'outreach-integration',
              title: 'Platform Integration',
              icon: '🔗',
              settings: [
                { type: 'checkbox', key: 'syncWithCRM', label: 'Sync with CRM System', default: true },
                { type: 'checkbox', key: 'syncWithCalendar', label: 'Sync with Calendar', default: false },
                { type: 'checkbox', key: 'enableSlackIntegration', label: 'Enable Slack Integration', default: false },
                { type: 'checkbox', key: 'enableTeamsIntegration', label: 'Enable Teams Integration', default: false }
              ]
            }
          ]
        };
      case 'inventory':
        return {
          title: 'Inventory Overview Settings',
          sections: [
            {
              id: 'inventory-categories',
              title: 'Product Categories',
              icon: '📦',
              settings: [
                { type: 'checkbox', key: 'showSoftwareItems', label: 'Software Products', default: true },
                { type: 'checkbox', key: 'showServiceItems', label: 'Service Items', default: true },
                { type: 'checkbox', key: 'showEducationItems', label: 'Education/Training', default: true },
                { type: 'checkbox', key: 'showSupportItems', label: 'Support Items', default: true }
              ]
            },
            {
              id: 'inventory-status',
              title: 'Stock Status Filters',
              icon: '📊',
              settings: [
                { type: 'checkbox', key: 'showInStock', label: 'In Stock Items', default: true },
                { type: 'checkbox', key: 'showLowStock', label: 'Low Stock Items', default: true },
                { type: 'checkbox', key: 'showOutOfStock', label: 'Out of Stock Items', default: false }
              ]
            },
            {
              id: 'inventory-thresholds',
              title: 'Stock Alert Thresholds',
              icon: '⚠️',
              settings: [
                { 
                  type: 'number', 
                  key: 'lowStockThreshold', 
                  label: 'Low Stock Alert (units)', 
                  min: 1, 
                  max: 100, 
                  default: 20 
                },
                { 
                  type: 'number', 
                  key: 'criticalStockThreshold', 
                  label: 'Critical Stock Alert (units)', 
                  min: 1, 
                  max: 50, 
                  default: 5 
                }
              ]
            },
            {
              id: 'inventory-display',
              title: 'Display Options',
              icon: '🖥️',
              settings: [
                { type: 'checkbox', key: 'showItemValues', label: 'Show Item Values', default: true },
                { type: 'checkbox', key: 'showReservedCounts', label: 'Show Reserved Quantities', default: true },
                { type: 'checkbox', key: 'showAvailableCounts', label: 'Show Available Quantities', default: true },
                { type: 'checkbox', key: 'groupByCategory', label: 'Group by Category', default: false }
              ]
            },
            {
              id: 'inventory-sorting',
              title: 'Sorting Options',
              icon: '🔢',
              settings: [
                { 
                  type: 'select', 
                  key: 'sortBy', 
                  label: 'Sort By', 
                  options: [
                    { value: 'name', label: 'Item Name' },
                    { value: 'quantity', label: 'Total Quantity' },
                    { value: 'available', label: 'Available Quantity' },
                    { value: 'value', label: 'Item Value' },
                    { value: 'category', label: 'Category' },
                    { value: 'lastUpdated', label: 'Last Updated' }
                  ],
                  default: 'name'
                },
                { type: 'checkbox', key: 'enableDragAndDrop', label: 'Enable Drag & Drop Sorting', default: false }
              ]
            },
            {
              id: 'inventory-automation',
              title: 'Inventory Automation',
              icon: '⚙️',
              settings: [
                { type: 'checkbox', key: 'autoReorderWhenLow', label: 'Auto-reorder When Low Stock', default: false },
                { type: 'checkbox', key: 'predictiveStocking', label: 'Predictive Stock Management', default: false },
                { type: 'checkbox', key: 'autoUpdatePricing', label: 'Auto-update Pricing', default: false },
                { 
                  type: 'number', 
                  key: 'reorderBuffer', 
                  label: 'Reorder Buffer (days)', 
                  min: 1, 
                  max: 30, 
                  default: 7 
                }
              ]
            },
            {
              id: 'inventory-reports',
              title: 'Inventory Reports',
              icon: '📊',
              settings: [
                { type: 'checkbox', key: 'enableStockReports', label: 'Enable Stock Reports', default: true },
                { type: 'checkbox', key: 'trackInventoryHistory', label: 'Track Inventory History', default: false },
                { type: 'checkbox', key: 'generateUsageAnalytics', label: 'Generate Usage Analytics', default: false },
                { 
                  type: 'select', 
                  key: 'reportFrequency', 
                  label: 'Report Frequency', 
                  options: [
                    { value: 'daily', label: 'Daily Reports' },
                    { value: 'weekly', label: 'Weekly Reports' },
                    { value: 'monthly', label: 'Monthly Reports' },
                    { value: 'quarterly', label: 'Quarterly Reports' }
                  ],
                  default: 'weekly'
                }
              ]
            },
            {
              id: 'inventory-integrations',
              title: 'System Integrations',
              icon: '🔌',
              settings: [
                { type: 'checkbox', key: 'syncWithAccounting', label: 'Sync with Accounting System', default: false },
                { type: 'checkbox', key: 'syncWithEcommerce', label: 'Sync with E-commerce Platform', default: false },
                { type: 'checkbox', key: 'enableBarcodeScanning', label: 'Enable Barcode Scanning', default: false },
                { type: 'checkbox', key: 'apiWebhooks', label: 'Enable API Webhooks', default: false }
              ]
            }
          ]
        };
      case 'metrics':
        return {
          title: 'Combined Metrics Settings',
          sections: [
            {
              id: 'metrics-visibility',
              title: 'Metric Visibility',
              icon: '📈',
              settings: [
                { type: 'checkbox', key: 'showMessages', label: 'Messages Count', default: true },
                { type: 'checkbox', key: 'showAIAlerts', label: 'AI Alerts Count', default: true },
                { type: 'checkbox', key: 'showTotalLeads', label: 'Total Leads', default: true },
                { type: 'checkbox', key: 'showOrgScore', label: 'Organization Score', default: true },
                { type: 'checkbox', key: 'showRevenue', label: 'Revenue Metrics', default: false },
                { type: 'checkbox', key: 'showActiveDeals', label: 'Active Deals', default: false },
                { type: 'checkbox', key: 'showConversionRate', label: 'Conversion Rate', default: false },
                { type: 'checkbox', key: 'showTeamMembers', label: 'Team Members', default: false }
              ]
            },
            {
              id: 'metrics-colors',
              title: 'Metric Color Themes',
              icon: '🎨',
              settings: [
                { 
                  type: 'select', 
                  key: 'messagesColor', 
                  label: 'Messages Color', 
                  options: [
                    { value: 'green', label: '🟢 Green' },
                    { value: 'blue', label: '🔵 Blue' },
                    { value: 'orange', label: '🟠 Orange' },
                    { value: 'purple', label: '🟣 Purple' }
                  ],
                  default: 'green'
                },
                { 
                  type: 'select', 
                  key: 'alertsColor', 
                  label: 'Alerts Color', 
                  options: [
                    { value: 'blue', label: '🔵 Blue' },
                    { value: 'red', label: '🔴 Red' },
                    { value: 'orange', label: '🟠 Orange' },
                    { value: 'yellow', label: '🟡 Yellow' }
                  ],
                  default: 'blue'
                },
                { 
                  type: 'select', 
                  key: 'leadsColor', 
                  label: 'Leads Color', 
                  options: [
                    { value: 'orange', label: '🟠 Orange' },
                    { value: 'green', label: '🟢 Green' },
                    { value: 'purple', label: '🟣 Purple' },
                    { value: 'blue', label: '🔵 Blue' }
                  ],
                  default: 'orange'
                }
              ]
            },
            {
              id: 'metrics-layout',
              title: 'Layout Options',
              icon: '📐',
              settings: [
                { 
                  type: 'select', 
                  key: 'metricsLayout', 
                  label: 'Metrics Layout', 
                  options: [
                    { value: 'grid', label: '⚏ Grid Layout' },
                    { value: 'list', label: '☰ List Layout' },
                    { value: 'compact', label: '▣ Compact Layout' }
                  ],
                  default: 'grid'
                },
                { 
                  type: 'select', 
                  key: 'metricsPerRow', 
                  label: 'Metrics Per Row', 
                  options: [
                    { value: '2', label: '2 Metrics' },
                    { value: '3', label: '3 Metrics' },
                    { value: '4', label: '4 Metrics' }
                  ],
                  default: '4'
                }
              ]
            },
            {
              id: 'metrics-formatting',
              title: 'Number Formatting',
              icon: '🔢',
              settings: [
                { type: 'checkbox', key: 'useThousandsSeparator', label: 'Use Thousands Separator', default: true },
                { type: 'checkbox', key: 'showMetricDescriptions', label: 'Show Metric Descriptions', default: true },
                { type: 'checkbox', key: 'showMetricIcons', label: 'Show Metric Icons', default: true },
                { type: 'checkbox', key: 'showPercentageChanges', label: 'Show Percentage Changes', default: false },
                { 
                  type: 'select', 
                  key: 'numberFormat', 
                  label: 'Number Format', 
                  options: [
                    { value: 'full', label: '1,234 (Full Numbers)' },
                    { value: 'abbreviated', label: '1.2K (Abbreviated)' },
                    { value: 'compact', label: '1K (Compact)' }
                  ],
                  default: 'full'
                },
                { 
                  type: 'select', 
                  key: 'decimalPlaces', 
                  label: 'Decimal Places', 
                  options: [
                    { value: '0', label: 'No Decimals (1234)' },
                    { value: '1', label: '1 Decimal (123.4)' },
                    { value: '2', label: '2 Decimals (123.45)' }
                  ],
                  default: '0'
                }
              ]
            },
            {
              id: 'metrics-comparisons',
              title: 'Data Comparisons',
              icon: '📈',
              settings: [
                { type: 'checkbox', key: 'enablePeriodComparison', label: 'Enable Period Comparison', default: false },
                { type: 'checkbox', key: 'showTrendArrows', label: 'Show Trend Arrows', default: true },
                { type: 'checkbox', key: 'enableGoalTracking', label: 'Enable Goal Tracking', default: false },
                { 
                  type: 'select', 
                  key: 'comparisonPeriod', 
                  label: 'Comparison Period', 
                  options: [
                    { value: 'yesterday', label: 'vs Yesterday' },
                    { value: 'lastWeek', label: 'vs Last Week' },
                    { value: 'lastMonth', label: 'vs Last Month' },
                    { value: 'lastQuarter', label: 'vs Last Quarter' }
                  ],
                  default: 'lastWeek'
                }
              ]
            },
            {
              id: 'metrics-alerts',
              title: 'Metric Alerts',
              icon: '🚨',
              settings: [
                { type: 'checkbox', key: 'enableMetricAlerts', label: 'Enable Metric Alerts', default: false },
                { type: 'checkbox', key: 'alertOnThresholds', label: 'Alert on Threshold Breach', default: false },
                { type: 'checkbox', key: 'alertOnAnomalies', label: 'Alert on Anomalies', default: false },
                { 
                  type: 'number', 
                  key: 'alertThresholdPercentage', 
                  label: 'Alert Threshold Change (%)', 
                  min: 5, 
                  max: 100, 
                  default: 25 
                }
              ]
            },
            {
              id: 'metrics-integrations',
              title: 'Metrics Integration',
              icon: '🔗',
              settings: [
                { type: 'checkbox', key: 'exportToAnalytics', label: 'Export to Analytics Platform', default: false },
                { type: 'checkbox', key: 'syncWithBI', label: 'Sync with BI Tools', default: false },
                { type: 'checkbox', key: 'enableAPIAccess', label: 'Enable API Access', default: false },
                { type: 'checkbox', key: 'realTimeUpdates', label: 'Real-time Updates', default: true }
              ]
            }
          ]
        };
      default:
        return { title: 'Card Settings', sections: [] };
    }
  };

  const cardConfig = getCardSpecificSettings();

  const renderSettingControl = (setting: any) => {
    switch (setting.type) {
      case 'checkbox':
        return (
          <label key={setting.key} className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50 transition-all cursor-pointer border border-gray-100">
            <input
              type="checkbox"
              checked={cardSettings[setting.key] ?? setting.default}
              onChange={(e) => onSettingsChange(setting.key, e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <span className="text-sm text-gray-700">{setting.label}</span>
          </label>
        );
      
      case 'select':
        return (
          <div key={setting.key} className="mb-2">
            <label className="block text-xs mb-1 font-medium text-gray-600">{setting.label}:</label>
            <select
              value={cardSettings[setting.key] ?? setting.default}
              onChange={(e) => onSettingsChange(setting.key, e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
            >
              {setting.options.map((option: any) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        );
      
      case 'number':
        return (
          <div key={setting.key} className="mb-2">
            <label className="block text-xs mb-1 font-medium text-gray-600">{setting.label}:</label>
            <div className="relative">
              <input
                type="number"
                value={cardSettings[setting.key] ?? setting.default}
                onChange={(e) => onSettingsChange(setting.key, parseInt(e.target.value))}
                min={setting.min}
                max={setting.max}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white pr-10"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <span className="text-gray-400 text-xs">
                  {setting.min}-{setting.max}
                </span>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Modal 
      open={open} 
      onClose={onClose}
      title={cardConfig.title}
    >
      <div className="max-h-[80vh] overflow-y-auto bg-gray-50">
        <div className="p-4">
          <div className="space-y-4">
        
            {/* Global Theme Options */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="bg-gradient-to-r from-pink-500 to-orange-500 text-white p-3 rounded-t-lg">
                <h5 className="font-semibold text-sm flex items-center gap-2">
                  <span className="text-lg">🎨</span>
                  Theme & Style
                </h5>
              </div>
              <div className="p-3">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs mb-1 font-medium text-gray-600">Card Theme:</label>
                    <select
                      value={cardSettings.theme || 'orange'}
                      onChange={(e) => onSettingsChange('theme', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                    >
                      {themeOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs mb-1 font-medium text-gray-600">Border Style:</label>
                    <select
                      value={cardSettings.borderStyle || 'solid'}
                      onChange={(e) => onSettingsChange('borderStyle', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                    >
                      {borderStyleOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Source - Common for all cards */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-3 rounded-t-lg">
                <h5 className="font-semibold text-sm flex items-center gap-2">
                  <span className="text-lg">🔄</span>
                  Data Source Settings
                </h5>
              </div>
              <div className="p-3">
                <div>
                  <label className="block text-xs mb-1 font-medium text-gray-600">Data Source:</label>
                  <select
                    value={cardSettings.dataSource || 'demo'}
                    onChange={(e) => onSettingsChange('dataSource', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                  >
                    <option value="demo">📋 Demo Data</option>
                    <option value="live">🔴 Live Data</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Card-Specific Settings Sections */}
            {cardConfig.sections.map((section: any, index: number) => {
              // Define different gradient combinations for visual variety
              const gradients = [
                'from-emerald-500 to-teal-600',
                'from-purple-500 to-indigo-600', 
                'from-orange-500 to-red-500',
                'from-cyan-500 to-blue-600',
                'from-pink-500 to-rose-600',
                'from-amber-500 to-orange-600',
                'from-violet-500 to-purple-600',
                'from-green-500 to-emerald-600'
              ];
              
              return (
                <div key={section.id} className="bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className={`bg-gradient-to-r ${gradients[index % gradients.length]} text-white p-3 rounded-t-lg`}>
                    <h5 className="font-semibold text-sm flex items-center gap-2">
                      <span className="text-lg">{section.icon}</span>
                      {section.title}
                    </h5>
                  </div>
                  <div className="p-3">
                    <div className="space-y-2">
                      {section.settings.map((setting: any) => renderSettingControl(setting))}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Auto Refresh Settings - Common for all cards */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-3 rounded-t-lg">
                <h5 className="font-semibold text-sm flex items-center gap-2">
                  <span className="text-lg">⏱️</span>
                  Auto Refresh Settings
                </h5>
              </div>
              <div className="p-3">
                <label className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50 transition-colors mb-3 border border-gray-100">
                  <input
                    type="checkbox"
                    checked={cardSettings.autoRefresh || false}
                    onChange={(e) => onSettingsChange('autoRefresh', e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-700">Enable Auto Refresh</span>
                </label>
                
                {cardSettings.autoRefresh && (
                  <div className="pl-3 border-l-2 border-purple-200 bg-purple-50 rounded-r-md py-2 pr-2">
                    <label className="block text-xs mb-1 font-medium text-gray-600">Refresh Interval:</label>
                    <select
                      value={cardSettings.refreshInterval || 30}
                      onChange={(e) => onSettingsChange('refreshInterval', parseInt(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
                    >
                      <option value={5}>⚡ 5 seconds</option>
                      <option value={15}>🚀 15 seconds</option>
                      <option value={30}>⏰ 30 seconds</option>
                      <option value={60}>🕐 1 minute</option>
                      <option value={300}>🕕 5 minutes</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Save Button */}
          <div className="mt-4 pt-3 border-t border-gray-200 bg-gray-50 rounded-b-lg -mx-4 -mb-4 px-4 pb-4">
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
              >
                <span>💾</span>
                Save & Close
              </button>
              <button
                onClick={onClose}
                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-all"
                title="Cancel"
              >
                ✕
              </button>
            </div>
            <div className="mt-2 text-center">
              <p className="text-xs text-gray-500">
                Changes applied instantly
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
