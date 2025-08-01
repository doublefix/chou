"use client";

import React from "react";
import { useHealth } from "@/hooks/useHealth";

export default function HomePage() {
  const { health, isLoading, error } = useHealth();

  if (isLoading) return <div>正在检查系统健康状态...</div>;
  if (error) return <div>❌ 健康检查失败: {error.message}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-2">系统健康检查</h1>
      <pre className="bg-gray-100 p-2 rounded">{JSON.stringify(health, null, 2)}</pre>
    </div>
  );
}