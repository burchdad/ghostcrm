-- =========
-- USERS: add missing columns if they don't exist
-- =========
IF COL_LENGTH('dbo.users','totp_secret') IS NULL
  ALTER TABLE dbo.users ADD totp_secret NVARCHAR(64) NULL;

IF COL_LENGTH('dbo.users','totp_temp_secret') IS NULL
  ALTER TABLE dbo.users ADD totp_temp_secret NVARCHAR(64) NULL;

IF COL_LENGTH('dbo.users','webauthn_register_challenge') IS NULL
  ALTER TABLE dbo.users ADD webauthn_register_challenge NVARCHAR(255) NULL;

IF COL_LENGTH('dbo.users','webauthn_auth_challenge') IS NULL
  ALTER TABLE dbo.users ADD webauthn_auth_challenge NVARCHAR(255) NULL;

-- (Optional) If you previously stored WebAuthn JSON/array on users, keep it for now.
-- You can drop it later once you're confident nothing reads it:
-- IF COL_LENGTH('dbo.users','webauthn_credentials') IS NOT NULL
--   ALTER TABLE dbo.users DROP COLUMN webauthn_credentials;

-- =========
-- PASSWORD RESETS
-- =========
IF OBJECT_ID('dbo.password_resets','U') IS NULL
BEGIN
  CREATE TABLE dbo.password_resets (
    id           INT IDENTITY(1,1) PRIMARY KEY,
    email        NVARCHAR(255) NOT NULL,
    token_hash   NVARCHAR(64)  NOT NULL,  -- sha256 hex
    expires_at   DATETIME2      NOT NULL,
    created_at   DATETIME2      NOT NULL DEFAULT SYSUTCDATETIME()
  );

  -- Lookups for validity checks and cleanups
  CREATE INDEX IX_password_resets_email_expires
    ON dbo.password_resets (email, expires_at);
  CREATE INDEX IX_password_resets_token_hash
    ON dbo.password_resets (token_hash);
END;

-- =========
-- WEBAUTHN CREDENTIALS
-- =========
IF OBJECT_ID('dbo.webauthn_credentials','U') IS NULL
BEGIN
  CREATE TABLE dbo.webauthn_credentials (
    id            INT IDENTITY(1,1) PRIMARY KEY,
    email         NVARCHAR(255) NOT NULL,
    -- (Optional) keep user_id if you want a FK; otherwise email lookups are fine
    -- user_id    INT NULL FOREIGN KEY REFERENCES dbo.users(id),
    credential_id NVARCHAR(512) NOT NULL,  -- Base64URL string from registrationInfo.credential.id
    public_key    NVARCHAR(MAX) NOT NULL,  -- Base64URL string from registrationInfo.credential.publicKey
    counter       INT NOT NULL DEFAULT(0),
    transports    NVARCHAR(MAX) NULL,      -- JSON array of transports if provided
    device_type   NVARCHAR(50)  NULL,      -- "singleDevice" | "multiDevice" (optional)
    backed_up     BIT NOT NULL DEFAULT(0),
    created_at    DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
  );

  -- Fast lookups & dedupe per user/credential
  CREATE INDEX IX_webauthn_credentials_email ON dbo.webauthn_credentials (email);
  CREATE UNIQUE INDEX UX_webauthn_credentials_email_cred
    ON dbo.webauthn_credentials (email, credential_id);
END;
