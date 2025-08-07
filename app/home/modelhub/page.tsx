"use client";
import { DataTable } from "@/components/dashboard/data-table-modelhub";

import { useState, useEffect } from "react";
import { useRepoList } from "@/hooks/useRepoList";
import type { RepoQuery } from "@/hooks/useRepoList";
import data from "./data.json";

export default function Page() {
  const params: RepoQuery = {
    page: 1,
    limit: 10,
    sort: "stars",
    order: "desc",
  };

  const { data: repoData, error, isLoading } = useRepoList(params);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (repoData) {
      console.log("接口返回的数据:", repoData);
      setFetched(true);
    }
    if (error) {
      console.error("接口调用失败:", error);
    }
  }, [repoData, error]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <DataTable data={data} />
        </div>
      </div>
    </div>
  );
}
