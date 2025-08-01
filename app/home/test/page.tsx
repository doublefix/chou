"use client";

import React from "react";
import { useGetNodesQuery } from "@/hooks/graphql-generated";

export default function HomePage() {
  const { data, loading, error } = useGetNodesQuery({
    variables: {
      limit: 3,
      continueToken: "",
    },
  });

  if (loading) return <p>加载中...</p>;
  if (error) return <p>错误: {error.message}</p>;

  return (
    <div>
      <h1>节点列表</h1>
      <ul>
        {data?.paginatedNodes.items.map((node) => (
          <li key={node.name}>
            <p>名称: {node.name}</p>
            <p>CPU: {node.cpu}</p>
            <p>内存: {node.memory}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}