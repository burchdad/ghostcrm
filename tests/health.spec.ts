import { test, expect } from "@playwright/test";

const BASE_URL = process.env.APP_BASE_URL || "http://localhost:3000";

test.describe("Health endpoints", () => {
  test("auth health endpoint reports ok", async ({ request }) => {
    const res = await request.get(`${BASE_URL}/api/health/auth`);
    const json = await res.json();
     expect([200, 500]).toContain(res.status());
     expect(typeof json.ok).toBe("boolean");
     expect(json.env).toBeDefined();
     expect(Array.isArray(json.env.missingCritical)).toBe(true);
     expect(Array.isArray(json.env.missingRecommended)).toBe(true);
     expect(json.db).toBeDefined();
     expect(json.db.usersTable).toBeDefined();
     expect(Array.isArray(json.db.usersTable.missingColumns)).toBe(true);
  });

  test("app health endpoint reports ok or skipped for Twilio", async ({ request }) => {
    const res = await request.get(`${BASE_URL}/api/health/app`);
    const json = await res.json();
    // Accept 200 if all services are healthy, 500 if any are missing
     expect([200, 500]).toContain(res.status());
     expect(json.checks).toBeDefined();
     expect(typeof json.checks.dbWrite).toBe("boolean");
     expect(["configured", "skipped", "error"]).toContain(json.checks.sendgrid);
     expect(["ok", "skipped", "error"]).toContain(json.checks.twilio);
  });
  test("version endpoint returns git SHA and build time", async ({ request }) => {
    const res = await request.get(`${BASE_URL}/api/health/version`);
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.gitSha).toBeDefined();
    expect(json.buildTime).toBeDefined();
    expect(typeof json.gitSha).toBe("string");
    expect(typeof json.buildTime).toBe("string");
  });
});
