import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const SECRET = process.env.JWT_SECRET!;

export interface TokenPayload {
  id: string;
  email: string;
  iat: number;
  exp: number;
}

interface TokenUser {
  [key: string]: any;
  _id: string;
  email: string;
  name?: string;
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

export function createAuthResponse(user: any, message?: string) {

  const token = createToken({
    id: user._id,
    email: user.email
  });

  const response = NextResponse.json(
    {
      status: "success",
      message: message || `Welcome back ${user.name}!`,
      user: user,
      token,
    },
    { status: 200 }
  );

  response.cookies.set("authToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });

  return response;
}

