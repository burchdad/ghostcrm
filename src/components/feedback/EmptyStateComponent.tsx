'use client'

import React from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  MessageSquare, 
  Car,
  Plus,
  ArrowRight,
  Sparkles,
  BarChart3,
  FileText,
  Settings,
  Zap
} from 'lucide-react'

interface EmptyStateProps {
  type: 'dashboard' | 'leads' | 'deals' | 'appointments' | 'messages' | 'reports' | 'general'
  title?: string
  description?: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
  showIcon?: boolean
  showAnimation?: boolean
  className?: string
}

// Helper function to get tenant-aware route based on user role
function getTenantRoute(user: any, basePath: string): string {
  if (!user || !user.role) return basePath;
  
  const roleMapping: Record<string, string> = {
    'owner': 'tenant-owner',
    'admin': 'tenant-owner', // Admin can access owner routes
    'manager': 'tenant-salesmanager',
    'sales_rep': 'tenant-salesrep',
    'user': 'tenant-salesrep' // Default users to sales rep level
  };
  
  const tenantPrefix = roleMapping[user.role] || 'tenant-salesrep';
  return `/${tenantPrefix}${basePath}`;
}

const EmptyStateConfig = {
  dashboard: {
    icon: BarChart3,
    title: "Welcome to GhostCRM!",
    description: "Your dashboard will come alive as you start adding leads, deals, and appointments. Let's get you set up!",
    actionLabel: "Add Your First Lead",
    actionHref: "/leads",
    gradient: "from-purple-600 to-pink-600",
    bgColor: "bg-purple-50",
    iconColor: "text-purple-600"
  },
  leads: {
    icon: Users,
    title: "No leads yet",
    description: "Get started by adding your first lead using the 'Add Lead' button above. You can add leads individually or import them in bulk.",
    actionLabel: null, // Removed button - use header button instead
    actionHref: null,
    gradient: "from-blue-600 to-cyan-600",
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600"
  },
  deals: {
    icon: TrendingUp,
    title: "No deals in progress",
    description: "Turn your leads into revenue! Create your first deal and start tracking your sales pipeline.",
    actionLabel: "Create Deal",
    actionHref: "/deals/new",
    gradient: "from-green-600 to-emerald-600",
    bgColor: "bg-green-50",
    iconColor: "text-green-600"
  },
  appointments: {
    icon: Calendar,
    title: "No appointments scheduled",
    description: "Keep your schedule organized. Book your first appointment with a lead or customer.",
    actionLabel: "Schedule Appointment",
    actionHref: "/appointments/new",
    gradient: "from-orange-600 to-red-600",
    bgColor: "bg-orange-50",
    iconColor: "text-orange-600"
  },
  messages: {
    icon: MessageSquare,
    title: "No messages yet",
    description: "Communication is key to closing deals. Start conversations with your leads.",
    actionLabel: "Send Message",
    actionHref: "/messaging",
    gradient: "from-indigo-600 to-purple-600",
    bgColor: "bg-indigo-50",
    iconColor: "text-indigo-600"
  },
  reports: {
    icon: FileText,
    title: "No data to report",
    description: "Reports will generate automatically as you add leads, deals, and activities.",
    actionLabel: "Add Some Data",
    actionHref: "/leads",
    gradient: "from-gray-600 to-slate-600",
    bgColor: "bg-gray-50",
    iconColor: "text-gray-600"
  },
  general: {
    icon: Sparkles,
    title: "Nothing here yet",
    description: "This section will populate as you use the system.",
    actionLabel: "Get Started",
    actionHref: "/dashboard",
    gradient: "from-purple-600 to-pink-600",
    bgColor: "bg-purple-50",
    iconColor: "text-purple-600"
  }
}

export default function EmptyStateComponent({
  type,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  showIcon = true,
  showAnimation = true,
  className = ""
}: EmptyStateProps) {
  const config = EmptyStateConfig[type]
  const Icon = config.icon
  const { user } = useAuth()

  const finalTitle = title || config.title
  const finalDescription = description || config.description
  const finalActionLabel = actionLabel || config.actionLabel
  
  // Make actionHref tenant-aware if not explicitly provided
  let finalActionHref = actionHref || config.actionHref
  if (!actionHref && user && config.actionHref) {
    // Only make specific paths tenant-aware
    if (config.actionHref === "/leads") {
      finalActionHref = getTenantRoute(user, "/new-lead")
    } else if (config.actionHref === "/deals/new") {
      finalActionHref = getTenantRoute(user, "/new-deal")
    } else {
      finalActionHref = config.actionHref
    }
  }

  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}>
      {/* Animated Background */}
      {showAnimation && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute -top-4 -left-4 w-32 h-32 ${config.bgColor} rounded-full opacity-20 animate-pulse`}></div>
          <div className={`absolute -bottom-8 -right-8 w-40 h-40 ${config.bgColor} rounded-full opacity-10 animate-pulse delay-1000`}></div>
          <div className={`absolute top-1/3 left-1/4 w-24 h-24 ${config.bgColor} rounded-full opacity-15 animate-pulse delay-500`}></div>
        </div>
      )}

      {/* Icon */}
      {showIcon && (
        <div className={`relative mb-6 p-6 ${config.bgColor} rounded-2xl ${showAnimation ? 'animate-bounce' : ''}`}>
          <Icon className={`w-16 h-16 ${config.iconColor}`} />
          {showAnimation && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-shimmer"></div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 max-w-md">
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          {finalTitle}
        </h3>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          {finalDescription}
        </p>

        {/* Action Button */}
        {(finalActionHref || onAction) && (
          <div className="space-y-4">
            {finalActionHref ? (
              <Link
                href={finalActionHref}
                className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${config.gradient} text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200`}
              >
                <Plus className="w-5 h-5" />
                {finalActionLabel}
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : onAction ? (
              <button
                onClick={onAction}
                className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${config.gradient} text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200`}
              >
                <Plus className="w-5 h-5" />
                {finalActionLabel}
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : null}

            {/* Secondary Actions */}
            {type === 'dashboard' && (
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <Link
                  href="/settings"
                  className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Setup Settings
                </Link>
                <Link
                  href="/dashboard/chart-marketplace"
                  className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Zap className="w-4 h-4" />
                  Explore Features
                </Link>
              </div>
            )}

            {type === 'leads' && (
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                {/* Removed Import Leads and Connect Integrations buttons - these are now in the modal */}
                <p className="text-sm text-gray-500">Use the "Add Lead" button above to create leads or import them in bulk.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tips Section */}
      {type === 'dashboard' && (
        <div className="mt-12 max-w-2xl">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Start Tips</h4>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 bg-white rounded-lg border border-gray-100">
              <Users className="w-6 h-6 text-blue-600 mb-2" />
              <div className="font-medium text-gray-900">Add Leads</div>
              <div className="text-gray-600">Import or manually add your first leads</div>
            </div>
            <div className="p-4 bg-white rounded-lg border border-gray-100">
              <Car className="w-6 h-6 text-green-600 mb-2" />
              <div className="font-medium text-gray-900">Create Deals</div>
              <div className="text-gray-600">Turn leads into revenue opportunities</div>
            </div>
            <div className="p-4 bg-white rounded-lg border border-gray-100">
              <Calendar className="w-6 h-6 text-orange-600 mb-2" />
              <div className="font-medium text-gray-900">Schedule</div>
              <div className="text-gray-600">Book appointments and follow-ups</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Utility component for dashboard metrics cards
export function EmptyMetricCard({ 
  title, 
  icon: Icon, 
  description 
}: { 
  title: string
  icon: React.ComponentType<{ className?: string }>
  description: string 
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-400">0</p>
        </div>
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <p className="text-xs text-gray-500 mt-2">{description}</p>
    </div>
  )
}