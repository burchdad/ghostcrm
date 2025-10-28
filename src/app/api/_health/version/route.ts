export async function GET() {
  return Response.json({ ok:true, sha: process.env.VERCEL_GIT_COMMIT_SHA || "dev", builtAt: process.env.BUILD_TIME || new Date().toISOString() });
}

