// Simple Next.js route handler wrapper for async functions
export function createRouteHandler(fn: (req: Request) => Promise<{ status: number; body: any }>) {
  return async function handler(req: Request) {
    try {
      const result = await fn(req);
      return new Response(JSON.stringify(result.body), {
        status: result.status,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err?.message || String(err) }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  };
}
