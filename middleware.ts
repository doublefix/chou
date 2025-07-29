import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: [
    "/((?!api|_next/static|favicon.ico|.*\\.(?:css|js|map|jpg|jpeg|png|gif|svg|webp|woff|woff2|eot|ttf|otf)).*)",
  ],
};

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const pathname = url.pathname;
  const query = url.searchParams;
  let response = NextResponse.next();

  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  const isLoginPath = pathname === "/login";
  const publicPaths = [
    "/join",
    "/oauth2/auth",
    "/consent",
    "/auth/callback",
    "/auth",
  ];
  const isPublic =
    publicPaths.some((path) => pathname.startsWith(path)) ||
    (isLoginPath && query.has("login_challenge"));

  // ❗️ /login 但没 login_challenge，重定向到 OAuth
  if (isLoginPath && !query.has("login_challenge")) {
    return redirectToOAuth(request);
  }

  if (isPublic) return response;

  let isExpired = true;
  if (accessToken) {
    try {
      isExpired = checkJwtTokenExpired(accessToken);
    } catch (err) {
      console.error("❌ Failed to decode token:", err);
    }
  }

  if (isExpired && refreshToken) {
    const refreshed = await tryRefreshToken(refreshToken);

    if (refreshed) {
      const {
        access_token,
        expires_in,
        refresh_token: newRefreshToken,
      } = refreshed;

      response.cookies.set("access_token", access_token, {
        maxAge: expires_in,
        httpOnly: true,
        // secure: true,
        sameSite: "strict",
        path: "/",
      });

      if (newRefreshToken) {
        response.cookies.set("refresh_token", newRefreshToken, {
          maxAge: 7 * 24 * 60 * 60, // 一周
          httpOnly: true,
          // secure: true,
          sameSite: "strict",
          path: "/",
        });
      }

      isExpired = false;
    } else {
      response.cookies.delete("access_token");
      response.cookies.delete("refresh_token");
      response.cookies.delete("id_token");
      return redirectToOAuth(request, response);
    }
  }

  // 👉 未登录
  if (isExpired) return redirectToOAuth(request);

  // 👉 已登录但访问 login 或 join，重定向到 /home
  if (pathname === "/login" || pathname === "/join") {
    return redirectTo(request, "/home");
  }

  return response;
}

function redirectTo(request: NextRequest, pathname: string): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  return NextResponse.redirect(url);
}

function redirectToOAuth(
  request: NextRequest,
  response?: NextResponse
): NextResponse {
  const state = crypto.randomUUID();
  const oauthURL = new URL("http://10.187.6.190/oauth2/auth");

  oauthURL.searchParams.set("client_id", "dev");
  oauthURL.searchParams.set("response_type", "code");
  oauthURL.searchParams.set("scope", "openid");
  oauthURL.searchParams.set("state", state);
  oauthURL.searchParams.set("redirect_uri", "http://10.187.6.190/auth");

  const redirect = NextResponse.redirect(oauthURL.toString());
  if (response) {
    for (const [name, cookie] of Object.entries(response.cookies.getAll())) {
      redirect.cookies.set(name, cookie.value, {
        ...cookie,
      });
    }
  }
  return redirect;
}

function checkJwtTokenExpired(token: string): boolean {
  const [, payloadBase64] = token.split(".");
  if (!payloadBase64) throw new Error("Invalid JWT format");

  const payloadJson = Buffer.from(payloadBase64, "base64url").toString("utf-8");
  const payload = JSON.parse(payloadJson);

  if (!payload.exp) return true;

  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
}

async function tryRefreshToken(refreshToken: string): Promise<any | null> {
  try {
    const res = await fetch("http://10.187.6.190/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: "dev",
        redirect_uri: "http://10.187.6.190/auth",
        refresh_token: refreshToken,
      }),
    });

    if (!res.ok) {
      console.warn("🔁 Token refresh failed with status:", res.status);
      return null;
    }

    const json = await res.json();
    // console.log("✅ Token refresh success:", json);
    return json;
  } catch (error) {
    // console.error("❌ Token refresh error:", error);
    return null;
  }
}
