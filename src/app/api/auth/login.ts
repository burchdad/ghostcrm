import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  const { username, password, totp } = await req.json();
  const { data: user, error: userError } = await supabaseAdmin
    .from("users")
    .select("id, username, password_hash, role, totp_secret")
    .eq("username", username)
    .single();
  if (!user || userError) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const valid = await compare(password, user.password_hash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  // If user has TOTP enabled, require code
  if (user.totp_secret) {
    if (!totp) {
      return NextResponse.json({ error: "TOTP code required" }, { status: 401 });
    }
    const verified = speakeasy.totp.verify({
      secret: user.totp_secret,
      encoding: "base32",
      token: totp,
      window: 1,
    });
    if (!verified) {
      return NextResponse.json({ error: "Invalid TOTP code" }, { status: 401 });
    }
  }
  const token = jwt.sign({ userId: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: "2h" });
  // Set JWT in httpOnly, Secure cookie
  const response = NextResponse.json({ user: { id: user.id, username: user.username, role: user.role } });
  response.headers.set("Set-Cookie", `ghostcrm_jwt=${token}; HttpOnly; Secure; Path=/; Max-Age=7200; SameSite=Strict`);
  return response;
}
