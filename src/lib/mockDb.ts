// Fallback database abstraction for development when main database is unavailable
// This should only be used in development environments
let fallbackUsers: any[] = [];
let fallbackOrganizations: any[] = [];
let fallbackTenants: any[] = [];
let fallbackAuditEvents: any[] = [];

export const fallbackDb = {
  users: {
    async findByEmail(email: string) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Fallback database should not be used in production');
      }
      return fallbackUsers.find(u => u.email === email) || null;
    },
    
    async create(userData: any) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Fallback database should not be used in production');
      }
      const newUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: userData.email,
        password_hash: userData.password_hash,
        role: userData.role || 'user',
        tenantId: userData.tenantId || null,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      fallbackUsers.push(newUser);
      return newUser;
    },
    
    async deleteByEmail(email: string) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Fallback database should not be used in production');
      }
      const index = fallbackUsers.findIndex(u => u.email === email);
      if (index !== -1) {
        const deletedUser = fallbackUsers.splice(index, 1)[0];
        console.warn(`[FALLBACK DB] Deleted user: ${email}`);
        return deletedUser;
      }
      return null;
    },
    
    async list() {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Fallback database should not be used in production');
      }
      return fallbackUsers;
    },
    
    async clearDemo() {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Fallback database should not be used in production');
      }
      const demoEmail = 'demo_admin@example.com';
      const deleted = await this.deleteByEmail(demoEmail);
      
      // Also clean up related audit events
      fallbackAuditEvents = fallbackAuditEvents.filter(event => 
        !event.details?.email || event.details.email !== demoEmail
      );
      
      console.warn(`[FALLBACK DB] Demo cleanup completed for ${demoEmail}`);
      return deleted;
    }
  },
  
  tenants: {
    async create(tenantData: any) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Fallback database should not be used in production');
      }
      const newTenant = {
        id: `tenant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: tenantData.name,
        subscription: tenantData.subscription || { status: 'trial', plan: 'professional' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        isActive: true
      };
      fallbackTenants.push(newTenant);
      return newTenant;
    },
    
    async findById(id: string) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Fallback database should not be used in production');
      }
      return fallbackTenants.find(t => t.id === id) || null;
    }
  },
  
  organizations: {
    async create(orgData: any) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Fallback database should not be used in production');
      }
      const newOrg = {
        id: `org_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: orgData.name,
        owner_id: orgData.owner_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      fallbackOrganizations.push(newOrg);
      return newOrg;
    }
  },
  
  audit_events: {
    async create(eventData: any) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Fallback database should not be used in production');
      }
      const newEvent = {
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: eventData.user_id,
        action: eventData.action,
        details: eventData.details,
        ip_address: eventData.ip_address,
        user_agent: eventData.user_agent,
        created_at: new Date().toISOString()
      };
      fallbackAuditEvents.push(newEvent);
      return newEvent;
    }
  }
};

// Maintain compatibility with existing imports
export const mockDb = fallbackDb;