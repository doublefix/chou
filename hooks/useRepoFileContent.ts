import useSWR from "swr";
import { fetcher } from "@/lib/api";

export interface FileContent {
  name: string;
  path: string;
  sha: string;
  last_commit_sha: string;
  last_committer_date: string;
  last_author_date: string;
  type: "file" | "dir" | "symlink" | "submodule";
  size: number;
  encoding: "base64" | string;
  content: string;
  target: string | null;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  submodule_git_url: string | null;
  _links: {
    self: string;
    git: string;
    html: string;
  };
}

export interface FileContentParams {
  ref?: string;
}

export function useFileContent(
  owner: string,
  repo: string,
  filePath: string,
  params: FileContentParams = {}
) {
  const queryParams = new URLSearchParams();
  if (params.ref) {
    queryParams.append("ref", params.ref);
  }

  const queryString = queryParams.toString();
  const url = `/api/v1/repos/${owner}/${repo}/contents/${filePath}${
    queryString ? `?${queryString}` : ""
  }`;

  const { data, error, isLoading, mutate } = useSWR(url, fetcher);

  const fileContent: FileContent | null = data?.data || null;

  return {
    fileContent,
    error,
    isLoading,
    mutate,
    isFile: fileContent?.type === "file",
    isDirectory: fileContent?.type === "dir",
    decodedContent:
      fileContent?.encoding === "base64" && fileContent?.content
        ? atob(fileContent.content)
        : fileContent?.content,
  };
}
