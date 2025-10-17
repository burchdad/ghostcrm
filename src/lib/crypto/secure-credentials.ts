import crypto from 'crypto';

interface EncryptionResult {
  encrypted: string;
  iv: string;
  tag?: string;
}

interface DecryptionParams {
  encrypted: string;
  iv: string;
  tag?: string;
}

class SecureCredentialManager {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32; // 256 bits
  private readonly ivLength = 16; // 128 bits
  private readonly tagLength = 16; // 128 bits
  
  private encryptionKey: Buffer;

  constructor() {
    // In production, load this from environment variables or secure key management service
    const masterKey = process.env.ENCRYPTION_MASTER_KEY || this.generateMasterKey();
    this.encryptionKey = this.deriveKey(masterKey);
  }

  /**
   * Generate a cryptographically secure master key
   * In production, this should be stored in environment variables or AWS KMS
   */
  private generateMasterKey(): string {
    const key = crypto.randomBytes(32).toString('hex');
    console.warn('⚠️  Generated new encryption key. In production, set ENCRYPTION_MASTER_KEY environment variable.');
    console.warn(`Generated key: ${key}`);
    return key;
  }

  /**
   * Derive encryption key from master key using PBKDF2
   */
  private deriveKey(masterKey: string): Buffer {
    const salt = process.env.ENCRYPTION_SALT || 'ghostcrm-secure-salt-2024';
    return crypto.pbkdf2Sync(masterKey, salt, 100000, this.keyLength, 'sha256');
  }

  /**
   * Encrypt sensitive data (API keys, tokens, passwords)
   */
  public encryptCredential(plaintext: string): EncryptionResult {
    try {
      const iv = crypto.randomBytes(this.ivLength);
      const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
      cipher.setAutoPadding(true);
      
      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      return {
        encrypted,
        iv: iv.toString('hex')
      };
    } catch (error) {
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Decrypt sensitive data
   */
  public decryptCredential(params: DecryptionParams): string {
    try {
      const { encrypted, iv } = params;
      
      const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
      decipher.setAutoPadding(true);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Invalid or corrupted data'}`);
    }
  }

  /**
   * Encrypt an object containing multiple credentials
   */
  public encryptCredentialObject(credentials: Record<string, any>): Record<string, any> {
    const encrypted: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(credentials)) {
      if (this.isSensitiveField(key) && typeof value === 'string' && value.length > 0) {
        encrypted[key] = this.encryptCredential(value);
      } else {
        encrypted[key] = value;
      }
    }
    
    return encrypted;
  }

  /**
   * Decrypt an object containing encrypted credentials
   */
  public decryptCredentialObject(encryptedCredentials: Record<string, any>): Record<string, any> {
    const decrypted: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(encryptedCredentials)) {
      if (this.isSensitiveField(key) && this.isEncryptedValue(value)) {
        try {
          decrypted[key] = this.decryptCredential(value);
        } catch (error) {
          console.error(`Failed to decrypt field ${key}:`, error);
          decrypted[key] = '[DECRYPTION_ERROR]';
        }
      } else {
        decrypted[key] = value;
      }
    }
    
    return decrypted;
  }

  /**
   * Determine if a field contains sensitive data that should be encrypted
   */
  private isSensitiveField(fieldName: string): boolean {
    const sensitiveFields = [
      'apiKey',
      'apiSecret',
      'clientSecret',
      'password',
      'privateKey',
      'serviceKey',
      'accessToken',
      'refreshToken',
      'webhookSecret',
      'databasePassword',
      'connectionString'
    ];
    
    const lowerFieldName = fieldName.toLowerCase();
    return sensitiveFields.some(sensitive => 
      lowerFieldName.includes(sensitive.toLowerCase()) ||
      lowerFieldName.endsWith('key') ||
      lowerFieldName.endsWith('secret') ||
      lowerFieldName.endsWith('token') ||
      lowerFieldName.endsWith('password')
    );
  }

  /**
   * Check if a value is an encrypted credential object
   */
  private isEncryptedValue(value: any): value is EncryptionResult {
    return (
      typeof value === 'object' &&
      value !== null &&
      typeof value.encrypted === 'string' &&
      typeof value.iv === 'string'
    );
  }

  /**
   * Generate a secure session token for temporary use
   */
  public generateSessionToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Hash sensitive data for searching/comparison without storing plaintext
   */
  public hashForComparison(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Securely wipe sensitive data from memory (best effort)
   */
  public secureWipe(sensitiveString: string): void {
    if (typeof sensitiveString === 'string') {
      // In Node.js, we can't truly wipe memory, but we can try to overwrite
      try {
        for (let i = 0; i < sensitiveString.length; i++) {
          (sensitiveString as any)[i] = '0';
        }
      } catch (error) {
        // Strings are immutable in JS, so this might fail
      }
    }
  }

  /**
   * Validate encryption key strength
   */
  public validateKeyStrength(): { isValid: boolean; warnings: string[] } {
    const warnings: string[] = [];
    
    if (!process.env.ENCRYPTION_MASTER_KEY) {
      warnings.push('Using generated encryption key. Set ENCRYPTION_MASTER_KEY in production.');
    }
    
    if (!process.env.ENCRYPTION_SALT) {
      warnings.push('Using default salt. Set ENCRYPTION_SALT in production.');
    }
    
    const masterKey = process.env.ENCRYPTION_MASTER_KEY;
    if (masterKey && masterKey.length < 32) {
      warnings.push('Encryption key should be at least 32 characters long.');
    }
    
    return {
      isValid: warnings.length === 0,
      warnings
    };
  }

  /**
   * Create a masked version of sensitive data for display purposes
   */
  public maskSensitiveData(data: string, visibleChars: number = 4): string {
    if (!data || data.length <= visibleChars * 2) {
      return '****';
    }
    
    const start = data.substring(0, visibleChars);
    const end = data.substring(data.length - visibleChars);
    const maskLength = Math.max(4, data.length - (visibleChars * 2));
    const mask = '*'.repeat(maskLength);
    
    return `${start}${mask}${end}`;
  }
}

// Export singleton instance
export const credentialManager = new SecureCredentialManager();

// Export types for use in other modules
export type { EncryptionResult, DecryptionParams };