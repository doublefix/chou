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
  const response = NextResponse.next();

  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;
  let isExpired = true;

  if (accessToken) {
    try {
      isExpired = await checkTokenExpiration(accessToken);
    } catch (err) {
      console.error("Failed to decode token:", err);
    }
  }

  if (isExpired && refreshToken) {
    const data = await fetchTokenDetail(refreshToken);
    if (data) {
      console.log(data);
      const accessToken = data.access_token;
      // TODO: 后端返回时间不正确，是 0
      const accessTokenTTL =
        data.access_token_ttl > 0 ? data.access_token_ttl : 3600;
      const path = data.path;
      response.cookies.set("access_token", accessToken, {
        maxAge: accessTokenTTL,
        path: path,
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });
      isExpired = false;
    }
  }

  // 未登录用户：保护的页面重定向到 /login
  if (isExpired && pathname !== "/login" && pathname !== "/join") {
    return redirectTo(request, "/login");
  }

  // 已登录用户：不允许访问 /login 和 /join，重定向到首页或其他页面
  if (!isExpired && (pathname === "/login" || pathname === "/join")) {
    return redirectTo(request, "/home");
  }

  return response;
}

function redirectTo(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  return NextResponse.redirect(url);
}

async function checkTokenExpiration(token: string): Promise<boolean> {
  try {
    const response = await fetch(`http://localhost:8080/api/v1/auth/token/check`, {
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

// 刷新 Token 并设置新的 Cookie
async function fetchTokenDetail(refreshToken: string): Promise<any> {
  try {
    const response = await fetch(
      "http://localhost:8080/api/v1/token/refresh/detail",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${refreshToken}`,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error("Failed to fetch token detail:", response.status);
      return null;
    }
  } catch (err) {
    console.error("Error while fetching token detail:", err);
    return null;
  }
}
