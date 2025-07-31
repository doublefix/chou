import useSWR from "swr";
import { fetcher } from "@/lib/api";

export function useNodes(page = 1, limit = 20) {
  const { data, error, isLoading } = useSWR(
    `/api/nodes?page=${page}&limit=${limit}`,
    fetcher
  );

  return {
    data: data?.items || [],
    total: data?.total,
    error,
    isLoading,
  };
}