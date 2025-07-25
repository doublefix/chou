"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function LoginForm({ loginChallenge }: { loginChallenge?: string }) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pending, setPending] = useState<boolean>(false);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    const identifier = formData.get("identifier")?.toString() || "";
    const password = formData.get("password")?.toString() || "";

    try {
      // 1. 获取 flow_id
      const flowRes = await fetch("http://10.187.6.190/api/v1/flow");
      const flowData = await flowRes.json();

      const flowId = flowData.flow_id;
      if (!flowId) throw new Error("无法获取 flow_id");

      // 2. 构造登录请求体
      const payload = {
        flow_id: flowId,
        identifier,
        password,
        login_challenge: loginChallenge ?? "",
      };

      // 3. 登录请求
      const loginRes = await fetch("http://10.187.6.190/api/v1/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const loginResult = await loginRes.json();
      console.log("[LOGIN RESPONSE]", loginRes.status, loginResult); // ✅ 打印响应内容

      if (loginRes.status === 200) {
        // 登录成功，跳转
        router.push(loginResult.redirect || "/");
      } else {
        setErrorMessage(loginResult.error || "登录失败，请检查用户名或密码。");
      }
    } catch (err: any) {
      console.error("[LOGIN ERROR]", err);
      setErrorMessage(err.message || "登录失败，请联系管理员。");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Username or Email address</Label>
              <Input
                id="identifier"
                name="identifier"
                type="text"
                placeholder="test@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="#"
                  className="ml-auto inline-block text-sm underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <Input id="password" name="password" type="password" required />
            </div>
            {errorMessage && (
              <p className="text-sm text-red-500">{errorMessage}</p>
            )}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "登录中..." : "登录"}
            </Button>
            <Button variant="outline" className="w-full">
              手机号登录
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/join" className="underline">
              Sign up
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
