import { NextResponse } from "next/server";

// Helper to get git SHA and build time
function getVersionInfo() {
  // Try to get from env, fallback to unknown
  const gitSha = process.env.GIT_COMMIT_SHA || "unknown";
  const buildTime = process.env.BUILD_TIME || "unknown";
  return { gitSha, buildTime };
}

export async function GET() {
  const version = getVersionInfo();
  return NextResponse.json(version, { status: 200 });
}
