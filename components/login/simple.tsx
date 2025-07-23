"use client";

import { LoginForm } from "@/components/login/components/simple";

export default function LoginPage({
  loginChallenge,
}: {
  loginChallenge?: string;
}) {
  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <LoginForm loginChallenge={loginChallenge} />
    </div>
  );
}