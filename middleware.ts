import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 从 Cookie 中获取 access_token
  const token = request.cookies.get("access_token")?.value;

  let isLoggedIn = false;

  if (token) {
    try {
      const decoded = jwt.decode(token);
      if (decoded && typeof decoded !== "string" && decoded.exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp > currentTime) {
          isLoggedIn = true;
        }
      }
    } catch (err) {
      console.error("Failed to decode token:", err);
    }
  }

  // 路由保护：未登录用户重定向到登录页面
  if (!isLoggedIn && pathname !== "/login" && pathname !== "/join") {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard", "/protected-page", "/about"],
};
