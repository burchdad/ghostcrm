// Supabase Edge Function: automation-runner
// If running in Deno, ensure you have the correct Deno setup and tsconfig for remote imports.
// If running in Node.js, use the npm http server package instead:


// Use Deno's standard http server for Edge Functions
let serve;
try {
  // @ts-ignore
  serve = (await import("https://deno.land/std@0.177.0/http/server.ts")).serve;
} catch {
  // Not running in Deno, provide fallback or error
  throw new Error("This function must be run in a Deno Edge Function environment.");
}

/// <reference lib="deno.ns" />
serve(async (req: Request) => {
  // Validate automation token
  let automationToken;
  // Deno global fallback
  if (typeof Deno !== "undefined" && Deno.env) {
    automationToken = Deno.env.get("AUTOMATION_TOKEN");
  } else {
    automationToken = req.headers.get("x-automation-token") || process.env.AUTOMATION_TOKEN;
  }
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (token !== automationToken) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  }

  // ...your automation logic here...

  return new Response(JSON.stringify({ ok: true, ran: true, time: new Date().toISOString() }), {
    headers: { "Content-Type": "application/json" },
  });
});
