import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 从 Cookie 中获取 access_token
  const token = request.cookies.get("access_token")?.value;

  // 检查 access_token 是否存在
  const isLoggedIn = Boolean(token); // 如果 token 存在，则认为用户已登录

  // 路由保护：除了 /login 和 /join 页面，其它页面都需要验证登录状态
  if (!isLoggedIn && pathname !== "/login" && pathname !== "/join") {
    console.log("User not logged in. Redirecting to login.");
    const url = request.nextUrl.clone();
    url.pathname = "/login"; // 重定向到登录页面
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// 配置中间件的应用范围
export const config = {
  matcher: ["/", "/dashboard", "/protected-page", "/about"], // 配置需要保护的页面
};
