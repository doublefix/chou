import useSWR from "swr";
import { fetcher } from "@/lib/api";

export interface PayloadCommit {
  id: string;
  message: string;
  url: string;
  author: {
    name: string;
    email: string;
    username: string;
  };
  committer: {
    name: string;
    email: string;
    username: string;
  };
  verification: {
    verified: boolean;
    reason: string;
    signature: string;
    signer: null | any;
    payload: string;
  };
  timestamp: string;
  added: null | string[];
  removed: null | string[];
  modified: null | string[];
}

export interface Branch {
  name: string;
  commit: PayloadCommit;
  protected: boolean;
  required_approvals: number;
  enable_status_check: boolean;
  status_check_contexts: string[];
  user_can_push: boolean;
  user_can_merge: boolean;
  effective_branch_protection_name: string;
}

export interface UseBranchesOptions {
  enabled?: boolean; // 是否启用请求
  page?: number; // 页码 (1-based)
  limit?: number; // 每页大小
}

export function useBranches(
  owner: string,
  repo: string,
  options: UseBranchesOptions = {}
) {
  const { enabled = true, page, limit } = options;

  const queryParams = new URLSearchParams();
  if (page !== undefined) {
    queryParams.append("page", page.toString());
  }
  if (limit !== undefined) {
    queryParams.append("limit", limit.toString());
  }

  const queryString = queryParams.toString();
  const url = `/api/v1/repos/${owner}/${repo}/branches${
    queryString ? `?${queryString}` : ""
  }`;

  const { data, error, isLoading, mutate } = useSWR<{
    data: Branch[];
    headers: Headers;
    status: number;
  }>(enabled ? url : null, fetcher, {
    shouldRetryOnError: (error) => {
      return !error.message.includes("404");
    },
  });

  const branches: Branch[] = data?.data || [];

  return {
    branches,
    error,
    isLoading,
    mutate,
    totalCount: branches.length,
    protectedBranches: branches.filter((branch) => branch.protected),
    mainBranch:
      branches.find((branch) => branch.name === "main") ||
      branches.find((branch) => branch.name === "master") ||
      null,
  };
}
