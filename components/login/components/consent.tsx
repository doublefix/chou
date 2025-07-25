"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ConsentForm({
  consent_challenge,
  clientName = "Example App",
  requestedScopes = ["openid", "profile", "email"],
}: {
  consent_challenge: string;
  clientName?: string;
  requestedScopes?: string[];
}) {
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleAccept() {
    setPending(true);
    setErrorMessage(null);

    try {
      const res = await fetch(
        `http://10.187.6.190/api/v1/consent?consent_challenge=${consent_challenge}`,
        {
          method: "GET",
        }
      );

      if (!res.ok) {
        throw new Error(`请求失败，状态码：${res.status}`);
      }

      const data = await res.json();
      if (!data.redirect_to) {
        throw new Error("接口响应缺少 redirect_to");
      }

      // ✅ 跳转
      window.location.href = data.redirect_to;
    } catch (err: any) {
      console.error("[CONSENT ERROR]", err);
      setErrorMessage(err.message || "授权失败，请联系管理员。");
    } finally {
      setPending(false);
    }
  }

  async function handleReject() {
    // 如果也有拒绝接口，请参照 handleAccept 逻辑
    console.log("[CONSENT] 用户拒绝授权，未实现跳转");
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">请求授权</CardTitle>
        <CardDescription>
          <span className="font-medium">{clientName}</span>{" "}
          想要访问你的账户信息。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">请求的权限：</p>
            <ul className="list-disc list-inside text-sm mt-1">
              {requestedScopes.map((scope) => (
                <li key={scope}>{scope}</li>
              ))}
            </ul>
          </div>
          {errorMessage && (
            <p className="text-sm text-red-500">{errorMessage}</p>
          )}
          <div className="flex gap-2">
            <Button
              className="w-full"
              onClick={handleAccept}
              disabled={pending}
            >
              {pending ? "授权中..." : "授权"}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleReject}
              disabled={pending}
            >
              拒绝
            </Button>
          </div>
          <div className="mt-4 text-center text-xs text-muted-foreground">
            你可以在账户设置中随时撤销授权。
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
