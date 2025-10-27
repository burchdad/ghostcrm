/**
 * Registration Hook for Automated Client Database Provisioning
 * This hook integrates with the user registration process to automatically
 * trigger database provisioning for new clients
 */

import { triggerClientProvisioning } from '../../migrations/client-provisioning/provisioning-system'

interface RegistrationData {
  id?: string
  companyName: string
  adminEmail: string
  adminFirstName?: string
  adminLastName?: string
  adminPassword?: string
  plan?: 'starter' | 'professional' | 'enterprise'
  customSettings?: Record<string, any>
}

interface RegistrationResult {
  success: boolean
  clientId: string
  message: string
  provisioningTriggered: boolean
  error?: string
}

/**
 * Main registration hook - called when new clients sign up
 */
export async function onClientRegistration(registrationData: RegistrationData): Promise<RegistrationResult> {
  try {
    console.log(`🔔 New client registration: ${registrationData.companyName}`)
    
    // Generate client ID if not provided
    const clientId = registrationData.id || crypto.randomUUID()
    
    // Prepare client data for provisioning
    const clientData = {
      id: clientId,
      name: registrationData.companyName,
      adminEmail: registrationData.adminEmail,
      adminPassword: registrationData.adminPassword,
      customSettings: await buildClientSettings(registrationData)
    }
    
    // Trigger database provisioning in background
    await triggerClientProvisioning(clientData)
    
    console.log(`✅ Database provisioning triggered for ${registrationData.companyName}`)
    
    return {
      success: true,
      clientId,
      message: 'Registration successful. Database provisioning initiated.',
      provisioningTriggered: true
    }
    
  } catch (error) {
    console.error('Registration hook error:', error)
    
    return {
      success: false,
      clientId: registrationData.id || 'unknown',
      message: 'Registration failed',
      provisioningTriggered: false,
      error: (error as Error).message
    }
  }
}

/**
 * Build client-specific settings based on registration data
 */
async function buildClientSettings(registrationData: RegistrationData): Promise<Record<string, any>> {
  const settings: Record<string, any> = {
    company_name: registrationData.companyName,
    admin_first_name: registrationData.adminFirstName || 'Admin',
    admin_last_name: registrationData.adminLastName || 'User'
  }
  
  // Apply plan-specific settings
  if (registrationData.plan) {
    settings.subscription_plan = registrationData.plan
    
    switch (registrationData.plan) {
      case 'starter':
        settings.max_users = 5
        settings.max_contacts = 1000
        settings.max_file_storage = '1GB'
        settings.features = JSON.stringify(['basic_crm', 'email_templates', 'basic_reports'])
        break
        
      case 'professional':
        settings.max_users = 25
        settings.max_contacts = 10000
        settings.max_file_storage = '10GB'
        settings.features = JSON.stringify(['basic_crm', 'email_templates', 'advanced_reports', 'automation', 'integrations'])
        break
        
      case 'enterprise':
        settings.max_users = -1 // unlimited
        settings.max_contacts = -1 // unlimited
        settings.max_file_storage = '100GB'
        settings.features = JSON.stringify(['full_crm', 'advanced_automation', 'custom_fields', 'api_access', 'white_label'])
        break
    }
  }
  
  // Merge any custom settings
  if (registrationData.customSettings) {
    Object.assign(settings, registrationData.customSettings)
  }
  
  return settings
}

/**
 * Verify client database provisioning status
 */
export async function verifyClientProvisioning(clientId: string): Promise<{
  provisioned: boolean
  details?: any
  error?: string
}> {
  try {
    // This would check the provisioning status
    // For now, we'll simulate with a simple check
    
    // In a real implementation, you might:
    // 1. Check if the client's database exists
    // 2. Verify required tables are created
    // 3. Confirm admin user exists
    // 4. Validate settings are applied
    
    return {
      provisioned: true,
      details: {
        clientId,
        timestamp: new Date().toISOString(),
        status: 'provisioned'
      }
    }
    
  } catch (error) {
    return {
      provisioned: false,
      error: (error as Error).message
    }
  }
}

/**
 * Handle failed provisioning - retry or escalate
 */
export async function handleProvisioningFailure(
  clientId: string, 
  error: string,
  retryCount: number = 0
): Promise<void> {
  const maxRetries = 3
  
  console.error(`❌ Provisioning failed for client ${clientId}: ${error}`)
  
  if (retryCount < maxRetries) {
    console.log(`🔄 Retrying provisioning for client ${clientId} (attempt ${retryCount + 1}/${maxRetries})`)
    
    // Implement retry logic here
    // This could involve re-queueing the provisioning request
    
  } else {
    console.error(`💥 Provisioning failed permanently for client ${clientId} after ${maxRetries} attempts`)
    
    // Escalate to admin team
    await notifyAdminTeam({
      type: 'provisioning_failure',
      clientId,
      error,
      retryCount,
      timestamp: new Date().toISOString()
    })
  }
}

/**
 * Notify admin team of critical issues
 */
async function notifyAdminTeam(notification: {
  type: string
  clientId: string
  error: string
  retryCount: number
  timestamp: string
}): Promise<void> {
  // This could send notifications via:
  // - Email
  // - Slack
  // - Discord webhook
  // - Admin dashboard alert
  
  console.log('🚨 ADMIN NOTIFICATION:', notification)
  
  // Example: Log to admin audit table
  // await supabase.from('admin_notifications').insert(notification)
}

/**
 * Middleware for existing registration endpoints
 */
export function withProvisioningHook(registrationHandler: Function) {
  return async function(request: any, ...args: any[]) {
    try {
      // Execute original registration logic
      const result = await registrationHandler(request, ...args)
      
      // If registration was successful, trigger provisioning
      if (result.success && result.userData) {
        const registrationData: RegistrationData = {
          id: result.userData.id,
          companyName: result.userData.companyName || result.userData.company,
          adminEmail: result.userData.email,
          adminFirstName: result.userData.firstName,
          adminLastName: result.userData.lastName,
          plan: result.userData.plan
        }
        
        // Trigger provisioning asynchronously
        onClientRegistration(registrationData).catch(error => {
          console.error('Async provisioning trigger failed:', error)
        })
      }
      
      return result
      
    } catch (error) {
      console.error('Registration with provisioning hook failed:', error)
      throw error
    }
  }
}