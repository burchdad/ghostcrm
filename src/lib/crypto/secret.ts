import crypto from "node:crypto";

const RAW = process.env.PROVIDER_SECRET_KEY || ""; // 32-byte base64, e.g. `openssl rand -base64 32`
if (!RAW) console.warn("[WARN] PROVIDER_SECRET_KEY is not set (dev only).");
const KEY = RAW ? Buffer.from(RAW, "base64") : crypto.randomBytes(32);

export function encryptJSON(obj: any) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", KEY, iv);
  const plaintext = Buffer.from(JSON.stringify(obj));
  const enc = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]); // 12|16|N
}

export function decryptJSON(cipherBuf: Buffer) {
  const iv = cipherBuf.subarray(0,12);
  const tag = cipherBuf.subarray(12,28);
  const enc = cipherBuf.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", KEY, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
  return JSON.parse(dec.toString("utf8"));
}
