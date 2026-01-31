'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { getBrowserSupabase } from '@/utils/supabase/client';
import { SYSTEM_ROLES, hasPermission, hasAnyPermission } from '@/lib/permissions'

interface User {
  id: string
  email: string
  organizationId?: string
  role?: string
  tier?: string
  permissions: string[]
}

interface PermissionContextType {
  user: User | null
  loading: boolean
  hasPermission: (permission: string) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
  canViewLeads: (scope?: 'own' | 'team' | 'all') => boolean
  canEditLeads: (scope?: 'own' | 'team' | 'all') => boolean
  canManageUsers: () => boolean
  canAccessBilling: () => boolean
  canManageOrganization: () => boolean
  refreshPermissions: () => Promise<void>
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined)

export function PermissionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const loadUserPermissions = async () => {
    try {
      const supabase = getBrowserSupabase();
      const { data: authUser } = await supabase.auth.getUser()
      
      if (!authUser.user) {
        setUser(null)
        return
      }

      // Get user's organization membership and role
      const { data: membership } = await supabase
        .from('organization_memberships')
        .select(`
          organization_id,
          role,
          tier,
          status,
          organization:organizations(name, status, subscription_status),
          user_role:user_roles(name, permissions)
        `)
        .eq('user_id', authUser.user.id)
        .eq('status', 'active')
        .single()

      if (!membership) {
        // User has no organization membership
        setUser({
          id: authUser.user.id,
          email: authUser.user.email || '',
          permissions: []
        })
        return
      }

      // Get permissions from role
      let permissions: string[] = []
      
      if (membership.user_role) {
        const userRole = membership.user_role as any
        permissions = userRole.permissions || []
      } else {
        // Fallback to system role if custom role not found
        const systemRole = SYSTEM_ROLES.find(
          role => role.name === membership.role && role.tier === membership.tier
        )
        permissions = systemRole?.permissions || []
      }

      setUser({
        id: authUser.user.id,
        email: authUser.user.email || '',
        organizationId: membership.organization_id,
        role: membership.role,
        tier: membership.tier,
        permissions
      })

    } catch (error) {
      console.error('Error loading user permissions:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUserPermissions()

    // Listen for auth state changes
    const supabase = getBrowserSupabase();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        loadUserPermissions()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const contextValue: PermissionContextType = {
    user,
    loading,
    hasPermission: (permission: string) => {
      return user ? hasPermission(user.permissions, permission) : false
    },
    hasAnyPermission: (permissions: string[]) => {
      return user ? hasAnyPermission(user.permissions, permissions) : false
    },
    canViewLeads: (scope = 'own') => {
      if (!user) return false
      const permissionMap = {
        'own': 'leads.view_own',
        'team': 'leads.view_team',
        'all': 'leads.view_all'
      }
      return hasPermission(user.permissions, permissionMap[scope]) ||
             hasPermission(user.permissions, 'leads.view_all')
    },
    canEditLeads: (scope = 'own') => {
      if (!user) return false
      const permissionMap = {
        'own': 'leads.edit_own',
        'team': 'leads.edit_team',
        'all': 'leads.edit_all'
      }
      return hasPermission(user.permissions, permissionMap[scope]) ||
             hasPermission(user.permissions, 'leads.edit_all')
    },
    canManageUsers: () => {
      return user ? hasPermission(user.permissions, 'users.manage') : false
    },
    canAccessBilling: () => {
      return user ? hasAnyPermission(user.permissions, ['billing.view', 'billing.manage']) : false
    },
    canManageOrganization: () => {
      return user ? hasPermission(user.permissions, 'organization.manage') : false
    },
    refreshPermissions: loadUserPermissions
  }

  return (
    <PermissionContext.Provider value={contextValue}>
      {children}
    </PermissionContext.Provider>
  )
}

export function usePermissions() {
  const context = useContext(PermissionContext)
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionProvider')
  }
  return context
}

// Utility hook for specific permission checks
export function usePermission(permission: string) {
  const { hasPermission } = usePermissions()
  return hasPermission(permission)
}

// Hook for checking multiple permissions
export function useAnyPermission(permissions: string[]) {
  const { hasAnyPermission } = usePermissions()
  return hasAnyPermission(permissions)
}

// Component wrapper for permission-based rendering
export function WithPermission({ 
  permission, 
  permissions, 
  fallback = null, 
  children 
}: {
  permission?: string
  permissions?: string[]
  fallback?: React.ReactNode
  children: React.ReactNode
}) {
  const { hasPermission, hasAnyPermission } = usePermissions()

  const hasAccess = permission 
    ? hasPermission(permission)
    : permissions 
    ? hasAnyPermission(permissions)
    : false

  return hasAccess ? <>{children}</> : <>{fallback}</>
}

// Higher-order component for permission-based access
export function withPermission<T extends object>(
  Component: React.ComponentType<T>,
  requiredPermission: string | string[],
  fallback?: React.ComponentType
) {
  return function PermissionWrappedComponent(props: T) {
    const { hasPermission, hasAnyPermission } = usePermissions()

    const hasAccess = Array.isArray(requiredPermission)
      ? hasAnyPermission(requiredPermission)
      : hasPermission(requiredPermission)

    if (!hasAccess) {
      if (fallback) {
        const FallbackComponent = fallback
        return <FallbackComponent {...props} />
      }
      return null
    }

    return <Component {...props} />
  }
}