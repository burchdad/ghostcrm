import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

export function getUserIdFromRequest(req: Request) {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  if (!authHeader) return null;
  const token = Array.isArray(authHeader) ? authHeader[0].split(" ")[1] : authHeader.split(" ")[1];
  if (!token) return null;
  const payload = verifyToken(token);
  return payload && typeof payload === "object" ? payload["userId"] : null;
}
