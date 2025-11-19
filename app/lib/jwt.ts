import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const SECRET = process.env.JWT_SECRET!;

export interface TokenPayload {
  id: string;
  email: string;
  iat: number;
  exp: number;
}

export function createToken(payload: Omit<TokenPayload, "iat" | "exp">) {
  return jwt.sign(payload, SECRET, { expiresIn: "30d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, SECRET) as TokenPayload;   
  } catch {
    return null;
  }
}



export async function getAuthTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value || null;
  return token;
}

export async function getAuthenticatedUser() {
  const token = await getAuthTokenFromCookies();
  if (!token) return null;

  const payload = verifyToken(token);
  return payload;
}

export async function compareToken(id: string) {
  const user = await getAuthenticatedUser();
  return user?.id === id;
}

// export async function getUserFromCookies() {
//   const cookieStore = await cookies();
//   const token = cookieStore.get("authToken")?.value;
//   if (!token) return null;
//   return verifyToken(token);
// }
// export function getTokenPayloadFromHeader(token: string) {
//   try {
//     return jwt.verify(token, process.env.JWT_SECRET!);
//   } catch {
//     return null;
//   }
// }

// export async function compareToken(id: string) {
//   const cookieStore = await cookies();
//   const token = cookieStore.get("authToken")?.value;

//   if (!token) return false;

//   const payload = verifyToken(token);
//   if (!payload) return false;

//   return payload.id === id;
// }

// export function getAuthToken(): string | null {
//   if (typeof window === "undefined") return null;
//   return localStorage.getItem("token");
// }

// // Decode token payload without verifying (safe on client)
// export function getTokenPayload(token?: string | null): any | null {
//   const jwtToken = token || getAuthToken();
//   if (!jwtToken) return null;

//   try {
//     const payload = jwtDecode(jwtToken);
//     return payload;
//   } catch {
//     return null;
//   }
// }

