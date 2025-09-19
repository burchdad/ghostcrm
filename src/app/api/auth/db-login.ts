import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import { queryDb } from "@/db/mssql";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// In-memory rate limiting store (for demo)
const attemptStore: Record<string, { count: number; lastAttempt: number }> = {};
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0] || 'unknown';
  const key = `${ip}:${email}`;
  const now = Date.now();
  if (!attemptStore[key] || now - attemptStore[key].lastAttempt > WINDOW_MS) {
    attemptStore[key] = { count: 1, lastAttempt: now };
  } else {
    attemptStore[key].count += 1;
    attemptStore[key].lastAttempt = now;
  }
  if (attemptStore[key].count > MAX_ATTEMPTS) {
    return NextResponse.json({ error: "Too many login attempts. Please try again later." }, { status: 429 });
  }
  const users = await queryDb("SELECT * FROM users WHERE email = @param0", [email]);
  const user = users[0];
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const valid = await compare(password, user.password_hash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "2h" });
  // Set JWT in httpOnly, Secure cookie
  const response = NextResponse.json({ user: { id: user.id, email: user.email, role: user.role } });
  response.headers.set("Set-Cookie", `ghostcrm_jwt=${token}; HttpOnly; Secure; Path=/; Max-Age=7200; SameSite=Strict`);
  // Audit log with IP, device, geo (stubbed for demo)
  const device = req.headers.get('user-agent') || '';
  const ipAddr = ip;
  // TODO: Integrate geo lookup if desired
  await queryDb("INSERT INTO audit_logs (user_id, event_type, event_details) VALUES (@param0, @param1, @param2)", [user.id, "login", JSON.stringify({ email, ip: ipAddr, device })]);
  return response;
}
