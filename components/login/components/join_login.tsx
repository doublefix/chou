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
import { join } from "@/lib/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function JoinForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pending, setPending] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);

    const formData = new FormData(event.currentTarget);

    try {
      const result = await mutate("/api/v1/join", () => join(formData));

      if (result.code === 2001000) {
        console.log("注册成功");
        setErrorMessage(null);
        setShowDialog(true); // 显示对话框
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

  return (
    <>
      {/* 注册表单 */}
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Join</CardTitle>
          <CardDescription>
            Enter your email below to create new account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="test@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
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

      {/* 注册成功对话框 */}
      {showDialog && (
        <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Registration Successful</AlertDialogTitle>
              <AlertDialogDescription>
                Congratulations, your registration was successful! Click the
                button below to go to the login page.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction
                onClick={() => {
                  setShowDialog(false);
                  router.push("/login");
                }}
              >
                Go to Login
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
