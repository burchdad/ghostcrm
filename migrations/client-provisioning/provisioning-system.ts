/**
 * Client Database Provisioning System
 * Automated database setup for new client registrations
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs/promises'
import path from 'path'

interface ClientProvisioningConfig {
  clientId: string
  clientName: string
  adminEmail: string
  adminPassword: string
  databaseUrl: string
  databaseKey: string
  settings?: Record<string, any>
}

interface ProvisioningResult {
  success: boolean
  clientId: string
  databaseUrl?: string
  error?: string
  details?: any
}

export class ClientDatabaseProvisioner {
  private readonly templatePath: string
  private readonly logPath: string

  constructor() {
    this.templatePath = path.join(process.cwd(), 'migrations', 'client-provisioning')
    this.logPath = path.join(process.cwd(), 'logs', 'provisioning')
  }

  /**
   * Main provisioning method - sets up complete client database
   */
  async provisionClientDatabase(config: ClientProvisioningConfig): Promise<ProvisioningResult> {
    const startTime = Date.now()
    
    try {
      console.log(`🚀 Starting database provisioning for client: ${config.clientName}`)
      
      // 1. Validate configuration
      await this.validateConfig(config)
      
      // 2. Create Supabase client connection
      const supabase = createClient(config.databaseUrl, config.databaseKey)
      
      // 3. Execute schema template
      await this.executeSchemaTemplate(supabase, config)
      
      // 4. Create admin user
      await this.createAdminUser(supabase, config)
      
      // 5. Apply client-specific settings
      await this.applyClientSettings(supabase, config)
      
      // 6. Set up Row Level Security policies
      await this.setupRLSPolicies(supabase, config)
      
      // 7. Log successful provisioning
      await this.logProvisioningResult(config, true, Date.now() - startTime)
      
      console.log(`✅ Database provisioning completed for ${config.clientName} in ${Date.now() - startTime}ms`)
      
      return {
        success: true,
        clientId: config.clientId,
        databaseUrl: config.databaseUrl
      }
      
    } catch (error) {
      console.error(`❌ Database provisioning failed for ${config.clientName}:`, error)
      
      await this.logProvisioningResult(config, false, Date.now() - startTime, error)
      
      return {
        success: false,
        clientId: config.clientId,
        error: (error as Error).message || 'Unknown provisioning error'
      }
    }
  }

  /**
   * Validate the provisioning configuration
   */
  private async validateConfig(config: ClientProvisioningConfig): Promise<void> {
    const required: (keyof ClientProvisioningConfig)[] = ['clientId', 'clientName', 'adminEmail', 'databaseUrl', 'databaseKey']
    
    for (const field of required) {
      if (!config[field]) {
        throw new Error(`Missing required configuration field: ${field}`)
      }
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(config.adminEmail)) {
      throw new Error('Invalid admin email format')
    }
    
    // Validate client ID format (UUID or similar)
    if (config.clientId.length < 8) {
      throw new Error('Client ID must be at least 8 characters long')
    }
  }

  /**
   * Execute the main schema template
   */
  private async executeSchemaTemplate(supabase: any, config: ClientProvisioningConfig): Promise<void> {
    console.log('📋 Executing schema template...')
    
    const templateFile = path.join(this.templatePath, '001_client_schema_template.pgsql')
    const schemaSQL = await fs.readFile(templateFile, 'utf-8')
    
    // Replace template variables
    const processedSQL = schemaSQL
      .replace(/\{\{client_id\}\}/g, config.clientId)
      .replace(/\{\{client_name\}\}/g, config.clientName)
      .replace(/\{\{admin_email\}\}/g, config.adminEmail)
    
    // Split into individual statements (PostgreSQL can't handle multiple in one call)
    const statements = this.splitSQLStatements(processedSQL)
    
    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        if (error) {
          throw new Error(`Schema execution error: ${error.message}`)
        }
      }
    }
  }

  /**
   * Create the initial admin user for the client
   */
  private async createAdminUser(supabase: any, config: ClientProvisioningConfig): Promise<void> {
    console.log('👤 Creating admin user...')
    
    // Create user in auth.users (Supabase Auth)
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: config.adminEmail,
      password: config.adminPassword || this.generateSecurePassword(),
      email_confirm: true
    })
    
    if (authError) {
      throw new Error(`Auth user creation error: ${authError.message}`)
    }
    
    // Insert user profile in public.users table
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authUser.user.id,
        email: config.adminEmail,
        first_name: 'Admin',
        last_name: 'User',
        role: 'super_admin',
        status: 'active'
      })
    
    if (profileError) {
      throw new Error(`User profile creation error: ${profileError.message}`)
    }
  }

  /**
   * Apply client-specific settings
   */
  private async applyClientSettings(supabase: any, config: ClientProvisioningConfig): Promise<void> {
    console.log('⚙️ Applying client settings...')
    
    const defaultSettings = {
      company_name: config.clientName,
      timezone: 'UTC',
      currency: 'USD',
      date_format: 'YYYY-MM-DD',
      time_format: '24h',
      primary_color: '#3B82F6',
      max_file_size: '10485760',
      allowed_file_types: '["pdf", "doc", "docx", "xls", "xlsx", "jpg", "jpeg", "png", "gif"]'
    }
    
    const finalSettings = { ...defaultSettings, ...config.settings }
    
    const settingsToInsert = Object.entries(finalSettings).map(([key, value]) => ({
      setting_key: key,
      setting_value: typeof value === 'string' ? value : JSON.stringify(value),
      description: this.getSettingDescription(key),
      is_public: this.isPublicSetting(key)
    }))
    
    const { error } = await supabase
      .from('client_settings')
      .upsert(settingsToInsert, { onConflict: 'setting_key' })
    
    if (error) {
      throw new Error(`Settings application error: ${error.message}`)
    }
  }

  /**
   * Set up Row Level Security policies for the client
   */
  private async setupRLSPolicies(supabase: any, config: ClientProvisioningConfig): Promise<void> {
    console.log('🔒 Setting up Row Level Security policies...')
    
    const policies = [
      // Users can see their own profile
      `CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);`,
      `CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);`,
      
      // Contacts access based on ownership
      `CREATE POLICY "Users can view assigned contacts" ON contacts FOR SELECT USING (owner_id = auth.uid() OR auth.role() IN ('admin', 'super_admin'));`,
      `CREATE POLICY "Users can create contacts" ON contacts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);`,
      `CREATE POLICY "Users can update assigned contacts" ON contacts FOR UPDATE USING (owner_id = auth.uid() OR auth.role() IN ('admin', 'super_admin'));`,
      
      // Deals access based on ownership
      `CREATE POLICY "Users can view assigned deals" ON deals FOR SELECT USING (owner_id = auth.uid() OR auth.role() IN ('admin', 'super_admin'));`,
      `CREATE POLICY "Users can create deals" ON deals FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);`,
      `CREATE POLICY "Users can update assigned deals" ON deals FOR UPDATE USING (owner_id = auth.uid() OR auth.role() IN ('admin', 'super_admin'));`,
      
      // Activities access
      `CREATE POLICY "Users can view related activities" ON activities FOR SELECT USING (user_id = auth.uid() OR auth.role() IN ('admin', 'super_admin'));`,
      `CREATE POLICY "Users can create activities" ON activities FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);`,
      `CREATE POLICY "Users can update own activities" ON activities FOR UPDATE USING (user_id = auth.uid() OR auth.role() IN ('admin', 'super_admin'));`
    ]
    
    for (const policy of policies) {
      const { error } = await supabase.rpc('exec_sql', { sql: policy })
      if (error && !error.message.includes('already exists')) {
        console.warn(`Policy setup warning: ${error.message}`)
      }
    }
  }

  /**
   * Split SQL into individual statements
   */
  private splitSQLStatements(sql: string): string[] {
    // Simple SQL statement splitter - handles basic cases
    return sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
  }

  /**
   * Generate a secure random password
   */
  private generateSecurePassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  /**
   * Get description for a setting
   */
  private getSettingDescription(key: string): string {
    const descriptions: Record<string, string> = {
      company_name: 'Client company name',
      timezone: 'Default timezone for the client',
      currency: 'Default currency for the client',
      date_format: 'Default date format',
      time_format: 'Default time format (12h or 24h)',
      primary_color: 'Primary brand color',
      max_file_size: 'Maximum file upload size in bytes',
      allowed_file_types: 'Allowed file upload types'
    }
    return descriptions[key] || 'Custom client setting'
  }

  /**
   * Determine if a setting should be public
   */
  private isPublicSetting(key: string): boolean {
    const publicSettings = ['company_name', 'timezone', 'currency', 'date_format', 'time_format', 'primary_color']
    return publicSettings.includes(key)
  }

  /**
   * Log provisioning results
   */
  private async logProvisioningResult(
    config: ClientProvisioningConfig, 
    success: boolean, 
    duration: number, 
    error?: any
  ): Promise<void> {
    try {
      // Ensure logs directory exists
      await fs.mkdir(this.logPath, { recursive: true })
      
      const logEntry = {
        timestamp: new Date().toISOString(),
        clientId: config.clientId,
        clientName: config.clientName,
        success,
        duration,
        error: error?.message || null,
        details: error ? error.stack : null
      }
      
      const logFile = path.join(this.logPath, `provisioning-${new Date().toISOString().split('T')[0]}.log`)
      await fs.appendFile(logFile, JSON.stringify(logEntry) + '\n')
    } catch (logError) {
      console.error('Failed to write provisioning log:', logError)
    }
  }
}

/**
 * Queue-based provisioning system
 */
export class ProvisioningQueue {
  private queue: ClientProvisioningConfig[] = []
  private processing = false
  private provisioner = new ClientDatabaseProvisioner()

  /**
   * Add a client to the provisioning queue
   */
  async addToQueue(config: ClientProvisioningConfig): Promise<void> {
    this.queue.push(config)
    console.log(`📥 Added ${config.clientName} to provisioning queue. Queue length: ${this.queue.length}`)
    
    if (!this.processing) {
      this.processQueue()
    }
  }

  /**
   * Process the provisioning queue
   */
  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return
    }
    
    this.processing = true
    console.log(`🔄 Starting queue processing. Items to process: ${this.queue.length}`)
    
    try {
      while (this.queue.length > 0) {
        const config = this.queue.shift()!
        await this.provisioner.provisionClientDatabase(config)
        
        // Small delay between provisions to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    } catch (error) {
      console.error('Queue processing error:', error)
    } finally {
      this.processing = false
      console.log('✅ Queue processing completed')
    }
  }

  /**
   * Get queue status
   */
  getQueueStatus(): { length: number, processing: boolean } {
    return {
      length: this.queue.length,
      processing: this.processing
    }
  }
}

// Singleton queue instance
export const provisioningQueue = new ProvisioningQueue()

/**
 * Utility function for triggering provisioning from registration
 */
export async function triggerClientProvisioning(
  clientData: {
    id: string
    name: string
    adminEmail: string
    adminPassword?: string
    customSettings?: Record<string, any>
  }
): Promise<void> {
  const config: ClientProvisioningConfig = {
    clientId: clientData.id,
    clientName: clientData.name,
    adminEmail: clientData.adminEmail,
    adminPassword: clientData.adminPassword || '',
    databaseUrl: process.env.SUPABASE_URL!,
    databaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    settings: clientData.customSettings
  }
  
  await provisioningQueue.addToQueue(config)
}