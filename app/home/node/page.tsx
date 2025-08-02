"use client";

import { useEffect, useState } from "react";
import { useGetNodesQuery } from "@/hooks/graphql-generated";

import { DataTable } from "@/components/dashboard/data-table-node";
import { SectionCards } from "@/components/dashboard/section-cards";

export default function Page() {
  const [remoteNodes, setRemoteNodes] = useState<any[]>([]);
  const [continueTokens, setContinueTokens] = useState<string[]>([]); // To track pagination history
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(2); // Default page size

  const {
    data: queryData,
    loading,
    error,
    refetch,
  } = useGetNodesQuery({
    variables: {
      limit: pageSize,
      continueToken:
        currentPageIndex > 0 ? continueTokens[currentPageIndex - 1] : "",
    },
  });

  useEffect(() => {
    if (queryData?.paginatedNodes?.items) {
      setRemoteNodes(queryData.paginatedNodes.items);

      // Update continue tokens history if this is a new page
      if (
        queryData.paginatedNodes.continueToken &&
        (currentPageIndex >= continueTokens.length ||
          continueTokens[currentPageIndex] !==
            queryData.paginatedNodes.continueToken)
      ) {
        const newTokens = [...continueTokens];
        newTokens[currentPageIndex] = queryData.paginatedNodes.continueToken;
        setContinueTokens(newTokens);
      }
    }
  }, [queryData]);

  const handleNextPage = () => {
    if (queryData?.paginatedNodes?.continueToken) {
      setCurrentPageIndex((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex((prev) => prev - 1);
    }
  };

  const handleFirstPage = () => {
    setCurrentPageIndex(0);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPageIndex(0);
    setContinueTokens([]);
  };

  const data = queryData?.paginatedNodes?.items ?? [];

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />
          <DataTable
            data={data}
            onNextPage={handleNextPage}
            onPrevPage={handlePrevPage}
            onFirstPage={handleFirstPage}
            onPageSizeChange={handlePageSizeChange}
            hasNextPage={!!queryData?.paginatedNodes?.continueToken}
            hasPrevPage={currentPageIndex > 0}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}

// 采用状态提升,单向数据流,使用useState + useEffect实现单向数据流
// 数据请求放在父页面是“常规做法”
