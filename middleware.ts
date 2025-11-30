import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    const token = req.cookies.get("authToken")?.value;

    const { pathname } = req.nextUrl;

    const publicPaths = ["/pages/login", "/pages/register","/pages/forgotPassword", "/pages/resetPassword"];

    if (publicPaths.includes(pathname)) {
        return NextResponse.next();
    }

    const isProtected = pathname.startsWith("/pages");

    if (!token && isProtected) {
        return NextResponse.redirect(new URL("/pages/login", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next|public|favicon.ico).*)"],
};
