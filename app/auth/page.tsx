import { Suspense } from "react";
import OAuthCallbackClient from "./OAuthCallbackClient";

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="text-center p-8">加载中...</div>}>
      <OAuthCallbackClient />
    </Suspense>
  );
}
