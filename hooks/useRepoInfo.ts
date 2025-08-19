import useSWR from "swr";
import { fetcher } from "@/lib/api";

export interface RepoOwner {
  id: number;
  login: string;
  login_name: string;
  source_id: number;
  full_name: string;
  email: string;
  avatar_url: string;
  html_url: string;
  language: string;
  is_admin: boolean;
  last_login: string;
  created: string;
  restricted: boolean;
  active: boolean;
  prohibit_login: boolean;
  location: string;
  website: string;
  description: string;
  visibility: string;
  followers_count: number;
  following_count: number;
  starred_repos_count: number;
  username: string;
}

export interface RepoPermissions {
  admin: boolean;
  push: boolean;
  pull: boolean;
}

export interface InternalTracker {
  enable_time_tracker: boolean;
  allow_only_contributors_to_track_time: boolean;
  enable_issue_dependencies: boolean;
}

export interface RepoInfo {
  id: number;
  owner: RepoOwner;
  name: string;
  full_name: string;
  description: string;
  empty: boolean;
  private: boolean;
  fork: boolean;
  template: boolean;
  parent: any; // 可能是 null 或另一个仓库对象
  mirror: boolean;
  size: number;
  language: string;
  languages_url: string;
  html_url: string;
  url: string;
  link: string;
  ssh_url: string;
  clone_url: string;
  original_url: string;
  website: string;
  stars_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  open_pr_counter: number;
  release_counter: number;
  default_branch: string;
  archived: boolean;
  created_at: string;
  updated_at: string;
  archived_at: string;
  permissions: RepoPermissions;
  has_issues: boolean;
  internal_tracker: InternalTracker;
  has_wiki: boolean;
  has_pull_requests: boolean;
  has_projects: boolean;
  projects_mode: string;
  has_releases: boolean;
  has_packages: boolean;
  has_actions: boolean;
  ignore_whitespace_conflicts: boolean;
  allow_merge_commits: boolean;
  allow_rebase: boolean;
  allow_rebase_explicit: boolean;
  allow_squash_merge: boolean;
  allow_fast_forward_only_merge: boolean;
  allow_rebase_update: boolean;
  default_delete_branch_after_merge: boolean;
  default_merge_style: string;
  default_allow_maintainer_edit: boolean;
  avatar_url: string;
  internal: boolean;
  mirror_interval: string;
  object_format_name: string;
  mirror_updated: string;
  repo_transfer: any; // 可能是 null 或传输对象
  topics: string[];
  licenses: any; // 可能是 null 或许可证对象
}

export function useRepoInfo(owner: string, repo: string) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/v1/repos/${owner}/${repo}`,
    fetcher
  );

  const repoInfo: RepoInfo | null = data?.data || null;

  return {
    repoInfo,
    error,
    isLoading,
    mutate,
  };
}

export async function getRepoInfo(
  owner: string,
  repo: string
): Promise<RepoInfo> {
  try {
    const response = await fetcher(`/api/v1/repos/${owner}/${repo}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch repository info:", error);
    throw error;
  }
}
