"use client";
import { ConsentForm } from "@/components/login/components/consent";


export default function ConsentPage({
  consent_challenge,
}: {
  consent_challenge?: string;
}) {
  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <ConsentForm consent_challenge={consent_challenge ?? ""} />
    </div>
  );
}
