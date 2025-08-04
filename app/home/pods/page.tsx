"use client";

import { useEffect, useState } from "react";
import { useGetPodsQuery } from "@/hooks/graphql-generated";

import { DataTable } from "@/components/dashboard/data-table-pod";
import { SectionCards } from "@/components/dashboard/section-cards";

export default function Page() {
  const [remotePods, setRemotePods] = useState<any[]>([]);
  const [continueTokens, setContinueTokens] = useState<string[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [isMounted, setIsMounted] = useState(false);
  const namespace = "kube-system"; // Hardcoded namespace as requested

  const {
    data: queryData,
    loading,
    error,
    refetch,
  } = useGetPodsQuery({
    variables: {
      namespace,
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
    if (queryData?.pods?.items) {
      setRemotePods(queryData.pods.items);

      if (
        queryData.pods.continueToken &&
        (currentPageIndex >= continueTokens.length ||
          continueTokens[currentPageIndex] !== queryData.pods.continueToken)
      ) {
        const newTokens = [...continueTokens];
        newTokens[currentPageIndex] = queryData.pods.continueToken;
        setContinueTokens(newTokens);
      }
    }
  }, [queryData, currentPageIndex, continueTokens]);

  const handleNextPage = () => {
    if (queryData?.pods?.continueToken) {
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

  const handleRefresh = async () => {
    try {
      await refetch();
    } catch (err) {
      console.error("Failed to refresh data", err);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />
          <DataTable
            data={
              (queryData?.pods?.items || []).map(pod => ({
                ...pod,
                podIP: pod.podIP ?? ""
              }))
            }
            onNextPage={handleNextPage}
            onPrevPage={handlePrevPage}
            onFirstPage={handleFirstPage}
            onPageSizeChange={handlePageSizeChange}
            pageSize={pageSize}
            hasNextPage={!!queryData?.pods?.continueToken}
            hasPrevPage={currentPageIndex > 0}
            loading={!isMounted || loading} // Include !isMounted in loading state
            onRefresh={handleRefresh}
          />
        </div>
      </div>
    </div>
  );
}