export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { generateAuthenticationOptions, verifyAuthenticationResponse } from "@simplewebauthn/server";
import { queryDb } from "@/db/mssql";
import jwt from "jsonwebtoken";

const rpID = process.env.WEBAUTHN_RP_ID || "localhost";
const expectedOrigin = process.env.WEBAUTHN_EXPECTED_ORIGIN || "http://localhost:3000";

// Get JWT secret with runtime validation
function getJWTSecret() {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET must be set");
  }
  return JWT_SECRET;
}

export async function POST(req: Request) {
  // CSRF origin check
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_BASE_URL,
    process.env.NEXT_PUBLIC_DEPLOY_URL,
    "http://localhost:3000",
    "https://ghostcrm.com"
  ].filter((url): url is string => Boolean(url));
  const origin = req.headers.get("origin") || req.headers.get("referer") || "";
  if (origin && !allowedOrigins.some(o => origin.startsWith(o))) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const credRow = (await queryDb(
    "SELECT TOP 1 credential_id, transports FROM webauthn_credentials WHERE email=@param0",
    [email]
  ))?.[0];
  if (!credRow) return NextResponse.json({ error: "No credential found" }, { status: 404 });

  // transports is optional; keep it if present and valid
  let transports: any[] | undefined;
  try { transports = credRow.transports ? JSON.parse(credRow.transports) : undefined; } catch { transports = undefined; }

  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: "preferred",
    // ✅ NO `type` here; only `id` and optional `transports`
    allowCredentials: transports
      ? [{ id: credRow.credential_id, transports }]
      : [{ id: credRow.credential_id }],
  });

  await queryDb("UPDATE users SET webauthn_auth_challenge=@param0 WHERE email=@param1", [
    options.challenge,
    email,
  ]);

  return NextResponse.json(options);
}

export async function PUT(req: Request) {
  // CSRF origin check
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_BASE_URL,
    process.env.NEXT_PUBLIC_DEPLOY_URL,
    "http://localhost:3000",
    "https://ghostcrm.com"
  ];
  const origin = req.headers.get("origin") || req.headers.get("referer") || "";
  if (origin && !allowedOrigins.some(o => origin.startsWith(o))) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
  const { email, assertionResponse } = await req.json();
  if (!email || !assertionResponse) {
    return NextResponse.json({ error: "Email and assertion required" }, { status: 400 });
  }

  const userRow = (await queryDb(
    "SELECT TOP 1 webauthn_auth_challenge, id, role FROM users WHERE email=@param0",
    [email]
  ))?.[0];
  const expectedChallenge = userRow?.webauthn_auth_challenge;

  const credRow = (await queryDb(
    "SELECT TOP 1 credential_id, public_key, counter, transports FROM webauthn_credentials WHERE email=@param0",
    [email]
  ))?.[0];

  if (!expectedChallenge || !credRow) {
    return NextResponse.json({ error: "No challenge or credential" }, { status: 400 });
  }

  const transports = (() => {
    try { return JSON.parse(credRow.transports || "[]"); } catch { return []; }
  })();

  const { verified, authenticationInfo } = await verifyAuthenticationResponse({
    response: assertionResponse,
    expectedChallenge,
    expectedOrigin,
    expectedRPID: rpID,

    // NEW API SHAPE — pass `credential`, not `authenticator`
    credential: {
      id: credRow.credential_id,           // Base64URLString
      publicKey: credRow.public_key,       // Base64URLString
      counter: credRow.counter ?? 0,
      transports,
    },
    requireUserVerification: false,
  });

  if (!verified) return NextResponse.json({ error: "Authentication failed" }, { status: 401 });

  // Update counter if provided
  const newCounter = authenticationInfo?.newCounter;
  if (typeof newCounter === "number") {
    await queryDb("UPDATE webauthn_credentials SET counter=@param0 WHERE email=@param1", [
      newCounter,
      email,
    ]);
  }

  await queryDb("UPDATE users SET webauthn_auth_challenge=NULL WHERE email=@param0", [email]);

  // issue session
  const token = jwt.sign({ sub: String(userRow.id), email, role: userRow.role }, getJWTSecret(), { expiresIn: "2h" });
  const res = NextResponse.json({ success: true });
  res.headers.set("Set-Cookie", `ghostcrm_jwt=${token}; HttpOnly; Secure; Path=/; Max-Age=7200; SameSite=Strict`);
  return res;
}
