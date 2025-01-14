import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: [
    // 排除以下路径：
    // - API 路径：/api/*
    // - Next.js 静态资源路径：/_next/static/*
    // - favicon.ico
    // - 静态文件（如图片、CSS、JS等）：通常静态资源路径包含 .ico、.css、.js、.map、.jpg 等后缀
    "/((?!api|_next/static|favicon.ico|.*\\.(?:css|js|map|jpg|jpeg|png|gif|svg|webp|woff|woff2|eot|ttf|otf)).*)",
  ],
};

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 从 Cookie 中获取 access_token
  const token = request.cookies.get("access_token")?.value;
  let isExpired = true;

  if (token) {
    try {
      isExpired = await checkTokenExpiration(token);
    } catch (err) {
      console.error("Failed to decode token:", err);
    }
  }

  // 未登录用户：保护的页面重定向到 /login
  if (isExpired && pathname !== "/login" && pathname !== "/join") {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // 已登录用户：不允许访问 /login 和 /join，重定向到首页或其他页面
  if (!isExpired && (pathname === "/login" || pathname === "/join")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

async function checkTokenExpiration(token: string): Promise<boolean> {
  try {
    const response = await fetch(`http://localhost:8080/api/v1/token/check`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const responseBody = await response.json();
    // console.log(responseBody);

    // 返回 is_expired 字段的值
    return responseBody.is_expired || false;
  } catch (err) {
    console.error("Error checking token expiration:", err);
    return true; // 如果请求失败，默认认为 token 过期
  }
}
