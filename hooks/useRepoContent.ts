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

export interface UseRepoContentsResult {
  contents: RepoContentItem[];
  error: Error | null;
  isLoading: boolean;
  isNotFound: boolean;
  mutate: () => void;
}

export function useRepoContents(
  owner: string,
  repo: string,
  filepath: string = "",
  params: RepoContentsParams = {}
): UseRepoContentsResult {
  const queryParams = new URLSearchParams();
  if (params.ref) {
    queryParams.append("ref", params.ref);
  }

  const queryString = queryParams.toString();
  const url = `/api/v1/repos/${encodeURIComponent(owner)}/${encodeURIComponent(
    repo
  )}/contents/${encodeURIComponent(filepath)}${
    queryString ? `?${queryString}` : ""
  }`;

  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: (error) => {
      return error?.status !== 404;
    },
  });

  const isNotFound = error?.status === 404;

  let contents: RepoContentItem[] = [];

  if (data?.data && !error) {
    contents = Array.isArray(data.data) ? data.data : [data.data];
  }

  return {
    contents,
    error: error && !isNotFound ? error : null,
    isLoading,
    isNotFound,
    mutate,
  };
}

export function useRepoFile(
  owner: string,
  repo: string,
  filepath: string,
  params: RepoContentsParams = {}
) {
  const { contents, ...rest } = useRepoContents(owner, repo, filepath, params);

  return {
    file: contents[0] || null,
    ...rest,
  };
}

export function useRepoDirectory(
  owner: string,
  repo: string,
  directoryPath: string = "",
  params: RepoContentsParams = {}
) {
  return useRepoContents(owner, repo, directoryPath, params);
}
