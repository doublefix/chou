"use client";

import { useEffect, useState } from "react";
import { useGetNodesQuery } from "@/hooks/graphql-generated";

import { DataTable } from "@/components/dashboard/data-table-node";
import { SectionCards } from "@/components/dashboard/section-cards";

export default function Page() {
  const [remoteNodes, setRemoteNodes] = useState<any[]>([]);
  const [continueTokens, setContinueTokens] = useState<string[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(2);
  const [isMounted, setIsMounted] = useState(false);

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
    skip: !isMounted, // Only execute query after component mounts
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (queryData?.paginatedNodes?.items) {
      setRemoteNodes(queryData.paginatedNodes.items);

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
  }, [queryData, currentPageIndex, continueTokens]);

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

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />
          <DataTable
            data={queryData?.paginatedNodes?.items || []}
            onNextPage={handleNextPage}
            onPrevPage={handlePrevPage}
            onFirstPage={handleFirstPage}
            onPageSizeChange={handlePageSizeChange}
            pageSize={pageSize}
            hasNextPage={!!queryData?.paginatedNodes?.continueToken}
            hasPrevPage={currentPageIndex > 0}
            loading={!isMounted || loading} // Include !isMounted in loading state
          />
        </div>
      </div>
    </div>
  );
}

// 采用状态提升,单向数据流,使用useState + useEffect实现单向数据流
// 数据请求放在父页面是“常规做法”
