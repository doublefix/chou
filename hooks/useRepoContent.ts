import useSWR from "swr";
import { fetcher } from "@/lib/api";

export interface RepoContentItem {
  name: string;
  path: string;
  sha: string;
  last_commit_sha: string;
  last_committer_date: string;
  last_author_date: string;
  type: "file" | "dir" | "symlink" | "submodule";
  size: number;
  encoding: string | null;
  content: string | null;
  target: string | null;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  submodule_git_url: string | null;
  _links: {
    self: string;
    git: string;
    html: string;
  };
}

export interface RepoContentsParams {
  ref?: string;
}

export function useRepoContents(
  owner: string,
  repo: string,
  filepath: string = "",
  params: RepoContentsParams = {}
) {
  const queryParams = new URLSearchParams();
  if (params.ref) {
    queryParams.append("ref", params.ref);
  }

  const queryString = queryParams.toString();
  const url = `/api/v1/repos/${owner}/${repo}/contents/${filepath}${
    queryString ? `?${queryString}` : ""
  }`;

  const { data, error, isLoading, mutate } = useSWR(url, fetcher);

  const response = data?.data;
  const contents: RepoContentItem[] = Array.isArray(response)
    ? response
    : response
    ? [response]
    : [];

  return {
    contents,
    error,
    isLoading,
    mutate,
  };
}
