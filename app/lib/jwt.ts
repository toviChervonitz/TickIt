import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET!;

// export function getFromLocalStorage<T>(key: string): T | null {
//   if (typeof window === "undefined") return null;
//   const item = localStorage.getItem(key);
//   return item ? JSON.parse(item) : null;
// }

export function createToken(payload: any) {
  return jwt.sign(payload, SECRET, { expiresIn: "30d" });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

// export function getAuthToken(): string | null {
//   if (typeof window === "undefined") return null;
//   return localStorage.getItem("token");
// }

// export function getTokenPayload(token?: string): any | null {
//   const jwtToken = token || getAuthToken();
//   if (!jwtToken) return null;

//   try {
//     const payload = jwt.verify(jwtToken, SECRET) as any;

//     return payload;
//     { }
//   } catch {
//     return null;
//   }
// }
import { jwtDecode } from "jwt-decode";

export function getFromLocalStorage<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : null;
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

// Decode token payload without verifying (safe on client)
export function getTokenPayload(token?: string): any | null {
  const jwtToken = token || getAuthToken();
  if (!jwtToken) return null;

  try {
    const payload = jwtDecode(jwtToken);
    return payload;
  } catch {
    return null;
  }
}

export function getTokenPayloadFromHeader(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!);
  } catch {
    return null;
  }
}

