import { NextRequest, NextResponse } from "next/server";
import { BLOCK_WHEN_LOGGED_IN, PROTECTED_ROUTES, PUBLIC_ROUTES, ROUTES } from "./app/config/routes";

export function middleware(req: NextRequest) {
    const token = req.cookies.get("authToken")?.value;
    let pathname = req.nextUrl.pathname;

    if (pathname.startsWith("/api")) {
        return NextResponse.next();
    }

    if (pathname !== "/" && pathname.endsWith("/")) {
        pathname = pathname.slice(0, -1);
    }
  
    if (token && BLOCK_WHEN_LOGGED_IN.includes(pathname)) {
        return NextResponse.redirect(new URL(ROUTES.DASHBOARD, req.url));
    }

    const isProtected = PROTECTED_ROUTES.some((p) => pathname.startsWith(p));
    const isPublic = BLOCK_WHEN_LOGGED_IN.includes(pathname);

    if (!token &&!isPublic) {
        return NextResponse.redirect(new URL(ROUTES.UNAUTHORIZED, req.url));

    }


    return NextResponse.next();

}

export const config = {
    matcher: ["/((?!_next|logo.ico).*)"],
};