// Converts PublicKeyCredential (with ArrayBuffers) to JSON-safe format
export function publicKeyCredentialToJSON(cred: any): any {
  if (Array.isArray(cred)) return cred.map(publicKeyCredentialToJSON);
  if (cred instanceof ArrayBuffer) return Buffer.from(cred).toString("base64url");
  if (cred && typeof cred === "object") {
    const obj: any = {};
    for (const k of Object.keys(cred)) obj[k] = publicKeyCredentialToJSON(cred[k]);
    return obj;
  }
  return cred;
}
