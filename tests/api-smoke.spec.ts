import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('API Smoke Tests', () => {
  test('GET /api/health/dashboard returns metrics', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/api/health/dashboard`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.metrics).toBeDefined();
    expect(typeof body.metrics.leads).toBe('number');
    expect(typeof body.metrics.deals).toBe('number');
    expect(typeof body.metrics.messagesToday).toBe('number');
  });

  test('POST /api/leads creates a lead', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/leads`, {
      data: { name: 'Test Lead', phone: '+1234567890' }
    });
    expect([200,201]).toContain(res.status());
    const body = await res.json();
    expect(body.id).toBeDefined();
  });

  test('POST /api/deals creates a deal', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/deals`, {
      data: { name: 'Test Deal', value: 1000 }
    });
    expect([200,201]).toContain(res.status());
    const body = await res.json();
    expect(body.id).toBeDefined();
  });

  test('POST /api/appointments creates an appointment', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/appointments`, {
      data: { title: 'Test Appt', time: new Date().toISOString() }
    });
    expect([200,201]).toContain(res.status());
    const body = await res.json();
    expect(body.id).toBeDefined();
  });

  test('POST /api/messages/send returns ok or error', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/messages/send`, {
      data: { to: '+1234567890', body: 'Hello!' }
    });
    expect([200,201,202,429,502]).toContain(res.status());
    const body = await res.json();
    expect(body.ok === true || body.error).toBeTruthy();
  });
});
