"use client";

import { useState } from "react";
import { usePaginatedNodes } from "@/hooks/useNodes";

export default function NodeListPage() {
  const [token, setToken] = useState<string | undefined>(undefined);
  const { nodes, continueToken, isLoading, error } = usePaginatedNodes(3, token);

  const handleNext = () => {
    if (continueToken) setToken(continueToken);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">节点列表</h1>

      {isLoading && <p>加载中...</p>}
      {error && <p>加载失败: {error.message}</p>}

      <ul className="space-y-2">
        {nodes.map((node, i) => (
          <li key={i} className="border rounded p-4 shadow">
            <p><strong>名称：</strong>{node.name}</p>
            <p><strong>CPU：</strong>{node.cpu}</p>
            <p><strong>内存：</strong>{node.memory}</p>
            <p><strong>GPU：</strong>{node.gpu}</p>
          </li>
        ))}
      </ul>

      {continueToken && (
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={handleNext}
        >
          下一页
        </button>
      )}
    </div>
  );
}