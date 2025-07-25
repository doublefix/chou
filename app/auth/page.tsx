"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      console.error("OAuth error:", error);
      router.push(`/error?error=${error}`);
      return;
    }

    if (code && state) {
      console.log("授权成功，code:", code, "state:", state);

      const fetchTokens = async () => {
        try {
          const res = await fetch("http://10.187.6.190/oauth2/token", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              grant_type: "authorization_code",
              client_id: "dev",
              redirect_uri: "http://10.187.6.190/auth",
              code: code,
            }),
          });

          if (!res.ok) {
            throw new Error(`Token request failed with status ${res.status}`);
          }

          const data = await res.json();
          console.log("Token response:", data);

          // 设置 token 到 cookie（简单方式，生产建议 HttpOnly + 后端设置）
          const expireDate = new Date(Date.now() + data.expires_in * 1000).toUTCString();

          document.cookie = `access_token=${data.access_token}; path=/; expires=${expireDate}`;
          document.cookie = `refresh_token=${data.refresh_token}; path=/;`;
          document.cookie = `id_token=${data.id_token}; path=/; expires=${expireDate}`;

          // 跳转到首页
          router.push("/home");
        } catch (err) {
          console.error("Token fetch failed:", err);
          router.push(`/error?error=token_fetch_failed`);
        }
      };

      fetchTokens();
    }
  }, [searchParams, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">正在完成授权...</h1>
        <p className="text-gray-500">请稍候，正在交换访问令牌...</p>
      </div>
    </div>
  );
}