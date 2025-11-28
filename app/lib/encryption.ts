import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const ENCODING = "base64";

export function encrypt(text: string): string {
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, "base64");
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, "utf8", ENCODING);
  encrypted += cipher.final(ENCODING);

  const authTag = cipher.getAuthTag();

  //combine iv, auth tag, and encrypted text
  return `${iv.toString(ENCODING)}:${authTag.toString(ENCODING)}:${encrypted}`;
}

export function decrypt(encryptedText: string): string {
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, "base64");
  const [ivBase64, authTagBase64, encryptedBase64] = encryptedText.split(":");

  const iv = Buffer.from(ivBase64, ENCODING);
  const authTag = Buffer.from(authTagBase64, ENCODING);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedBase64, ENCODING, "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
