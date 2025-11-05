import { randomBytes } from "crypto";

export function generatePassword(length = 8): string {
  const bytes = Math.ceil((length * 3) / 4);
  const password = randomBytes(bytes)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "")
    .slice(0, length);
  return password;
}
