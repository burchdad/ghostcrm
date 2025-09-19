import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// Example user DB (replace with real DB in prod)
const users = [
  { id: "1", username: "admin", passwordHash: "$2a$10$7QwQwQwQwQwQwQwQwQwQwOQwQwQwQwQwQwQwQwQwQwQwQwQwQw", role: "admin", totpSecret: "JBSWY3DPEHPK3PXP" }, // password: admin123
  { id: "2", username: "user", passwordHash: "$2a$10$7QwQwQwQwQwQwQwQwQwQwOQwQwQwQwQwQwQwQwQwQwQwQwQwQw", role: "user", totpSecret: "JBSWY3DPEHPK3PXP" }, // password: user123
];

export async function POST(req: Request) {
  const { username, password, totp } = await req.json();
  const user = users.find(u => u.username === username);
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const valid = await compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  // If user has TOTP enabled, require code
  if (user.totpSecret) {
    if (!totp) {
      return NextResponse.json({ error: "TOTP code required" }, { status: 401 });
    }
    const verified = speakeasy.totp.verify({
      secret: user.totpSecret,
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
