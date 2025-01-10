"use client";

import { mutate } from "swr";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { join, checkAvailability } from "@/lib/actions";

export function JoinForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pending, setPending] = useState<boolean>(false);
  const [availability, setAvailability] = useState<{
    email_available?: boolean;
    username_available?: boolean;
    phone_available?: boolean;
  }>({});
  const [checking, setChecking] = useState<boolean>(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);

    const formData = new FormData(event.currentTarget);

    try {
      const result = await mutate("/api/v1/join", () => join(formData));

      if (result.code === 2001000) {
        setErrorMessage(null);
        const redirectPath = result.data?.[0]?.redirect;
        if (redirectPath) {
          router.push(redirectPath);
        }
        return;
      }
      setErrorMessage(result.message || "注册失败，请稍后重试。");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message || "注册失败，请联系管理员。"
          : "注册失败，请联系管理员。";
      setErrorMessage(errorMessage);
    } finally {
      setPending(false);
    }
  }

  async function handleCheck(field: string, value: string) {
    if (!value.trim()) {
      // 如果值为空字符串或仅包含空格，直接返回
      setAvailability((prev) => ({
        ...prev,
        [`${field}_available`]: undefined,
      }));
      return;
    }

    setChecking(true);
    try {
      const result = await checkAvailability({ [field]: value });
      setAvailability((prev) => ({ ...prev, ...result }));
    } catch (error) {
      console.error(`Error checking ${field} availability:`, error);
    } finally {
      setChecking(false);
    }
  }
  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Join</CardTitle>
        <CardDescription>
        Enter your email below to create a new account and get started!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email address*</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="test@example.com"
                required
                onBlur={(e) => handleCheck("email", e.target.value)}
              />
              {availability.email_available === false && (
                <p className="text-sm text-red-500">
                  Email is not available.
                </p>
              )}
              {availability.email_available === true && (
                <p className="text-sm text-green-500">
                  Email is available
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                required
                onBlur={(e) => handleCheck("username", e.target.value)}
              />
              {availability.username_available === false && (
                <p className="text-sm text-red-500">
                  Username is not available.
                </p>
              )}
              {availability.username_available === true && (
                <p className="text-sm text-green-500">
                  Username is available.
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password*</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            {errorMessage && (
              <p className="text-sm text-red-500">{errorMessage}</p>
            )}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "注册中..." : "注册"}
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Log in
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
