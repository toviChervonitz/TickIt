import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export function middleware(req: Request) {
  const { pathname } = new URL(req.url);

  // Allow login/signup
  if (pathname.startsWith("/api/auth")) {
    
    return NextResponse.next();
  }

  // Check token for all other API routes
  const token = req.headers.get("authorization")?.split(" ")[1];

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    jwt.verify(token, JWT_SECRET);
    return NextResponse.next();
  } catch (err) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
}

export const config = {
  matcher: ["/api/:path*"], // Apply to all API routes
};



/**
 * to use in frontend:
 * const res = await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});
const { token } = await res.json();
localStorage.setItem("token", token);




const token = localStorage.getItem("token");
const res = await fetch("/api/tasks", {
  headers: { Authorization: `Bearer ${token}` },
});

 */