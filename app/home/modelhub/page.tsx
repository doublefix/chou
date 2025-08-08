"use client";
import { DataTable } from "@/components/dashboard/data-table-modelhub";
import { useState, useEffect } from "react";
import { useRepoList } from "@/hooks/useRepoList";
import type { RepoQuery } from "@/hooks/useRepoList";

export default function Page() {
  const [params, setParams] = useState<RepoQuery>({
    page: 1,
    limit: 2,
    sort: "stars",
    order: "desc",
  });

  const { data: repoData, totalCount, error, isLoading } = useRepoList(params);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (repoData) {
      console.log("接口返回的数据:", repoData);
      console.log("接口返回的数据:", totalCount);
      setFetched(true);
    }
    if (error) {
      console.error("接口调用失败:", error);
    }
  }, [repoData, error]);

  const handlePageChange = (page: number) => {
    setParams((prev) => ({ ...prev, page }));
  };

  const handlePageSizeChange = (limit: number) => {
    setParams((prev) => ({ ...prev, limit, page: 1 }));
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <p>Loading repositories...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64 text-red-500">
              <p>Failed to load repositories. Please try again later.</p>
            </div>
          ) : (
            <DataTable
              data={repoData}
              totalCount={totalCount}
              page={params.page ?? 1}
              pageSize={params.limit ?? 10}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          )} */}
        </div>
      </div>
    </div>
  );
}
