import useSWR from "swr";
import { fetcher } from "@/lib/api";

export function useHealth() {
  const { data, error, isLoading } = useSWR("/api/v1/healthz", fetcher);

  return {
    health: data,
    isLoading,
    error,
  };
}
