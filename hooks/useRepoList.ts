import useSWR from "swr";
import { fetcher } from "@/lib/api";

type RepoQuery = {
  q?: string;
  topic?: boolean;
  includeDesc?: boolean;
  uid?: number;
  priority_owner_id?: number;
  team_id?: number;
  starredBy?: number;
  private?: boolean;
  is_private?: boolean;
  template?: boolean;
  archived?: boolean;
  mode?: "fork" | "source" | "mirror" | "collaborative";
  exclusive?: boolean;
  sort?: "alpha" | "created" | "updated" | "size" | "git_size" | "lfs_size" | "stars" | "forks" | "id";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
};

function toQueryString(params: Record<string, any>) {
  return Object.entries(params)
    .filter(([_, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
}

export function useRepoList(params: RepoQuery = {}) {
  const queryString = toQueryString({
    page: 1,
    limit: 10,
    ...params,
  });

  return useSWR(`/api/v1/repos/search?${queryString}`, fetcher);
}