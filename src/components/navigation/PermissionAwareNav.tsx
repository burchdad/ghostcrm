'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { usePermissions } from '@/hooks/usePermissions'
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  Calendar,
  MessageSquare,
  BarChart3,
  Settings,
  CreditCard,
  FileText,
  Zap,
  Shield,
  Building2
} from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  permission?: string | string[]
  badge?: string
  children?: NavItem[]
}

const navigationItems: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    name: 'Leads',
    href: '/leads',
    icon: Users,
    permission: ['leads.view_own', 'leads.view_team', 'leads.view_all']
  },
  {
    name: 'Deals',
    href: '/deals',
    icon: TrendingUp,
    permission: ['deals.view_own', 'deals.view_team', 'deals.view_all']
  },
  {
    name: 'Appointments',
    href: '/appointments',
    icon: Calendar,
    permission: ['contacts.view', 'leads.view_own']
  },
  {
    name: 'Messaging',
    href: '/messaging',
    icon: MessageSquare,
    permission: ['contacts.manage', 'leads.edit_own']
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: BarChart3,
    permission: ['reports.basic', 'reports.advanced', 'reports.team'],
    children: [
      {
        name: 'Sales Reports',
        href: '/reports/sales',
        icon: TrendingUp,
        permission: 'reports.basic'
      },
      {
        name: 'Team Performance',
        href: '/reports/team',
        icon: Users,
        permission: 'reports.team'
      },
      {
        name: 'Advanced Analytics',
        href: '/reports/analytics',
        icon: BarChart3,
        permission: 'reports.advanced'
      }
    ]
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    permission: 'settings.view',
    children: [
      {
        name: 'Profile',
        href: '/settings/profile',
        icon: Users
      },
      {
        name: 'Organization',
        href: '/settings/organization',
        icon: Building2,
        permission: 'organization.manage'
      },
      {
        name: 'User Management',
        href: '/settings/users',
        icon: Shield,
        permission: 'users.manage'
      },
      {
        name: 'Integrations',
        href: '/settings/integrations',
        icon: Zap,
        permission: 'settings.integrations'
      },
      {
        name: 'Billing',
        href: '/settings/billing',
        icon: CreditCard,
        permission: ['billing.view', 'billing.manage']
      }
    ]
  }
]

interface PermissionAwareNavProps {
  className?: string
  onItemClick?: () => void
}

export default function PermissionAwareNav({ className = "", onItemClick }: PermissionAwareNavProps) {
  const pathname = usePathname()
  const { hasPermission, hasAnyPermission, user, loading } = usePermissions()

  const hasAccessToItem = (item: NavItem): boolean => {
    if (!item.permission) return true
    
    return Array.isArray(item.permission) 
      ? hasAnyPermission(item.permission)
      : hasPermission(item.permission)
  }

  const isItemActive = (href: string): boolean => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  const renderNavItem = (item: NavItem, isChild = false) => {
    if (!hasAccessToItem(item)) {
      return null
    }

    const isActive = isItemActive(item.href)
    const Icon = item.icon

    return (
      <div key={item.href}>
        <Link
          href={item.href}
          onClick={onItemClick}
          className={`
            flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
            ${isChild ? 'ml-6 pl-6 border-l border-gray-200' : ''}
            ${isActive 
              ? 'bg-purple-100 text-purple-700 border-purple-200' 
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }
          `}
        >
          <Icon className={`w-4 h-4 ${isChild ? 'w-3 h-3' : ''}`} />
          <span>{item.name}</span>
          {item.badge && (
            <span className="ml-auto text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
              {item.badge}
            </span>
          )}
        </Link>
        
        {/* Render children if parent is active */}
        {item.children && isItemActive(item.href) && (
          <div className="mt-1 space-y-1">
            {item.children.map(child => renderNavItem(child, true))}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`space-y-2 ${className}`}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (!user) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-500">Please log in to access navigation</p>
      </div>
    )
  }

  return (
    <nav className={`space-y-1 ${className}`}>
      {navigationItems.map(item => renderNavItem(item))}
      
      {/* Role indicator */}
      {user.role && (
        <div className="mt-8 pt-4 border-t border-gray-200">
          <div className="px-3 py-2">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Current Role
            </div>
            <div className="mt-1 text-sm font-medium text-gray-900">
              {user.role === 'sales_rep' && 'Sales Representative'}
              {user.role === 'sales_manager' && 'Sales Manager'}
              {user.role === 'admin' && 'Administrator'}
              {user.role === 'owner' && 'Organization Owner'}
              {user.tier && (
                <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full capitalize">
                  {user.tier}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

// Standalone permission-based navigation link component
export function PermissionNavLink({
  href,
  permission,
  children,
  className = "",
  activeClassName = "bg-purple-100 text-purple-700",
  ...props
}: {
  href: string
  permission?: string | string[]
  children: React.ReactNode
  className?: string
  activeClassName?: string
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const pathname = usePathname()
  const { hasPermission, hasAnyPermission } = usePermissions()

  const hasAccess = permission
    ? Array.isArray(permission)
      ? hasAnyPermission(permission)
      : hasPermission(permission)
    : true

  if (!hasAccess) {
    return null
  }

  const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))

  return (
    <Link
      href={href}
      className={`${className} ${isActive ? activeClassName : ''}`}
      {...props}
    >
      {children}
    </Link>
  )
}