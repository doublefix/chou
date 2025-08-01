"use client";

import React from "react";
import { useGetNodesQuery } from "@/hooks/graphql-generated";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export default function HomePage() {
  const { data, loading, error } = useGetNodesQuery({
    variables: {
      limit: 3,
      continueToken: "",
    },
  });

  if (loading) {
    return (
      <div className="p-6 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-4 space-y-2">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>加载失败</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">节点列表</h1>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {data?.paginatedNodes.items.map((node) => (
          <Card key={node.name} className="p-4">
            <CardContent className="space-y-1">
              <p className="text-lg font-medium">名称: {node.name}</p>
              <p className="text-sm text-muted-foreground">CPU: {node.cpu}</p>
              <p className="text-sm text-muted-foreground">内存: {node.memory}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}