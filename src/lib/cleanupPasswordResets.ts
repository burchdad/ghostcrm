import { queryDb } from "@/db/mssql";

export async function cleanupExpiredPasswordResets() {
  // Remove password reset rows older than 24 hours
  const sql = `DELETE FROM password_resets WHERE requested_at < DATEADD(hour, -24, GETDATE())`;
  try {
    const result = await queryDb(sql, []);
    return { success: true, deleted: result?.rowsAffected?.[0] ?? 0 };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}
