import useSWR from "swr";
import { fetcher } from "@/lib/api";

export type RepoQuery = {
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
  sort?:
    | "alpha"
    | "created"
    | "updated"
    | "size"
    | "git_size"
    | "lfs_size"
    | "stars"
    | "forks"
    | "id";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
};

// 定义仓库数据类型
export interface Repo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  private: boolean;
  fork: boolean;
  template: boolean;
  mirror: boolean;
  size: number;
  language: string;
  html_url: string;
  clone_url: string;
  stars_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  created_at: string;
  updated_at: string;
  owner: {
    id: number;
    login: string;
    full_name: string;
    email: string;
    avatar_url: string;
    html_url: string;
  };
  topics: string[];
  archived: boolean;
  default_branch: string;
}

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

  const { data, error, isLoading, mutate } = useSWR(
    `/api/v1/repos/search?${queryString}`,
    fetcher
  );

  // 修复数据解析逻辑
  const response = data?.data;
  const repos: Repo[] = response?.data || [];

  // 从headers获取总数
  const totalCountStr = data?.headers?.get
    ? data.headers.get("X-Total-Count")
    : undefined;
  const totalCount = totalCountStr ? parseInt(totalCountStr, 10) : 0;

  return {
    repos,
    totalCount,
    error,
    isLoading,
    mutate, // 用于手动刷新数据
  };
}
