// =============================================================================
// ADVANCED SECURITY & THREAT DETECTION SYSTEM
// Enterprise-grade security monitoring and compliance automation
// =============================================================================

import crypto from 'crypto';
// import geoip from 'geoip-lite'; // Install: npm install geoip-lite @types/geoip-lite
import { DatabaseManager } from '../database/connection-pool';
import { cacheManager } from '../cache/redis-manager';

// =============================================================================
// THREAT DETECTION ENGINE
// =============================================================================

export class ThreatDetectionSystem {
  private db: DatabaseManager;
  private suspiciousActivities = new Map<string, SecurityEvent[]>();
  private threatIntelligence = new Set<string>();
  private alertThresholds: AlertThresholds;

  constructor() {
    this.db = DatabaseManager.getInstance();
    this.alertThresholds = {
      maxLoginAttempts: 5,
      rapidRequestThreshold: 50, // requests per minute
      suspiciousLocationDistance: 1000, // km
      dataAccessAnomalyThreshold: 10 // times normal access
    };
    
    this.initializeThreatIntelligence();
  }

  // =============================================================================
  // LOGIN SECURITY MONITORING
  // =============================================================================

  async analyzeLoginAttempt(loginData: LoginAttempt): Promise<SecurityAssessment> {
    const { email, ip, userAgent, timestamp } = loginData;
    const riskScore = await this.calculateRiskScore(loginData);
    
    // Check for known threats
    const isKnownThreat = await this.checkThreatIntelligence(ip);
    
    // Analyze location anomaly
    const locationRisk = await this.analyzeLocationAnomaly(email, ip);
    
    // Check velocity patterns
    const velocityRisk = await this.analyzeLoginVelocity(email, ip);
    
    // Device fingerprinting
    const deviceRisk = await this.analyzeDeviceFingerprint(email, userAgent);
    
    const assessment: SecurityAssessment = {
      riskScore,
      threats: {
        knownThreat: isKnownThreat,
        locationAnomaly: locationRisk.isAnomalous,
        velocityAnomaly: velocityRisk.isAnomalous,
        newDevice: deviceRisk.isNewDevice
      },
      actions: this.determineSecurityActions(riskScore),
      metadata: {
        location: locationRisk.location,
        previousLocations: locationRisk.previousLocations,
        loginFrequency: velocityRisk.frequency,
        deviceInfo: deviceRisk.deviceInfo
      }
    };

    // Log security event
    await this.logSecurityEvent({
      type: 'login_attempt',
      email,
      ip,
      userAgent,
      riskScore,
      assessment,
      timestamp
    });

    // Trigger alerts if necessary
    if (riskScore > 70) {
      await this.triggerSecurityAlert(assessment, loginData);
    }

    return assessment;
  }

  private async calculateRiskScore(loginData: LoginAttempt): Promise<number> {
    let score = 0;
    
    // IP reputation check
    if (await this.checkThreatIntelligence(loginData.ip)) {
      score += 40;
    }
    
    // Geolocation risk
    const locationRisk = await this.analyzeLocationAnomaly(loginData.email, loginData.ip);
    if (locationRisk.isAnomalous) {
      score += 25;
    }
    
    // Time-based risk
    const timeRisk = await this.analyzeTimeAnomaly(loginData.email, loginData.timestamp);
    if (timeRisk.isUnusual) {
      score += 15;
    }
    
    // Velocity risk
    const velocityRisk = await this.analyzeLoginVelocity(loginData.email, loginData.ip);
    if (velocityRisk.isAnomalous) {
      score += 20;
    }
    
    return Math.min(score, 100);
  }

  // =============================================================================
  // LOCATION ANOMALY DETECTION
  // =============================================================================

  private async analyzeLocationAnomaly(email: string, ip: string): Promise<LocationRisk> {
    // Mock location data - in production, use geoip-lite or similar service
    const currentLocation = this.mockGeoLookup(ip);
    if (!currentLocation) {
      return { isAnomalous: true, location: null, previousLocations: [] };
    }

    // Get historical login locations
    const historicalLogins = await this.db.query(`
      SELECT DISTINCT ip_address, location_data
      FROM audit_logs 
      WHERE user_email = $1 
        AND action = 'login' 
        AND created_at >= NOW() - INTERVAL '30 days'
      ORDER BY created_at DESC
      LIMIT 10
    `, [email]);

    const previousLocations = historicalLogins
      .map(login => JSON.parse(login.location_data || '{}'))
      .filter(loc => loc.city);

    if (previousLocations.length === 0) {
      return { isAnomalous: false, location: currentLocation, previousLocations: [] };
    }

    // Calculate distance from previous locations
    const distances = previousLocations.map(prevLoc => 
      this.calculateDistance(
        currentLocation.ll[0], currentLocation.ll[1],
        prevLoc.ll[0], prevLoc.ll[1]
      )
    );

    const minDistance = Math.min(...distances);
    const isAnomalous = minDistance > this.alertThresholds.suspiciousLocationDistance;

    return {
      isAnomalous,
      location: currentLocation,
      previousLocations,
      minDistance
    };
  }

  // =============================================================================
  // VELOCITY ANALYSIS
  // =============================================================================

  private async analyzeLoginVelocity(email: string, ip: string): Promise<VelocityRisk> {
    const recentLogins = await this.db.query(`
      SELECT ip_address, created_at
      FROM audit_logs 
      WHERE user_email = $1 
        AND action = 'login' 
        AND created_at >= NOW() - INTERVAL '1 hour'
      ORDER BY created_at DESC
    `, [email]);

    const loginCount = recentLogins.length;
    const uniqueIPs = new Set(recentLogins.map(login => login.ip_address)).size;
    
    // Check for impossible travel
    if (recentLogins.length > 1) {
      const impossibleTravel = await this.detectImpossibleTravel(recentLogins);
      if (impossibleTravel.detected) {
        return {
          isAnomalous: true,
          frequency: loginCount,
          impossibleTravel
        };
      }
    }

    // Check for rapid requests from same IP
    const sameIPLogins = recentLogins.filter(login => login.ip_address === ip);
    const isRapidAttempt = sameIPLogins.length > this.alertThresholds.maxLoginAttempts;

    return {
      isAnomalous: isRapidAttempt || uniqueIPs > 3,
      frequency: loginCount,
      uniqueIPs,
      rapidAttempts: isRapidAttempt
    };
  }

  // =============================================================================
  // GDPR COMPLIANCE AUTOMATION
  // =============================================================================

  async handleDataDeletionRequest(tenantId: string, userId: string, requesterId: string): Promise<DeletionResult> {
    console.log(`🗑️ Processing GDPR deletion request for user ${userId} in tenant ${tenantId}`);
    
    // Verify requester authorization
    const isAuthorized = await this.verifyDeletionAuthorization(requesterId, userId, tenantId);
    if (!isAuthorized) {
      throw new Error('Unauthorized deletion request');
    }

    // Log the deletion request
    await this.logComplianceEvent({
      type: 'data_deletion_request',
      tenantId,
      userId,
      requesterId,
      timestamp: new Date()
    });

    const deletionTasks = [
      { table: 'leads', condition: 'user_id = $1 AND tenant_id = $2' },
      { table: 'deals', condition: 'user_id = $1 AND tenant_id = $2' },
      { table: 'activities', condition: 'user_id = $1 AND tenant_id = $2' },
      { table: 'contacts', condition: 'user_id = $1 AND tenant_id = $2' },
      { table: 'audit_logs', condition: 'user_id = $1 AND tenant_id = $2' },
      { table: 'user_sessions', condition: 'user_id = $1 AND tenant_id = $2' },
      { table: 'billing_events', condition: 'user_id = $1 AND tenant_id = $2' }
    ];

    const deletionResults: DeletionRecord[] = [];

    for (const task of deletionTasks) {
      try {
        // Count records before deletion
        const countResult = await this.db.query(
          `SELECT COUNT(*) as count FROM ${task.table} WHERE ${task.condition}`,
          [userId, tenantId]
        );
        const recordCount = parseInt(countResult[0].count);

        // Perform deletion
        const deleteResult = await this.db.query(
          `DELETE FROM ${task.table} WHERE ${task.condition}`,
          [userId, tenantId]
        );

        deletionResults.push({
          table: task.table,
          recordsDeleted: recordCount,
          success: true,
          timestamp: new Date()
        });

        console.log(`✅ Deleted ${recordCount} records from ${task.table}`);
      } catch (error) {
        console.error(`❌ Failed to delete from ${task.table}:`, error);
        deletionResults.push({
          table: task.table,
          recordsDeleted: 0,
          success: false,
          error: error.message,
          timestamp: new Date()
        });
      }
    }

    // Generate deletion certificate
    const certificate = await this.generateDeletionCertificate(
      tenantId,
      userId,
      deletionResults
    );

    // Invalidate caches
    await cacheManager.invalidateTenantCache(tenantId);

    return {
      success: deletionResults.every(r => r.success),
      deletionResults,
      certificate,
      totalRecordsDeleted: deletionResults.reduce((sum, r) => sum + r.recordsDeleted, 0)
    };
  }

  async generateDataExport(tenantId: string, userId: string): Promise<DataExport> {
    console.log(`📤 Generating GDPR data export for user ${userId} in tenant ${tenantId}`);

    const exportData: any = {};
    
    const exportTables = [
      { table: 'leads', fields: '*' },
      { table: 'deals', fields: '*' },
      { table: 'activities', fields: '*' },
      { table: 'contacts', fields: '*' },
      { table: 'audit_logs', fields: 'action, created_at, ip_address, user_agent' }
    ];

    for (const tableConfig of exportTables) {
      try {
        const data = await this.db.query(
          `SELECT ${tableConfig.fields} FROM ${tableConfig.table} 
           WHERE user_id = $1 AND tenant_id = $2`,
          [userId, tenantId]
        );
        exportData[tableConfig.table] = data;
      } catch (error) {
        console.error(`Failed to export ${tableConfig.table}:`, error);
        exportData[tableConfig.table] = [];
      }
    }

    // Calculate total record count
    const totalRecords = Object.values(exportData).reduce((sum: number, records: unknown): number => {
      const recordArray = Array.isArray(records) ? records : [];
      return sum + recordArray.length;
    }, 0) as number;

    const exportResult: DataExport = {
      exportId: crypto.randomUUID(),
      tenantId,
      userId,
      data: exportData,
      exportedAt: new Date(),
      format: 'JSON',
      recordCount: totalRecords,
      signature: await this.signExport(exportData)
    };

    // Log export event
    await this.logComplianceEvent({
      type: 'data_export',
      tenantId,
      userId,
      exportId: exportResult.exportId,
      recordCount: exportResult.recordCount,
      timestamp: new Date()
    });

    return exportResult;
  }

  // =============================================================================
  // ADVANCED MFA SYSTEM
  // =============================================================================

  async setupBiometricAuth(userId: string, tenantId: string, deviceInfo: DeviceInfo): Promise<BiometricSetup> {
    const challenge = crypto.randomBytes(32).toString('base64');
    const registrationId = crypto.randomUUID();

    await this.db.query(`
      INSERT INTO biometric_registrations (
        id, user_id, tenant_id, challenge, device_info, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, 'pending', NOW())
    `, [registrationId, userId, tenantId, challenge, JSON.stringify(deviceInfo)]);

    return {
      registrationId,
      challenge,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    };
  }

  async verifyBiometric(registrationId: string, biometricData: any): Promise<boolean> {
    const registration = await this.db.query(
      'SELECT * FROM biometric_registrations WHERE id = $1 AND status = $2',
      [registrationId, 'pending']
    );

    if (registration.length === 0) {
      return false;
    }

    // In a real implementation, you would verify the biometric data
    // against the stored challenge using WebAuthn or similar
    const isValid = await this.validateBiometricData(
      biometricData,
      registration[0].challenge
    );

    if (isValid) {
      await this.db.query(
        'UPDATE biometric_registrations SET status = $1, verified_at = NOW() WHERE id = $2',
        ['verified', registrationId]
      );
    }

    return isValid;
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  private mockGeoLookup(ip: string): any {
    // Mock geolocation data - in production, use geoip-lite or similar
    return {
      city: 'Unknown',
      country: 'XX',
      ll: [0, 0] // latitude, longitude
    };
  }

  private async initializeThreatIntelligence(): Promise<void> {
    // In production, this would load from threat intelligence feeds
    const knownThreats = [
      '192.168.1.100', // Example bad IP
      '10.0.0.1'       // Example bad IP
    ];
    
    knownThreats.forEach(ip => this.threatIntelligence.add(ip));
  }

  private async checkThreatIntelligence(ip: string): Promise<boolean> {
    return this.threatIntelligence.has(ip);
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLon = this.degreesToRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.degreesToRadians(lat1)) * Math.cos(this.degreesToRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private async logSecurityEvent(event: SecurityEvent): Promise<void> {
    await this.db.query(`
      INSERT INTO security_events (
        type, user_email, ip_address, user_agent, risk_score, 
        assessment_data, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      event.type,
      event.email,
      event.ip,
      event.userAgent,
      event.riskScore,
      JSON.stringify(event.assessment),
      event.timestamp
    ]);
  }

  private async logComplianceEvent(event: ComplianceEvent): Promise<void> {
    await this.db.query(`
      INSERT INTO compliance_events (
        type, tenant_id, user_id, requester_id, event_data, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      event.type,
      event.tenantId,
      event.userId,
      event.requesterId,
      JSON.stringify(event),
      event.timestamp
    ]);
  }

  private determineSecurityActions(riskScore: number): SecurityAction[] {
    const actions: SecurityAction[] = [];
    
    if (riskScore > 90) {
      actions.push('block_login', 'require_admin_approval');
    } else if (riskScore > 70) {
      actions.push('require_mfa', 'send_security_alert');
    } else if (riskScore > 50) {
      actions.push('require_email_verification');
    }
    
    return actions;
  }

  private async triggerSecurityAlert(assessment: SecurityAssessment, loginData: LoginAttempt): Promise<void> {
    // In production, this would send to security team via email/Slack/etc.
    console.log('🚨 Security alert triggered:', {
      riskScore: assessment.riskScore,
      email: loginData.email,
      ip: loginData.ip,
      threats: assessment.threats
    });
  }

  private async detectImpossibleTravel(recentLogins: any[]): Promise<ImpossibleTravelResult> {
    // Implementation for impossible travel detection
    return { detected: false };
  }

  private async analyzeTimeAnomaly(email: string, timestamp: Date): Promise<{ isUnusual: boolean }> {
    // Implementation for time-based anomaly detection
    return { isUnusual: false };
  }

  private async analyzeDeviceFingerprint(email: string, userAgent: string): Promise<DeviceRisk> {
    // Implementation for device fingerprinting
    return { isNewDevice: false, deviceInfo: {} };
  }

  private async verifyDeletionAuthorization(requesterId: string, userId: string, tenantId: string): Promise<boolean> {
    // Check if requester has permission to delete user data
    const result = await this.db.query(`
      SELECT 1 FROM users 
      WHERE id = $1 AND tenant_id = $2 
        AND (id = $3 OR role IN ('admin', 'owner'))
    `, [requesterId, tenantId, userId]);
    
    return result.length > 0;
  }

  private async generateDeletionCertificate(
    tenantId: string,
    userId: string,
    deletionResults: DeletionRecord[]
  ): Promise<string> {
    const certificate = {
      certificateId: crypto.randomUUID(),
      tenantId,
      userId,
      deletionResults,
      issuedAt: new Date(),
      totalRecordsDeleted: deletionResults.reduce((sum, r) => sum + r.recordsDeleted, 0)
    };
    
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(certificate))
      .digest('hex');
  }

  private async signExport(exportData: any): Promise<string> {
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(exportData))
      .digest('hex');
  }

  private async validateBiometricData(biometricData: any, challenge: string): Promise<boolean> {
    // In a real implementation, this would use WebAuthn or similar
    return true;
  }
}

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

interface LoginAttempt {
  email: string;
  ip: string;
  userAgent: string;
  timestamp: Date;
}

interface SecurityAssessment {
  riskScore: number;
  threats: {
    knownThreat: boolean;
    locationAnomaly: boolean;
    velocityAnomaly: boolean;
    newDevice: boolean;
  };
  actions: SecurityAction[];
  metadata: any;
}

interface LocationRisk {
  isAnomalous: boolean;
  location: any;
  previousLocations: any[];
  minDistance?: number;
}

interface VelocityRisk {
  isAnomalous: boolean;
  frequency: number;
  uniqueIPs?: number;
  rapidAttempts?: boolean;
  impossibleTravel?: ImpossibleTravelResult;
}

interface DeviceRisk {
  isNewDevice: boolean;
  deviceInfo: any;
}

interface ImpossibleTravelResult {
  detected: boolean;
}

interface SecurityEvent {
  type: string;
  email: string;
  ip: string;
  userAgent: string;
  riskScore: number;
  assessment: SecurityAssessment;
  timestamp: Date;
}

interface ComplianceEvent {
  type: string;
  tenantId: string;
  userId: string;
  requesterId?: string;
  exportId?: string;
  recordCount?: number;
  timestamp: Date;
}

interface DeletionRecord {
  table: string;
  recordsDeleted: number;
  success: boolean;
  error?: string;
  timestamp: Date;
}

interface DeletionResult {
  success: boolean;
  deletionResults: DeletionRecord[];
  certificate: string;
  totalRecordsDeleted: number;
}

interface DataExport {
  exportId: string;
  tenantId: string;
  userId: string;
  data: any;
  exportedAt: Date;
  format: string;
  recordCount: number;
  signature: string;
}

interface BiometricSetup {
  registrationId: string;
  challenge: string;
  expiresAt: Date;
}

interface DeviceInfo {
  userAgent: string;
  platform: string;
  fingerprint: string;
}

interface AlertThresholds {
  maxLoginAttempts: number;
  rapidRequestThreshold: number;
  suspiciousLocationDistance: number;
  dataAccessAnomalyThreshold: number;
}

type SecurityAction = 'block_login' | 'require_mfa' | 'require_email_verification' | 'send_security_alert' | 'require_admin_approval';

// Export singleton instance
export const threatDetection = new ThreatDetectionSystem();