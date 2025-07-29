import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: [
    "/((?!api|_next/static|favicon.ico|.*\\.(?:css|js|map|jpg|jpeg|png|gif|svg|webp|woff|woff2|eot|ttf|otf)).*)",
  ],
};

export async function middleware(request: NextRequest) {
  const { pathname, searchParams, hostname } = request.nextUrl;

  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  const isLoginPath = pathname === "/login";
// ✅ 登录页但缺 login_challenge，跳 OAuth
if (pathname === "/login" && !searchParams.has("login_challenge")) {
  return redirectToOAuth();
}

// ✅ 如果有 access_token 并访问 /login 或 /join，重定向到 /home
if (accessToken && (pathname === "/login" || pathname === "/join")) {
  return redirectToClean("/home", request);
}

// ✅ 公开路径放行（必须放在最后）
const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
if (isPublicPath) return NextResponse.next();

  // ✅ 登录页但缺 login_challenge，跳 OAuth
  if (isLoginPath && !searchParams.has("login_challenge")) {
    return redirectToOAuth();
  }

  // ✅ 公开路径，放行
  if (isPublicPath) return NextResponse.next();

  // ✅ 处理 Token 逻辑
  let isTokenExpired = true;
  if (accessToken) {
    try {
      isTokenExpired = isJwtExpired(accessToken);
    } catch (err) {
      console.warn("❌ Invalid access_token:", err);
    }
  }

  // ✅ 尝试刷新 access_token
  if (isTokenExpired && refreshToken) {
    const refreshed = await tryRefreshToken(refreshToken);

    if (refreshed) {
      const {
        access_token,
        id_token,
        expires_in,
        refresh_token: newRefreshToken,
      } = refreshed;

      const response = NextResponse.redirect(request.nextUrl); // ✅ 重要：用 redirect 才能带上 cookie
      setAuthCookies(
        response,
        access_token,
        id_token,
        expires_in,
        newRefreshToken,
        hostname
      );
      return response;
    }

    // ❌ 刷新失败，清除 cookie
    const response = NextResponse.redirect(request.nextUrl);
    clearAuthCookies(response);
    return redirectToOAuth(response);
  }

  // ❌ 未登录或无 token，跳 OAuth
  if (isTokenExpired) return redirectToOAuth();

  // ✅ 已登录但访问登录页，跳转到 /home
  if (pathname === "/login" || pathname === "/join") {
    return redirectTo(request, "/home");
  }

  return NextResponse.next();
}

// ----------------------------
// ✅ 配置
// ----------------------------
const PUBLIC_PATHS = [
  "/join",
  "/oauth2/auth",
  "/consent",
  "/auth/callback",
  "/auth",
];

// ----------------------------
// ✅ 辅助函数
// ----------------------------

function redirectTo(request: NextRequest, pathname: string): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  return NextResponse.redirect(url);
}

function redirectToClean(path: string, request: NextRequest) {
  const url = new URL(path, request.url);
  return NextResponse.redirect(url);
}

function redirectToOAuth(baseResponse?: NextResponse): NextResponse {
  const state = crypto.randomUUID();
  const oauthURL = new URL("http://10.187.6.190/oauth2/auth");

  oauthURL.searchParams.set("client_id", "dev");
  oauthURL.searchParams.set("response_type", "code");
  oauthURL.searchParams.set("scope", "openid");
  oauthURL.searchParams.set("state", state);
  oauthURL.searchParams.set("redirect_uri", "http://10.187.6.190/auth");

  const redirect = NextResponse.redirect(oauthURL.toString());

  // ⚠️ 复制原响应的 cookies（如删除操作）
  if (baseResponse) {
    for (const cookie of baseResponse.cookies.getAll()) {
      redirect.cookies.set(cookie.name, cookie.value, { ...cookie });
    }
  }

  return redirect;
}

function isJwtExpired(token: string): boolean {
  const [, payloadBase64] = token.split(".");
  if (!payloadBase64) throw new Error("Invalid JWT format");

  const payloadJson = Buffer.from(payloadBase64, "base64url").toString("utf-8");
  const payload = JSON.parse(payloadJson);

  const now = Math.floor(Date.now() / 1000);
  return !payload.exp || payload.exp < now;
}

async function tryRefreshToken(refreshToken: string): Promise<any | null> {
  try {
    const res = await fetch("http://10.187.6.190/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: "dev",
        redirect_uri: "http://10.187.6.190/auth",
        refresh_token: refreshToken,
      }),
    });

    if (!res.ok) {
      console.warn("🔁 Refresh failed:", res.status);
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error("❌ Refresh error:", err);
    return null;
  }
}

function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  idToken: string,
  maxAge: number,
  refreshToken?: string,
  hostname?: string
) {
  const secure = hostname !== "localhost";

  response.cookies.set("access_token", accessToken, {
    maxAge,
    httpOnly: true,
    secure,
    sameSite: "strict",
    path: "/",
  });

    response.cookies.set("id_token", accessToken, {
    maxAge,
    httpOnly: true,
    secure,
    sameSite: "strict",
    path: "/",
  });

  if (refreshToken) {
    response.cookies.set("refresh_token", refreshToken, {
      maxAge: 30 * 24 * 60 * 60,
      httpOnly: true,
      secure,
      sameSite: "strict",
      path: "/",
    });
  }
}

function clearAuthCookies(response: NextResponse) {
  response.cookies.delete("access_token");
  response.cookies.delete("refresh_token");
  response.cookies.delete("id_token");
}
