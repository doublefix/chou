"use client";

import { ConsentForm } from "@/components/login/components/consent";

export default function LoginPage({
  loginChallenge,
}: {
  loginChallenge?: string;
}) {
  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <ConsentForm />
    </div>
  );
}