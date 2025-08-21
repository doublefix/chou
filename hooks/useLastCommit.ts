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

export interface UseLastCommitOptions {
  enabled?: boolean; // 是否启用请求
}

export function useLastCommit(
  owner: string,
  repo: string,
  branch: string = "main",
  options: UseLastCommitOptions = {}
) {
  const { enabled = true } = options;

  const { data, error, isLoading, mutate } = useSWR<{
    data: Branch;
    headers: Headers;
    status: number;
  }>(
    enabled ? `/api/v1/repos/${owner}/${repo}/branches/${branch}` : null,
    fetcher,
    {
      shouldRetryOnError: (error) => {
        return !error.message.includes("404");
      },
    }
  );

  const branchData: Branch | null = data?.data || null;

  return {
    branch: branchData,
    error,
    isLoading,
    mutate,
    lastCommit: branchData?.commit || null,
    isProtected: branchData?.protected || false,
  };
}
