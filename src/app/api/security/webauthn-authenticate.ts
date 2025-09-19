import { NextResponse } from "next/server";
import { generateAuthenticationOptions, verifyAuthenticationResponse } from "@simplewebauthn/server";

// In-memory credential store (replace with DB in production)
const userCredentials: Record<string, any> = {};
const rpID = "localhost"; // Change to your domain in production

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });
  const credential = userCredentials[email]?.credential;
  if (!credential) return NextResponse.json({ error: "No credential found" }, { status: 404 });
  // Generate authentication options
  const options = await generateAuthenticationOptions({
    rpID,
    allowCredentials: [
      {
        id: credential.credentialID,
        transports: ["internal"],
      },
    ],
    userVerification: "preferred",
  });
  // Store challenge for verification
  userCredentials[email].authChallenge = options.challenge;
  return NextResponse.json(options);
}

export async function PUT(req: Request) {
  const { email, assertionResponse } = await req.json();
  if (!email || !assertionResponse) return NextResponse.json({ error: "Email and assertion required" }, { status: 400 });
  const expectedChallenge = userCredentials[email]?.authChallenge;
  const credential = userCredentials[email]?.credential;
  if (!expectedChallenge || !credential) return NextResponse.json({ error: "No challenge or credential found" }, { status: 400 });
  try {
    const verification = await verifyAuthenticationResponse({
      response: assertionResponse,
      expectedChallenge,
      expectedOrigin: `https://${rpID}`,
      expectedRPID: rpID,
      credential,
    });
    if (!verification.verified) return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Authentication error" }, { status: 500 });
  }
}
