import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: [
    // 匹配所有除 static/api 等路径以外的请求
    "/((?!api|_next/static|favicon.ico|.*\\.(?:css|js|map|jpg|jpeg|png|gif|svg|webp|woff|woff2|eot|ttf|otf)).*)",
  ],
};

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const response = NextResponse.next();

  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  const publicPaths = [
    "/login",
    "/join",
    "/oauth2/auth",
    "/consent",
    "/auth/callback",
    "/auth",
  ];

  const isPublic = publicPaths.some((path) => pathname.startsWith(path));

  // 👉 公共路径放行（即使未登录也能访问）
  if (isPublic) {
    return response;
  }

  // ✅ 判断 access_token 是否过期
  let isExpired = true;
  if (accessToken) {
    try {
      isExpired = checkJwtTokenExpired(accessToken);
    } catch (err) {
      console.error("Failed to decode token:", err);
    }
  }

  // ✅ 如果 access_token 过期，尝试用 refresh_token 刷新
  if (isExpired && refreshToken) {
    const data = await fetchTokenDetail(refreshToken);
    if (data) {
      const newAccessToken = data.access_token;
      const accessTokenTTL =
        data.access_token_ttl > 0 ? data.access_token_ttl : 3600;
      const path = data.path || "/";

      response.cookies.set("access_token", newAccessToken, {
        maxAge: accessTokenTTL,
        path,
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });

      isExpired = false;
    }
  }

  // 👉 ① 未登录，重定向到 OAuth 授权
  if (isExpired) {
    return redirectToOAuth(request);
  }

  // 👉 ② 已登录但访问 login 或 join，重定向到 /home
  if (!isExpired && (pathname === "/login" || pathname === "/join")) {
    return redirectTo(request, "/home");
  }

  return response;
}

// ✅ 内部页面重定向
function redirectTo(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  return NextResponse.redirect(url);
}

// ✅ OAuth 登录重定向逻辑
function redirectToOAuth(request: NextRequest): NextResponse {
  const state = crypto.randomUUID();
  const oauthURL = new URL("http://10.187.6.190/oauth2/auth");

  oauthURL.searchParams.set("client_id", "dev");
  oauthURL.searchParams.set("response_type", "code");
  oauthURL.searchParams.set("scope", "openid");
  oauthURL.searchParams.set("state", state);

  // ⚠️ redirect_uri 建议配置为固定值
  oauthURL.searchParams.set("redirect_uri", "http://10.187.6.190/auth");

  return NextResponse.redirect(oauthURL.toString());
}

// ✅ 检查 access_token 是否过期
function checkJwtTokenExpired(token: string): boolean {
  const [, payloadBase64] = token.split(".");
  if (!payloadBase64) throw new Error("Invalid JWT format");

  const payloadJson = Buffer.from(payloadBase64, "base64url").toString("utf-8");
  const payload = JSON.parse(payloadJson);

  if (!payload.exp) return true;

  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
}

// 🔄 使用 refresh_token 刷新 access_token
async function fetchTokenDetail(refreshToken: string): Promise<any> {
  try {
    const response = await fetch(
      "http://localhost:8080/api/v1/auth/token/refresh/detail",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${refreshToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      return await response.json();
    } else {
      console.error("Failed to fetch token detail:", response.status);
      return null;
    }
  } catch (err) {
    console.error("Error while fetching token detail:", err);
    return null;
  }
}