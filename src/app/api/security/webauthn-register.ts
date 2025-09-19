import { NextResponse } from "next/server";
import { generateRegistrationOptions, verifyRegistrationResponse } from "@simplewebauthn/server";

// In-memory credential store (replace with DB in production)
const userCredentials: Record<string, any> = {};
const rpID = "localhost"; // Change to your domain in production
const rpName = "GhostCRM";

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });
  // Generate registration options
  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userID: email,
    userName: email,
  });
  // Store challenge for verification
  userCredentials[email] = { challenge: options.challenge };
  return NextResponse.json(options);
}

export async function PUT(req: Request) {
  const { email, attestationResponse } = await req.json();
  if (!email || !attestationResponse) return NextResponse.json({ error: "Email and attestation required" }, { status: 400 });
  const expectedChallenge = userCredentials[email]?.challenge;
  if (!expectedChallenge) return NextResponse.json({ error: "No challenge found" }, { status: 400 });
  try {
    const verification = await verifyRegistrationResponse({
      response: attestationResponse,
      expectedChallenge,
      expectedOrigin: `https://${rpID}`,
      expectedRPID: rpID,
    });
    if (!verification.verified) return NextResponse.json({ error: "Verification failed" }, { status: 401 });
    // Store credential for user
    userCredentials[email].credential = verification.registrationInfo;
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Verification error" }, { status: 500 });
  }
}
