// scripts/migrate-users-sqlserver.js
// Usage: DB_* envs (below), then:  node scripts/migrate-users-sqlserver.js
const sql = require("mssql");

const cfg = {
  server: process.env.DB_HOST,            // e.g. "localhost" or "localhost\\SQLEXPRESS"
  port: process.env.DB_INSTANCE ? undefined : Number(process.env.DB_PORT || 1433),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  options: {
    instanceName: process.env.DB_INSTANCE || undefined, // e.g. SQLEXPRESS
    encrypt: process.env.DB_ENCRYPT ? process.env.DB_ENCRYPT === "true" : true,
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERT
      ? process.env.DB_TRUST_SERVER_CERT === "true"
      : true,
  },
  pool: { max: 5, min: 0, idleTimeoutMillis: 30000 },
};

const MIGRATION_SQL = `
-- Ensure table exists
IF OBJECT_ID('dbo.users','U') IS NULL
BEGIN
  CREATE TABLE dbo.users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    email NVARCHAR(255) NOT NULL,
    password_hash NVARCHAR(255) NOT NULL,
    role NVARCHAR(50) NOT NULL CONSTRAINT DF_users_role DEFAULT ('user'),
    created_at DATETIME2 NOT NULL CONSTRAINT DF_users_created_at DEFAULT SYSUTCDATETIME()
  );
END;

-- Required columns and sizes (add only if missing)
IF COL_LENGTH('dbo.users','email') IS NULL
  ALTER TABLE dbo.users ADD email NVARCHAR(255) NOT NULL;
IF COL_LENGTH('dbo.users','password_hash') IS NULL
  ALTER TABLE dbo.users ADD password_hash NVARCHAR(255) NOT NULL;
IF COL_LENGTH('dbo.users','role') IS NULL
  ALTER TABLE dbo.users ADD role NVARCHAR(50) NOT NULL CONSTRAINT DF_users_role DEFAULT ('user');
IF COL_LENGTH('dbo.users','created_at') IS NULL
  ALTER TABLE dbo.users ADD created_at DATETIME2 NOT NULL CONSTRAINT DF_users_created_at DEFAULT SYSUTCDATETIME();

-- Unique index on email (create only if it doesn't exist)
IF NOT EXISTS (
  SELECT 1 FROM sys.indexes
  WHERE name = 'UX_users_email' AND object_id = OBJECT_ID('dbo.users')
)
  CREATE UNIQUE INDEX UX_users_email ON dbo.users(email);
`;

(async () => {
  try {
    if (!cfg.server || !cfg.user || !cfg.password || !cfg.database) {
      throw new Error("Missing DB env vars: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME");
    }

    console.log("[migrate] Connecting to SQL Server…");
    const pool = await sql.connect(cfg);
    console.log("[migrate] Connected. Running migration…");

    await pool.request().batch(MIGRATION_SQL);

    console.log("[migrate] ✅ Migration applied successfully.");
    await pool.close();
    process.exit(0);
  } catch (err) {
  console.error("[migrate] ❌ Migration failed:", err.message || err);
  console.error("[migrate] code:", err.code);
  console.error("[migrate] name:", err.name);
  console.error("[migrate] message:", err.message);
  console.error("[migrate] original:", err.originalError?.message);
  process.exit(1);
  }
})();
