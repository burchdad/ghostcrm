IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
CREATE TABLE users (
  id INT IDENTITY(1,1) PRIMARY KEY,
  email NVARCHAR(255) NOT NULL UNIQUE,
  email_verified BIT DEFAULT 0,
  email_verification_token NVARCHAR(64),
  password_hash NVARCHAR(255) NOT NULL,
  totp_secret NVARCHAR(64),
  webauthn_credentials NVARCHAR(MAX),
  jwt_token NVARCHAR(512),
  created_at DATETIME DEFAULT GETDATE(),
  updated_at DATETIME DEFAULT GETDATE(),
  lockout_until DATETIME,
  failed_attempts INT DEFAULT 0
);

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='audit_logs' AND xtype='U')
CREATE TABLE audit_logs (
  id INT IDENTITY(1,1) PRIMARY KEY,
  user_id INT FOREIGN KEY REFERENCES users(id),
  event_type NVARCHAR(64) NOT NULL,
  event_details NVARCHAR(MAX),
  created_at DATETIME DEFAULT GETDATE()
);
