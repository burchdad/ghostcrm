import { NextResponse } from "next/server";
import { generateRegistrationOptions, verifyRegistrationResponse } from "@simplewebauthn/server";
import { queryDb } from "@/db/mssql";

// Set these in env for prod
const rpID = process.env.WEBAUTHN_RP_ID || "localhost"; // e.g. app.ghostcrm.com
const expectedOrigin = process.env.WEBAUTHN_EXPECTED_ORIGIN || "http://localhost:3000"; // EXACT origin incl. scheme/port

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const options = await generateRegistrationOptions({
    rpName: "GhostCRM",
    rpID,                           // host only (no scheme/port)
    userID: email,                  // your stable user id
    userName: email,
  });

  // Persist challenge for this user
  await queryDb(
    "UPDATE users SET webauthn_register_challenge=@param0 WHERE email=@param1",
    [options.challenge, email]
  );

  return NextResponse.json(options);
}

export async function PUT(req: Request) {
  const { email, attestationResponse } = await req.json();
  if (!email || !attestationResponse) {
    return NextResponse.json({ error: "Email and attestation required" }, { status: 400 });
  }

  const rows = await queryDb(
    "SELECT TOP 1 webauthn_register_challenge FROM users WHERE email=@param0",
    [email]
  );
  const expectedChallenge = rows?.[0]?.webauthn_register_challenge;
  if (!expectedChallenge) return NextResponse.json({ error: "No challenge" }, { status: 400 });

  const { verified, registrationInfo } = await verifyRegistrationResponse({
    response: attestationResponse,
    expectedChallenge,
    expectedOrigin,                 // must match your frontend origin EXACTLY
    expectedRPID: rpID,
    requireUserVerification: true,
  });

  if (!verified || !registrationInfo) {
    return NextResponse.json({ error: "Verification failed" }, { status: 401 });
  }

  // NEW API SHAPE — everything is under registrationInfo.credential
  const { credential, credentialDeviceType, credentialBackedUp } = registrationInfo;
  // credential.id (Base64URLString), credential.publicKey (Base64URLString), credential.counter (number), credential.transports? (array)

  await queryDb(
    `INSERT INTO webauthn_credentials (email, credential_id, public_key, counter, transports, device_type, backed_up)
     VALUES (@param0,@param1,@param2,@param3,@param4,@param5,@param6)`,
    [
      email,
      credential.id,
      credential.publicKey,
      credential.counter ?? 0,
      JSON.stringify(credential.transports ?? []),
      String(credentialDeviceType || ""),
      credentialBackedUp ? 1 : 0,
    ]
  );

  await queryDb("UPDATE users SET webauthn_register_challenge=NULL WHERE email=@param0", [email]);

  return NextResponse.json({ success: true });
}
