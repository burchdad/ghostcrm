'use client'

import React from 'react'
import UserManagementDashboard from '@/components/dashboards/UserManagementDashboard'
import { WithPermission } from '@/hooks/usePermissions'
import { Shield } from 'lucide-react'

export default function UserManagementPage() {
  return (
    <WithPermission 
      permission="users.manage"
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to manage users.</p>
          </div>
        </div>
      }
    >
      <UserManagementDashboard />
    </WithPermission>
  )
}
