export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const last = String(messages?.[messages.length - 1]?.content || "").toLowerCase();

    let reply =
      "I can help with: creating an account, password reset, two-factor (TOTP), or biometric login.\n" +
      "• Create account: click “Create an account”, enter email & password, then login.\n" +
      "• Reset password: use “Forgot password?”, check email for the link.\n" +
      "• TOTP: go to Settings → Security to enroll and then enter the 6-digit code here.\n" +
      "• Biometrics: enroll your device under Security, then use “Login with biometrics.”";

    if (last.includes("create") || last.includes("sign up") || last.includes("register")) {
      reply = "To create an account: click “Create an account”, fill email + password, submit, then login.";
    } else if (last.includes("reset") || last.includes("forgot")) {
      reply = "Use “Forgot password?” on the login page. We’ll email you a reset link (expires in ~30 minutes).";
    } else if (last.includes("totp") || last.includes("2fa") || last.includes("authenticator")) {
      reply = "Go to Settings → Security → TOTP. Scan the QR in your Authenticator app and enter the 6-digit code.";
    } else if (last.includes("biometric") || last.includes("webauthn") || last.includes("face") || last.includes("touch")) {
      reply = "Enroll under Settings → Security → WebAuthn. After enrolling, use “Login with biometrics.”";
    }

    return NextResponse.json({ reply });
  } catch (e: any) {
    return NextResponse.json({ reply: "I hit a snag. Try again in a bit." }, { status: 200 });
  }
}
