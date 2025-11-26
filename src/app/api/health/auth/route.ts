export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { queryDb } from "@/db/mssql";

const REQUIRED_TABLES = ["users", "password_resets", "webauthn_credentials", "audit_logs"];
const REQUIRED_USER_COLS = [
  "id", "email", "password_hash", "role",
  "totp_secret", "totp_temp_secret",
  "webauthn_register_challenge", "webauthn_auth_challenge",
];

const CRITICAL_ENVS = ["JWT_SECRET"] as const;
const RECOMMENDED_ENVS = ["APP_BASE_URL", "WEBAUTHN_RP_ID", "WEBAUTHN_EXPECTED_ORIGIN", "SENDGRID_API_KEY", "SENDGRID_FROM"] as const;

export async function GET() {
  const env = {
    missingCritical: CRITICAL_ENVS.filter(k => !process.env[k]),
    missingRecommended: RECOMMENDED_ENVS.filter(k => !process.env[k]),
  };

  let missingTables: string[] = [];
  let missingUserCols: string[] = [];
  let userCount = 0;

  try {
    const tableRows = await queryDb(
      "SELECT name FROM sys.tables WHERE name IN ('users','password_resets','webauthn_credentials','audit_logs')",
      []
    );
    const tablesFound = new Set((tableRows || []).map((r) => String(r.name).toLowerCase()));
    missingTables = REQUIRED_TABLES.filter((t) => !tablesFound.has(t));

    const colRows = await queryDb(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_NAME='users'
         AND COLUMN_NAME IN ('id','email','password_hash','role',
                             'totp_secret','totp_temp_secret',
                             'webauthn_register_challenge','webauthn_auth_challenge')`,
      []
    );
    const colsFound = new Set((colRows || []).map((r) => String(r.COLUMN_NAME).toLowerCase()));
    missingUserCols = REQUIRED_USER_COLS.filter((c) => !colsFound.has(c));

    const countRows = await queryDb("SELECT COUNT(*) AS c FROM dbo.users", []);
    userCount = Number(countRows?.[0]?.c ?? 0);
  } catch (e) {
    const body = {
      ok: false,
      env: {
        criticalOk: CRITICAL_ENVS.every(k => !!process.env[k]),
        missingCritical: CRITICAL_ENVS.filter(k => !process.env[k]),
        missingRecommended: RECOMMENDED_ENVS.filter(k => !process.env[k]),
      },
      db: {
        tables: { missing: ["users","password_resets","webauthn_credentials","audit_logs"] },
        usersTable: { missingColumns: ["id","email","password_hash","role","totp_secret","totp_temp_secret","webauthn_register_challenge","webauthn_auth_challenge"] },
        userCount: 0,
      },
      error: "db_error",
      detail: String(e),
      hint: "Check DB connection envs (DB_HOST/USER/PASSWORD/NAME), firewall/port, and that the app is pointing at the same DB you migrated.",
    };
    return NextResponse.json(body, { status: 500 });
  }

  const ok = env.missingCritical.length === 0 && missingTables.length === 0 && missingUserCols.length === 0;

  return NextResponse.json(
    {
      ok,
      env: {
        criticalOk: env.missingCritical.length === 0,
        missingCritical: env.missingCritical,
        missingRecommended: env.missingRecommended,
      },
      db: {
        tables: { missing: missingTables },
        usersTable: { missingColumns: missingUserCols },
        userCount,
      },
      hint: ok
        ? "Auth stack looks healthy."
        : "Run migrations (002_auth_security.sql) and set missing envs.",
    },
    { status: ok ? 200 : 500 }
  );
}
